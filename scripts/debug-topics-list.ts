#!/usr/bin/env tsx
/** Simulates IPC topics:list — same code path as handlers.ts */
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { RepositoryRegistry } from '../electron/repositories';

const dbPath =
  process.argv[2] ??
  path.join(
    os.homedir(),
    'Library/Application Support/edumost-studio/EduMost Studio/edumost.db',
  );

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const repos = new RepositoryRegistry(db);
const mat = repos.subjects.findAll().find((s) => s.code === 'MAT');
if (!mat) {
  console.error('Subject MAT not found');
  process.exit(1);
}

const filters = {
  subjectId: mat.id,
  schoolClass: 5,
  limit: 20,
  offset: 0,
};

console.log('IPC topics:list filters:', JSON.stringify(filters));
console.log('DB:', dbPath);
console.log('');

const rows = repos.topics.findAll(filters);

console.log(
  '| curriculum_display_order | code | name_pl |',
);
console.log(
  '|---:|---|---|',
);
for (const row of rows.slice(0, 20)) {
  const lp = row.curriculum_display_order ?? 'NULL';
  const name = (row.name_pl ?? '').replace(/\|/g, '\\|').slice(0, 50);
  console.log(`| ${lp} | ${row.code} | ${name} |`);
}

console.log('');
console.log(`Total returned: ${rows.length} (limit=${filters.limit})`);

db.close();
