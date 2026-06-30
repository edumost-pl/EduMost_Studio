#!/usr/bin/env tsx
/**
 * Integration test: fresh SQLite DB with schema, migrations, MAT5 + POL5 seeds.
 * Does NOT touch edumost.db.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { configureDatabaseConnection } from '../electron/database/databasePragmas';
import { isDatabaseEmpty, runMigrations } from '../electron/database/migrate';
import { runSeed } from '../electron/database/seed';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsBaseDir = path.join(__dirname, '../electron');
const testRoot = path.join(os.tmpdir(), `edumost-pol5-integration-${Date.now()}`);
const dbPath = path.join(testRoot, 'EduMost Studio', 'edumost.db');
const matSeedPath = path.join(assetsBaseDir, 'database/seed/seed_klasa5_matematyka.sql');
const polSeedPath = path.join(assetsBaseDir, 'database/seed/seed_klasa5_jezyk_polski.sql');

interface CheckResult {
  name: string;
  expected: number | string;
  actual: number | string;
  ok: boolean;
}

function count(db: Database.Database, sql: string): number {
  return (db.prepare(sql).get() as { c: number }).c;
}

function main(): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  configureDatabaseConnection(db);

  console.log('=== POL5 INTEGRATION TEST ===\n');
  console.log(`Temp DB: ${dbPath}\n`);

  console.log('Step 1: migrations (schema 001–005 + 004_global_topic_codes)');
  runMigrations(db, assetsBaseDir);

  console.log('Step 2: base seed.sql (Subjects — wymagane dla subject_id 1/2)');
  if (isDatabaseEmpty(db)) {
    runSeed(db, assetsBaseDir);
  }

  console.log('Step 3: seed_klasa5_matematyka.sql');
  db.exec(fs.readFileSync(matSeedPath, 'utf-8'));

  console.log('Step 4: seed_klasa5_jezyk_polski.sql');
  db.exec(fs.readFileSync(polSeedPath, 'utf-8'));

  const checks: CheckResult[] = [
    {
      name: 'Sections POL5',
      expected: 11,
      actual: count(
        db,
        `SELECT COUNT(*) AS c FROM Sections s
         INNER JOIN Subjects sub ON sub.id = s.subject_id
         WHERE sub.code = 'POL'
           AND EXISTS (SELECT 1 FROM Topics t WHERE t.section_id = s.id AND t.code LIKE 'POL5-%')`,
      ),
      ok: false,
    },
    {
      name: 'Topics POL5',
      expected: 112,
      actual: count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'POL5-%'`),
      ok: false,
    },
    {
      name: 'Curriculum POL5 (class 5)',
      expected: 112,
      actual: count(
        db,
        `SELECT COUNT(*) AS c FROM Curriculum c
         INNER JOIN Topics t ON t.id = c.topic_id
         WHERE t.code LIKE 'POL5-%' AND c.school_class = 5`,
      ),
      ok: false,
    },
    {
      name: 'Lessons POL5',
      expected: 112,
      actual: count(
        db,
        `SELECT COUNT(*) AS c FROM Lessons
         WHERE code LIKE 'POL5-L%' AND school_class = 5`,
      ),
      ok: false,
    },
    {
      name: 'LessonTopics POL5',
      expected: 112,
      actual: count(
        db,
        `SELECT COUNT(*) AS c FROM LessonTopics lt
         INNER JOIN Lessons l ON l.id = lt.lesson_id
         INNER JOIN Topics t ON t.id = lt.topic_id
         WHERE l.code LIKE 'POL5-L%' AND t.code LIKE 'POL5-%'`,
      ),
      ok: false,
    },
  ];

  for (const c of checks) {
    c.ok = c.actual === c.expected;
  }

  const dupTopicCodes = db
    .prepare(
      `SELECT code, COUNT(*) AS n FROM Topics WHERE code LIKE 'POL5-%'
       GROUP BY code HAVING COUNT(*) > 1`,
    )
    .all() as Array<{ code: string; n: number }>;

  const dupLessonCodes = db
    .prepare(
      `SELECT code, COUNT(*) AS n FROM Lessons WHERE code LIKE 'POL5-L%'
       GROUP BY code HAVING COUNT(*) > 1`,
    )
    .all() as Array<{ code: string; n: number }>;

  const orphanCurriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum c
     LEFT JOIN Topics t ON t.id = c.topic_id WHERE t.id IS NULL`,
  );
  const orphanLessonTopicsLesson = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics lt
     LEFT JOIN Lessons l ON l.id = lt.lesson_id WHERE l.id IS NULL`,
  );
  const orphanLessonTopicsTopic = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics lt
     LEFT JOIN Topics t ON t.id = lt.topic_id WHERE t.id IS NULL`,
  );
  const polTopicsWithoutCurriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Topics t
     LEFT JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
     WHERE t.code LIKE 'POL5-%' AND c.id IS NULL`,
  );
  const polLessonsWithoutLink = count(
    db,
    `SELECT COUNT(*) AS c FROM Lessons l
     LEFT JOIN LessonTopics lt ON lt.lesson_id = l.id
     WHERE l.code LIKE 'POL5-L%' AND lt.id IS NULL`,
  );

  const fkViolations = db.pragma('foreign_key_check') as Array<{
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
  }>;

  const integrity = db.pragma('integrity_check') as Array<{ integrity_check: string }>;
  const quick = db.pragma('quick_check') as Array<{ quick_check: string }>;

  const displayOrders = (
    db
      .prepare(
        `SELECT c.display_order AS o FROM Curriculum c
         INNER JOIN Topics t ON t.id = c.topic_id
         WHERE t.code LIKE 'POL5-%' AND c.school_class = 5
         ORDER BY c.display_order`,
      )
      .all() as Array<{ o: number }>
  ).map((r) => r.o);

  const expectedOrders = Array.from({ length: 112 }, (_, i) => i + 1);
  const orderOk = JSON.stringify(displayOrders) === JSON.stringify(expectedOrders);

  const migrations = (
    db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{
      version: string;
    }>
  ).map((r) => r.version);

  const mat5Topics = count(
    db,
    `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'MAT5-%'`,
  );

  console.log('\n=== COUNTS (POL5) ===\n');
  console.log('| Metryka | Otrzymano | Oczekiwano | Status |');
  console.log('|---------|----------:|-----------:|--------|');
  let allOk = true;
  for (const c of checks) {
    const status = c.ok ? 'OK' : 'FAIL';
    if (!c.ok) allOk = false;
    console.log(`| ${c.name} | ${c.actual} | ${c.expected} | ${status} |`);
  }

  console.log('\n=== display_order Curriculum POL5 ===');
  console.log(orderOk ? '1–112 ciągły: OK' : `FAIL — zakres ${displayOrders[0]}–${displayOrders[displayOrders.length - 1]}, luk: ${expectedOrders.filter((x) => !displayOrders.includes(x)).slice(0, 10)}`);
  if (!orderOk) allOk = false;

  console.log('\n=== DUPLIKATY code ===');
  console.log(`Topics.code: ${dupTopicCodes.length === 0 ? 'brak' : dupTopicCodes.map((d) => d.code).join(', ')}`);
  console.log(`Lessons.code: ${dupLessonCodes.length === 0 ? 'brak' : dupLessonCodes.map((d) => d.code).join(', ')}`);
  if (dupTopicCodes.length || dupLessonCodes.length) allOk = false;

  console.log('\n=== OSIEROCE REKORDY ===');
  console.log(`Curriculum bez Topics: ${orphanCurriculum}`);
  console.log(`LessonTopics bez Lessons: ${orphanLessonTopicsLesson}`);
  console.log(`LessonTopics bez Topics: ${orphanLessonTopicsTopic}`);
  console.log(`POL5 Topics bez Curriculum: ${polTopicsWithoutCurriculum}`);
  console.log(`POL5 Lessons bez LessonTopics: ${polLessonsWithoutLink}`);
  const orphanTotal =
    orphanCurriculum +
    orphanLessonTopicsLesson +
    orphanLessonTopicsTopic +
    polTopicsWithoutCurriculum +
    polLessonsWithoutLink;
  if (orphanTotal > 0) allOk = false;

  console.log('\n=== FOREIGN KEY ===');
  if (fkViolations.length === 0) {
    console.log('foreign_key_check: brak naruszeń');
  } else {
    allOk = false;
    console.table(fkViolations);
  }

  console.log('\n=== PRAGMA integrity_check ===');
  for (const row of integrity) {
    console.log(row.integrity_check ?? row);
    if (row.integrity_check !== 'ok') allOk = false;
  }

  console.log('\n=== PRAGMA quick_check ===');
  for (const row of quick) {
    console.log(row.quick_check ?? row);
    if (row.quick_check !== 'ok') allOk = false;
  }

  console.log('\n=== KONTEKST ===');
  console.log(`MAT5 topics (ładowane razem): ${mat5Topics}`);
  console.log(`schema_migrations: ${migrations.join(', ')}`);
  console.log(`Rozmiar bazy: ${fs.statSync(dbPath).size.toLocaleString()} B`);

  const firstPol = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'POL5-%' ORDER BY c.display_order ASC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string };
  const lastPol = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'POL5-%' ORDER BY c.display_order DESC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string };
  console.log(`Pierwszy POL5: ${firstPol.code} — ${firstPol.name_pl}`);
  console.log(`Ostatni POL5: ${lastPol.code} — ${lastPol.name_pl}`);

  db.close();

  console.log('\n=== WYNIK ===');
  console.log(allOk ? 'PASS' : 'FAIL');
  console.log(`\nTemp DB preserved at: ${dbPath}`);
  console.log('(edumost.db — nie modyfikowana)');

  if (!allOk) {
    process.exit(1);
  }
}

main();
