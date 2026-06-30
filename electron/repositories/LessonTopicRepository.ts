import type { LessonTopic } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class LessonTopicRepository extends BaseRepository {
  findByLessonId(lessonId: number): LessonTopic[] {
    return this.all<LessonTopic>(
      `SELECT * FROM LessonTopics
       WHERE lesson_id = ?
       ORDER BY display_order ASC`,
      [lessonId],
    );
  }

  findByTopicId(topicId: number): LessonTopic[] {
    return this.all<LessonTopic>(
      `SELECT * FROM LessonTopics
       WHERE topic_id = ?
       ORDER BY display_order ASC`,
      [topicId],
    );
  }

  getNextDisplayOrder(topicId: number): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM LessonTopics WHERE topic_id = ?',
      [topicId],
    );
    return (row?.max_order ?? -1) + 1;
  }

  create(data: Omit<LessonTopic, 'id' | 'created_at' | 'updated_at'>): LessonTopic {
    const result = this.run(
      `INSERT INTO LessonTopics (lesson_id, topic_id, is_primary, display_order)
       VALUES (?, ?, ?, ?)`,
      [data.lesson_id, data.topic_id, data.is_primary, data.display_order],
    );

    return this.get<LessonTopic>('SELECT * FROM LessonTopics WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }
}
