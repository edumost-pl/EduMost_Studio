import type DatabaseType from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { loadNativeModule, readPackageVersion, resolveAppRoot } from '../paths/appRoot';
import { isDatabaseEmpty, runMigrations } from './migrate';
import { resolveAssetsBaseDir, resolveDatabasePath } from './paths';
import { runSeed } from './seed';

function loadBetterSqlite3(appRoot: string): typeof DatabaseType {
  return loadNativeModule<typeof DatabaseType>('better-sqlite3', appRoot);
}

function ensureUserDataDirectories(baseDir: string): void {
  for (const name of ['Backups', 'Materials', 'Logs']) {
    const dir = path.join(baseDir, name);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export interface DatabaseInfo {
  path: string;
  isNew: boolean;
  seeded: boolean;
  counts: {
    subjects: number;
    sections: number;
    topics: number;
    curriculum: number;
    lessons: number;
    lessonTopics: number;
    lessonResources: number;
    topicRelations: number;
    settings: number;
  };
}

export interface DatabaseServiceOptions {
  userDataPath: string;
  assetsBaseDir: string;
  dbPath?: string;
}

export class DatabaseService {
  private db: DatabaseType.Database;
  private readonly dbPath: string;
  private readonly isNew: boolean;
  private readonly seeded: boolean;

  constructor(options: DatabaseServiceOptions) {
    const appRoot = resolveAppRoot(options.assetsBaseDir);
    const appVersion = readPackageVersion(appRoot);
    const Database = loadBetterSqlite3(appRoot);

    this.dbPath = options.dbPath ?? resolveDatabasePath(options.userDataPath);
    const dir = path.dirname(this.dbPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    ensureUserDataDirectories(dir);

    this.isNew = !fs.existsSync(this.dbPath);

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    runMigrations(this.db, resolveAssetsBaseDir(options.assetsBaseDir));

    if (isDatabaseEmpty(this.db)) {
      runSeed(this.db, resolveAssetsBaseDir(options.assetsBaseDir));
      this.seeded = true;
    } else {
      this.seeded = false;
    }

    this.syncSettingsPath(appVersion);
  }

  getDatabase(): DatabaseType.Database {
    return this.db;
  }

  getPath(): string {
    return this.dbPath;
  }

  getDatabaseDirectory(): string {
    return path.dirname(this.dbPath);
  }

  getInfo(): DatabaseInfo {
    const count = (table: string) =>
      (this.db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number })
        .count;

    return {
      path: this.dbPath,
      isNew: this.isNew,
      seeded: this.seeded,
      counts: {
        subjects: count('Subjects'),
        sections: count('Sections'),
        topics: count('Topics'),
        curriculum: count('Curriculum'),
        lessons: count('Lessons'),
        lessonTopics: count('LessonTopics'),
        lessonResources: count('LessonResources'),
        topicRelations: count('TopicRelations'),
        settings: count('Settings'),
      },
    };
  }

  private syncSettingsPath(appVersion: string): void {
    const materialsDir = path.join(this.getDatabaseDirectory(), 'Materials');
    if (!fs.existsSync(materialsDir)) {
      fs.mkdirSync(materialsDir, { recursive: true });
    }
    const settings = this.db
      .prepare('SELECT id, materials_path FROM Settings LIMIT 1')
      .get() as { id: number; materials_path: string | null } | undefined;

    if (settings) {
      this.db
        .prepare(
          `UPDATE Settings
           SET database_path = ?,
               materials_path = COALESCE(materials_path, ?),
               app_version = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
        )
        .run(this.dbPath, materialsDir, appVersion, settings.id);
      return;
    }

    this.db
      .prepare(
        `INSERT INTO Settings (
           interface_language, database_path, auto_backup, auto_backup_before_import,
           theme, app_version, materials_path
         ) VALUES ('UA', ?, 1, 1, 'Light', ?, ?)`,
      )
      .run(this.dbPath, appVersion, materialsDir);
  }

  close(): void {
    this.db.close();
  }
}

let instance: DatabaseService | null = null;

export function initDatabaseService(options: DatabaseServiceOptions): DatabaseService {
  if (instance) {
    instance.close();
  }
  instance = new DatabaseService(options);
  return instance;
}

export function getDatabaseService(): DatabaseService {
  if (!instance) {
    throw new Error('DatabaseService is not initialized. Call initDatabaseService first.');
  }
  return instance;
}

export function closeDatabaseService(): void {
  instance?.close();
  instance = null;
}
