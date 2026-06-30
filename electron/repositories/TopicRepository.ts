import type {
  Topic,
  TopicDetail,
  TopicFilters,
  TopicListItem,
} from '../database/types';
import { buildTopicCode } from '../database/topicCode';
import { BaseRepository } from './BaseRepository';

export class TopicRepository extends BaseRepository {
  private buildCurriculumJoin(schoolClass?: number): string {
    if (schoolClass) {
      return 'INNER JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1';
    }

    return `LEFT JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
         AND c.school_class = (
           SELECT MIN(c2.school_class) FROM Curriculum c2
           WHERE c2.topic_id = t.id AND c2.is_active = 1 AND c2.display_order >= 1
         )`;
  }

  private buildTopicOrderBy(filters: TopicFilters): string {
    if (filters.schoolClass) {
      return 'c.display_order ASC';
    }

    if (filters.sectionId) {
      return 'COALESCE(c.display_order, t.display_order) ASC';
    }

    return 'COALESCE(c.display_order, s.display_order * 1000 + t.display_order) ASC';
  }

  findAll(filters: TopicFilters = {}): TopicListItem[] {
    const conditions = ['t.is_active = 1'];
    const params: unknown[] = [];

    if (filters.subjectId) {
      conditions.push('s.subject_id = ?');
      params.push(filters.subjectId);
    }

    if (filters.sectionId) {
      conditions.push('t.section_id = ?');
      params.push(filters.sectionId);
    }

    if (filters.schoolClass) {
      conditions.push('c.school_class = ?');
      conditions.push('c.display_order >= 1');
      params.push(filters.schoolClass);
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        '(t.code LIKE ? OR t.name_pl LIKE ? OR t.name_ua LIKE ?)',
      );
      params.push(term, term, term);
    }

    const curriculumJoin = this.buildCurriculumJoin(filters.schoolClass);
    const orderBy = this.buildTopicOrderBy(filters);

    const where = `WHERE ${conditions.join(' AND ')}`;
    const limit = filters.limit ?? 100;
    const offset = filters.offset ?? 0;

