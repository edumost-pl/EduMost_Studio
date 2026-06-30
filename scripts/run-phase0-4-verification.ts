#!/usr/bin/env tsx
/**
 * Phase 0–4 verification: migrations, integrity, MAT5 count, 5 restart stability.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  closeDatabaseService,
  getDatabaseService,
  initDatabaseService,
} from '../electron/database/DatabaseService';
import { RepositoryRegistry } from '../electron/repositories';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userDataPath = path.join(os.homedir(), 'Library/Application Support/edumost-studio');
const assetsBaseDir = path.join(__dirname, '../dist-electron');
const dbPath = path.join(userDataPath, 'EduMost Studio/edumost.db');

interface DbSnapshot {
  sizeBytes: number;
  migrations: string[];
  mat5Topics: number;
  mat5Lessons: number;
  subjects: number;
  topics: number;
  firstTopicCode: string | null;
  firstTopicOrder: number | null;
}

function readSnapshot(): DbSnapshot {
  const db = getDatabaseService().getDatabase();
  const migrations = (
    db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{
      version: string;
    }>
  ).map((row) => row.version);

  const mat5Topics = (
    db.prepare(
      `SELECT COUNT(*) AS c FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       WHERE sub.code = 'MAT' AND t.code LIKE 'MAT5-%' AND t.is_active = 1`,
    ).get() as { c: number }
  ).c;

  const mat5Lessons = (
    db.prepare(
      `SELECT COUNT(*) AS c FROM Lessons
       WHERE subject_id = (SELECT id FROM Subjects WHERE code = 'MAT')
         AND school_class = 5 AND code LIKE 'MAT5-L%'`,
    ).get() as { c: number }
  ).c;

  const subjects = (db.prepare('SELECT COUNT(*) AS c FROM Subjects').get() as { c: number }).c;
  const topics = (db.prepare('SELECT COUNT(*) AS c FROM Topics').get() as { c: number }).c;

  const repos = new RepositoryRegistry(db);
  const mat = repos.subjects.findAll().find((s) => s.code === 'MAT');
  const first = mat
    ? repos.topics.findAll({ subjectId: mat.id, schoolClass: 5, limit: 1, offset: 0 })[0]
    : undefined;

  return {
    sizeBytes: fs.statSync(dbPath).size,
    migrations,
    mat5Topics,
    mat5Lessons,
    subjects,
    topics,
    firstTopicCode: first?.code ?? null,
    firstTopicOrder: first?.curriculum_display_order ?? null,
  };
}

function printIntegrityChecks(): void {
  const db = getDatabaseService().getDatabase();
  const integrity = db.pragma('integrity_check') as Array<{ integrity_check: string }>;
  const quick = db.pragma('quick_check') as Array<{ quick_check: string }>;
  const migrations = db.prepare('SELECT version FROM schema_migrations ORDER BY version').all();

  console.log('\n=== PRAGMA integrity_check ===');
  for (const row of integrity) {
    console.log(row.integrity_check ?? row);
  }

  console.log('\n=== PRAGMA quick_check ===');
  for (const row of quick) {
    console.log(row.quick_check ?? row);
  }

  console.log('\n=== schema_migrations ===');
  console.table(migrations);
}

function snapshotsEqual(a: DbSnapshot, b: DbSnapshot): boolean {
  return (
    a.mat5Topics === b.mat5Topics &&
    a.mat5Lessons === b.mat5Lessons &&
    a.subjects === b.subjects &&
    a.topics === b.topics &&
    a.firstTopicCode === b.firstTopicCode &&
    a.firstTopicOrder === b.firstTopicOrder &&
    a.migrations.join('|') === b.migrations.join('|')
  );
}

console.log('=== Phase 0–4 verification ===');
console.log('DB:', dbPath);
console.log('Assets:', assetsBaseDir);

initDatabaseService({ userDataPath, assetsBaseDir });
printIntegrityChecks();

const afterMigration = readSnapshot();
console.log('\n=== Post-migration snapshot ===');
console.log(JSON.stringify(afterMigration, null, 2));

console.log('\n=== Explorer (topics:list MAT5, limit 5) ===');
const db = getDatabaseService().getDatabase();
const repos = new RepositoryRegistry(db);
const mat = repos.subjects.findAll().find((s) => s.code === 'MAT')!;
const rows = repos.topics.findAll({ subjectId: mat.id, schoolClass: 5, limit: 5, offset: 0 });
console.log('| order | code | name_pl |');
console.log('|---:|---|---|');
for (const row of rows) {
  console.log(`| ${row.curriculum_display_order} | ${row.code} | ${row.name_pl.slice(0, 40)} |`);
}

closeDatabaseService();

console.log('\n=== 5 restart stability test ===');
let baseline: DbSnapshot | null = null;
for (let i = 1; i <= 5; i += 1) {
  initDatabaseService({ userDataPath, assetsBaseDir });
  const snap = readSnapshot();
  console.log(`Restart ${i}: MAT5=${snap.mat5Topics}, topics=${snap.topics}, migrations=${snap.migrations.length}`);
  if (baseline === null) {
    baseline = snap;
  } else if (!snapshotsEqual(baseline, snap)) {
    console.error('FAIL: snapshot changed on restart', i);
    console.error('baseline:', baseline);
    console.error('current:', snap);
    closeDatabaseService();
    process.exit(1);
  }
  closeDatabaseService();
}

console.log('\n=== RESULT ===');
const mat5Ok = afterMigration.mat5Topics === 71;
const explorerOk = afterMigration.firstTopicCode === 'MAT5-NUM-001' && afterMigration.firstTopicOrder === 1;
console.log(`MAT5 topics = 71: ${mat5Ok ? 'PASS' : 'FAIL'} (${afterMigration.mat5Topics})`);
console.log(`Explorer first topic: ${explorerOk ? 'PASS' : 'FAIL'} (${afterMigration.firstTopicCode}, order ${afterMigration.firstTopicOrder})`);
console.log('5 restarts stable: PASS');
console.log(`Has 004_global_topic_codes: ${afterMigration.migrations.includes('004_global_topic_codes') ? 'yes' : 'no'}`);
console.log(`Has 005_drop_idx_topics_code: ${afterMigration.migrations.includes('005_drop_idx_topics_code') ? 'yes' : 'no'}`);
console.log(`Has seed_klasa5_matematyka_v1: ${afterMigration.migrations.includes('seed_klasa5_matematyka_v1') ? 'yes' : 'no'}`);

if (!mat5Ok || !explorerOk) {
  process.exit(1);
}
