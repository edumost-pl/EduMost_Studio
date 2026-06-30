#!/usr/bin/env tsx
/**
 * Import seed_klasa5_biologia.sql into the active EduMost Studio database.
 * Pre-import: integrity_check, quick_check, backup.
 * Post-import: validation report with PRAGMA checks.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { DatabaseInUseError, DatabaseLock } from '../electron/database/databaseLock';
import { configureDatabaseConnection } from '../electron/database/databasePragmas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDb = path.join(
  os.homedir(),
  'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
);
const dbPath = process.argv[2] ?? defaultDb;
const bioSeedPath = path.join(__dirname, '../electron/database/seed/seed_klasa5_biologia.sql');

const EXPECTED = {
  sections: 5,
  topics: 33,
  curriculum: 33,
  lessons: 33,
  lessonTopics: 33,
  topicRelations: 64,
  requiresReview: 33,
};

function count(db: Database.Database, sql: string): number {
  return (db.prepare(sql).get() as { c: number }).c;
}

function checkpoint(db: Database.Database): void {
  db.pragma('wal_checkpoint(TRUNCATE)');
}

function pragmaChecks(db: Database.Database): {
  integrityCheck: string;
  quickCheck: string;
  foreignKeyCheck: string[];
} {
  const integrityCheck = (db.pragma('integrity_check') as { integrity_check: string }[])[0]
    .integrity_check;
  const quickCheck = (db.pragma('quick_check') as { quick_check: string }[])[0].quick_check;
  const fkRows = db.pragma('foreign_key_check') as {
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
  }[];
  return {
    integrityCheck,
    quickCheck,
    foreignKeyCheck: fkRows.map(
      (r) => `${r.table} rowid=${r.rowid} → ${r.parent} (fkid=${r.fkid})`,
    ),
  };
}

function formatBackupFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `backup_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}.db`;
}

function createBackup(dbPath: string): string {
  const backupsDir = path.join(path.dirname(dbPath), 'Backups');
  fs.mkdirSync(backupsDir, { recursive: true });
  const destPath = path.join(backupsDir, formatBackupFileName());
  fs.copyFileSync(dbPath, destPath);
  for (const suffix of ['-wal', '-shm']) {
    const sidecar = `${dbPath}${suffix}`;
    if (fs.existsSync(sidecar)) {
      fs.copyFileSync(sidecar, `${destPath}${suffix}`);
    }
  }
  return destPath;
}

function restoreBackup(dbPath: string, backupPath: string): void {
  fs.copyFileSync(backupPath, dbPath);
  for (const suffix of ['-wal', '-shm']) {
    const sidecar = `${backupPath}${suffix}`;
    if (fs.existsSync(sidecar)) {
      fs.copyFileSync(sidecar, `${dbPath}${suffix}`);
    } else {
      const dest = `${dbPath}${suffix}`;
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
    }
  }
}

function validate(db: Database.Database): {
  ok: boolean;
  sections: number;
  topics: number;
  curriculum: number;
  lessons: number;
  lessonTopics: number;
  topicRelations: number;
  requiresReview: number;
  integrityCheck: string;
  quickCheck: string;
  foreignKeyCheck: string[];
  firstTopic: { code: string; name_pl: string } | null;
  lastTopic: { code: string; name_pl: string } | null;
  errors: string[];
} {
  const errors: string[] = [];

  const sections = count(
    db,
    `SELECT COUNT(*) AS c FROM Sections s
     INNER JOIN Subjects sub ON sub.id = s.subject_id
     WHERE sub.code = 'BIO' AND s.code IN ('NAU','ORG','MIK','TKA','ROZ')`,
  );
  const topics = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'BIO5-%'`);
  const curriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum c
     INNER JOIN Topics t ON t.id = c.topic_id
     WHERE c.school_class = 5 AND t.code LIKE 'BIO5-%'`,
  );
  const lessons = count(db, `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'BIO5-L%'`);
  const lessonTopics = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics
     WHERE topic_id IN (SELECT id FROM Topics WHERE code LIKE 'BIO5-%')`,
  );
  const topicRelations = count(
    db,
    `SELECT COUNT(*) AS c FROM TopicRelations tr
     WHERE tr.topic_id IN (SELECT id FROM Topics WHERE code LIKE 'BIO5-%')`,
  );
  const requiresReview = count(
    db,
    `SELECT COUNT(*) AS c FROM Lessons l
     INNER JOIN LessonTopics lt ON lt.lesson_id = l.id
     INNER JOIN Topics t ON t.id = lt.topic_id
     WHERE t.code LIKE 'BIO5-%' AND l.status = 'REQUIRES_REVIEW'`,
  );

  if (sections !== EXPECTED.sections) errors.push(`Sections BIO5: ${sections} (expected ${EXPECTED.sections})`);
  if (topics !== EXPECTED.topics) errors.push(`Topics BIO5: ${topics} (expected ${EXPECTED.topics})`);
  if (curriculum !== EXPECTED.curriculum) {
    errors.push(`Curriculum BIO5: ${curriculum} (expected ${EXPECTED.curriculum})`);
  }
  if (lessons !== EXPECTED.lessons) errors.push(`Lessons BIO5: ${lessons} (expected ${EXPECTED.lessons})`);
  if (lessonTopics !== EXPECTED.lessonTopics) {
    errors.push(`LessonTopics BIO5: ${lessonTopics} (expected ${EXPECTED.lessonTopics})`);
  }
  if (topicRelations !== EXPECTED.topicRelations) {
    errors.push(`TopicRelations BIO5: ${topicRelations} (expected ${EXPECTED.topicRelations})`);
  }
  if (requiresReview !== EXPECTED.requiresReview) {
    errors.push(`REQUIRES_REVIEW: ${requiresReview} (expected ${EXPECTED.requiresReview})`);
  }

  const { integrityCheck, quickCheck, foreignKeyCheck } = pragmaChecks(db);
  if (integrityCheck !== 'ok') errors.push(`integrity_check: ${integrityCheck}`);
  if (quickCheck !== 'ok') errors.push(`quick_check: ${quickCheck}`);
  if (foreignKeyCheck.length > 0) {
    errors.push(`foreign_key_check: ${foreignKeyCheck.length} violation(s)`);
  }

  const firstTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'BIO5-%'
       ORDER BY c.display_order ASC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  const lastTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'BIO5-%'
       ORDER BY c.display_order DESC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  return {
    ok: errors.length === 0,
    sections,
    topics,
    curriculum,
    lessons,
    lessonTopics,
    topicRelations,
    requiresReview,
    integrityCheck,
    quickCheck,
    foreignKeyCheck,
    firstTopic: firstTopic ?? null,
    lastTopic: lastTopic ?? null,
    errors,
  };
}

function main(): void {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(bioSeedPath)) {
    console.error(`Seed file not found: ${bioSeedPath}`);
    process.exit(1);
  }

  const dbLock = new DatabaseLock(dbPath);
  try {
    dbLock.acquire();
  } catch (error) {
    if (error instanceof DatabaseInUseError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  let backupPath: string | null = null;
  let db: Database.Database | null = null;

  try {
    db = new Database(dbPath);
    configureDatabaseConnection(db);
    checkpoint(db);

    const existingBio = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'BIO5-%'`);
    if (existingBio > 0) {
      console.error(`BIO5 already present (${existingBio} topics). Aborting to avoid duplicates.`);
      process.exit(1);
    }

    console.log('=== BIO5 IMPORT ===\n');
    console.log(`Target DB: ${dbPath}\n`);

    const pre = pragmaChecks(db);
    console.log('=== PRZED IMPORTEM ===\n');
    console.log(`integrity_check:     ${pre.integrityCheck}`);
    console.log(`quick_check:         ${pre.quickCheck}`);
    if (pre.integrityCheck !== 'ok' || pre.quickCheck !== 'ok') {
      console.error('\nBaza nie przeszła kontroli przed importem. Przerywam.');
      process.exit(1);
    }

    backupPath = createBackup(dbPath);
    console.log(`\nBackup created: ${backupPath}\n`);

    console.log('Loading seed_klasa5_biologia.sql …');
    db.exec(fs.readFileSync(bioSeedPath, 'utf-8'));
    checkpoint(db);

    const result = validate(db);

    console.log('=== RAPORT PO IMPORCIE ===\n');
    console.log(`Backup:               ${backupPath}`);
    console.log(`Sekcje BIO5:          ${result.sections}`);
    console.log(`Tematy BIO5:          ${result.topics}`);
    console.log(`Curriculum BIO5:      ${result.curriculum}`);
    console.log(`Lekcje BIO5:          ${result.lessons}`);
    console.log(`LessonTopics BIO5:    ${result.lessonTopics}`);
    console.log(`TopicRelations BIO5:  ${result.topicRelations}`);
    console.log(`REQUIRES_REVIEW:      ${result.requiresReview}`);
    if (result.firstTopic) {
      console.log(`Pierwszy temat:       ${result.firstTopic.code} — ${result.firstTopic.name_pl}`);
    }
    if (result.lastTopic) {
      console.log(`Ostatni temat:        ${result.lastTopic.code} — ${result.lastTopic.name_pl}`);
    }
    console.log(`integrity_check:      ${result.integrityCheck}`);
    console.log(`quick_check:          ${result.quickCheck}`);
    console.log(
      `foreign_key_check:    ${result.foreignKeyCheck.length === 0 ? 'brak naruszeń' : result.foreignKeyCheck.join('; ')}`,
    );

    if (!result.ok) {
      console.error('\n=== WALIDACJA NIEUDANA — PRZYWRACANIE BACKUPU ===\n');
      for (const err of result.errors) {
        console.error(`  • ${err}`);
      }
      db.close();
      db = null;
      restoreBackup(dbPath, backupPath);
      console.error(`\nPrzywrócono backup: ${backupPath}`);
      process.exit(1);
    }

    console.log('\n=== WYNIK ===');
    console.log('PASS');
  } catch (error) {
    if (backupPath && dbPath) {
      console.error('\nBłąd importu — przywracanie backupu …');
      if (db) {
        db.close();
        db = null;
      }
      restoreBackup(dbPath, backupPath);
      console.error(`Przywrócono backup: ${backupPath}`);
    }
    throw error;
  } finally {
    if (db) {
      db.close();
    }
    dbLock.release();
  }
}

main();