    return this.all<TopicListItem>(
      `SELECT
         t.*,
         s.name_pl AS section_name_pl,
         s.name_ua AS section_name_ua,
         c.school_class,
         c.display_order AS curriculum_display_order,
         (
           SELECT COUNT(*)
           FROM LessonTopics lt
           INNER JOIN Lessons l ON l.id = lt.lesson_id AND l.is_active = 1
           WHERE lt.topic_id = t.id
         ) AS lessons_count
       FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       ${curriculumJoin}
       ${where}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
  }

  count(filters: TopicFilters = {}): number {
    const conditions = ['t.is_active = 1'];
    const params: unknown[] = [];

    if (filters.subjectId) {
      conditions.push('s.subject_id = ?');
      params.push(filters.subjectId);
    }
    if (filters.sectionId) {
      conditions.push('t.section_id = ?');
      params.push(filters.sectionId);
    }
    if (filters.schoolClass) {
      conditions.push('c.school_class = ?');
      conditions.push('c.display_order >= 1');
      params.push(filters.schoolClass);
    }
    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push('(t.code LIKE ? OR t.name_pl LIKE ? OR t.name_ua LIKE ?)');
      params.push(term, term, term);
    }

    const join = filters.schoolClass
      ? 'INNER JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1'
      : '';

    const row = this.get<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       ${join}
       WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return row?.count ?? 0;
  }

  findAdjacent(
    topicId: number,
    filters: TopicFilters = {},
  ): { prev: TopicListItem | null; next: TopicListItem | null } {
    const items = this.findAll({ ...filters, limit: 10000, offset: 0 });
    const index = items.findIndex((item) => item.id === topicId);
    if (index < 0) {
      return { prev: null, next: null };
    }
    return {
      prev: index > 0 ? items[index - 1]! : null,
      next: index < items.length - 1 ? items[index + 1]! : null,
    };
  }

  findById(id: number): Topic | undefined {
    return this.get<Topic>('SELECT * FROM Topics WHERE id = ?', [id]);
  }

  findByCode(code: string): Topic | undefined {
    return this.get<Topic>('SELECT * FROM Topics WHERE code = ?', [code]);
  }

  findDetailById(id: number): TopicDetail | undefined {
    const topic = this.get<TopicDetail>(
      `SELECT
         t.*,
         s.name_pl AS section_name_pl,
         s.name_ua AS section_name_ua,
         sub.code AS subject_code,
         sub.name_pl AS subject_name_pl,
         sub.name_ua AS subject_name_ua
       FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       WHERE t.id = ?`,
      [id],
    );

    if (!topic) {
      return undefined;
    }

    topic.curriculum = this.all(
      `SELECT * FROM Curriculum
       WHERE topic_id = ? AND is_active = 1
       ORDER BY school_class ASC, display_order ASC`,
      [id],
    );

    topic.relations = this.all(
      `SELECT
         tr.*,
         rt.code AS related_code,
         rt.name_pl AS related_name_pl,
         rt.name_ua AS related_name_ua
       FROM TopicRelations tr
       INNER JOIN Topics rt ON rt.id = tr.related_topic_id
       WHERE tr.topic_id = ? AND tr.is_active = 1
       ORDER BY tr.relation_type ASC, tr.display_order ASC`,
      [id],
    );

    topic.lessons = this.all(
      `SELECT
         lt.*,
         l.code AS lesson_code,
         l.title_pl AS lesson_title_pl,
         l.title_ua AS lesson_title_ua,
         l.lesson_type
       FROM LessonTopics lt
       INNER JOIN Lessons l ON l.id = lt.lesson_id AND l.is_active = 1
       WHERE lt.topic_id = ?
       ORDER BY lt.display_order ASC, l.code ASC`,
      [id],
    );

    return topic;
  }

  suggestNextCodeForPrefix(prefix: string): string {
    const codePrefix = `${prefix}-`;
    const rows = this.all<{ code: string }>(
      'SELECT code FROM Topics WHERE code LIKE ?',
      [`${codePrefix}%`],
    );

    let maxNum = 0;
    for (const row of rows) {
      const suffix = row.code.slice(codePrefix.length);
      const num = parseInt(suffix, 10);
      if (!Number.isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }

    return `${codePrefix}${String(maxNum + 1).padStart(3, '0')}`;
  }

  suggestNextCode(subjectId: number, schoolClass: number, sectionId: number): string {
    const row = this.get<{
      subject_code: string;
      section_code: string;
      next_order: number;
    }>(
      `SELECT
         sub.code AS subject_code,
         s.code AS section_code,
         COALESCE(
           (
             SELECT MAX(c.display_order) + 1
             FROM Curriculum c
             INNER JOIN Topics t2 ON t2.id = c.topic_id AND t2.is_active = 1
             INNER JOIN Sections s2 ON s2.id = t2.section_id
             WHERE c.is_active = 1
               AND c.school_class = ?
               AND s2.subject_id = ?
               AND c.display_order >= 1
           ),
           1
         ) AS next_order
       FROM Sections s
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       WHERE s.id = ? AND s.subject_id = ?`,
      [schoolClass, subjectId, sectionId, subjectId],
    );

    if (!row) {
      throw new Error('Section not found');
    }

    return buildTopicCode(
      row.subject_code,
      schoolClass,
      row.section_code,
      row.next_order,
    );
  }

  /** @deprecated Legacy section-only codes — do not use for new topics. */
  suggestNextCodeLegacy(sectionId: number): string {
    const section = this.get<{ code: string }>(
      'SELECT code FROM Sections WHERE id = ?',
      [sectionId],
    );
    if (!section) {
      throw new Error('Section not found');
    }

    return this.suggestNextCodeForPrefix(section.code);
  }

  create(data: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Topic {
    const result = this.run(
      `INSERT INTO Topics (
         section_id, code, name_pl, name_ua,
         description_pl, description_ua,
         prerequisites_pl, prerequisites_ua,
         outcomes_pl, outcomes_ua,
         terminology_pl, terminology_ua,
         methodology_pl, methodology_ua,
         display_order, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.section_id,
        data.code,
        data.name_pl,
        data.name_ua,
        data.description_pl,
        data.description_ua,
        data.prerequisites_pl,
        data.prerequisites_ua,
        data.outcomes_pl,
        data.outcomes_ua,
        data.terminology_pl,
        data.terminology_ua,
        data.methodology_pl,
        data.methodology_ua,
        data.display_order,
        data.is_active,
      ],
    );

    return this.get<Topic>('SELECT * FROM Topics WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<Topic>): void {
    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at',
    );

    if (fields.length === 0) {
      return;
    }

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof Topic]);

    this.run(
      `UPDATE Topics
       SET ${assignments}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [...values, id],
    );
  }
}
