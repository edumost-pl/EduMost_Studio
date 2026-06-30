import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getDatabaseService } from '../database/DatabaseService';
import {
  createBackup,
  exportDatabase,
  getDatabaseFileInfo,
  importDatabase,
  listBackups,
  openDatabaseFolder,
  openPathInShell,
  restoreBackup,
  selectFolder,
} from '../database/databaseManager';
import { exportReferenceToExcel, type ReferenceExportType } from '../database/referenceExport';
import { buildDocumentationSnapshot } from '../documentation/buildSnapshot';
import type { Topic } from '../database/types';
import {
  buildResourcePreviewPayload,
  fileNameFromResourceUrl,
} from './resourcePreview';
import { RepositoryRegistry } from '../repositories';
import { IpcChannels } from './channels';

function getRepos(): RepositoryRegistry {
  return new RepositoryRegistry(getDatabaseService().getDatabase());
}

export function registerIpcHandlers(): void {
  unregisterIpcHandlers();

  ipcMain.handle(IpcChannels.DB_GET_INFO, () => getDatabaseService().getInfo());

  ipcMain.handle(IpcChannels.DB_GET_TABLES, () => {
    const db = getDatabaseService().getDatabase();
    return db
      .prepare(
        `SELECT name FROM sqlite_master
         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
         ORDER BY name ASC`,
      )
      .all();
  });

  ipcMain.handle(IpcChannels.SUBJECTS_LIST, () => getRepos().subjects.findAll());

  ipcMain.handle(IpcChannels.SUBJECTS_GET, (_event, id: number) =>
    getRepos().subjects.findById(id),
  );

  ipcMain.handle(IpcChannels.SECTIONS_LIST, () => getRepos().sections.findAll());

  ipcMain.handle(IpcChannels.SECTIONS_BY_SUBJECT, (_event, subjectId: number) =>
    getRepos().sections.findBySubjectId(subjectId),
  );

  ipcMain.handle(
    IpcChannels.SECTIONS_BY_SUBJECT_CLASS,
    (_event, subjectId: number, schoolClass: number) =>
      getRepos().sections.findBySubjectAndClass(subjectId, schoolClass),
  );

  ipcMain.handle(
    IpcChannels.SECTIONS_SUGGEST_CODE,
    (_event, subjectId: number, name: string) =>
      getRepos().sections.suggestNewSectionCode(subjectId, name),
  );

  ipcMain.handle(
    IpcChannels.SECTIONS_CREATE,
    (
      _event,
      subjectId: number,
      data: { name_pl: string; name_ua: string; code?: string },
    ) => {
      const repos = getRepos().sections;
      try {
        const code =
          data.code?.trim() ||
          repos.suggestNewSectionCode(subjectId, data.name_ua || data.name_pl);
        return repos.create({
          subject_id: subjectId,
          code,
          name_pl: data.name_pl.trim(),
          name_ua: data.name_ua.trim(),
          description_pl: null,
          description_ua: null,
          display_order: repos.getNextDisplayOrder(subjectId),
          is_active: 1,
        });
      } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
          throw new Error('DUPLICATE_CODE');
        }
        throw err;
      }
    },
  );

  ipcMain.handle(IpcChannels.TOPICS_LIST, (_event, filters) =>
    getRepos().topics.findAll(filters ?? {}),
  );

  ipcMain.handle(IpcChannels.TOPICS_COUNT, (_event, filters) =>
    getRepos().topics.count(filters ?? {}),
  );

  ipcMain.handle(IpcChannels.TOPICS_GET, (_event, id: number) =>
    getRepos().topics.findById(id),
  );

  ipcMain.handle(IpcChannels.TOPICS_GET_DETAIL, (_event, id: number) =>
    getRepos().topics.findDetailById(id),
  );

  ipcMain.handle(
    IpcChannels.TOPICS_ADJACENT,
    (_event, topicId: number, filters?: Record<string, unknown>) =>
      getRepos().topics.findAdjacent(topicId, filters ?? {}),
  );

  ipcMain.handle(
    IpcChannels.TOPICS_GET_CREATE_DEFAULTS,
    (
      _event,
      options: {
        subjectId: number;
        schoolClass: number;
        sectionName: string;
        sectionId?: number | null;
      },
    ) => {
      const repos = getRepos();
      let sectionId = options.sectionId ?? null;
      if (!sectionId) {
        const section = repos.sections.findBySubjectAndName(
          options.subjectId,
          options.sectionName,
        );
        sectionId = section?.id ?? null;
      }
      if (sectionId) {
        return {
          code: repos.topics.suggestNextCode(
            options.subjectId,
            options.schoolClass,
            sectionId,
          ),
        };
      }
      const subject = repos.subjects.findById(options.subjectId);
      const prefix = repos.sections.resolveSectionCode(
        options.subjectId,
        options.sectionName,
        options.sectionId,
      );
      const subjectCode = subject?.code ?? 'SUB';
      return {
        code: repos.topics.suggestNextCodeForPrefix(
          `${subjectCode}${options.schoolClass}-${prefix}`,
        ),
      };
    },
  );

  ipcMain.handle(
    IpcChannels.TOPICS_CREATE,
    (
      _event,
      topicData: Record<string, unknown>,
      options: {
        schoolClass: number;
        subjectId: number;
        sectionName: string;
        sectionId?: number | null;
      },
    ) => {
      const db = getDatabaseService().getDatabase();
      const repos = getRepos();
      try {
        const create = db.transaction(() => {
          const section = repos.sections.resolveOrCreate(
            options.subjectId,
            options.sectionName,
            options.sectionId,
          );
          const topic = repos.topics.create({
            ...(topicData as Omit<Topic, 'id' | 'created_at' | 'updated_at'>),
            section_id: section.id,
            display_order: 0,
          });
          repos.curriculum.create({
            topic_id: topic.id,
            school_class: options.schoolClass,
            learning_stage: 'Introduced',
            curriculum_code: null,
            curriculum_pl: null,
            notes_pl: null,
            notes_ua: null,
            display_order: 0,
            is_active: 1,
          });
          return repos.topics.findDetailById(topic.id);
        });
        return create();
      } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
          throw new Error('DUPLICATE_CODE');
        }
        throw err;
      }
    },
  );

  ipcMain.handle(
    IpcChannels.TOPICS_UPDATE,
    (
      _event,
      id: number,
      data,
      options?: {
        schoolClass?: number;
        subjectId?: number;
        sectionName?: string;
        sectionId?: number | null;
      },
    ) => {
      const db = getDatabaseService().getDatabase();
      const repos = getRepos();
      const update = db.transaction(() => {
        const payload = { ...(data as Record<string, unknown>) };

        if (options?.subjectId && options.sectionName) {
          const section = repos.sections.resolveOrCreate(
            options.subjectId,
            options.sectionName,
            options.sectionId,
          );
          payload.section_id = section.id;
        }

        repos.topics.update(id, payload as Partial<Topic>);

        if (options?.schoolClass != null) {
          repos.curriculum.updateSchoolClassByTopicId(id, options.schoolClass);
        }

        return repos.topics.findDetailById(id);
      });
      return update();
    },
  );

  ipcMain.handle(IpcChannels.LESSONS_LIST, (_event, filters) =>
    getRepos().lessons.findAll(filters ?? {}),
  );

  ipcMain.handle(IpcChannels.LESSONS_GET, (_event, id: number) =>
    getRepos().lessons.findById(id),
  );

  ipcMain.handle(IpcChannels.LESSONS_GET_DETAIL, (_event, id: number) =>
    getRepos().lessons.findDetailById(id),
  );

  ipcMain.handle(
    IpcChannels.LESSONS_GET_CREATE_DEFAULTS,
    (_event, subjectId: number, schoolClass: number) => ({
      code: getRepos().lessons.suggestNextCode(subjectId, schoolClass),
    }),
  );

  ipcMain.handle(
    IpcChannels.LESSONS_CREATE,
    (_event, lessonData: Record<string, unknown>, topicId: number) => {
      const db = getDatabaseService().getDatabase();
      const repos = getRepos();
      try {
        const create = db.transaction(() => {
          const lesson = repos.lessons.create(lessonData as Parameters<
            typeof repos.lessons.create
          >[0]);
          repos.lessonTopics.create({
            lesson_id: lesson.id,
            topic_id: topicId,
            is_primary: 1,
            display_order: repos.lessonTopics.getNextDisplayOrder(topicId),
          });
          return repos.lessons.findDetailById(lesson.id);
        });
        return create();
      } catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
          throw new Error('DUPLICATE_CODE');
        }
        throw err;
      }
    },
  );

  ipcMain.handle(IpcChannels.LESSONS_BY_TOPIC, (_event, topicId: number) =>
    getRepos().lessons.findByTopicId(topicId),
  );

  ipcMain.handle(
    IpcChannels.LESSONS_ADJACENT,
    (
      _event,
      lessonId: number,
      filters?: { subjectId?: number; schoolClass?: number; topicId?: number },
    ) => getRepos().lessons.findAdjacent(lessonId, filters ?? {}),
  );

  ipcMain.handle(IpcChannels.LESSONS_UPDATE, (_event, id: number, data) => {
    getRepos().lessons.update(id, data);
    return getRepos().lessons.findDetailById(id);
  });

  ipcMain.handle(IpcChannels.LESSON_RESOURCES_BY_LESSON, (_event, lessonId: number) =>
    getRepos().lessonResources.findByLessonId(lessonId),
  );

  ipcMain.handle(
    IpcChannels.LESSON_RESOURCE_PREVIEW,
    (_event, url: string, resourceType: string) =>
      buildResourcePreviewPayload(url, resourceType),
  );

  ipcMain.handle(
    IpcChannels.LESSON_RESOURCE_DOWNLOAD,
    async (_event, url: string, suggestedName?: string) => {
      const fileName = suggestedName || fileNameFromResourceUrl(url);

      if (url.startsWith('http://') || url.startsWith('https://')) {
        const win = BrowserWindow.getFocusedWindow();
        if (win) {
          win.webContents.downloadURL(url);
          return { ok: true };
        }
        await shell.openExternal(url);
        return { ok: true };
      }

      let srcPath: string;
      try {
        srcPath = fileURLToPath(url);
      } catch {
        return { ok: false, error: 'Invalid file URL' };
      }

      if (!fs.existsSync(srcPath)) {
        return { ok: false, error: 'File not found' };
      }

      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: fileName,
      });

      if (canceled || !filePath) {
        return { ok: false, cancelled: true };
      }

      await fs.promises.copyFile(srcPath, filePath);
      return { ok: true, filePath };
    },
  );

  ipcMain.handle(IpcChannels.TOPIC_RELATIONS_BY_TOPIC, (_event, topicId: number) =>
    getRepos().topicRelations.findByTopicId(topicId),
  );

  ipcMain.handle(IpcChannels.CURRICULUM_BY_TOPIC, (_event, topicId: number) =>
    getRepos().curriculum.findByTopicId(topicId),
  );

  ipcMain.handle(
    IpcChannels.CURRICULUM_BY_CLASS,
    (_event, schoolClass: number, subjectId?: number) =>
      getRepos().curriculum.findByClass(schoolClass, subjectId),
  );

  ipcMain.handle(IpcChannels.SEARCH, (_event, query: string) => {
    const repos = getRepos();
    const topics = repos.topics.findAll({ search: query, limit: 50 });
    const lessons = repos.lessons.findAll({ search: query, limit: 50 });
    return { topics, lessons };
  });

  ipcMain.handle(IpcChannels.SETTINGS_GET, () => getRepos().settings.find());

  ipcMain.handle(IpcChannels.SETTINGS_UPDATE, (_event, data) =>
    getRepos().settings.update(data),
  );

  ipcMain.handle(IpcChannels.DB_GET_FILE_INFO, () => getDatabaseFileInfo());

  ipcMain.handle(IpcChannels.DB_EXPORT, () => exportDatabase());

  ipcMain.handle(IpcChannels.DB_IMPORT, async (_event, backupBeforeImport?: boolean) =>
    importDatabase({ backupBeforeImport }),
  );

  ipcMain.handle(IpcChannels.DB_CREATE_BACKUP, () => {
    const backup = createBackup();
    getRepos().settings.update({ last_backup: backup.modifiedAt });
    return backup;
  });

  ipcMain.handle(IpcChannels.DB_LIST_BACKUPS, () => listBackups());

  ipcMain.handle(IpcChannels.DB_RESTORE_BACKUP, () => restoreBackup());

  ipcMain.handle(IpcChannels.SHELL_OPEN_DATABASE_FOLDER, () => {
    openDatabaseFolder();
  });

  ipcMain.handle(IpcChannels.SHELL_OPEN_PATH, (_event, targetPath: string) => {
    openPathInShell(targetPath);
  });

  ipcMain.handle(IpcChannels.DIALOG_SELECT_FOLDER, (_event, defaultPath?: string) =>
    selectFolder(defaultPath),
  );

  ipcMain.handle(IpcChannels.REF_SUBJECTS_LIST, () => getRepos().subjects.findAllForAdmin());

  ipcMain.handle(IpcChannels.REF_SUBJECTS_CREATE, (_event, data) => {
    try {
      return getRepos().subjects.create(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new Error('DUPLICATE_CODE');
      }
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.REF_SUBJECTS_UPDATE, (_event, id: number, data) =>
    getRepos().subjects.update(id, data),
  );

  ipcMain.handle(IpcChannels.REF_SUBJECTS_DELETE, (_event, id: number) =>
    getRepos().subjects.delete(id),
  );

  ipcMain.handle(IpcChannels.REF_SUBJECTS_ARCHIVE, (_event, id: number) =>
    getRepos().subjects.archive(id),
  );

  ipcMain.handle(IpcChannels.REF_SECTIONS_LIST, () => getRepos().sections.findAllForAdmin());

  ipcMain.handle(IpcChannels.REF_SECTIONS_UPDATE, (_event, id: number, data) =>
    getRepos().sections.update(id, data),
  );

  ipcMain.handle(IpcChannels.REF_SECTIONS_DELETE, (_event, id: number) =>
    getRepos().sections.delete(id),
  );

  ipcMain.handle(IpcChannels.REF_SECTIONS_ARCHIVE, (_event, id: number) =>
    getRepos().sections.archive(id),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_TYPES_LIST, () => getRepos().lessonTypes.findAllForAdmin());

  ipcMain.handle(IpcChannels.REF_LESSON_TYPES_CREATE, (_event, data) => {
    try {
      return getRepos().lessonTypes.create(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new Error('DUPLICATE_NAME');
      }
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.REF_LESSON_TYPES_UPDATE, (_event, id: number, data) =>
    getRepos().lessonTypes.update(id, data),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_TYPES_DELETE, (_event, id: number) =>
    getRepos().lessonTypes.delete(id),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_TYPES_ARCHIVE, (_event, id: number) =>
    getRepos().lessonTypes.archive(id),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_STATUSES_LIST, () =>
    getRepos().lessonStatuses.findAllForAdmin(),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_STATUSES_CREATE, (_event, data) => {
    try {
      return getRepos().lessonStatuses.create(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new Error('DUPLICATE_NAME');
      }
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.REF_LESSON_STATUSES_UPDATE, (_event, id: number, data) =>
    getRepos().lessonStatuses.update(id, data),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_STATUSES_DELETE, (_event, id: number) =>
    getRepos().lessonStatuses.delete(id),
  );

  ipcMain.handle(IpcChannels.REF_LESSON_STATUSES_ARCHIVE, (_event, id: number) =>
    getRepos().lessonStatuses.archive(id),
  );

  ipcMain.handle(IpcChannels.REF_SCHOOL_CLASSES_LIST, () =>
    getRepos().schoolClasses.findAllForAdmin(),
  );

  ipcMain.handle(IpcChannels.REF_SCHOOL_CLASSES_CREATE, (_event, data) => {
    try {
      return getRepos().schoolClasses.create(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
        throw new Error('DUPLICATE_NUMBER');
      }
      throw err;
    }
  });

  ipcMain.handle(IpcChannels.REF_SCHOOL_CLASSES_UPDATE, (_event, id: number, data) =>
    getRepos().schoolClasses.update(id, data),
  );

  ipcMain.handle(IpcChannels.REF_SCHOOL_CLASSES_DELETE, (_event, id: number) =>
    getRepos().schoolClasses.delete(id),
  );

  ipcMain.handle(IpcChannels.REF_SCHOOL_CLASSES_ARCHIVE, (_event, id: number) =>
    getRepos().schoolClasses.archive(id),
  );

  ipcMain.handle(IpcChannels.REF_EXPORT_EXCEL, (_event, type: ReferenceExportType) =>
    exportReferenceToExcel(type),
  );

  ipcMain.handle(IpcChannels.DOCS_GET_SNAPSHOT, () => buildDocumentationSnapshot());
}

export function unregisterIpcHandlers(): void {
  Object.values(IpcChannels).forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
}
