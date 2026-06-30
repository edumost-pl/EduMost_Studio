/** Renderer-safe API types (mirror of electron/preload.ts) */
export interface EduMostAPI {
  platform: NodeJS.Platform;
  version: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  db: {
    getInfo: () => Promise<unknown>;
    getTables: () => Promise<unknown>;
    getFileInfo: () => Promise<unknown>;
    export: () => Promise<{ ok: boolean; path?: string; error?: string }>;
    import: (backupBeforeImport?: boolean) => Promise<{ ok: boolean; error?: string }>;
    createBackup: () => Promise<unknown>;
    listBackups: () => Promise<unknown>;
    restoreBackup: () => Promise<{ ok: boolean; error?: string }>;
  };
  subjects: {
    list: () => Promise<unknown>;
    get: (id: number) => Promise<unknown>;
  };
  sections: {
    list: () => Promise<unknown>;
    bySubject: (subjectId: number) => Promise<unknown>;
    bySubjectAndClass: (subjectId: number, schoolClass: number) => Promise<unknown>;
    suggestCode: (subjectId: number, name: string) => Promise<unknown>;
    create: (
      subjectId: number,
      data: { name_pl: string; name_ua: string; code?: string },
    ) => Promise<unknown>;
  };
  topics: {
    list: (filters?: Record<string, unknown>) => Promise<unknown>;
    count: (filters?: Record<string, unknown>) => Promise<unknown>;
    get: (id: number) => Promise<unknown>;
    getDetail: (id: number) => Promise<unknown>;
    getCreateDefaults: (options: {
      subjectId: number;
      schoolClass: number;
      sectionName: string;
      sectionId?: number | null;
    }) => Promise<unknown>;
    create: (
      data: Record<string, unknown>,
      options: {
        schoolClass: number;
        subjectId: number;
        sectionName: string;
        sectionId?: number | null;
      },
    ) => Promise<unknown>;
    update: (
      id: number,
      data: Record<string, unknown>,
      options?: {
        schoolClass?: number;
        subjectId?: number;
        sectionName?: string;
        sectionId?: number | null;
      },
    ) => Promise<unknown>;
    adjacent: (topicId: number, filters?: Record<string, unknown>) => Promise<unknown>;
  };
  lessons: {
    list: (filters?: Record<string, unknown>) => Promise<unknown>;
    get: (id: number) => Promise<unknown>;
    getDetail: (id: number) => Promise<unknown>;
    getCreateDefaults: (subjectId: number, schoolClass: number) => Promise<unknown>;
    create: (data: Record<string, unknown>, topicId: number) => Promise<unknown>;
    byTopic: (topicId: number) => Promise<unknown>;
    update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
    adjacent: (
      lessonId: number,
      filters?: { subjectId?: number; schoolClass?: number; topicId?: number },
    ) => Promise<unknown>;
  };
  lessonResources: {
    byLesson: (lessonId: number) => Promise<unknown>;
    preview: (url: string, resourceType: string) => Promise<unknown>;
    download: (url: string, suggestedName?: string) => Promise<unknown>;
  };
  topicRelations: {
    byTopic: (topicId: number) => Promise<unknown>;
  };
  curriculum: {
    byTopic: (topicId: number) => Promise<unknown>;
    byClass: (schoolClass: number, subjectId?: number) => Promise<unknown>;
  };
  search: {
    query: (text: string) => Promise<unknown>;
  };
  settings: {
    get: () => Promise<{ interface_language?: string } | undefined>;
    update: (data: Record<string, unknown>) => Promise<unknown>;
  };
  shell: {
    openDatabaseFolder: () => Promise<void>;
    openPath: (targetPath: string) => Promise<void>;
  };
  dialog: {
    selectFolder: (defaultPath?: string) => Promise<{ ok: boolean; path?: string }>;
  };
  ref: {
    subjects: {
      list: () => Promise<unknown>;
      create: (data: Record<string, unknown>) => Promise<unknown>;
      update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
      delete: (id: number) => Promise<unknown>;
      archive: (id: number) => Promise<unknown>;
    };
    sections: {
      list: () => Promise<unknown>;
      update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
      delete: (id: number) => Promise<unknown>;
      archive: (id: number) => Promise<unknown>;
    };
    lessonTypes: {
      list: () => Promise<unknown>;
      create: (data: Record<string, unknown>) => Promise<unknown>;
      update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
      delete: (id: number) => Promise<unknown>;
      archive: (id: number) => Promise<unknown>;
    };
    lessonStatuses: {
      list: () => Promise<unknown>;
      create: (data: Record<string, unknown>) => Promise<unknown>;
      update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
      delete: (id: number) => Promise<unknown>;
      archive: (id: number) => Promise<unknown>;
    };
    schoolClasses: {
      list: () => Promise<unknown>;
      create: (data: Record<string, unknown>) => Promise<unknown>;
      update: (id: number, data: Record<string, unknown>) => Promise<unknown>;
      delete: (id: number) => Promise<unknown>;
      archive: (id: number) => Promise<unknown>;
    };
    exportExcel: (type: string) => Promise<{ ok: boolean; path?: string; error?: string }>;
  };
  docs: {
    getSnapshot: () => Promise<unknown>;
  };
}
