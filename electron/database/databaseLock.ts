import fs from 'node:fs';
import path from 'node:path';

export class DatabaseInUseError extends Error {
  readonly lockPath: string;
  readonly holderPid: number | null;

  constructor(message: string, lockPath: string, holderPid: number | null) {
    super(message);
    this.name = 'DatabaseInUseError';
    this.lockPath = lockPath;
    this.holderPid = holderPid;
  }
}

interface LockPayload {
  pid: number;
  startedAt: string;
  dbPath: string;
}

function lockFilePath(dbPath: string): string {
  return `${dbPath}.lock`;
}

function readLockPayload(lockPath: string): LockPayload | null {
  try {
    return JSON.parse(fs.readFileSync(lockPath, 'utf-8')) as LockPayload;
  } catch {
    return null;
  }
}

function isProcessRunning(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function removeLockFile(lockPath: string): void {
  try {
    fs.unlinkSync(lockPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

/** Detect another live process holding the same database lock file. */
export function assertDatabaseAvailable(dbPath: string): void {
  const lockPath = lockFilePath(dbPath);
  if (!fs.existsSync(lockPath)) {
    return;
  }

  const payload = readLockPayload(lockPath);
  const holderPid = payload?.pid ?? null;

  if (holderPid !== null && holderPid !== process.pid && isProcessRunning(holderPid)) {
    throw new DatabaseInUseError(
      `Database is already in use by process ${holderPid}. Close the other EduMost Studio instance or CLI script before continuing.`,
      lockPath,
      holderPid,
    );
  }

  removeLockFile(lockPath);
}

export class DatabaseLock {
  private readonly lockPath: string;
  private fd: number | null = null;

  constructor(private readonly dbPath: string) {
    this.lockPath = lockFilePath(dbPath);
  }

  acquire(): void {
    assertDatabaseAvailable(this.dbPath);

    const payload: LockPayload = {
      pid: process.pid,
      startedAt: new Date().toISOString(),
      dbPath: path.resolve(this.dbPath),
    };

    try {
      this.fd = fs.openSync(this.lockPath, 'wx');
      fs.writeFileSync(this.fd, `${JSON.stringify(payload)}\n`, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        const existing = readLockPayload(this.lockPath);
        const holderPid = existing?.pid ?? null;
        throw new DatabaseInUseError(
          holderPid
            ? `Database is already in use by process ${holderPid}.`
            : 'Database lock file already exists.',
          this.lockPath,
          holderPid,
        );
      }
      throw error;
    }
  }

  release(): void {
    if (this.fd !== null) {
      fs.closeSync(this.fd);
      this.fd = null;
    }
    removeLockFile(this.lockPath);
  }
}
