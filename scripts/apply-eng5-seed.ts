#!/usr/bin/env tsx
/**
 * Import seed_klasa5_angielski.sql into the active EduMost Studio database.
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
const engSeedPath = path.join(__dirname, '../electron/database/seed/seed_klasa5_angielski.sql');

const EXPECTED = {
  sections: 7,
  topics: 90,
  curriculum: 90,
  lessons: 90,
  lessonTopics: 90,
  topicRelations: 178,
  requiresReview: 90,
};

const ENG_SECTIONS = ['MYW', 'RWG', 'BIT', 'CLB', 'ADV', 'LTC', 'FST'];

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
  firstLesson: { code: string; title_pl: string } | null;
  lastLesson: { code: string; title_pl: string } | null;
  errors: string[];
} {
  const errors: string[] = [];
  const sectionList = ENG_SECTIONS.map((s) => `'${s}'`).join(',');

  const sections = count(
    db,
    `SELECT COUNT(*) AS c FROM Sections s
     INNER JOIN Subjects sub ON sub.id = s.subject_id
     WHERE sub.code = 'ENG' AND s.code IN (${sectionList})`,
  );
  const topics = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'ENG5-%'`);
  const curriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum c
     INNER JOIN Topics t ON t.id = c.topic_id
     WHERE c.school_class = 5 AND t.code LIKE 'ENG5-%'`,
  );
  const lessons = count(db, `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'ENG5-L%'`);
  const lessonTopics = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics
     WHERE topic_id IN (SELECT id FROM Topics WHERE code LIKE 'ENG5-%')`,
  );
  const topicRelations = count(
    db,
    `SELECT COUNT(*) AS c FROM TopicRelations tr
     WHERE tr.topic_id IN (SELECT id FROM Topics WHERE code LIKE 'ENG5-%')`,
  );
  const requiresReview = count(
    db,
    `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'ENG5-L%' AND status = 'REQUIRES_REVIEW'`,
  );

  if (sections !== EXPECTED.sections) errors.push(`Sections: ${sections} (expected ${EXPECTED.sections})`);
  if (topics !== EXPECTED.topics) errors.push(`Topics: ${topics} (expected ${EXPECTED.topics})`);
  if (curriculum !== EXPECTED.curriculum) {
    errors.push(`Curriculum: ${curriculum} (expected ${EXPECTED.curriculum})`);
  }
  if (lessons !== EXPECTED.lessons) errors.push(`Lessons: ${lessons} (expected ${EXPECTED.lessons})`);
  if (lessonTopics !== EXPECTED.lessonTopics) {
    errors.push(`LessonTopics: ${lessonTopics} (expected ${EXPECTED.lessonTopics})`);
  }
  if (topicRelations !== EXPECTED.topicRelations) {
    errors.push(`TopicRelations: ${topicRelations} (expected ${EXPECTED.topicRelations})`);
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
       WHERE t.code LIKE 'ENG5-%'
       ORDER BY c.display_order ASC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  const lastTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'ENG5-%'
       ORDER BY c.display_order DESC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string } | undefined;

  const firstLesson = db
    .prepare(
      `SELECT code, title_pl FROM Lessons WHERE code LIKE 'ENG5-L%' ORDER BY code ASC LIMIT 1`,
    )
    .get() as { code: string; title_pl: string } | undefined;

  const lastLesson = db
    .prepare(
      `SELECT code, title_pl FROM Lessons WHERE code LIKE 'ENG5-L%' ORDER BY code DESC LIMIT 1`,
    )
    .get() as { code: string; title_pl: string } | undefined;

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
    firstLesson: firstLesson ?? null,
    lastLesson: lastLesson ?? null,
    errors,
  };
}

function main(): void {
  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(engSeedPath)) {
    console.error(`Seed file not found: ${engSeedPath}`);
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

    const existing = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'ENG5-%'`);
    if (existing > 0) {
      console.error(`ENG5 already present (${existing} topics). Aborting.`);
      process.exit(1);
    }

    const pre = pragmaChecks(db);
    if (pre.integrityCheck !== 'ok' || pre.quickCheck !== 'ok') {
      console.error('Pre-import integrity/quick check failed.');
      process.exit(1);
    }

    backupPath = createBackup(dbPath);
    db.exec(fs.readFileSync(engSeedPath, 'utf-8'));
    checkpoint(db);

    const result = validate(db);

    console.log('=== ENG5 IMPORT REPORT ===');
    console.log(`Sections:          ${result.sections}`);
    console.log(`Topics:            ${result.topics}`);
    console.log(`Curriculum:        ${result.curriculum}`);
    console.log(`Lessons:           ${result.lessons}`);
    console.log(`LessonTopics:      ${result.lessonTopics}`);
    console.log(`TopicRelations:    ${result.topicRelations}`);
    console.log(`REQUIRES_REVIEW:   ${result.requiresReview}`);
    if (result.firstTopic) {
      console.log(`Pierwszy topic:    ${result.firstTopic.code} — ${result.firstTopic.name_pl}`);
    }
    if (result.lastTopic) {
      console.log(`Ostatni topic:     ${result.lastTopic.code} — ${result.lastTopic.name_pl}`);
    }
    if (result.firstLesson) {
      console.log(`Pierwszy lesson:   ${result.firstLesson.code} — ${result.firstLesson.title_pl}`);
    }
    if (result.lastLesson) {
      console.log(`Ostatni lesson:    ${result.lastLesson.code} — ${result.lastLesson.title_pl}`);
    }
    console.log(`integrity_check:   ${result.integrityCheck}`);
    console.log(`quick_check:       ${result.quickCheck}`);
    console.log(
      `foreign_key_check: ${result.foreignKeyCheck.length === 0 ? 'ok' : result.foreignKeyCheck.join('; ')}`,
    );
    console.log(`Backup:            ${backupPath}`);

    if (!result.ok) {
      db.close();
      db = null;
      restoreBackup(dbPath, backupPath);
      console.log('FAIL — rollback wykonany');
      for (const err of result.errors) {
        console.error(`  • ${err}`);
      }
      process.exit(1);
    }

    console.log('PASS');
  } catch (error) {
    if (backupPath && dbPath) {
      if (db) {
        db.close();
        db = null;
      }
      restoreBackup(dbPath, backupPath);
      console.error('FAIL — rollback wykonany po błędzie');
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
