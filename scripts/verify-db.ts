import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseService } from '../electron/database/DatabaseService';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDir = path.join(os.tmpdir(), `edumost-verify-${Date.now()}`);
const assetsBase = path.join(__dirname, '../electron');

function printSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

try {
  const service = new DatabaseService({
    userDataPath: testDir,
    assetsBaseDir: assetsBase,
  });

  const db = service.getDatabase();
  const info = service.getInfo();

  printSection('Database Info');
  console.log(JSON.stringify(info, null, 2));

  printSection('Tables');
  const tables = db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`,
    )
    .all() as { name: string }[];
  tables.forEach((t) => console.log(`- ${t.name}`));

  printSection('Sample Data');
  const subject = db.prepare("SELECT code, name_ua FROM Subjects WHERE code = 'MAT'").get();
  const topic = db.prepare("SELECT code, name_ua FROM Topics WHERE code = 'FRA-019'").get();
  const lesson = db.prepare("SELECT code, title_ua FROM Lessons WHERE code = 'MAT4-021'").get();
  const settings = db.prepare('SELECT interface_language, theme, database_path FROM Settings LIMIT 1').get();
  const topicsCount = db
    .prepare(
      `SELECT COUNT(*) AS count FROM Topics t
       INNER JOIN Sections s ON s.id = t.section_id
       INNER JOIN Curriculum c ON c.topic_id = t.id
       WHERE s.code = 'FRA' AND c.school_class = 4`,
    )
    .get() as { count: number };
  const klasa5Topics = db
    .prepare(
      `SELECT COUNT(*) AS count FROM Topics t
       INNER JOIN Curriculum c ON c.topic_id = t.id
       WHERE c.school_class = 5`,
    )
    .get() as { count: number };
  const klasa5Lessons = db
    .prepare(`SELECT COUNT(*) AS count FROM Lessons WHERE school_class = 5`)
    .get() as { count: number };

  console.log('Subject MAT:', subject);
  console.log('Topic FRA-019:', topic);
  console.log('Lesson MAT4-021:', lesson);
  console.log('Settings:', settings);
  console.log(`Topics in FRA / class 4: ${topicsCount.count}`);
  console.log(`Topics in class 5: ${klasa5Topics.count}`);
  console.log(`Lessons in class 5: ${klasa5Lessons.count}`);

  service.close();
  fs.rmSync(testDir, { recursive: true, force: true });

  printSection('Result');
  console.log('SQLite layer verified successfully.');
} catch (error) {
  console.error('Verification failed:', error);
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  process.exit(1);
}
