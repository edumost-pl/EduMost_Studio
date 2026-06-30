export interface DocTableColumn {
  name: string;
  type: string;
  notes?: string;
}

export interface DocTableForeignKey {
  column: string;
  references: string;
  onDelete?: string;
}

export interface DocTable {
  name: string;
  purpose: string;
  columns: DocTableColumn[];
  foreignKeys: DocTableForeignKey[];
  migrations: string[];
}

export interface DocIpcChannel {
  channel: string;
  constant: string;
  handlers: string[];
}

export interface DocRepository {
  file: string;
  className: string;
  methods: string[];
}

export interface DocProjectFolder {
  path: string;
  description: string;
}

export interface DocRoute {
  path: string;
  component: string;
  note?: string;
}

export interface DocCodeRule {
  entity: string;
  format: string;
  method: string;
  description: string;
}

export interface DocSettingField {
  key: string;
  type: string;
  description: string;
}

export interface DocHotkey {
  keys: string;
  action: string;
  implemented: boolean;
}

export interface DocChangelogEntry {
  version: string;
  migration: string;
  features: string[];
}

export interface DocumentationSnapshot {
  generatedAt: string;
  appVersion: string;
  electronVersion: string;
  tables: DocTable[];
  ipcChannels: DocIpcChannel[];
  repositories: DocRepository[];
  projectFolders: DocProjectFolder[];
  routes: DocRoute[];
  codeRules: DocCodeRule[];
  settingsFields: DocSettingField[];
  hotkeys: DocHotkey[];
  changelog: DocChangelogEntry[];
}
