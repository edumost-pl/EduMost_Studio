import type Database from 'better-sqlite3';

/** Standard connection settings for all EduMost Studio database writers. */
export function configureDatabaseConnection(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = FULL');
}
