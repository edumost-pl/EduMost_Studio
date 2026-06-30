import type { LessonStatus } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class LessonStatusRepository extends BaseRepository {
  findAllForAdmin(): LessonStatus[] {
    return this.all<LessonStatus>(
      `SELECT * FROM LessonStatuses ORDER BY display_order ASC, name ASC`,
    );
  }

  findById(id: number): LessonStatus | undefined {
    return this.get<LessonStatus>('SELECT * FROM LessonStatuses WHERE id = ?', [id]);
  }

  getNextDisplayOrder(): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM LessonStatuses',
    );
    return (row?.max_order ?? 0) + 1;
  }

  countUsage(name: string): number {
    return (
      this.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM Lessons WHERE status = ?',
        [name],
      )?.count ?? 0
    );
  }

  create(data: { name: string; display_order?: number; is_active?: number }): LessonStatus {
    const result = this.run(
      `INSERT INTO LessonStatuses (name, display_order, is_active) VALUES (?, ?, ?)`,
      [data.name.trim(), data.display_order ?? this.getNextDisplayOrder(), data.is_active ?? 1],
    );
    return this.get<LessonStatus>('SELECT * FROM LessonStatuses WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<LessonStatus>): LessonStatus | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at',
    );
    if (fields.length === 0) return current;

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof LessonStatus]);

    this.run(
      `UPDATE LessonStatuses SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  archive(id: number): LessonStatus | undefined {
    return this.update(id, { is_active: 0 });
  }

  delete(id: number): { ok: true } | { ok: false; reason: 'IN_USE' } {
    const current = this.findById(id);
    if (!current) return { ok: true };
    if (this.countUsage(current.name) > 0) {
      return { ok: false, reason: 'IN_USE' };
    }
    this.run('DELETE FROM LessonStatuses WHERE id = ?', [id]);
    return { ok: true };
  }
}
