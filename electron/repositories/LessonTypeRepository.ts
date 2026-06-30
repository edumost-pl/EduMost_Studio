import type { LessonType } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class LessonTypeRepository extends BaseRepository {
  findAllForAdmin(): LessonType[] {
    return this.all<LessonType>(
      `SELECT * FROM LessonTypes ORDER BY display_order ASC, name ASC`,
    );
  }

  findById(id: number): LessonType | undefined {
    return this.get<LessonType>('SELECT * FROM LessonTypes WHERE id = ?', [id]);
  }

  getNextDisplayOrder(): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM LessonTypes',
    );
    return (row?.max_order ?? 0) + 1;
  }

  countUsage(name: string): number {
    return (
      this.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM Lessons WHERE lesson_type = ?',
        [name],
      )?.count ?? 0
    );
  }

  create(data: { name: string; display_order?: number; is_active?: number }): LessonType {
    const result = this.run(
      `INSERT INTO LessonTypes (name, display_order, is_active) VALUES (?, ?, ?)`,
      [data.name.trim(), data.display_order ?? this.getNextDisplayOrder(), data.is_active ?? 1],
    );
    return this.get<LessonType>('SELECT * FROM LessonTypes WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<LessonType>): LessonType | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at',
    );
    if (fields.length === 0) return current;

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof LessonType]);

    this.run(
      `UPDATE LessonTypes SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  archive(id: number): LessonType | undefined {
    return this.update(id, { is_active: 0 });
  }

  delete(id: number): { ok: true } | { ok: false; reason: 'IN_USE' } {
    const current = this.findById(id);
    if (!current) return { ok: true };
    if (this.countUsage(current.name) > 0) {
      return { ok: false, reason: 'IN_USE' };
    }
    this.run('DELETE FROM LessonTypes WHERE id = ?', [id]);
    return { ok: true };
  }
}
