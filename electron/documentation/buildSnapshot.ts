import fs from 'node:fs';
import path from 'node:path';
import { IpcChannels } from '../ipc/channels';
import {
  CODE_GENERATION_RULES,
  HOTKEYS,
  MIGRATION_FEATURES,
  PROJECT_FOLDERS,
  SETTING_DESCRIPTIONS,
  TABLE_PURPOSES,
} from './metadata';
import type {
  DocIpcChannel,
  DocRepository,
  DocRoute,
  DocSettingField,
  DocTable,
  DocTableColumn,
  DocTableForeignKey,
  DocumentationSnapshot,
} from './types';

function getPaths() {
  const appRoot = process.env.APP_ROOT ?? path.join(__dirname, '..', '..');
  const electronDir = path.join(appRoot, 'electron');
  return {
    appRoot,
    migrationsDir: path.join(electronDir, 'database', 'migrations'),
    handlersPath: path.join(electronDir, 'ipc', 'handlers.ts'),
    reposDir: path.join(electronDir, 'repositories'),
    pagesDir: path.join(appRoot, 'src', 'pages'),
    packageJsonPath: path.join(appRoot, 'package.json'),
    routesPath: path.join(appRoot, 'src', 'App.tsx'),
    settingsTypesPath: path.join(electronDir, 'database', 'types.ts'),
  };
}

function parseMigrationTables(sql: string, migrationVersion: string, tables: Map<string, DocTable>) {
  const createRegex = /CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/gi;
  let match: RegExpExecArray | null;

  while ((match = createRegex.exec(sql))) {
    const tableName = match[1];
    const body = match[2];
    const columns: DocTableColumn[] = [];
    const foreignKeys: DocTableForeignKey[] = [];

    for (const rawLine of body.split('\n')) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line || line.startsWith('--')) continue;

      const fkMatch = line.match(
        /FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s*(\w+)\((\w+)\)(?:\s+ON DELETE (\w+))?/i,
      );
      if (fkMatch) {
        foreignKeys.push({
          column: fkMatch[1],
          references: `${fkMatch[2]}(${fkMatch[3]})`,
          onDelete: fkMatch[4],
        });
        continue;
      }

      if (/^(PRIMARY KEY|UNIQUE|CHECK|CONSTRAINT)/i.test(line)) continue;

      const colMatch = line.match(/^(\w+)\s+(.+)$/);
      if (colMatch) {
        columns.push({
          name: colMatch[1],
          type: colMatch[2],
        });
      }
    }

    const existing = tables.get(tableName);
    if (existing) {
      existing.columns.push(...columns);
      existing.foreignKeys.push(...foreignKeys);
      if (!existing.migrations.includes(migrationVersion)) {
        existing.migrations.push(migrationVersion);
      }
    } else {
      tables.set(tableName, {
        name: tableName,
        purpose: TABLE_PURPOSES[tableName] ?? `Таблиця ${tableName}`,
        columns,
        foreignKeys,
        migrations: [migrationVersion],
      });
    }
  }

  const alterRegex = /ALTER TABLE (\w+) ADD COLUMN (\w+)\s+([^;]+);/gi;
  while ((match = alterRegex.exec(sql))) {
    const tableName = match[1];
    const columnName = match[2];
    const columnType = match[3].trim();
    const table =
      tables.get(tableName) ??
      ({
        name: tableName,
        purpose: TABLE_PURPOSES[tableName] ?? `Таблиця ${tableName}`,
        columns: [],
        foreignKeys: [],
        migrations: [migrationVersion],
      } satisfies DocTable);

    if (!table.columns.some((col) => col.name === columnName)) {
      table.columns.push({ name: columnName, type: columnType });
    }
    if (!table.migrations.includes(migrationVersion)) {
      table.migrations.push(migrationVersion);
    }
    tables.set(tableName, table);
  }
}

function parseTablesFromMigrations(migrationsDir: string): DocTable[] {
  const tables = new Map<string, DocTable>();
  if (!fs.existsSync(migrationsDir)) return [];

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    parseMigrationTables(sql, version, tables);
  }

  return [...tables.values()]
    .filter((table) => table.name !== 'sqlite_sequence')
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseIpcHandlers(handlersPath: string): Map<string, string[]> {
  const result = new Map<string, string[]>();
  if (!fs.existsSync(handlersPath)) return result;

  const source = fs.readFileSync(handlersPath, 'utf-8');
  const channelEntries = Object.entries(IpcChannels) as Array<[string, string]>;

  for (const [constant] of channelEntries) {
    const blockRegex = new RegExp(
      `ipcMain\\.handle\\(IpcChannels\\.${constant}[\\s\\S]*?(?=\\n\\s*ipcMain\\.handle|\\n\\}\\s*$)`,
    );
    const block = source.match(blockRegex)?.[0] ?? '';
    const handlers = new Set<string>();

    const repoMatches = block.matchAll(/getRepos\(\)\.(\w+)\.(\w+)/g);
    for (const repoMatch of repoMatches) {
      handlers.add(`${repoMatch[1]}.${repoMatch[2]}`);
    }

    if (/getDatabaseService\(\)/.test(block)) handlers.add('DatabaseService');
    if (/exportDatabase/.test(block)) handlers.add('exportDatabase');
    if (/importDatabase/.test(block)) handlers.add('importDatabase');
    if (/createBackup/.test(block)) handlers.add('createBackup');
    if (/listBackups/.test(block)) handlers.add('listBackups');
    if (/restoreBackup/.test(block)) handlers.add('restoreBackup');
    if (/getDatabaseFileInfo/.test(block)) handlers.add('getDatabaseFileInfo');
    if (/exportReferenceToExcel/.test(block)) handlers.add('exportReferenceToExcel');
    if (/buildResourcePreviewPayload/.test(block)) handlers.add('buildResourcePreviewPayload');
    if (/openDatabaseFolder/.test(block)) handlers.add('openDatabaseFolder');
    if (/openPathInShell/.test(block)) handlers.add('openPathInShell');
    if (/selectFolder/.test(block)) handlers.add('selectFolder');
    if (/sqlite_master/.test(block)) handlers.add('sqlite_master (direct SQL)');

    result.set(constant, [...handlers].sort());
  }

  return result;
}

