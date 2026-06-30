#!/usr/bin/env tsx
/**
 * Integration test: fresh SQLite DB with schema, migrations, ENG5 seed only.
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
const testRoot = path.join(os.tmpdir(), `edumost-eng5-integration-${Date.now()}`);
const dbPath = path.join(testRoot, 'EduMost Studio', 'edumost.db');
const engSeedPath = path.join(assetsBaseDir, 'database/seed/seed_klasa5_angielski.sql');

const EXPECTED = {
  sections: 7,
  topics: 90,
  curriculum: 90,
  lessons: 90,
  lessonTopics: 90,
  topicRelations: 178,
  requiresReview: 90,
};

function count(db: Database.Database, sql: string): number {
  return (db.prepare(sql).get() as { c: number }).c;
}

function main(): void {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  configureDatabaseConnection(db);

  runMigrations(db, assetsBaseDir);
  if (isDatabaseEmpty(db)) {
    runSeed(db, assetsBaseDir);
  }
  db.exec(fs.readFileSync(engSeedPath, 'utf-8'));

  const sections = count(
    db,
    `SELECT COUNT(*) AS c FROM Sections s
     INNER JOIN Subjects sub ON sub.id = s.subject_id
     WHERE sub.code = 'ENG'`,
  );
  const topics = count(db, `SELECT COUNT(*) AS c FROM Topics WHERE code LIKE 'ENG5-%'`);
  const curriculum = count(
    db,
    `SELECT COUNT(*) AS c FROM Curriculum c
     INNER JOIN Topics t ON t.id = c.topic_id
     WHERE t.code LIKE 'ENG5-%' AND c.school_class = 5`,
  );
  const lessons = count(db, `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'ENG5-L%'`);
  const lessonTopics = count(
    db,
    `SELECT COUNT(*) AS c FROM LessonTopics lt
     INNER JOIN Lessons l ON l.id = lt.lesson_id
     INNER JOIN Topics t ON t.id = lt.topic_id
     WHERE l.code LIKE 'ENG5-L%' AND t.code LIKE 'ENG5-%'`,
  );
  const topicRelations = count(
    db,
    `SELECT COUNT(*) AS c FROM TopicRelations tr
     INNER JOIN Topics src ON src.id = tr.topic_id
     WHERE src.code LIKE 'ENG5-%'`,
  );
  const requiresReview = count(
    db,
    `SELECT COUNT(*) AS c FROM Lessons WHERE code LIKE 'ENG5-L%' AND status = 'REQUIRES_REVIEW'`,
  );

  const integrityCheck = (db.pragma('integrity_check') as { integrity_check: string }[])[0]
    .integrity_check;
  const quickCheck = (db.pragma('quick_check') as { quick_check: string }[])[0].quick_check;
  const fkRows = db.pragma('foreign_key_check') as unknown[];

  const checks = [
    sections === EXPECTED.sections,
    topics === EXPECTED.topics,
    curriculum === EXPECTED.curriculum,
    lessons === EXPECTED.lessons,
    lessonTopics === EXPECTED.lessonTopics,
    topicRelations === EXPECTED.topicRelations,
    requiresReview === EXPECTED.requiresReview,
    integrityCheck === 'ok',
    quickCheck === 'ok',
    fkRows.length === 0,
  ];

  const firstTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'ENG5-%' ORDER BY c.display_order ASC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string };
  const lastTopic = db
    .prepare(
      `SELECT t.code, t.name_pl FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id AND c.school_class = 5
       WHERE t.code LIKE 'ENG5-%' ORDER BY c.display_order DESC LIMIT 1`,
    )
    .get() as { code: string; name_pl: string };
  const firstLesson = db
    .prepare(`SELECT code, title_pl FROM Lessons WHERE code LIKE 'ENG5-L%' ORDER BY code ASC LIMIT 1`)
    .get() as { code: string; title_pl: string };
  const lastLesson = db
    .prepare(`SELECT code, title_pl FROM Lessons WHERE code LIKE 'ENG5-L%' ORDER BY code DESC LIMIT 1`)
    .get() as { code: string; title_pl: string };

  db.close();

  const allOk = checks.every(Boolean);
  console.log('=== ENG5 INTEGRATION TEST ===');
  console.log(`Sections: ${sections}/${EXPECTED.sections}`);
  console.log(`Topics: ${topics}/${EXPECTED.topics}`);
  console.log(`Curriculum: ${curriculum}/${EXPECTED.curriculum}`);
  console.log(`Lessons: ${lessons}/${EXPECTED.lessons}`);
  console.log(`LessonTopics: ${lessonTopics}/${EXPECTED.lessonTopics}`);
  console.log(`TopicRelations: ${topicRelations}/${EXPECTED.topicRelations}`);
  console.log(`REQUIRES_REVIEW: ${requiresReview}/${EXPECTED.requiresReview}`);
  console.log(`integrity_check: ${integrityCheck}`);
  console.log(`quick_check: ${quickCheck}`);
  console.log(`foreign_key_check: ${fkRows.length === 0 ? 'ok' : fkRows.length}`);
  console.log(`Pierwszy topic: ${firstTopic.code} — ${firstTopic.name_pl}`);
  console.log(`Ostatni topic: ${lastTopic.code} — ${lastTopic.name_pl}`);
  console.log(`Pierwszy lesson: ${firstLesson.code} — ${firstLesson.title_pl}`);
  console.log(`Ostatni lesson: ${lastLesson.code} — ${lastLesson.title_pl}`);
  console.log(allOk ? 'PASS' : 'FAIL');
  process.exit(allOk ? 0 : 1);
}

main();
