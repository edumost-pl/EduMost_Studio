import type { Subject } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class SubjectRepository extends BaseRepository {
  findAll(): Subject[] {
    return this.all<Subject>(
      `SELECT * FROM Subjects
       WHERE is_active = 1
       ORDER BY display_order ASC, name_pl ASC`,
    );
  }

  findAllForAdmin(): Subject[] {
    return this.all<Subject>(
      `SELECT * FROM Subjects
       ORDER BY display_order ASC, name_pl ASC`,
    );
  }

  findById(id: number): Subject | undefined {
    return this.get<Subject>('SELECT * FROM Subjects WHERE id = ?', [id]);
  }

  findByCode(code: string): Subject | undefined {
    return this.get<Subject>('SELECT * FROM Subjects WHERE code = ?', [code]);
  }

  getNextDisplayOrder(): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM Subjects',
    );
    return (row?.max_order ?? 0) + 1;
  }

  countUsage(id: number): { sections: number; lessons: number } {
    const sections = this.get<{ count: number }>(
      'SELECT COUNT(*) AS count FROM Sections WHERE subject_id = ?',
      [id],
    )?.count ?? 0;
    const lessons = this.get<{ count: number }>(
      'SELECT COUNT(*) AS count FROM Lessons WHERE subject_id = ?',
      [id],
    )?.count ?? 0;
    return { sections, lessons };
  }

  create(data: {
    code: string;
    icon?: string | null;
    name_pl: string;
    name_ua: string;
    description_pl?: string | null;
    description_ua?: string | null;
    display_order?: number;
    is_active?: number;
  }): Subject {
    const result = this.run(
      `INSERT INTO Subjects (
         code, icon, name_pl, name_ua, description_pl, description_ua, display_order, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.code.trim().toUpperCase(),
        data.icon ?? null,
        data.name_pl.trim(),
        data.name_ua.trim(),
        data.description_pl ?? null,
        data.description_ua ?? null,
        data.display_order ?? this.getNextDisplayOrder(),
        data.is_active ?? 1,
      ],
    );

    return this.get<Subject>('SELECT * FROM Subjects WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<Subject>): Subject | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at',
    );
    if (fields.length === 0) return current;

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof Subject]);

    this.run(
      `UPDATE Subjects SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  archive(id: number): Subject | undefined {
    return this.update(id, { is_active: 0 });
  }

  delete(id: number): { ok: true } | { ok: false; reason: 'IN_USE' } {
    const usage = this.countUsage(id);
    if (usage.sections > 0 || usage.lessons > 0) {
      return { ok: false, reason: 'IN_USE' };
    }
    this.run('DELETE FROM Subjects WHERE id = ?', [id]);
    return { ok: true };
  }
}
