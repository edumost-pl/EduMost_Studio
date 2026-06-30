import type { SchoolClass } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class SchoolClassRepository extends BaseRepository {
  findAllForAdmin(): SchoolClass[] {
    return this.all<SchoolClass>(
      `SELECT * FROM SchoolClasses ORDER BY display_order ASC, class_number ASC`,
    );
  }

  findById(id: number): SchoolClass | undefined {
    return this.get<SchoolClass>('SELECT * FROM SchoolClasses WHERE id = ?', [id]);
  }

  getNextDisplayOrder(): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM SchoolClasses',
    );
    return (row?.max_order ?? 0) + 1;
  }

  countCurriculumUsage(classNumber: number): number {
    return (
      this.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM Curriculum WHERE school_class = ? AND is_active = 1',
        [classNumber],
      )?.count ?? 0
    );
  }

  countLessonUsage(classNumber: number): number {
    return (
      this.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM Lessons WHERE school_class = ? AND is_active = 1',
        [classNumber],
      )?.count ?? 0
    );
  }

  create(data: {
    class_number: number;
    name_ua: string;
    name_pl: string;
    display_order?: number;
    is_active?: number;
  }): SchoolClass {
    const result = this.run(
      `INSERT INTO SchoolClasses (class_number, name_ua, name_pl, display_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.class_number,
        data.name_ua.trim(),
        data.name_pl.trim(),
        data.display_order ?? this.getNextDisplayOrder(),
        data.is_active ?? 1,
      ],
    );
    return this.get<SchoolClass>('SELECT * FROM SchoolClasses WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  update(id: number, data: Partial<SchoolClass>): SchoolClass | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at',
    );
    if (fields.length === 0) return current;

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof SchoolClass]);

    this.run(
      `UPDATE SchoolClasses SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  archive(id: number): SchoolClass | undefined {
    return this.update(id, { is_active: 0 });
  }

  delete(id: number): { ok: true } | { ok: false; reason: 'IN_USE' } {
    const current = this.findById(id);
    if (!current) return { ok: true };
    if (
      this.countCurriculumUsage(current.class_number) > 0 ||
      this.countLessonUsage(current.class_number) > 0
    ) {
      return { ok: false, reason: 'IN_USE' };
    }
    this.run('DELETE FROM SchoolClasses WHERE id = ?', [id]);
    return { ok: true };
  }
}
