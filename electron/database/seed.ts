import type Database from 'better-sqlite3';
import fs from 'node:fs';
import { isMigrationApplied, markMigrationApplied } from './migrate';
import { getKlasa5SeedPath, getSeedPath } from './paths';

export const KLASA5_MAT_SEED_VERSION = 'seed_klasa5_matematyka_v1';

export function runSeed(db: Database.Database, assetsBaseDir: string): void {
  const seedPath = getSeedPath(assetsBaseDir);

  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');
  db.exec(sql);
}

function hasKlasa5MatCurriculum(db: Database.Database): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS ok
       FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       INNER JOIN Subjects sub ON sub.id = s.subject_id
       WHERE sub.code = 'MAT' AND t.code LIKE 'MAT5-%'
       LIMIT 1`,
    )
    .get() as { ok: number } | undefined;
  return Boolean(row);
}

/** One-time Matematyka Klasa 5 curriculum import (tracked in schema_migrations). */
export function runKlasa5Seed(db: Database.Database, assetsBaseDir: string): void {
  if (isMigrationApplied(db, KLASA5_MAT_SEED_VERSION)) {
    return;
  }

  if (hasKlasa5MatCurriculum(db)) {
    markMigrationApplied(db, KLASA5_MAT_SEED_VERSION);
    return;
  }

  const seedPath = getKlasa5SeedPath(assetsBaseDir);
  if (!fs.existsSync(seedPath)) {
    return;
  }

  const hasMat = db
    .prepare("SELECT 1 AS ok FROM Subjects WHERE code = 'MAT'")
    .get() as { ok: number } | undefined;

  if (!hasMat) {
    return;
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');
  db.exec(sql);
  markMigrationApplied(db, KLASA5_MAT_SEED_VERSION);
}
