import type Database from 'better-sqlite3';
import { topicCodeSqlExpression } from './topicCode';

interface MappingRow {
  id: number;
  old_code: string;
  new_code: string;
  display_order: number;
  section: string;
  school_class: number;
  subject: string;
}

const TOPIC_TEXT_COLUMNS = [
  'description_pl',
  'description_ua',
  'prerequisites_pl',
  'prerequisites_ua',
  'outcomes_pl',
  'outcomes_ua',
  'terminology_pl',
  'terminology_ua',
  'methodology_pl',
  'methodology_ua',
] as const;

const LESSON_TEXT_COLUMNS = [
  'goal_pl',
  'goal_ua',
  'learning_results_pl',
  'learning_results_ua',
  'terminology_pl',
  'terminology_ua',
  'equipment_pl',
  'equipment_ua',
  'scenario_pl',
  'scenario_ua',
  'homework_pl',
  'homework_ua',
  'assessment_pl',
  'assessment_ua',
  'teacher_notes_pl',
  'teacher_notes_ua',
] as const;

/** Migrate Topics.code to SUBJECT-CLASS-SECTION-ORDER (e.g. MAT5-NUM-001). */
export function migrateGlobalTopicCodes(db: Database.Database): number {
  const codeExpr = topicCodeSqlExpression();
  const mappings = db
    .prepare(
      `SELECT
         t.id,
         t.code AS old_code,
         s.code AS section,
         sub.code AS subject,
         c.school_class,
         c.display_order,
         ${codeExpr} AS new_code
       FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
       WHERE c.display_order >= 1
         AND t.is_active = 1
         AND t.code != ${codeExpr}
       ORDER BY c.school_class ASC, c.display_order ASC`,
    )
    .all() as MappingRow[];

  if (mappings.length === 0) {
    return 0;
  }

  const migratingIds = new Set(mappings.map((row) => row.id));
  const targetCodes = [...new Set(mappings.map((row) => row.new_code))];

  const blockers = db
    .prepare(
      `SELECT id, code FROM Topics
       WHERE code IN (${targetCodes.map(() => '?').join(', ')})
         AND is_active = 1`,
    )
    .all(...targetCodes) as Array<{ id: number; code: string }>;

  const migrate = db.transaction(() => {
    for (const blocker of blockers) {
      if (migratingIds.has(blocker.id)) {
        continue;
      }
      db.prepare('UPDATE Topics SET code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        `LEGACY-${blocker.id}`,
        blocker.id,
      );
    }

    for (const row of mappings) {
      db.prepare('UPDATE Topics SET code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        `__TMP__${row.id}`,
        row.id,
      );
    }

    for (const row of mappings) {
      db.prepare('UPDATE Topics SET code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
        row.new_code,
        row.id,
      );
    }

    for (const row of mappings) {
      for (const column of TOPIC_TEXT_COLUMNS) {
        db.prepare(
          `UPDATE Topics
           SET ${column} = REPLACE(${column}, ?, ?),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND ${column} LIKE '%' || ? || '%'`,
        ).run(row.old_code, row.new_code, row.id, row.old_code);
      }
    }

    for (const row of mappings) {
      for (const column of LESSON_TEXT_COLUMNS) {
        db.prepare(
          `UPDATE Lessons
           SET ${column} = REPLACE(${column}, ?, ?),
               updated_at = CURRENT_TIMESTAMP
           WHERE school_class = ? AND ${column} LIKE '%' || ? || '%'`,
        ).run(row.old_code, row.new_code, row.school_class, row.old_code);
      }

      db.prepare(
        `UPDATE Curriculum
         SET notes_pl = REPLACE(notes_pl, ?, ?),
             notes_ua = REPLACE(notes_ua, ?, ?),
             updated_at = CURRENT_TIMESTAMP
         WHERE topic_id = ?`,
      ).run(row.old_code, row.new_code, row.old_code, row.new_code, row.id);
    }

    for (const row of mappings) {
      db.prepare(
        `UPDATE Topics
         SET display_order = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
      ).run(row.display_order, row.id);
    }
  });

  migrate();
  return mappings.length;
}
