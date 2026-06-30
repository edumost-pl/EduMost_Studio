import type Database from 'better-sqlite3';
import fs from 'node:fs';
import { getMigrationPath } from './paths';

const MIGRATIONS = ['001_initial', '002_settings_extensions', '003_reference_dictionaries'] as const;

function isMigrationApplied(db: Database.Database, version: string): boolean {
  const row = db
    .prepare('SELECT 1 AS ok FROM schema_migrations WHERE version = ?')
    .get(version) as { ok: number } | undefined;
  return Boolean(row);
}

function applyMigration(db: Database.Database, assetsBaseDir: string, version: string): void {
  const migrationPath = getMigrationPath(assetsBaseDir, version);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(sql);
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
}

export function runMigrations(db: Database.Database, assetsBaseDir: string): void {
  const hasSubjects = db
    .prepare(
      `SELECT 1 AS ok FROM sqlite_master
       WHERE type = 'table' AND name = 'Subjects'`,
    )
    .get() as { ok: number } | undefined;

  if (!hasSubjects) {
    applyMigration(db, assetsBaseDir, '001_initial');
  } else if (!isMigrationApplied(db, '001_initial')) {
    db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run('001_initial');
  }

  for (const version of MIGRATIONS) {
    if (version === '001_initial') {
      continue;
    }
    if (isMigrationApplied(db, version)) {
      continue;
    }
    applyMigration(db, assetsBaseDir, version);
  }
}

export function isDatabaseEmpty(db: Database.Database): boolean {
  const row = db.prepare('SELECT COUNT(*) AS count FROM Subjects').get() as {
    count: number;
  };
  return row.count === 0;
}
