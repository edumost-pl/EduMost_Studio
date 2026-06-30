import type {
  Lesson,
  LessonDetail,
  Section,
  Subject,
  TopicDetail,
  TopicFilters,
  TopicListItem,
  Settings,
  DatabaseFileInfo,
  BackupEntry,
} from '@/types/database';
import type { EduMostAPI } from '@/types/edumost-api';

function getApi(): EduMostAPI {
  if (!window.edumost) {
    throw new Error(
      'window.edumost is not available. Application must run inside Electron with preload.',
    );
  }
  return window.edumost;
}

export async function fetchSubjects(): Promise<Subject[]> {
  return getApi().subjects.list() as Promise<Subject[]>;
}

export async function fetchSectionsByClass(
  subjectId: number,
  schoolClass: number,
): Promise<Section[]> {
  return getApi().sections.bySubjectAndClass(
    subjectId,
    schoolClass,
  ) as Promise<Section[]>;
}

export async function fetchTopics(
  filters: TopicFilters,
): Promise<TopicListItem[]> {
  return getApi().topics.list(filters as Record<string, unknown>) as Promise<
    TopicListItem[]
  >;
}

export async function fetchTopicsCount(filters: TopicFilters): Promise<number> {
  return getApi().topics.count(filters as Record<string, unknown>) as Promise<number>;
}

export async function fetchTopicAdjacent(
  topicId: number,
  filters: TopicFilters,
): Promise<{ prev: TopicListItem | null; next: TopicListItem | null }> {
  return getApi().topics.adjacent(topicId, filters as Record<string, unknown>) as Promise<{
    prev: TopicListItem | null;
    next: TopicListItem | null;
  }>;
}

export async function fetchTopicDetail(id: number): Promise<TopicDetail | null> {
  return (await getApi().topics.getDetail(id)) as TopicDetail | null;
}

export async function fetchTopicCreateDefaults(options: {
  subjectId: number;
  schoolClass: number;
  sectionName: string;
  sectionId?: number | null;
}): Promise<{ code: string }> {
  return getApi().topics.getCreateDefaults(options) as Promise<{ code: string }>;
}

export async function createTopic(
  data: Record<string, unknown>,
  options: {
    schoolClass: number;
    subjectId: number;
    sectionName: string;
    sectionId?: number | null;
  },
): Promise<TopicDetail | null> {
  return (await getApi().topics.create(data, options)) as TopicDetail | null;
}

export async function updateTopic(
  id: number,
  data: Partial<TopicDetail>,
  options?: {
    schoolClass?: number;
    subjectId?: number;
    sectionName?: string;
    sectionId?: number | null;
  },
): Promise<TopicDetail | null> {
  return (await getApi().topics.update(
    id,
    data as Record<string, unknown>,
    options,
  )) as TopicDetail | null;
}

export async function fetchSectionsBySubject(subjectId: number): Promise<Section[]> {
  return getApi().sections.bySubject(subjectId) as Promise<Section[]>;
}

export async function fetchSectionSuggestCode(
  subjectId: number,
  name: string,
): Promise<string> {
  return getApi().sections.suggestCode(subjectId, name) as Promise<string>;
}

export async function createSection(
  subjectId: number,
  data: { name_pl: string; name_ua: string; code?: string },
): Promise<Section> {
  return getApi().sections.create(subjectId, data) as Promise<Section>;
}

export async function fetchLessons(filters: {
  subjectId?: number;
  schoolClass?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Lesson[]> {
  return getApi().lessons.list(filters) as Promise<Lesson[]>;
}

export async function fetchLessonDetail(id: number): Promise<LessonDetail | null> {
  return (await getApi().lessons.getDetail(id)) as LessonDetail | null;
}

export async function fetchLessonAdjacent(
  lessonId: number,
  filters: { subjectId?: number; schoolClass?: number; topicId?: number },
): Promise<{ prev: Lesson | null; next: Lesson | null }> {
  return getApi().lessons.adjacent(lessonId, filters) as Promise<{
    prev: Lesson | null;
    next: Lesson | null;
  }>;
}

export async function fetchLessonCreateDefaults(
  subjectId: number,
  schoolClass: number,
): Promise<{ code: string }> {
  return getApi().lessons.getCreateDefaults(subjectId, schoolClass) as Promise<{
    code: string;
  }>;
}

export async function createLesson(
  data: Record<string, unknown>,
  topicId: number,
): Promise<LessonDetail | null> {
  return (await getApi().lessons.create(data, topicId)) as LessonDetail | null;
}

export async function updateLesson(
  id: number,
  data: Partial<LessonDetail>,
): Promise<LessonDetail | null> {
  return (await getApi().lessons.update(id, data as Record<string, unknown>)) as LessonDetail | null;
}

export async function fetchDbInfo() {
  return getApi().db.getInfo();
}

export async function fetchDatabaseFileInfo(): Promise<DatabaseFileInfo> {
  return getApi().db.getFileInfo() as Promise<DatabaseFileInfo>;
}

export async function fetchSettings(): Promise<Settings | undefined> {
  return getApi().settings.get() as Promise<Settings | undefined>;
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings | undefined> {
  return getApi().settings.update(data as Record<string, unknown>) as Promise<Settings | undefined>;
}

export async function exportDatabase(): Promise<{ ok: boolean; path?: string; error?: string }> {
  return getApi().db.export() as Promise<{ ok: boolean; path?: string; error?: string }>;
}

export async function importDatabase(
  backupBeforeImport?: boolean,
): Promise<{ ok: boolean; error?: string }> {
  return getApi().db.import(backupBeforeImport) as Promise<{ ok: boolean; error?: string }>;
}

export async function createDatabaseBackup(): Promise<BackupEntry> {
  return getApi().db.createBackup() as Promise<BackupEntry>;
}

export async function listDatabaseBackups(): Promise<BackupEntry[]> {
  return getApi().db.listBackups() as Promise<BackupEntry[]>;
}

export async function restoreDatabaseBackup(): Promise<{ ok: boolean; error?: string }> {
  return getApi().db.restoreBackup() as Promise<{ ok: boolean; error?: string }>;
}

export async function openDatabaseFolder(): Promise<void> {
  await getApi().shell.openDatabaseFolder();
}

export async function openFolderPath(targetPath: string): Promise<void> {
  await getApi().shell.openPath(targetPath);
}

export async function selectFolderPath(
  defaultPath?: string,
): Promise<{ ok: boolean; path?: string }> {
  return getApi().dialog.selectFolder(defaultPath) as Promise<{ ok: boolean; path?: string }>;
}
