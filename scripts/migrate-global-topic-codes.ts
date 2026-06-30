#!/usr/bin/env tsx
/**
 * CLI wrapper for global topic code migration.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { migrateGlobalTopicCodes } from '../electron/database/migrateGlobalTopicCodes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDb = path.join(
  os.homedir(),
  'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
);
const mappingOut = path.join(__dirname, 'global-topic-code-mapping.txt');

function main() {
  const dbPath = process.argv[2] ?? defaultDb;

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const before = db
    .prepare(
      `SELECT t.code AS old_code,
              sub.code || c.school_class || '-' || s.code || '-' || printf('%03d', c.display_order) AS new_code,
              c.display_order,
              s.code AS section
       FROM Topics t
       JOIN Sections s ON s.id = t.section_id
       JOIN Subjects sub ON sub.id = s.subject_id
       JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
       WHERE t.is_active = 1 AND c.display_order >= 1
         AND t.code != sub.code || c.school_class || '-' || s.code || '-' || printf('%03d', c.display_order)
       ORDER BY c.display_order`,
    )
    .all() as Array<{
    old_code: string;
    new_code: string;
    display_order: number;
    section: string;
  }>;

  const count = migrateGlobalTopicCodes(db);

  if (count === 0) {
    console.log('All topic codes already use global numbering.');
  } else {
    console.log(`Migrated ${count} topic codes in:\n  ${dbPath}\n`);
    const lines = before.map(
      (row) =>
        `${String(row.display_order).padStart(3, ' ')} | ${row.old_code.padEnd(10)} → ${row.new_code} (${row.section})`,
    );
    fs.writeFileSync(mappingOut, `${lines.join('\n')}\n`, 'utf-8');
    console.log('Mapping (old → new):');
    for (const line of lines) {
      console.log(line);
    }
    console.log(`\nFull mapping saved to:\n  ${mappingOut}`);
  }

  const integrity = {
    duplicateCodes: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM (
             SELECT code FROM Topics WHERE is_active = 1 GROUP BY code HAVING COUNT(*) > 1
           )`,
        )
        .get() as { c: number }
    ).c,
    mismatchedCodes: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM Topics t
           JOIN Sections s ON s.id = t.section_id
           JOIN Subjects sub ON sub.id = s.subject_id
           JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
           WHERE c.display_order >= 1 AND t.is_active = 1
             AND t.code != sub.code || c.school_class || '-' || s.code || '-' || printf('%03d', c.display_order)`,
        )
        .get() as { c: number }
    ).c,
    orphanRelations: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM TopicRelations tr
           LEFT JOIN Topics t ON t.id = tr.topic_id
           LEFT JOIN Topics rt ON rt.id = tr.related_topic_id
           WHERE tr.is_active = 1 AND (t.id IS NULL OR rt.id IS NULL)`,
        )
        .get() as { c: number }
    ).c,
    orphanLessonTopics: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM LessonTopics lt
           LEFT JOIN Topics t ON t.id = lt.topic_id
           LEFT JOIN Lessons l ON l.id = lt.lesson_id
           WHERE t.id IS NULL OR l.id IS NULL`,
        )
        .get() as { c: number }
    ).c,
  };

  console.log('\nIntegrity check:');
  console.log(`  Duplicate codes:       ${integrity.duplicateCodes}`);
  console.log(`  Mismatched codes:      ${integrity.mismatchedCodes}`);
  console.log(`  Orphan TopicRelations: ${integrity.orphanRelations}`);
  console.log(`  Orphan LessonTopics:   ${integrity.orphanLessonTopics}`);

  if (integrity.duplicateCodes > 0 || integrity.mismatchedCodes > 0) {
    db.close();
    process.exit(1);
  }

  console.log('\nFirst 20 topics (ORDER BY t.code ASC):');
  console.table(
    db
      .prepare(
        `SELECT c.display_order AS lp, t.code, substr(t.name_pl, 1, 35) AS name, s.code AS section
         FROM Topics t
         JOIN Sections s ON s.id = t.section_id
         JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5 AND c.is_active = 1
         WHERE t.is_active = 1 AND c.display_order >= 1
         ORDER BY t.code ASC
         LIMIT 20`,
      )
      .all(),
  );

  db.close();
}

main();
