import type Database from 'better-sqlite3';
import fs from 'node:fs';
import { getSeedPath } from './paths';

export function runSeed(db: Database.Database, assetsBaseDir: string): void {
  const seedPath = getSeedPath(assetsBaseDir);

  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found: ${seedPath}`);
  }

  const sql = fs.readFileSync(seedPath, 'utf-8');
  db.exec(sql);
}
