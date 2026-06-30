import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

let logFilePath: string | null = null;

function defaultUserDataPath(): string {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'edumost-studio');
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA ?? os.homedir(), 'edumost-studio');
  }
  return path.join(os.homedir(), '.config', 'edumost-studio');
}

function resolveLogFilePath(userDataPath: string): string {
  const logsDir = path.join(userDataPath, 'EduMost Studio', 'Logs');
  fs.mkdirSync(logsDir, { recursive: true });
  return path.join(logsDir, 'main.log');
}

export function initStartupLogger(userDataPath: string): string {
  logFilePath = resolveLogFilePath(userDataPath);
  fs.appendFileSync(
    logFilePath,
    `[${new Date().toISOString()}] logger.initialized ${JSON.stringify({ userDataPath, logFilePath })}\n`,
    'utf-8',
  );
  return logFilePath;
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }
  return String(error);
}

export function logStartup(message: string, data?: Record<string, unknown>): void {
  const line = `[${new Date().toISOString()}] ${message}${
    data ? ` ${JSON.stringify(data)}` : ''
  }`;
  console.log(line);

  if (!logFilePath) {
    try {
      initStartupLogger(defaultUserDataPath());
    } catch (error) {
      console.error('[StartupLogger] failed to initialize fallback log path:', error);
      return;
    }
  }

  try {
    fs.appendFileSync(logFilePath!, `${line}\n`, 'utf-8');
  } catch (error) {
    console.error('[StartupLogger] failed to write main.log:', error);
  }
}

export function logStartupError(message: string, error?: unknown): void {
  logStartup(message, error ? { error: formatError(error) } : undefined);
}

export function installGlobalErrorHandlers(userDataPath?: string): void {
  initStartupLogger(userDataPath ?? defaultUserDataPath());

  process.on('uncaughtException', (error) => {
    logStartupError('uncaughtException', error);
  });

  process.on('unhandledRejection', (reason) => {
    logStartupError('unhandledRejection', reason);
  });
}

export function getMainLogPath(): string | null {
  return logFilePath;
}
