#!/usr/bin/env tsx
/**
 * CLI wrapper for global topic code migration.
 * Prefer normal app startup (migration 004_global_topic_codes in migrate.ts).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { DatabaseInUseError, DatabaseLock } from '../electron/database/databaseLock';
import { configureDatabaseConnection } from '../electron/database/databasePragmas';
import { isMigrationApplied, runMigrations } from '../electron/database/migrate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDb = path.join(
  os.homedir(),
  'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
);
const assetsBaseDir = path.join(__dirname, '../electron');

function main() {
  const dbPath = process.argv[2] ?? defaultDb;

  if (!fs.existsSync(dbPath)) {
    console.error(`Database not found: ${dbPath}`);
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

  const db = new Database(dbPath);
  configureDatabaseConnection(db);

  if (isMigrationApplied(db, '004_global_topic_codes')) {
    console.log('Migration 004_global_topic_codes is already applied.');
    db.close();
    dbLock.release();
    return;
  }

  runMigrations(db, assetsBaseDir);
  console.log('Applied pending migrations (including 004_global_topic_codes when needed).');

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
  };

  console.log('\nIntegrity check:');
  console.log(`  Duplicate codes:  ${integrity.duplicateCodes}`);
  console.log(`  Mismatched codes: ${integrity.mismatchedCodes}`);

  db.close();
  dbLock.release();
}

main();
