#!/usr/bin/env tsx
/** Compare topics:list with and without schoolClass (diagnose UI mismatch). */
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { RepositoryRegistry } from '../electron/repositories';

const dbPath = path.join(
  os.homedir(),
  'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
);

const db = new Database(dbPath);
const repos = new RepositoryRegistry(db);
const matId = repos.subjects.findAll().find((s) => s.code === 'MAT')!.id;

function printTable(label: string, rows: ReturnType<typeof repos.topics.findAll>) {
  console.log(`\n### ${label}\n`);
  console.log('| curriculum_display_order | code | name_pl |');
  console.log('|---:|---|---|');
  for (const row of rows.slice(0, 20)) {
    console.log(
      `| ${row.curriculum_display_order ?? 'NULL'} | ${row.code} | ${row.name_pl.slice(0, 40)} |`,
    );
  }
}

printTable('A) CURRENT REPO: subjectId=MAT, schoolClass=5', repos.topics.findAll({
  subjectId: matId,
  schoolClass: 5,
  limit: 20,
  offset: 0,
}));

printTable('B) NO schoolClass (subjectId=MAT only)', repos.topics.findAll({
  subjectId: matId,
  limit: 20,
  offset: 0,
}));

// Simulate committed HEAD: ORDER BY t.code ASC
const legacyRows = db
  .prepare(
    `SELECT t.code, t.name_pl, c.display_order AS curriculum_display_order
     FROM Topics t
     INNER JOIN Sections s ON s.id = t.section_id
     LEFT JOIN Curriculum c ON c.topic_id = t.id AND c.is_active = 1
       AND c.school_class = (SELECT MIN(c2.school_class) FROM Curriculum c2 WHERE c2.topic_id = t.id AND c2.is_active = 1)
     WHERE t.is_active = 1 AND s.subject_id = ?
     ORDER BY t.code ASC
     LIMIT 20`,
  )
  .all(matId) as Array<{
  code: string;
  name_pl: string;
  curriculum_display_order: number | null;
}>;

console.log('\n### C) LEGACY (ORDER BY t.code ASC, no schoolClass filter)\n');
console.log('| curriculum_display_order | code | name_pl |');
console.log('|---:|---|---|');
for (const row of legacyRows) {
  console.log(
    `| ${row.curriculum_display_order ?? 'NULL'} | ${row.code} | ${row.name_pl.slice(0, 40)} |`,
  );
}

db.close();
