import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from './ipc/channels';

declare const __APP_VERSION__: string;

const api = {
  platform: process.platform,
  version: __APP_VERSION__,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  db: {
    getInfo: () => ipcRenderer.invoke(IpcChannels.DB_GET_INFO),
    getTables: () => ipcRenderer.invoke(IpcChannels.DB_GET_TABLES),
    getFileInfo: () => ipcRenderer.invoke(IpcChannels.DB_GET_FILE_INFO),
    export: () => ipcRenderer.invoke(IpcChannels.DB_EXPORT),
    import: (backupBeforeImport?: boolean) =>
      ipcRenderer.invoke(IpcChannels.DB_IMPORT, backupBeforeImport),
    createBackup: () => ipcRenderer.invoke(IpcChannels.DB_CREATE_BACKUP),
    listBackups: () => ipcRenderer.invoke(IpcChannels.DB_LIST_BACKUPS),
    restoreBackup: () => ipcRenderer.invoke(IpcChannels.DB_RESTORE_BACKUP),
  },
  subjects: {
    list: () => ipcRenderer.invoke(IpcChannels.SUBJECTS_LIST),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.SUBJECTS_GET, id),
  },
  sections: {
    list: () => ipcRenderer.invoke(IpcChannels.SECTIONS_LIST),
    bySubject: (subjectId: number) =>
      ipcRenderer.invoke(IpcChannels.SECTIONS_BY_SUBJECT, subjectId),
    bySubjectAndClass: (subjectId: number, schoolClass: number) =>
      ipcRenderer.invoke(
        IpcChannels.SECTIONS_BY_SUBJECT_CLASS,
        subjectId,
        schoolClass,
      ),
    suggestCode: (subjectId: number, name: string) =>
      ipcRenderer.invoke(IpcChannels.SECTIONS_SUGGEST_CODE, subjectId, name),
    create: (
      subjectId: number,
      data: { name_pl: string; name_ua: string; code?: string },
    ) => ipcRenderer.invoke(IpcChannels.SECTIONS_CREATE, subjectId, data),
  },
  topics: {
    list: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke(IpcChannels.TOPICS_LIST, filters),
    count: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke(IpcChannels.TOPICS_COUNT, filters),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.TOPICS_GET, id),
    getDetail: (id: number) =>
      ipcRenderer.invoke(IpcChannels.TOPICS_GET_DETAIL, id),
    getCreateDefaults: (options: {
      subjectId: number;
      sectionName: string;
      sectionId?: number | null;
    }) => ipcRenderer.invoke(IpcChannels.TOPICS_GET_CREATE_DEFAULTS, options),
    create: (
      data: Record<string, unknown>,
      options: {
        schoolClass: number;
        subjectId: number;
        sectionName: string;
        sectionId?: number | null;
      },
    ) => ipcRenderer.invoke(IpcChannels.TOPICS_CREATE, data, options),
    update: (
      id: number,
      data: Record<string, unknown>,
      options?: {
        schoolClass?: number;
        subjectId?: number;
        sectionName?: string;
        sectionId?: number | null;
      },
    ) => ipcRenderer.invoke(IpcChannels.TOPICS_UPDATE, id, data, options),
  },
  lessons: {
    list: (filters?: Record<string, unknown>) =>
      ipcRenderer.invoke(IpcChannels.LESSONS_LIST, filters),
    get: (id: number) => ipcRenderer.invoke(IpcChannels.LESSONS_GET, id),
    getDetail: (id: number) =>
      ipcRenderer.invoke(IpcChannels.LESSONS_GET_DETAIL, id),
    getCreateDefaults: (subjectId: number, schoolClass: number) =>
      ipcRenderer.invoke(
        IpcChannels.LESSONS_GET_CREATE_DEFAULTS,
        subjectId,
        schoolClass,
      ),
    create: (data: Record<string, unknown>, topicId: number) =>
      ipcRenderer.invoke(IpcChannels.LESSONS_CREATE, data, topicId),
    byTopic: (topicId: number) =>
      ipcRenderer.invoke(IpcChannels.LESSONS_BY_TOPIC, topicId),
    update: (id: number, data: Record<string, unknown>) =>
      ipcRenderer.invoke(IpcChannels.LESSONS_UPDATE, id, data),
  },
  lessonResources: {
    byLesson: (lessonId: number) =>
      ipcRenderer.invoke(IpcChannels.LESSON_RESOURCES_BY_LESSON, lessonId),
    preview: (url: string, resourceType: string) =>
      ipcRenderer.invoke(IpcChannels.LESSON_RESOURCE_PREVIEW, url, resourceType),
    download: (url: string, suggestedName?: string) =>
      ipcRenderer.invoke(IpcChannels.LESSON_RESOURCE_DOWNLOAD, url, suggestedName),
  },
  topicRelations: {
    byTopic: (topicId: number) =>
      ipcRenderer.invoke(IpcChannels.TOPIC_RELATIONS_BY_TOPIC, topicId),
  },
  curriculum: {
    byTopic: (topicId: number) =>
      ipcRenderer.invoke(IpcChannels.CURRICULUM_BY_TOPIC, topicId),
    byClass: (schoolClass: number, subjectId?: number) =>
      ipcRenderer.invoke(IpcChannels.CURRICULUM_BY_CLASS, schoolClass, subjectId),
  },
  search: {
    query: (text: string) => ipcRenderer.invoke(IpcChannels.SEARCH, text),
  },
  settings: {
    get: () => ipcRenderer.invoke(IpcChannels.SETTINGS_GET),
    update: (data: Record<string, unknown>) =>
      ipcRenderer.invoke(IpcChannels.SETTINGS_UPDATE, data),
  },
  shell: {
    openDatabaseFolder: () => ipcRenderer.invoke(IpcChannels.SHELL_OPEN_DATABASE_FOLDER),
    openPath: (targetPath: string) => ipcRenderer.invoke(IpcChannels.SHELL_OPEN_PATH, targetPath),
  },
  dialog: {
    selectFolder: (defaultPath?: string) =>
      ipcRenderer.invoke(IpcChannels.DIALOG_SELECT_FOLDER, defaultPath),
  },
  ref: {
    subjects: {
      list: () => ipcRenderer.invoke(IpcChannels.REF_SUBJECTS_LIST),
      create: (data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_SUBJECTS_CREATE, data),
      update: (id: number, data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_SUBJECTS_UPDATE, id, data),
      delete: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SUBJECTS_DELETE, id),
      archive: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SUBJECTS_ARCHIVE, id),
    },
    sections: {
      list: () => ipcRenderer.invoke(IpcChannels.REF_SECTIONS_LIST),
      update: (id: number, data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_SECTIONS_UPDATE, id, data),
      delete: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SECTIONS_DELETE, id),
      archive: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SECTIONS_ARCHIVE, id),
    },
    lessonTypes: {
      list: () => ipcRenderer.invoke(IpcChannels.REF_LESSON_TYPES_LIST),
      create: (data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_LESSON_TYPES_CREATE, data),
      update: (id: number, data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_LESSON_TYPES_UPDATE, id, data),
      delete: (id: number) => ipcRenderer.invoke(IpcChannels.REF_LESSON_TYPES_DELETE, id),
      archive: (id: number) => ipcRenderer.invoke(IpcChannels.REF_LESSON_TYPES_ARCHIVE, id),
    },
    lessonStatuses: {
      list: () => ipcRenderer.invoke(IpcChannels.REF_LESSON_STATUSES_LIST),
      create: (data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_LESSON_STATUSES_CREATE, data),
      update: (id: number, data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_LESSON_STATUSES_UPDATE, id, data),
      delete: (id: number) => ipcRenderer.invoke(IpcChannels.REF_LESSON_STATUSES_DELETE, id),
      archive: (id: number) => ipcRenderer.invoke(IpcChannels.REF_LESSON_STATUSES_ARCHIVE, id),
    },
    schoolClasses: {
      list: () => ipcRenderer.invoke(IpcChannels.REF_SCHOOL_CLASSES_LIST),
      create: (data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_SCHOOL_CLASSES_CREATE, data),
      update: (id: number, data: Record<string, unknown>) =>
        ipcRenderer.invoke(IpcChannels.REF_SCHOOL_CLASSES_UPDATE, id, data),
      delete: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SCHOOL_CLASSES_DELETE, id),
      archive: (id: number) => ipcRenderer.invoke(IpcChannels.REF_SCHOOL_CLASSES_ARCHIVE, id),
    },
    exportExcel: (type: string) => ipcRenderer.invoke(IpcChannels.REF_EXPORT_EXCEL, type),
  },
  docs: {
    getSnapshot: () => ipcRenderer.invoke(IpcChannels.DOCS_GET_SNAPSHOT),
  },
};

contextBridge.exposeInMainWorld('edumost', api);

export type EduMostAPI = typeof api;
