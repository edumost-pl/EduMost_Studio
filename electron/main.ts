import { app, BrowserWindow, dialog, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  closeDatabaseService,
  getDatabaseService,
  initDatabaseService,
} from './database/DatabaseService';
import { createBackup, rememberDatabaseInitOptions } from './database/databaseManager';
import {
  buildDatabaseDiagnostics,
  logDatabaseDiagnostics,
} from './database/diagnostics';
import { registerIpcHandlers, unregisterIpcHandlers } from './ipc/handlers';
import { resolveAppRoot } from './paths/appRoot';
import { applyAppIcon, loadAppIcon } from './paths/appIcon';
import {
  getMainLogPath,
  initStartupLogger,
  installGlobalErrorHandlers,
  logStartup,
  logStartupError,
} from './logging/startupLogger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const PRELOAD_PATH = path.join(__dirname, 'preload.js');
const DEBUG_PRODUCTION = process.env.DEBUG_PRODUCTION === 'true';

let mainWindow: BrowserWindow | null = null;
let databaseInitialized = false;
let bootstrapFailed = false;
let rendererDist = '';
let indexHtml = '';

installGlobalErrorHandlers();
logStartup('main.process.start', {
  pid: process.pid,
  argv: process.argv,
  execPath: process.execPath,
  isPackaged: app.isPackaged,
});

function ensureAppRoot(): void {
  if (process.env.APP_ROOT) {
    return;
  }

  process.env.APP_ROOT = app.isPackaged ? app.getAppPath() : path.join(__dirname, '..');
}

function resolveRendererDist(appRoot: string): string {
  const unpackedDist =
    typeof process.resourcesPath === 'string'
      ? path.join(process.resourcesPath, 'app.asar.unpacked', 'dist')
      : null;

  if (unpackedDist && fs.existsSync(path.join(unpackedDist, 'index.html'))) {
    return unpackedDist;
  }

  return path.join(appRoot, 'dist');
}

function resolveRendererPaths(): void {
  ensureAppRoot();
  const appRoot = process.env.APP_ROOT ?? __dirname;
  rendererDist = resolveRendererDist(appRoot);
  indexHtml = path.join(rendererDist, 'index.html');
}

function logStartupContext(userDataPath: string): void {
  resolveRendererPaths();
  logStartup('startup.context', {
    isPackaged: app.isPackaged,
    appRoot: process.env.APP_ROOT,
    electronDir: __dirname,
    rendererDist,
    indexHtml,
    indexHtmlExists: fs.existsSync(indexHtml),
    preloadPath: PRELOAD_PATH,
    preloadExists: fs.existsSync(PRELOAD_PATH),
    userData: userDataPath,
    resourcesPath: process.resourcesPath,
    debugProduction: DEBUG_PRODUCTION,
    viteDevServerUrl: VITE_DEV_SERVER_URL ?? null,
  });
}

function initializeDatabase(userDataPath: string): void {
  const options = {
    userDataPath,
    assetsBaseDir: __dirname,
  };

  logStartup('database.init.start', {
    userDataPath: options.userDataPath,
    assetsBaseDir: options.assetsBaseDir,
  });

  if (!databaseInitialized) {
    rememberDatabaseInitOptions(options);
    initDatabaseService(options);

    const dbPath = getDatabaseService().getPath();
    const dbInfo = getDatabaseService().getInfo();
    logStartup('database.init.success', {
      dbPath,
      logPath: getMainLogPath(),
    });

    const diagnostics = buildDatabaseDiagnostics({
      db: getDatabaseService().getDatabase(),
      activeDbPath: dbPath,
      userDataPath: options.userDataPath,
      appRoot: resolveAppRoot(options.assetsBaseDir),
      isPackaged: app.isPackaged,
      isNew: dbInfo.isNew,
      seeded: dbInfo.seeded,
    });
    logDatabaseDiagnostics(diagnostics);

    runStartupBackupIfEnabled();
    databaseInitialized = true;
  }
  registerIpcHandlers();
}