function buildIpcChannels(handlersPath: string): DocIpcChannel[] {
  const handlerMap = parseIpcHandlers(handlersPath);
  return (Object.entries(IpcChannels) as Array<[string, string]>).map(([constant, channel]) => ({
    constant,
    channel,
    handlers: handlerMap.get(constant) ?? [],
  }));
}

function parseRepositories(reposDir: string): DocRepository[] {
  if (!fs.existsSync(reposDir)) return [];

  return fs
    .readdirSync(reposDir)
    .filter((file) => file.endsWith('Repository.ts'))
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(reposDir, file), 'utf-8');
      const classMatch = source.match(/export class (\w+)/);
      const methods = [...source.matchAll(/^\s{2}(\w+)\([^)]*\)(?::|\s*\{)/gm)]
        .map((match) => match[1])
        .filter((name) => name !== 'constructor');

      return {
        file,
        className: classMatch?.[1] ?? file.replace('.ts', ''),
        methods: [...new Set(methods)].sort(),
      };
    });
}

function parseRoutes(routesPath: string): DocRoute[] {
  if (!fs.existsSync(routesPath)) return [];

  const source = fs.readFileSync(routesPath, 'utf-8');
  const routes: DocRoute[] = [];
  const routeRegex = /<Route path="([^"]*)" element=\{<(\w+)/g;
  let match: RegExpExecArray | null;

  while ((match = routeRegex.exec(source))) {
    routes.push({
      path: match[1] === '' ? '/' : `/${match[1]}`,
      component: match[2],
    });
  }

  const indexMatch = source.match(/<Route index element=\{<(\w+)/);
  if (indexMatch) {
    routes.unshift({
      path: '/',
      component: indexMatch[1],
      note: 'index route',
    });
  }

  return routes;
}

function parseSettingsFields(settingsTypesPath: string): DocSettingField[] {
  if (!fs.existsSync(settingsTypesPath)) return [];

  const source = fs.readFileSync(settingsTypesPath, 'utf-8');
  const block = source.match(/export interface Settings \{([\s\S]*?)\n\}/)?.[1];
  if (!block) return [];

  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .map((line) => {
      const fieldMatch = line.match(/^(\w+)(\?)?:\s*(.+?);$/);
      if (!fieldMatch) return null;
      const key = fieldMatch[1];
      return {
        key,
        type: fieldMatch[3],
        description: SETTING_DESCRIPTIONS[key] ?? '—',
      };
    })
    .filter((field): field is DocSettingField => field != null);
}

function scanPageModules(pagesDir: string): string[] {
  if (!fs.existsSync(pagesDir)) return [];

  const pages: string[] = [];
  const walk = (dir: string, prefix = '') => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), rel);
      } else if (entry.name.endsWith('Page.tsx')) {
        pages.push(`src/pages/${rel}`);
      }
    }
  };
  walk(pagesDir);
  return pages.sort();
}

function buildChangelog(migrationsDir: string) {
  if (!fs.existsSync(migrationsDir)) return [];

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => {
      const migration = file.replace(/\.sql$/, '');
      return {
        version: migration.split('_')[0] ?? migration,
        migration,
        features:
          MIGRATION_FEATURES[migration] ?? [`Оновлення схеми бази даних (${migration})`],
      };
    });
}

export function buildDocumentationSnapshot(): DocumentationSnapshot {
  const cachePath = path.join(__dirname, 'documentation-cache.json');
  if (fs.existsSync(cachePath)) {
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8')) as DocumentationSnapshot;
    } catch {
      // fall through to live generation
    }
  }

  const paths = getPaths();
  const packageJson = JSON.parse(fs.readFileSync(paths.packageJsonPath, 'utf-8')) as {
    version: string;
  };

  const pages = scanPageModules(paths.pagesDir);
  const projectFolders = [
    ...PROJECT_FOLDERS,
    ...pages.map((pagePath) => ({
      path: pagePath,
      description: 'Сторінка UI',
    })),
  ];

  return {
    generatedAt: new Date().toISOString(),
    appVersion: packageJson.version,
    electronVersion: process.versions.electron ?? '—',
    tables: parseTablesFromMigrations(paths.migrationsDir),
    ipcChannels: buildIpcChannels(paths.handlersPath),
    repositories: parseRepositories(paths.reposDir),
    projectFolders,
    routes: parseRoutes(paths.routesPath),
    codeRules: CODE_GENERATION_RULES,
    settingsFields: parseSettingsFields(paths.settingsTypesPath),
    hotkeys: HOTKEYS,
    changelog: buildChangelog(paths.migrationsDir),
  };
}
