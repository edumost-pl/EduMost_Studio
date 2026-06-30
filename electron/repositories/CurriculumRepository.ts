import type { Curriculum } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class CurriculumRepository extends BaseRepository {
  findByTopicId(topicId: number): Curriculum[] {
    return this.all<Curriculum>(
      `SELECT * FROM Curriculum
       WHERE topic_id = ? AND is_active = 1
       ORDER BY school_class ASC, display_order ASC`,
      [topicId],
    );
  }

  create(data: Omit<Curriculum, 'id' | 'created_at' | 'updated_at'>): Curriculum {
    const result = this.run(
      `INSERT INTO Curriculum (
         topic_id, school_class, learning_stage, curriculum_code,
         curriculum_pl, notes_pl, notes_ua, display_order, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.topic_id,
        data.school_class,
        data.learning_stage,
        data.curriculum_code,
        data.curriculum_pl,
        data.notes_pl,
        data.notes_ua,
        data.display_order,
        data.is_active,
      ],
    );

    return this.get<Curriculum>('SELECT * FROM Curriculum WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  updateSchoolClassByTopicId(topicId: number, schoolClass: number): void {
    this.run(
      `UPDATE Curriculum
       SET school_class = ?, updated_at = CURRENT_TIMESTAMP
       WHERE topic_id = ? AND is_active = 1`,
      [schoolClass, topicId],
    );
  }

  findByClass(schoolClass: number, subjectId?: number): Curriculum[] {
    if (subjectId) {
      return this.all<Curriculum>(
        `SELECT c.*
         FROM Curriculum c
         INNER JOIN Topics t ON t.id = c.topic_id AND t.is_active = 1
         INNER JOIN Sections s ON s.id = t.section_id
         WHERE c.school_class = ? AND c.is_active = 1 AND c.display_order >= 1
           AND s.subject_id = ?
         ORDER BY c.display_order ASC`,
        [schoolClass, subjectId],
      );
    }

    return this.all<Curriculum>(
      `SELECT * FROM Curriculum
       WHERE school_class = ? AND is_active = 1 AND display_order >= 1
       ORDER BY display_order ASC`,
      [schoolClass],
    );
  }
}