function runStartupBackupIfEnabled(): void {
  try {
    const db = getDatabaseService().getDatabase();
    const settings = db
      .prepare('SELECT auto_backup FROM Settings ORDER BY id ASC LIMIT 1')
      .get() as { auto_backup: number } | undefined;

    if (settings?.auto_backup === 1) {
      const backup = createBackup();
      db.prepare(
        `UPDATE Settings SET last_backup = ?, updated_at = CURRENT_TIMESTAMP`,
      ).run(backup.modifiedAt);
      logStartup('database.startupBackup.success', { backup: backup.path });
    }
  } catch (error) {
    logStartupError('database.startupBackup.failed', error);
  }
}

function createWindow(): boolean {
  try {
    const appIcon = loadAppIcon(__dirname, process.env.APP_ROOT);

    logStartup('window.create.start', {
      preloadPath: PRELOAD_PATH,
      preloadExists: fs.existsSync(PRELOAD_PATH),
    });

    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1200,
      minHeight: 720,
      title: 'EduMost Studio',
      icon: appIcon,
      show: false,
      webPreferences: {
        preload: PRELOAD_PATH,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    mainWindow.once('ready-to-show', () => {
      logStartup('window.ready-to-show');
      mainWindow?.show();
    });

    mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
      logStartupError('window.preload-error', {
        preloadPath,
        error: error instanceof Error ? error.stack ?? error.message : String(error),
      });
    });

    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      logStartup(`renderer.console.${level}`, { message, line, sourceId });
    });

    mainWindow.webContents.on('did-fail-load', (_event, code, description, url) => {
      logStartupError('window.did-fail-load', { code, description, url });
    });

    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      logStartupError('window.render-process-gone', details);
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    if (VITE_DEV_SERVER_URL) {
      logStartup('window.loadURL', { url: VITE_DEV_SERVER_URL });
      void mainWindow.loadURL(VITE_DEV_SERVER_URL);
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      if (!fs.existsSync(indexHtml)) {
        throw new Error(`Renderer index.html not found: ${indexHtml}`);
      }
      logStartup('window.loadFile', { indexHtml });
      void mainWindow.loadFile(indexHtml).catch((error) => {
        logStartupError('window.loadFile.failed', error);
      });
    }

    if (DEBUG_PRODUCTION && !VITE_DEV_SERVER_URL) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
      logStartup('window.devtools.opened', { reason: 'DEBUG_PRODUCTION=true' });
    }

    mainWindow.on('closed', () => {
      logStartup('window.closed');
      mainWindow = null;
    });

    logStartup('window.create.success');
    return true;
  } catch (error) {
    logStartupError('window.create.failed', error);
    return false;
  }
}

function bootstrapApp(userDataPath: string): void {
  initStartupLogger(userDataPath);
  logStartupContext(userDataPath);

  try {
    initializeDatabase(userDataPath);
  } catch (error) {
    bootstrapFailed = true;
    logStartupError('bootstrap.database.failed', error);
    return;
  }

  const windowCreated = createWindow();
  if (!windowCreated) {
    bootstrapFailed = true;
    logStartupError('bootstrap.window.failed', new Error('BrowserWindow was not created'));
  }
}

app.whenReady().then(() => {
  ensureAppRoot();
  const userDataPath = app.getPath('userData');
  const iconPath = applyAppIcon(__dirname, process.env.APP_ROOT);
  logStartup('app.whenReady', { userDataPath, appRoot: process.env.APP_ROOT, iconPath });

  try {
    bootstrapApp(userDataPath);
  } catch (error) {
    bootstrapFailed = true;
    logStartupError('bootstrap.failed', error);
  }

  if (bootstrapFailed) {
    logStartupError(
      'bootstrap.failed.summary',
      new Error('Application startup failed. See Logs/main.log for details.'),
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (bootstrapFailed) {
        logStartupError(
          'app.activate.blocked',
          new Error('Database initialization failed. IPC is unavailable until the issue is fixed.'),
        );
        dialog.showErrorBox(
          'EduMost Studio',
          'Не вдалося ініціалізувати базу даних.\n\nПеревірте Logs/main.log або імпортуйте базу через Налаштування після перезапуску.',
        );
        return;
      }
      logStartup('app.activate.recreateWindow');
      createWindow();
    }
  });
});

// Re-register IPC after main-process hot reload (vite-plugin-electron)
if (app.isReady()) {
  registerIpcHandlers();
}

app.on('window-all-closed', () => {
  logStartup('app.window-all-closed', { bootstrapFailed });
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  logStartup('app.before-quit');
  unregisterIpcHandlers();
  closeDatabaseService();
});
