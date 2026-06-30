/** UI interface languages (Settings.interface_language) */
export type InterfaceLanguage = 'UA' | 'PL';

/** Default UI language for EduMost Studio */
export const DEFAULT_INTERFACE_LANGUAGE: InterfaceLanguage = 'UA';

/** Primary content language — always displayed first */
export const CONTENT_PRIMARY_LANG = 'PL' as const;

/** Secondary content language — adaptation, displayed after PL */
export const CONTENT_SECONDARY_LANG = 'UA' as const;

/** Fixed column order for Knowledge Explorer — topics */
export const KNOWLEDGE_EXPLORER_TOPIC_COLUMNS = [
  'code',
  'name_pl',
  'name_ua',
  'school_class',
  'section',
  'lessons_count',
] as const;

/** Fixed column order for Knowledge Explorer — lessons */
export const KNOWLEDGE_EXPLORER_LESSON_COLUMNS = [
  'code',
  'title_pl',
  'title_ua',
  'school_class',
  'lesson_type',
] as const;

/** Bilingual field pairs in DB — PL always first */
export const BILINGUAL_FIELD_PAIRS = [
  ['name_pl', 'name_ua'],
  ['description_pl', 'description_ua'],
  ['prerequisites_pl', 'prerequisites_ua'],
  ['outcomes_pl', 'outcomes_ua'],
  ['goal_pl', 'goal_ua'],
  ['learning_results_pl', 'learning_results_ua'],
  ['scenario_pl', 'scenario_ua'],
  ['homework_pl', 'homework_ua'],
  ['assessment_pl', 'assessment_ua'],
  ['teacher_notes_pl', 'teacher_notes_ua'],
] as const;
