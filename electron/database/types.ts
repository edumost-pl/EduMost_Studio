export interface BaseEntity {
  id: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Subject extends BaseEntity {
  code: string;
  icon: string | null;
  name_pl: string;
  name_ua: string;
  description_pl: string | null;
  description_ua: string | null;
  display_order: number;
}

export interface SectionListItem extends Section {
  subject_code?: string;
  subject_name_ua?: string;
  subject_name_pl?: string;
}

export interface LessonType extends BaseEntity {
  name: string;
  display_order: number;
}

export interface LessonStatus extends BaseEntity {
  name: string;
  display_order: number;
}

export interface SchoolClass extends BaseEntity {
  class_number: number;
  name_ua: string;
  name_pl: string;
  display_order: number;
}

export interface Section extends BaseEntity {
  subject_id: number;
  code: string;
  name_pl: string;
  name_ua: string;
  description_pl: string | null;
  description_ua: string | null;
  display_order: number;
}

export interface Topic extends BaseEntity {
  section_id: number;
  code: string;
  name_pl: string;
  name_ua: string;
  description_pl: string | null;
  description_ua: string | null;
  prerequisites_pl: string | null;
  prerequisites_ua: string | null;
  outcomes_pl: string | null;
  outcomes_ua: string | null;
  terminology_pl: string | null;
  terminology_ua: string | null;
  methodology_pl: string | null;
  methodology_ua: string | null;
  display_order: number;
}

export interface Curriculum extends BaseEntity {
  topic_id: number;
  school_class: number;
  learning_stage: string;
  curriculum_code: string | null;
  curriculum_pl: string | null;
  notes_pl: string | null;
  notes_ua: string | null;
  display_order: number;
}

export interface Lesson extends BaseEntity {
  code: string;
  subject_id: number;
  school_class: number;
  lesson_type: string;
  duration: number | null;
  title_pl: string;
  title_ua: string;
  goal_pl: string | null;
  goal_ua: string | null;
  learning_results_pl: string | null;
  learning_results_ua: string | null;
  terminology_pl: string | null;
  terminology_ua: string | null;
  equipment_pl: string | null;
  equipment_ua: string | null;
  scenario_pl: string | null;
  scenario_ua: string | null;
  homework_pl: string | null;
  homework_ua: string | null;
  assessment_pl: string | null;
  assessment_ua: string | null;
  teacher_notes_pl: string | null;
  teacher_notes_ua: string | null;
  author: string | null;
  version: string | null;
  status: string;
}

export interface LessonTopic {
  id: number;
  lesson_id: number;
  topic_id: number;
  is_primary: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonResource extends BaseEntity {
  lesson_id: number;
  resource_type: string;
  storage_type: string;
  title_pl: string;
  title_ua: string;
  url: string;
  description_pl: string | null;
  description_ua: string | null;
  display_order: number;
}

export interface TopicRelation extends BaseEntity {
  topic_id: number;
  related_topic_id: number;
  relation_type: string;
  description_pl: string | null;
  description_ua: string | null;
  display_order: number;
}

export interface Settings {
  id: number;
  interface_language: string;
  database_path: string | null;
  backup_path: string | null;
  auto_backup: number;
  auto_backup_before_import: number;
  backup_interval: number | null;
  last_backup: string | null;
  materials_path: string | null;
  theme: string;
  app_version: string;
  created_at: string;
  updated_at: string;
}

export interface TopicFilters {
  subjectId?: number;
  sectionId?: number;
  schoolClass?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TopicListItem extends Topic {
  section_name_pl: string;
  section_name_ua: string;
  school_class: number | null;
  curriculum_display_order?: number | null;
  lessons_count: number;
}

export interface TopicAdjacentItem {
  id: number;
  code: string;
  name_pl: string;
  name_ua: string;
}

export interface TopicAdjacentResult {
  prev: TopicAdjacentItem | null;
  next: TopicAdjacentItem | null;
}

export interface TopicRelationView extends TopicRelation {
  related_code: string;
  related_name_pl: string;
  related_name_ua: string;
}

export interface LessonTopicView extends LessonTopic {
  lesson_code: string;
  lesson_title_pl: string;
  lesson_title_ua: string;
  lesson_type: string;
}

export interface LessonTopicWithTopicView extends LessonTopic {
  topic_code: string;
  topic_name_pl: string;
  topic_name_ua: string;
  section_name_pl: string;
  section_name_ua: string;
  section_id: number;
  topic_prerequisites_pl: string | null;
  topic_prerequisites_ua: string | null;
  topic_outcomes_pl: string | null;
  topic_outcomes_ua: string | null;
}

export interface LessonDetail extends Lesson {
  subject_code: string;
  subject_name_pl: string;
  subject_name_ua: string;
  topics: LessonTopicWithTopicView[];
  resources: LessonResource[];
}

export interface TopicDetail extends Topic {
  section_name_pl: string;
  section_name_ua: string;
  subject_code: string;
  subject_name_pl: string;
  subject_name_ua: string;
  curriculum: Curriculum[];
  relations: TopicRelationView[];
  lessons: LessonTopicView[];
}

export type RelationType =
  | 'PREREQUISITE'
  | 'NEXT'
  | 'RELATED'
  | 'REVISION'
  | 'EXTENSION';
