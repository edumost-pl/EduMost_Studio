import type Database from 'better-sqlite3';
import fs from 'node:fs';
import { getMigrationPath } from './paths';
import { migrateGlobalTopicCodes } from './migrateGlobalTopicCodes';

const SQL_MIGRATIONS = [
  '001_initial',
  '002_settings_extensions',
  '003_reference_dictionaries',
  '005_drop_idx_topics_code',
] as const;

const DATA_MIGRATIONS = ['004_global_topic_codes'] as const;

export type MigrationVersion = (typeof SQL_MIGRATIONS)[number] | (typeof DATA_MIGRATIONS)[number];

export function isMigrationApplied(db: Database.Database, version: string): boolean {
  const row = db
    .prepare('SELECT 1 AS ok FROM schema_migrations WHERE version = ?')
    .get(version) as { ok: number } | undefined;
  return Boolean(row);
}

export function markMigrationApplied(db: Database.Database, version: string): void {
  db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run(version);
}

function applySqlMigration(db: Database.Database, assetsBaseDir: string, version: string): void {
  const migrationPath = getMigrationPath(assetsBaseDir, version);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(sql);
  markMigrationApplied(db, version);
}

function applyDataMigration(db: Database.Database, version: string): void {
  if (version === '004_global_topic_codes') {
    migrateGlobalTopicCodes(db);
  } else {
    throw new Error(`Unknown data migration: ${version}`);
  }
  markMigrationApplied(db, version);
}

export function runMigrations(db: Database.Database, assetsBaseDir: string): void {
  const hasSubjects = db
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master
       WHERE type = 'table' AND name = 'Subjects'`,
    )
    .get() as { ok: number } | undefined;

  if (!hasSubjects) {
    applySqlMigration(db, assetsBaseDir, '001_initial');
  } else if (!isMigrationApplied(db, '001_initial')) {
    markMigrationApplied(db, '001_initial');
  }

  for (const version of SQL_MIGRATIONS) {
    if (version === '001_initial') {
      continue;
    }
    if (isMigrationApplied(db, version)) {
      continue;
    }
    applySqlMigration(db, assetsBaseDir, version);
  }

  for (const version of DATA_MIGRATIONS) {
    if (isMigrationApplied(db, version)) {
      continue;
    }
    applyDataMigration(db, version);
  }
}

export function isDatabaseEmpty(db: Database.Database): boolean {
  const row = db.prepare('SELECT COUNT(*) AS count FROM Subjects').get() as {
    count: number;
  };
  return row.count === 0;
}
