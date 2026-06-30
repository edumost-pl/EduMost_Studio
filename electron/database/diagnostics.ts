import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type Database from 'better-sqlite3';
import { loadNativeModule } from '../paths/appRoot';
import { logStartup, logStartupError } from '../logging/startupLogger';

export interface TableCounts {
  subjects: number;
  sections: number;
  topics: number;
  lessons: number;
}

export interface DiscoveredDatabaseFile {
  path: string;
  sizeBytes: number;
  modifiedAt: string;
  counts: TableCounts;
}

export interface DatabaseDiagnostics {
  runtimeMode: 'development' | 'production';
  userDataPath: string;
  activeDbPath: string;
  settingsDbPath: string | null;
  isNew: boolean;
  seeded: boolean;
  counts: TableCounts;
  discoveredFiles: DiscoveredDatabaseFile[];
}

function resolveApplicationSupportDir(): string {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support');
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA ?? os.homedir(), '');
  }
  return path.join(os.homedir(), '.config');
}

export function readTableCounts(db: Database.Database): TableCounts {
  const count = (table: string) =>
    (db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count;

  return {
    subjects: count('Subjects'),
    sections: count('Sections'),
    topics: count('Topics'),
    lessons: count('Lessons'),
  };
}

function inspectDatabaseFile(
  dbPath: string,
  DatabaseCtor: typeof Database,
): DiscoveredDatabaseFile | null {
  if (!fs.existsSync(dbPath)) {
    return null;
  }

  try {
    const stat = fs.statSync(dbPath);
    const db = new DatabaseCtor(dbPath, { readonly: true, fileMustExist: true });
    const counts = readTableCounts(db);
    db.close();

    return {
      path: dbPath,
      sizeBytes: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      counts,
    };
  } catch {
    return null;
  }
}

export function findEdumostDatabaseFiles(appRoot: string): DiscoveredDatabaseFile[] {
  const DatabaseCtor = loadNativeModule<typeof Database>('better-sqlite3', appRoot);
  const root = resolveApplicationSupportDir();
  const results: DiscoveredDatabaseFile[] = [];

  const walk = (dir: string, depth: number): void => {
    if (depth > 6 || !fs.existsSync(dir)) {
      return;
    }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, depth + 1);
        continue;
      }
      if (entry.isFile() && entry.name === 'edumost.db') {
        const info = inspectDatabaseFile(fullPath, DatabaseCtor);
        if (info) {
          results.push(info);
        }
      }
    }
  };

  walk(root, 0);
  return results.sort((a, b) => b.counts.topics - a.counts.topics || b.sizeBytes - a.sizeBytes);
}

export function buildDatabaseDiagnostics(options: {
  db: Database.Database;
  activeDbPath: string;
  userDataPath: string;
  appRoot: string;
  isPackaged: boolean;
  isNew: boolean;
  seeded: boolean;
}): DatabaseDiagnostics {
  const counts = readTableCounts(options.db);
  const settings = options.db
    .prepare('SELECT database_path FROM Settings ORDER BY id ASC LIMIT 1')
    .get() as { database_path: string | null } | undefined;

  return {
    runtimeMode: options.isPackaged ? 'production' : 'development',
    userDataPath: options.userDataPath,
    activeDbPath: options.activeDbPath,
    settingsDbPath: settings?.database_path ?? null,
    isNew: options.isNew,
    seeded: options.seeded,
    counts,
    discoveredFiles: findEdumostDatabaseFiles(options.appRoot),
  };
}

export function logDatabaseDiagnostics(diagnostics: DatabaseDiagnostics): void {
  logStartup('database.diagnostics', {
    runtimeMode: diagnostics.runtimeMode,
    userDataPath: diagnostics.userDataPath,
    activeDbPath: diagnostics.activeDbPath,
    settingsDbPath: diagnostics.settingsDbPath,
    isNew: diagnostics.isNew,
    seeded: diagnostics.seeded,
    counts: diagnostics.counts,
    discoveredDbFiles: diagnostics.discoveredFiles.map((file) => ({
      path: file.path,
      sizeBytes: file.sizeBytes,
      counts: file.counts,
    })),
  });

  logStartup('database.counts.Subjects', { count: diagnostics.counts.subjects });
  logStartup('database.counts.Sections', { count: diagnostics.counts.sections });
  logStartup('database.counts.Topics', { count: diagnostics.counts.topics });
  logStartup('database.counts.Lessons', { count: diagnostics.counts.lessons });

  const bestAlternative = diagnostics.discoveredFiles.find(
    (file) =>
      file.path !== diagnostics.activeDbPath &&
      file.counts.topics > diagnostics.counts.topics,
  );

  if (diagnostics.counts.subjects === 0) {
    logStartupError(
      'database.empty.warning',
      new Error(
        'Active database has no subjects. Use Settings → Import database or restore a backup.',
      ),
    );
  }

  if (bestAlternative) {
    logStartup('database.alternative.found', {
      message:
        'Another edumost.db with more data was found. Import it via Settings if the app looks empty.',
      activeDbPath: diagnostics.activeDbPath,
      activeTopics: diagnostics.counts.topics,
      suggestedDbPath: bestAlternative.path,
      suggestedTopics: bestAlternative.counts.topics,
    });
  }
}
