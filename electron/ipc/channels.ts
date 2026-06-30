export const IpcChannels = {
  DB_GET_INFO: 'db:getInfo',
  DB_GET_TABLES: 'db:getTables',

  SUBJECTS_LIST: 'subjects:list',
  SUBJECTS_GET: 'subjects:get',

  SECTIONS_LIST: 'sections:list',
  SECTIONS_BY_SUBJECT: 'sections:bySubject',
  SECTIONS_BY_SUBJECT_CLASS: 'sections:bySubjectAndClass',
  SECTIONS_SUGGEST_CODE: 'sections:suggestCode',
  SECTIONS_CREATE: 'sections:create',

  TOPICS_LIST: 'topics:list',
  TOPICS_COUNT: 'topics:count',
  TOPICS_GET: 'topics:get',
  TOPICS_GET_DETAIL: 'topics:getDetail',
  TOPICS_GET_CREATE_DEFAULTS: 'topics:getCreateDefaults',
  TOPICS_CREATE: 'topics:create',
  TOPICS_UPDATE: 'topics:update',

  LESSONS_LIST: 'lessons:list',
  LESSONS_GET: 'lessons:get',
  LESSONS_GET_DETAIL: 'lessons:getDetail',
  LESSONS_GET_CREATE_DEFAULTS: 'lessons:getCreateDefaults',
  LESSONS_CREATE: 'lessons:create',
  LESSONS_BY_TOPIC: 'lessons:byTopic',
  LESSONS_UPDATE: 'lessons:update',

  LESSON_RESOURCES_BY_LESSON: 'lessonResources:byLesson',
  LESSON_RESOURCE_PREVIEW: 'lessonResources:preview',
  LESSON_RESOURCE_DOWNLOAD: 'lessonResources:download',

  TOPIC_RELATIONS_BY_TOPIC: 'topicRelations:byTopic',

  CURRICULUM_BY_TOPIC: 'curriculum:byTopic',
  CURRICULUM_BY_CLASS: 'curriculum:byClass',

  SEARCH: 'search:query',

  SETTINGS_GET: 'settings:get',
  SETTINGS_UPDATE: 'settings:update',

  DB_GET_FILE_INFO: 'db:getFileInfo',
  DB_EXPORT: 'db:export',
  DB_IMPORT: 'db:import',
  DB_CREATE_BACKUP: 'db:createBackup',
  DB_LIST_BACKUPS: 'db:listBackups',
  DB_RESTORE_BACKUP: 'db:restoreBackup',

  SHELL_OPEN_DATABASE_FOLDER: 'shell:openDatabaseFolder',
  SHELL_OPEN_PATH: 'shell:openPath',
  DIALOG_SELECT_FOLDER: 'dialog:selectFolder',

  REF_SUBJECTS_LIST: 'ref:subjects:list',
  REF_SUBJECTS_CREATE: 'ref:subjects:create',
  REF_SUBJECTS_UPDATE: 'ref:subjects:update',
  REF_SUBJECTS_DELETE: 'ref:subjects:delete',
  REF_SUBJECTS_ARCHIVE: 'ref:subjects:archive',
  REF_SECTIONS_LIST: 'ref:sections:list',
  REF_SECTIONS_UPDATE: 'ref:sections:update',
  REF_SECTIONS_DELETE: 'ref:sections:delete',
  REF_SECTIONS_ARCHIVE: 'ref:sections:archive',
  REF_LESSON_TYPES_LIST: 'ref:lessonTypes:list',
  REF_LESSON_TYPES_CREATE: 'ref:lessonTypes:create',
  REF_LESSON_TYPES_UPDATE: 'ref:lessonTypes:update',
  REF_LESSON_TYPES_DELETE: 'ref:lessonTypes:delete',
  REF_LESSON_TYPES_ARCHIVE: 'ref:lessonTypes:archive',
  REF_LESSON_STATUSES_LIST: 'ref:lessonStatuses:list',
  REF_LESSON_STATUSES_CREATE: 'ref:lessonStatuses:create',
  REF_LESSON_STATUSES_UPDATE: 'ref:lessonStatuses:update',
  REF_LESSON_STATUSES_DELETE: 'ref:lessonStatuses:delete',
  REF_LESSON_STATUSES_ARCHIVE: 'ref:lessonStatuses:archive',
  REF_SCHOOL_CLASSES_LIST: 'ref:schoolClasses:list',
  REF_SCHOOL_CLASSES_CREATE: 'ref:schoolClasses:create',
  REF_SCHOOL_CLASSES_UPDATE: 'ref:schoolClasses:update',
  REF_SCHOOL_CLASSES_DELETE: 'ref:schoolClasses:delete',
  REF_SCHOOL_CLASSES_ARCHIVE: 'ref:schoolClasses:archive',
  REF_EXPORT_EXCEL: 'ref:exportExcel',

  DOCS_GET_SNAPSHOT: 'docs:getSnapshot',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
