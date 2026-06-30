import type { TopicDetail } from '@/types/database';

export interface TopicSaveOptions {
  schoolClass: number;
  subjectId: number;
  sectionName: string;
  sectionId?: number | null;
}

export interface TopicFormData {
  section_id: number;
  section_name: string;
  school_class: number;
  code: string;
  name_pl: string;
  name_ua: string;
  description_pl: string;
  description_ua: string;
  prerequisites_pl: string;
  prerequisites_ua: string;
  outcomes_pl: string;
  outcomes_ua: string;
  terminology_pl: string;
  terminology_ua: string;
  methodology_pl: string;
  methodology_ua: string;
  is_active: number;
}

export function matchSection(sections: { id: number; name_pl: string; name_ua: string }[], name: string) {
  const trimmed = name.trim();
  return sections.find(
    (section) => section.name_ua === trimmed || section.name_pl === trimmed,
  );
}

export function emptyTopicForm(
  sectionId: number,
  sectionName: string,
  code: string,
  schoolClass: number,
): TopicFormData {
  return {
    section_id: sectionId,
    section_name: sectionName,
    school_class: schoolClass,
    code,
    name_pl: '',
    name_ua: '',
    description_pl: '',
    description_ua: '',
    prerequisites_pl: '',
    prerequisites_ua: '',
    outcomes_pl: '',
    outcomes_ua: '',
    terminology_pl: '',
    terminology_ua: '',
    methodology_pl: '',
    methodology_ua: '',
    is_active: 1,
  };
}

export function topicDetailToForm(detail: TopicDetail): TopicFormData {
  return {
    section_id: detail.section_id,
    section_name: detail.section_name_ua,
    school_class: detail.curriculum?.[0]?.school_class ?? 4,
    code: detail.code,
    name_pl: detail.name_pl,
    name_ua: detail.name_ua,
    description_pl: detail.description_pl ?? '',
    description_ua: detail.description_ua ?? '',
    prerequisites_pl: detail.prerequisites_pl ?? '',
    prerequisites_ua: detail.prerequisites_ua ?? '',
    outcomes_pl: detail.outcomes_pl ?? '',
    outcomes_ua: detail.outcomes_ua ?? '',
    terminology_pl: detail.terminology_pl ?? '',
    terminology_ua: detail.terminology_ua ?? '',
    methodology_pl: detail.methodology_pl ?? '',
    methodology_ua: detail.methodology_ua ?? '',
    is_active: detail.is_active,
  };
}

export function formDataEqual(a: TopicFormData, b: TopicFormData): boolean {
  return (Object.keys(a) as (keyof TopicFormData)[]).every((key) => a[key] === b[key]);
}
