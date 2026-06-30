#!/usr/bin/env tsx
/**
 * Import seed_klasa5_historia.sql into the active EduMost Studio database.
 * Creates a backup first; restores it if post-import validation fails.
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
const histSeedPath = path.join(__dirname, '../electron/database/seed/seed_klasa5_historia.sql');

const EXPECTED = {
  topics: 52,
  curriculum: 52,
  lessons: 52,
  lessonTopics: 52,
};

function count(db: Database.Database, sql: string): number {
  return (db.prepare(sql).get() as { c: number }).c;
}

function checkpoint(db: Database.Database): void {
  db.pragma('wal_checkpoint(TRUNCATE)');
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
  topics: number;
  curriculumUserQuery: number;
  curriculum: number;
  lessons: number;
  lessonTopics: number;
  integrityCheck: string;
  quickCheck: string;
  foreignKeyCheck: string[];
  firstTopic: { code: string; name_pl: string } | null;
  lastTopic: { code: string; name_pl: string } | null;
  errors: string[];
} {
  const errors: string[] = [];

  const topics = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'HIST5-%'`);
  const curriculumUserQuery = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum
     WHERE school_class = 5 AND curriculum_code LIKE 'HIST5.%'`,
  );
  const curriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum c
     INNER JOIN Topics t ON t.id = c.topic_id
     WHERE c.school_class = 5 AND t.code LIKE 'HIST5-%'`,
  );
  const lessons = count(db, `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'HIST5-L%'`);
  const lessonTopics = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics
     WHERE topic_id IN (SELECT id FROM Topics WHERE code LIKE 'HIST5-%')`,
  );

  if (topics !== EXPECTED.topics) errors.push(`Topics HIST5: ${topics} (expected ${EXPECTED.topics})`);
  if (curriculum !== EXPECTED.curriculum) {
    errors.push(`Curriculum HIST5 (via Topics): ${curriculum} (expected ${EXPECTED.curriculum})`);
  }
  if (lessons !== EXPECTED.lessons) errors.push(`Lessons HIST5: ${lessons} (expected ${EXPECTED.lessons})`);
  if (lessonTopics !== EXPECTED.lessonTopics) {
    errors.push(`LessonTopics HIST5: ${lessonTopics} (expected ${EXPECTED.lessonTopics})`);
  }

  const integrityCheck = (db.pragma('integrity_check') as { integrity_check: string }[])[0]
    .integrity_check;
  const quickCheck = (db.pragma('quick_check') as { quick_check: string }[])[0].quick_check;
  const fkRows = db.pragma('foreign_key_check') as {
    table: string;
    rowid: number;
    parent: string;
    fkid: number;
  }[];

  if (integrityCheck !== 'ok') errors.push(`integrity_check: ${integrityCheck}`);
  if (quickCheck !== 'ok') errors.push(`quick_check: ${quickCheck}`);
  if (fkRows.length > 0) {
    errors.push(`foreign_key_check: ${fkRows.length} violation(s)`);
  }

  const firstTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'HIST5-%'
       ORDER BY c.display_order ASC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  const lastTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'HIST5-%'
       ORDER BY c.display_order DESC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  return {
    ok: errors.length === 0,
    topics,
    curriculumUserQuery,
    curriculum,
    lessons,
    lessonTopics,
    integrityCheck,
    quickCheck,
    foreignKeyCheck: fkRows.map(
      (r) => `${r.table} rowid=${r.rowid} → ${r.parent} (fkid=${r.fkid})`,
    ),
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
  if (!fs.existsSync(histSeedPath)) {
    console.error(`Seed file not found: ${histSeedPath}`);
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

    const existingHist = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'HIST5-%'`);
    if (existingHist > 0) {
      console.error(`HIST5 already present (${existingHist} topics). Aborting to avoid duplicates.`);
      process.exit(1);
    }

    console.log('=== HIST5 IMPORT ===\n');
    console.log(`Target DB: ${dbPath}\n`);

    backupPath = createBackup(dbPath);
    console.log(`Backup created: ${backupPath}\n`);

    console.log('Loading seed_klasa5_historia.sql …');
    db.exec(fs.readFileSync(histSeedPath, 'utf-8'));
    checkpoint(db);

    const result = validate(db);

    console.log('=== WALIDACJA ===\n');
    console.log(`Backup:              ${backupPath}`);
    console.log(`Topics HIST5:         ${result.topics}`);
    console.log(
      `Curriculum HIST5:     ${result.curriculumUserQuery}  (zapytanie: curriculum_code LIKE 'HIST5.%')`,
    );
    console.log(
      `Curriculum HIST5:     ${result.curriculum}  (via Topics JOIN, school_class = 5)`,
    );
    console.log(`Lessons HIST5:        ${result.lessons}`);
    console.log(`LessonTopics HIST5:   ${result.lessonTopics}`);
    console.log(`integrity_check:     ${result.integrityCheck}`);
    console.log(`quick_check:         ${result.quickCheck}`);
    console.log(
      `foreign_key_check:   ${result.foreignKeyCheck.length === 0 ? 'brak naruszeń' : result.foreignKeyCheck.join('; ')}`,
    );
    if (result.firstTopic) {
      console.log(`Pierwszy HIST5:       ${result.firstTopic.code} — ${result.firstTopic.name_pl}`);
    }
    if (result.lastTopic) {
      console.log(`Ostatni HIST5:        ${result.lastTopic.code} — ${result.lastTopic.name_pl}`);
    }

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
