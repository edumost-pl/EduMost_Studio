import type {
  LessonStatus,
  LessonType,
  SchoolClass,
  SectionListItem,
  Subject,
} from '@/types/database';

function getApi() {
  if (!window.edumost) {
    throw new Error('window.edumost is not available');
  }
  return window.edumost;
}

export type ReferenceExportType =
  | 'subjects'
  | 'sections'
  | 'lessonTypes'
  | 'lessonStatuses'
  | 'schoolClasses';

export type DeleteResult = { ok: true } | { ok: false; reason: 'IN_USE' };

export async function fetchRefSubjects(): Promise<Subject[]> {
  return getApi().ref.subjects.list() as Promise<Subject[]>;
}

export async function createRefSubject(data: {
  code: string;
  icon?: string | null;
  name_pl: string;
  name_ua: string;
  is_active?: number;
}): Promise<Subject> {
  return getApi().ref.subjects.create(data) as Promise<Subject>;
}

export async function updateRefSubject(
  id: number,
  data: Partial<Subject>,
): Promise<Subject | undefined> {
  return getApi().ref.subjects.update(id, data as Record<string, unknown>) as Promise<
    Subject | undefined
  >;
}

export async function deleteRefSubject(id: number): Promise<DeleteResult> {
  return getApi().ref.subjects.delete(id) as Promise<DeleteResult>;
}

export async function archiveRefSubject(id: number): Promise<Subject | undefined> {
  return getApi().ref.subjects.archive(id) as Promise<Subject | undefined>;
}

export async function fetchRefSections(): Promise<SectionListItem[]> {
  return getApi().ref.sections.list() as Promise<SectionListItem[]>;
}

export async function updateRefSection(
  id: number,
  data: Partial<SectionListItem>,
): Promise<SectionListItem | undefined> {
  return getApi().ref.sections.update(id, data as Record<string, unknown>) as Promise<
    SectionListItem | undefined
  >;
}

export async function deleteRefSection(id: number): Promise<DeleteResult> {
  return getApi().ref.sections.delete(id) as Promise<DeleteResult>;
}

export async function archiveRefSection(id: number): Promise<SectionListItem | undefined> {
  return getApi().ref.sections.archive(id) as Promise<SectionListItem | undefined>;
}

export async function fetchRefLessonTypes(): Promise<LessonType[]> {
  return getApi().ref.lessonTypes.list() as Promise<LessonType[]>;
}

export async function createRefLessonType(data: {
  name: string;
  is_active?: number;
}): Promise<LessonType> {
  return getApi().ref.lessonTypes.create(data) as Promise<LessonType>;
}

export async function updateRefLessonType(
  id: number,
  data: Partial<LessonType>,
): Promise<LessonType | undefined> {
  return getApi().ref.lessonTypes.update(id, data as Record<string, unknown>) as Promise<
    LessonType | undefined
  >;
}

export async function deleteRefLessonType(id: number): Promise<DeleteResult> {
  return getApi().ref.lessonTypes.delete(id) as Promise<DeleteResult>;
}

export async function archiveRefLessonType(id: number): Promise<LessonType | undefined> {
  return getApi().ref.lessonTypes.archive(id) as Promise<LessonType | undefined>;
}

export async function fetchRefLessonStatuses(): Promise<LessonStatus[]> {
  return getApi().ref.lessonStatuses.list() as Promise<LessonStatus[]>;
}

export async function createRefLessonStatus(data: {
  name: string;
  is_active?: number;
}): Promise<LessonStatus> {
  return getApi().ref.lessonStatuses.create(data) as Promise<LessonStatus>;
}

export async function updateRefLessonStatus(
  id: number,
  data: Partial<LessonStatus>,
): Promise<LessonStatus | undefined> {
  return getApi().ref.lessonStatuses.update(id, data as Record<string, unknown>) as Promise<
    LessonStatus | undefined
  >;
}

export async function deleteRefLessonStatus(id: number): Promise<DeleteResult> {
  return getApi().ref.lessonStatuses.delete(id) as Promise<DeleteResult>;
}

export async function archiveRefLessonStatus(id: number): Promise<LessonStatus | undefined> {
  return getApi().ref.lessonStatuses.archive(id) as Promise<LessonStatus | undefined>;
}

export async function fetchRefSchoolClasses(): Promise<SchoolClass[]> {
  return getApi().ref.schoolClasses.list() as Promise<SchoolClass[]>;
}

export async function createRefSchoolClass(data: {
  class_number: number;
  name_ua: string;
  name_pl: string;
  is_active?: number;
}): Promise<SchoolClass> {
  return getApi().ref.schoolClasses.create(data) as Promise<SchoolClass>;
}

export async function updateRefSchoolClass(
  id: number,
  data: Partial<SchoolClass>,
): Promise<SchoolClass | undefined> {
  return getApi().ref.schoolClasses.update(id, data as Record<string, unknown>) as Promise<
    SchoolClass | undefined
  >;
}

export async function deleteRefSchoolClass(id: number): Promise<DeleteResult> {
  return getApi().ref.schoolClasses.delete(id) as Promise<DeleteResult>;
}

export async function archiveRefSchoolClass(id: number): Promise<SchoolClass | undefined> {
  return getApi().ref.schoolClasses.archive(id) as Promise<SchoolClass | undefined>;
}

export async function exportReferenceExcel(
  type: ReferenceExportType,
): Promise<{ ok: boolean; path?: string; error?: string }> {
  return getApi().ref.exportExcel(type) as Promise<{ ok: boolean; path?: string; error?: string }>;
}
