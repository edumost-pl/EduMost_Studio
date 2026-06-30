import fs from 'node:fs';
import path from 'node:path';

export function getDatabaseAssetsDir(baseDir: string): string {
  return path.join(baseDir, 'database');
}

export function getMigrationPath(baseDir: string, version: string): string {
  return path.join(getDatabaseAssetsDir(baseDir), 'migrations', `${version}.sql`);
}

export function getSeedPath(baseDir: string): string {
  return path.join(getDatabaseAssetsDir(baseDir), 'seed', 'seed.sql');
}

export function getKlasa5SeedPath(baseDir: string): string {
  return path.join(getDatabaseAssetsDir(baseDir), 'seed', 'seed_klasa5_matematyka.sql');
}

export function resolveDatabaseDir(userDataPath: string): string {
  return path.join(userDataPath, 'EduMost Studio');
}

export function resolveDatabasePath(userDataPath: string): string {
  return path.join(resolveDatabaseDir(userDataPath), 'edumost.db');
}

export function resolveAssetsBaseDir(electronDir: string): string {
  const unpacked =
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'dist-electron')
      : null;

  if (
    unpacked &&
    fs.existsSync(path.join(unpacked, 'database', 'migrations', '001_initial.sql'))
  ) {
    return unpacked;
  }

  return electronDir;
}
