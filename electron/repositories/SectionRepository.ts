import type { Section } from '../database/types';
import { BaseRepository } from './BaseRepository';

export class SectionRepository extends BaseRepository {
  findAll(): Section[] {
    return this.all<Section>(
      `SELECT * FROM Sections
       WHERE is_active = 1
       ORDER BY display_order ASC, name_pl ASC`,
    );
  }

  findBySubjectId(subjectId: number): Section[] {
    return this.all<Section>(
      `SELECT * FROM Sections
       WHERE subject_id = ? AND is_active = 1
       ORDER BY display_order ASC, name_pl ASC`,
      [subjectId],
    );
  }

  findBySubjectAndClass(subjectId: number, schoolClass: number): Section[] {
    return this.all<Section>(
      `SELECT DISTINCT s.*
       FROM Sections s
       INNER JOIN Topics t ON t.section_id = s.id AND t.is_active = 1
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
       WHERE s.subject_id = ? AND s.is_active = 1 AND c.school_class = ?
       ORDER BY (
         SELECT MIN(c2.display_order)
         FROM Topics t2
         INNER JOIN Curriculum c2 ON c2.topic_id = t2.id AND c2.is_active = 1
         WHERE t2.section_id = s.id AND t2.is_active = 1 AND c2.school_class = ?
           AND c2.display_order >= 1
       ) ASC, s.display_order ASC, s.name_pl ASC`,
      [subjectId, schoolClass, schoolClass],
    );
  }

  findById(id: number): Section | undefined {
    return this.get<Section>('SELECT * FROM Sections WHERE id = ?', [id]);
  }

  findBySubjectAndName(subjectId: number, name: string): Section | undefined {
    const trimmed = name.trim();
    if (!trimmed) {
      return undefined;
    }

    return this.get<Section>(
      `SELECT * FROM Sections
       WHERE subject_id = ? AND is_active = 1
         AND (name_ua = ? OR name_pl = ?)`,
      [subjectId, trimmed, trimmed],
    );
  }

  codeExists(subjectId: number, code: string): boolean {
    return Boolean(
      this.get('SELECT 1 FROM Sections WHERE subject_id = ? AND code = ?', [
        subjectId,
        code,
      ]),
    );
  }

  suggestNewSectionCode(subjectId: number, name: string): string {
    const latin = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (latin.length >= 3) {
      const base = latin.slice(0, 3);
      if (!this.codeExists(subjectId, base)) {
        return base;
      }
      for (let i = 2; i < 100; i++) {
        const candidate = `${base.slice(0, 2)}${i}`;
        if (!this.codeExists(subjectId, candidate)) {
          return candidate;
        }
      }
    }

    for (let n = 1; n < 100; n++) {
      const code = `S${String(n).padStart(2, '0')}`;
      if (!this.codeExists(subjectId, code)) {
        return code;
      }
    }

    throw new Error('Cannot generate section code');
  }

  resolveSectionCode(
    subjectId: number,
    sectionName: string,
    sectionId?: number | null,
  ): string {
    const trimmed = sectionName.trim();
    if (!trimmed) {
      throw new Error('Section name is required');
    }

    if (sectionId && sectionId > 0) {
      const section = this.findById(sectionId);
      if (
        section &&
        section.subject_id === subjectId &&
        (section.name_ua === trimmed || section.name_pl === trimmed)
      ) {
        return section.code;
      }
    }

    const existing = this.findBySubjectAndName(subjectId, trimmed);
    if (existing) {
      return existing.code;
    }

    return this.suggestNewSectionCode(subjectId, trimmed);
  }

  getNextDisplayOrder(subjectId: number): number {
    const row = this.get<{ max_order: number | null }>(
      'SELECT MAX(display_order) AS max_order FROM Sections WHERE subject_id = ?',
      [subjectId],
    );
    return (row?.max_order ?? 0) + 1;
  }

  create(data: Omit<Section, 'id' | 'created_at' | 'updated_at'>): Section {
    const result = this.run(
      `INSERT INTO Sections (
         subject_id, code, name_pl, name_ua,
         description_pl, description_ua, display_order, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.subject_id,
        data.code,
        data.name_pl,
        data.name_ua,
        data.description_pl,
        data.description_ua,
        data.display_order,
        data.is_active,
      ],
    );

    return this.get<Section>('SELECT * FROM Sections WHERE id = ?', [
      Number(result.lastInsertRowid),
    ])!;
  }

  resolveOrCreate(
    subjectId: number,
    sectionName: string,
    sectionId?: number | null,
  ): Section {
    const trimmed = sectionName.trim();
    if (!trimmed) {
      throw new Error('Section name is required');
    }

    if (sectionId && sectionId > 0) {
      const section = this.findById(sectionId);
      if (
        section &&
        section.subject_id === subjectId &&
        (section.name_ua === trimmed || section.name_pl === trimmed)
      ) {
        return section;
      }
    }

    const existing = this.findBySubjectAndName(subjectId, trimmed);
    if (existing) {
      return existing;
    }

    return this.create({
      subject_id: subjectId,
      code: this.suggestNewSectionCode(subjectId, trimmed),
      name_pl: trimmed,
      name_ua: trimmed,
      description_pl: null,
      description_ua: null,
      display_order: this.getNextDisplayOrder(subjectId),
      is_active: 1,
    });
  }

  findAllForAdmin(): Array<
    Section & {
      subject_code: string;
      subject_name_ua: string;
      subject_name_pl: string;
    }
  > {
    return this.all(
      `SELECT
         s.*,
         sub.code AS subject_code,
         sub.name_ua AS subject_name_ua,
         sub.name_pl AS subject_name_pl
       FROM Sections s
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       ORDER BY sub.display_order ASC, s.display_order ASC, s.name_pl ASC`,
    );
  }

  countTopics(id: number): number {
    return (
      this.get<{ count: number }>(
        'SELECT COUNT(*) AS count FROM Topics WHERE section_id = ? AND is_active = 1',
        [id],
      )?.count ?? 0
    );
  }

  update(
    id: number,
    data: Partial<Omit<Section, 'id' | 'created_at' | 'updated_at'>>,
  ): Section | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(data).filter(
      (key) => key !== 'id' && key !== 'created_at' && key !== 'updated_at',
    );
    if (fields.length === 0) return current;

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field as keyof typeof data]);

    this.run(
      `UPDATE Sections SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id],
    );

    return this.findById(id);
  }

  archive(id: number): Section | undefined {
    return this.update(id, { is_active: 0 });
  }

  delete(id: number): { ok: true } | { ok: false; reason: 'IN_USE' } {
    if (this.countTopics(id) > 0) {
      return { ok: false, reason: 'IN_USE' };
    }
    this.run('DELETE FROM Sections WHERE id = ?', [id]);
    return { ok: true };
  }
}
