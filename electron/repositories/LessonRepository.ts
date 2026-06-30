import type { Lesson, LessonDetail } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class LessonRepository extends BaseRepository {
  findAll(filters: {
    subjectId?: number;
    schoolClass?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Lesson[] {
    const conditions = ['l.is_active = 1'];
    const params: unknown[] = [];

    if (filters.subjectId) {
      conditions.push('l.subject_id = ?');
      params.push(filters.subjectId);
    }

    if (filters.schoolClass) {
      conditions.push('l.school_class = ?');
      params.push(filters.schoolClass);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        `(l.code LIKE ? OR l.title_pl LIKE ? OR l.title_ua LIKE ?)`,
      );
      params.push(term, term, term);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    return this.all<Lesson>(
      `SELECT l.* FROM Lessons l
       ${where}
       ORDER BY l.code ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
  }

  findById(id: number): Lesson | undefined {
    return this.get<Lesson>('SELECT * FROM Lessons WHERE id = ?', [id]);
  }

  findByCode(code: string): Lesson | undefined {
    return this.get<Lesson>('SELECT * FROM Lessons WHERE code = ?', [code]);
  }

  findByTopicId(topicId: number): Lesson[] {
    return this.all<Lesson>(
      `SELECT l.*
       FROM Lessons l
       INNER JOIN LessonTopics lt ON lt.lesson_id = l.id
       WHERE lt.topic_id = ? AND l.is_active = 1
       ORDER BY lt.display_order ASC, l.code ASC`,
      [topicId],
    );
  }

  findDetailById(id: number): LessonDetail | undefined {
    const lesson = this.get<LessonDetail>(
      `SELECT
         l.*,
         s.code AS subject_code,
         s.name_pl AS subject_name_pl,
         s.name_ua AS subject_name_ua
       FROM Lessons l
       INNER JOIN Subjects s ON s.id = l.subject_id
       WHERE l.id = ?`,
      [id],
    );

    if (!lesson) {
      return undefined;
    }

    lesson.topics = this.all(
      `SELECT
         lt.*,
         t.code AS topic_code,
         t.name_pl AS topic_name_pl,
         t.name_ua AS topic_name_ua,
         t.prerequisites_pl AS topic_prerequisites_pl,
         t.prerequisites_ua AS topic_prerequisites_ua,
         t.outcomes_pl AS topic_outcomes_pl,
         t.outcomes_ua AS topic_outcomes_ua,
         sec.name_pl AS section_name_pl,
         sec.name_ua AS section_name_ua
       FROM LessonTopics lt
       INNER JOIN Topics t ON t.id = lt.topic_id AND t.is_active = 1
       INNER JOIN Sections sec ON sec.id = t.section_id
       WHERE lt.lesson_id = ?
       ORDER BY lt.display_order ASC, t.code ASC`,
      [id],
    );

    lesson.resources = this.all(
      `SELECT * FROM LessonResources
       WHERE lesson_id = ? AND is_active = 1
       ORDER BY display_order ASC`,
      [id],
    );

    return lesson;
  }

  suggestNextCode(subjectId: number, schoolClass: number): string {
    const subject = this.get<{ code: string }>(
      'SELECT code FROM Subjects WHERE id = ?',
      [subjectId],
    );
    if (!subject) {
      throw new Error('Subject not found');
    }

    const prefix = `${subject.code}${schoolClass}-`;
    const rows = this.all<{ code: string }>(
      'SELECT code FROM Lessons WHERE subject_id = ? AND school_class = ? AND code LIKE ?',
      [subjectId, schoolClass, `${prefix}%`],
    );

    let maxNum = 0;
    for (const row of rows) {
      const suffix = row.code.slice(prefix.length);
      const num = parseInt(suffix, 10);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }

    return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
  }

  create(data: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Lesson {
    const result = this.run(
      `INSERT INTO Lessons (
         code, subject_id, school_class, lesson_type, duration,
         title_pl, title_ua, goal_pl, goal_ua,
         learning_results_pl, learning_results_ua,
         terminology_pl, terminology_ua,
         equipment_pl, equipment_ua,
         scenario_pl, scenario_ua,
         homework_pl, homework_ua,
         assessment_pl, assessment_ua,
         teacher_notes_pl, teacher_notes_ua,
         author, version, status, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code,
        data.subject_id,
        data.school_class,
        data.lesson_type,
        data.duration,
        data.title_pl,
        data.title_ua,
        data.goal_pl,
        data.goal_ua,
        data.learning_results_pl,
        data.learning_results_ua,
        data.terminology_pl,
        data.terminology_ua,
        data.equipment_pl,
        data.equipment_ua,
        data.scenario_pl,
        data.scenario_ua,
        data.homework_pl,
        data.homework_ua,
        data.assessment_pl,
        data.assessment_ua,
        data.teacher_notes_pl,
        data.teacher_notes_ua,
        data.author,
        data.version,
        data.status,
        data.is_active,
      ],
    );

    return this.get<Lesson>('SELECT * FROM Lessons WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<Lesson>): void {
    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at',
    );

    if (fields.length === 0) {
      return;
    }

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof Lesson]);

    this.run(
      `UPDATE Lessons
       SET ${assignments}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [...values, id],
    );
  }
}
