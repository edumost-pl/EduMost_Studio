import type { LessonDetail } from '@/types/database';

export interface LessonFormData {
  code: string;
  subject_id: number;
  school_class: number;
  lesson_type: string;
  duration: number | null;
  title_pl: string;
  title_ua: string;
  goal_pl: string;
  goal_ua: string;
  learning_results_pl: string;
  learning_results_ua: string;
  terminology_pl: string;
  terminology_ua: string;
  equipment_pl: string;
  equipment_ua: string;
  scenario_pl: string;
  scenario_ua: string;
  homework_pl: string;
  homework_ua: string;
  assessment_pl: string;
  assessment_ua: string;
  teacher_notes_pl: string;
  teacher_notes_ua: string;
  author: string;
  version: string;
  status: string;
  is_active: number;
}

export function emptyLessonForm(
  subjectId: number,
  schoolClass: number,
  code: string,
): LessonFormData {
  return {
    code,
    subject_id: subjectId,
    school_class: schoolClass,
    lesson_type: 'New Knowledge',
    duration: 45,
    title_pl: '',
    title_ua: '',
    goal_pl: '',
    goal_ua: '',
    learning_results_pl: '',
    learning_results_ua: '',
    terminology_pl: '',
    terminology_ua: '',
    equipment_pl: '',
    equipment_ua: '',
    scenario_pl: '',
    scenario_ua: '',
    homework_pl: '',
    homework_ua: '',
    assessment_pl: '',
    assessment_ua: '',
    teacher_notes_pl: '',
    teacher_notes_ua: '',
    author: '',
    version: '',
    status: 'Draft',
    is_active: 1,
  };
}

export function lessonDetailToForm(detail: LessonDetail): LessonFormData {
  return {
    code: detail.code,
    subject_id: detail.subject_id,
    school_class: detail.school_class,
    lesson_type: detail.lesson_type,
    duration: detail.duration,
    title_pl: detail.title_pl,
    title_ua: detail.title_ua,
    goal_pl: detail.goal_pl ?? '',
    goal_ua: detail.goal_ua ?? '',
    learning_results_pl: detail.learning_results_pl ?? '',
    learning_results_ua: detail.learning_results_ua ?? '',
    terminology_pl: detail.terminology_pl ?? '',
    terminology_ua: detail.terminology_ua ?? '',
    equipment_pl: detail.equipment_pl ?? '',
    equipment_ua: detail.equipment_ua ?? '',
    scenario_pl: detail.scenario_pl ?? '',
    scenario_ua: detail.scenario_ua ?? '',
    homework_pl: detail.homework_pl ?? '',
    homework_ua: detail.homework_ua ?? '',
    assessment_pl: detail.assessment_pl ?? '',
    assessment_ua: detail.assessment_ua ?? '',
    teacher_notes_pl: detail.teacher_notes_pl ?? '',
    teacher_notes_ua: detail.teacher_notes_ua ?? '',
    author: detail.author ?? '',
    version: detail.version ?? '',
    status: detail.status,
    is_active: detail.is_active,
  };
}

export function formDataEqual(a: LessonFormData, b: LessonFormData): boolean {
  return (Object.keys(a) as (keyof LessonFormData)[]).every((key) => a[key] === b[key]);
}
