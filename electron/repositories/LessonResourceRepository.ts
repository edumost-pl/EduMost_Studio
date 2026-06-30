import type { LessonResource } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class LessonResourceRepository extends BaseRepository {
  findByLessonId(lessonId: number): LessonResource[] {
    return this.all<LessonResource>(
      `SELECT * FROM LessonResources
       WHERE lesson_id = ? AND is_active = 1
       ORDER BY display_order ASC`,
      [lessonId],
    );
  }
}
