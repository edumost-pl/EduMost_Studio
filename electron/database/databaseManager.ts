import fs from 'node:fs';
import path from 'node:path';
import { app, dialog, shell } from 'electron';
import {
  closeDatabaseService,
  getDatabaseService,
  initDatabaseService,
  type DatabaseService,
  type DatabaseServiceOptions,
} from './DatabaseService';
import {
  buildDatabaseDiagnostics,
  type DatabaseDiagnostics,
  type DiscoveredDatabaseFile,
} from './diagnostics';
import { resolveAppRoot } from '../paths/appRoot';

export interface DatabaseFileInfo {
  path: string;
  fileName: string;
  directory: string;
  sizeBytes: number;
  modifiedAt: string;
  sqliteVersion: string;
  appVersion: string;
  userDataPath: string;
  runtimeMode: 'development' | 'production';
  settingsDbPath: string | null;
  isNew: boolean;
  seeded: boolean;
  discoveredDbFiles: DiscoveredDatabaseFile[];
  counts: DatabaseDiagnostics['counts'] & {
    curriculum: number;
    lessonTopics: number;
    lessonResources: number;
    topicRelations: number;
    settings: number;
  };
}

export interface BackupEntry {
  fileName: string;
  path: string;
  sizeBytes: number;
  modifiedAt: string;
}

let storedInitOptions: DatabaseServiceOptions | null = null;

export function rememberDatabaseInitOptions(options: DatabaseServiceOptions): void {
  storedInitOptions = options;
}

export function getStoredDatabaseInitOptions(): DatabaseServiceOptions {
  if (!storedInitOptions) {
    throw new Error('Database init options are not stored.');
  }
  return storedInitOptions;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatBackupFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `backup_${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}.db`;
}

export function getBackupsDirectory(db: DatabaseService): string {
  const dir = path.join(db.getDatabaseDirectory(), 'Backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getDefaultMaterialsDirectory(db: DatabaseService): string {
  const dir = path.join(db.getDatabaseDirectory(), 'Materials');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function removeWalFiles(dbPath: string): void {
  for (const suffix of ['-wal', '-shm']) {
    const walPath = `${dbPath}${suffix}`;
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
  }
}

function checkpoint(service: DatabaseService): void {
  service.getDatabase().pragma('wal_checkpoint(TRUNCATE)');
}

export function getDatabaseFileInfo(): DatabaseFileInfo {
  const service = getDatabaseService();
  const dbPath = service.getPath();
  const stat = fs.statSync(dbPath);
  const sqliteVersion = (
    service.getDatabase().prepare('SELECT sqlite_version() AS version').get() as {
      version: string;
    }
  ).version;
  const dbInfo = service.getInfo();
  const initOptions = getStoredDatabaseInitOptions();
  const diagnostics = buildDatabaseDiagnostics({
    db: service.getDatabase(),
    activeDbPath: dbPath,
    userDataPath: initOptions.userDataPath,
    appRoot: resolveAppRoot(initOptions.assetsBaseDir),
    isPackaged: app.isPackaged,
    isNew: dbInfo.isNew,
    seeded: dbInfo.seeded,
  });

  return {
    path: dbPath,
    fileName: path.basename(dbPath),
    directory: path.dirname(dbPath),
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
    sqliteVersion,
    appVersion: app.getVersion(),
    userDataPath: diagnostics.userDataPath,
    runtimeMode: diagnostics.runtimeMode,
    settingsDbPath: diagnostics.settingsDbPath,
    isNew: diagnostics.isNew,
    seeded: diagnostics.seeded,
    discoveredDbFiles: diagnostics.discoveredFiles,
    counts: dbInfo.counts,
  };
}

export function openDatabaseFolder(): void {
  const dbPath = getDatabaseService().getPath();
  shell.showItemInFolder(dbPath);
}

export function openPathInShell(targetPath: string): void {
  shell.openPath(targetPath);
}

export async function exportDatabase(): Promise<{ ok: boolean; path?: string; error?: string }> {
  const service = getDatabaseService();
  checkpoint(service);

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Export database',
    defaultPath: 'edumost.db',
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
  });

  if (canceled || !filePath) {
    return { ok: false };
  }

  try {
    fs.copyFileSync(service.getPath(), filePath);
    return { ok: true, path: filePath };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function createBackup(): BackupEntry {
  const service = getDatabaseService();
  checkpoint(service);

  const backupsDir = getBackupsDirectory(service);
  const fileName = formatBackupFileName();
  const destPath = path.join(backupsDir, fileName);
  fs.copyFileSync(service.getPath(), destPath);

  const stat = fs.statSync(destPath);
  return {
    fileName,
    path: destPath,
    sizeBytes: stat.size,
    modifiedAt: stat.mtime.toISOString(),
  };
}

export function listBackups(): BackupEntry[] {
  const service = getDatabaseService();
  const backupsDir = getBackupsDirectory(service);

  return fs
    .readdirSync(backupsDir)
    .filter((fileName) => fileName.endsWith('.db'))
    .map((fileName) => {
      const backupPath = path.join(backupsDir, fileName);
      const stat = fs.statSync(backupPath);
      return {
        fileName,
        path: backupPath,
        sizeBytes: stat.size,
        modifiedAt: stat.mtime.toISOString(),
      };
    })
    .sort((left, right) => right.modifiedAt.localeCompare(left.modifiedAt));
}

export function reconnectDatabase(): void {
  closeDatabaseService();
  initDatabaseService(getStoredDatabaseInitOptions());
}

export function replaceDatabaseFile(sourcePath: string): void {
  const service = getDatabaseService();
  const dbPath = service.getPath();

  checkpoint(service);
  closeDatabaseService();

  fs.copyFileSync(sourcePath, dbPath);
  removeWalFiles(dbPath);
  reconnectDatabase();
}

export async function importDatabase(
  options?: { backupBeforeImport?: boolean },
): Promise<{ ok: boolean; error?: string }> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Import database',
    properties: ['openFile'],
    filters: [{ name: 'SQLite Database', extensions: ['db'] }],
  });

  if (canceled || filePaths.length === 0) {
    return { ok: false };
  }

  try {
    if (options?.backupBeforeImport) {
      createBackup();
    }
    replaceDatabaseFile(filePaths[0]);
    return { ok: true };
  } catch (error) {
    reconnectDatabase();
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function restoreBackup(): Promise<{ ok: boolean; error?: string }> {
  const service = getDatabaseService();
  const backupsDir = getBackupsDirectory(service);

  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Restore backup',
    defaultPath: backupsDir,
    properties: ['openFile'],
    filters: [{ name: 'SQLite Backup', extensions: ['db'] }],
  });

  if (canceled || filePaths.length === 0) {
    return { ok: false };
  }

  try {
    createBackup();
    replaceDatabaseFile(filePaths[0]);
    return { ok: true };
  } catch (error) {
    reconnectDatabase();
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function selectFolder(
  defaultPath?: string,
): Promise<{ ok: boolean; path?: string }> {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: 'Select folder',
    defaultPath,
    properties: ['openDirectory', 'createDirectory'],
  });

  if (canceled || filePaths.length === 0) {
    return { ok: false };
  }

  return { ok: true, path: filePaths[0] };
}
