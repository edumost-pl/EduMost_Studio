import type Database from 'better-sqlite3';
import fs from 'node:fs';
import { getKlasa5SeedPath, getSeedPath } from './paths';
import { migrateGlobalTopicCodes } from './migrateGlobalTopicCodes';

export function runSeed(db: Database.Database, assetsBaseDir: string): void {
  const seedPath = getSeedPath(assetsBaseDir);

  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');
  db.exec(sql);
}

/** Idempotent curriculum data for Matematyka Klasa 5 (runs after base seed or on upgrade). */
export function runKlasa5Seed(db: Database.Database, assetsBaseDir: string): void {
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
  migrateGlobalTopicCodes(db);
}
