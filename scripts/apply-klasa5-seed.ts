#!/usr/bin/env tsx
/**
 * Apply seed_klasa5_matematyka.sql to the active EduMost Studio database.
 * Default path: ~/Library/Application Support/edumost-studio/EduMost Studio/edumost.db
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { DatabaseInUseError, DatabaseLock } from '../electron/database/databaseLock';
import { configureDatabaseConnection } from '../electron/database/databasePragmas';
import { runKlasa5Seed } from '../electron/database/seed';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDb = path.join(
  os.homedir(),
  'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
);
const dbPath = process.argv[2] ?? defaultDb;
const assetsBaseDir = path.join(__dirname, '../electron');

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found: ${dbPath}`);
  process.exit(1);
}

const before = { curriculum: 0, lessons: 0, topics: 0 };
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

const db = new Database(dbPath);
configureDatabaseConnection(db);

before.curriculum = (
  db.prepare('SELECT COUNT(*) AS c FROM Curriculum WHERE school_class = 5').get() as { c: number }
).c;
before.lessons = (
  db.prepare('SELECT COUNT(*) AS c FROM Lessons WHERE school_class = 5').get() as { c: number }
).c;
before.topics = (
  db.prepare(
    `SELECT COUNT(*) AS c FROM Topics t
     JOIN Curriculum c ON c.topic_id = t.id
     WHERE c.school_class = 5 AND t.is_active = 1`,
  ).get() as { c: number }
).c;

console.log(`Applying Klasa 5 seed to:\n  ${dbPath}\n`);
runKlasa5Seed(db, assetsBaseDir);

const after = {
  curriculum: (
    db.prepare('SELECT COUNT(*) AS c FROM Curriculum WHERE school_class = 5').get() as { c: number }
  ).c,
  lessons: (
    db.prepare('SELECT COUNT(*) AS c FROM Lessons WHERE school_class = 5').get() as { c: number }
  ).c,
  topics: (
    db.prepare(
      `SELECT COUNT(*) AS c FROM Topics t
       JOIN Curriculum c ON c.topic_id = t.id
       WHERE c.school_class = 5 AND t.is_active = 1`,
    ).get() as { c: number }
  ).c,
};

console.log('Before → After:');
console.log(`  Curriculum (class 5): ${before.curriculum} → ${after.curriculum}`);
console.log(`  Topics (class 5):     ${before.topics} → ${after.topics}`);
console.log(`  Lessons (class 5):    ${before.lessons} → ${after.lessons}`);
db.close();
dbLock.release();
