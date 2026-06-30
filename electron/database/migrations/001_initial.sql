PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name_pl TEXT NOT NULL,
  name_ua TEXT NOT NULL,
  description_pl TEXT,
  description_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subjects_code ON Subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_display_order ON Subjects(display_order);
CREATE INDEX IF NOT EXISTS idx_subjects_is_active ON Subjects(is_active);

CREATE TABLE IF NOT EXISTS Sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name_pl TEXT NOT NULL,
  name_ua TEXT NOT NULL,
  description_pl TEXT,
  description_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE RESTRICT,
  UNIQUE(subject_id, code)
);

CREATE INDEX IF NOT EXISTS idx_sections_subject_id ON Sections(subject_id);
CREATE INDEX IF NOT EXISTS idx_sections_code ON Sections(code);
CREATE INDEX IF NOT EXISTS idx_sections_display_order ON Sections(display_order);
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON Sections(is_active);

CREATE TABLE IF NOT EXISTS Topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name_pl TEXT NOT NULL,
  name_ua TEXT NOT NULL,
  description_pl TEXT,
  description_ua TEXT,
  prerequisites_pl TEXT,
  prerequisites_ua TEXT,
  outcomes_pl TEXT,
  outcomes_ua TEXT,
  terminology_pl TEXT,
  terminology_ua TEXT,
  methodology_pl TEXT,
  methodology_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES Sections(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_topics_section_id ON Topics(section_id);
CREATE INDEX IF NOT EXISTS idx_topics_code ON Topics(code);
CREATE INDEX IF NOT EXISTS idx_topics_name_pl ON Topics(name_pl);
CREATE INDEX IF NOT EXISTS idx_topics_name_ua ON Topics(name_ua);
CREATE INDEX IF NOT EXISTS idx_topics_display_order ON Topics(display_order);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON Topics(is_active);

CREATE TABLE IF NOT EXISTS Curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  school_class INTEGER NOT NULL CHECK (school_class BETWEEN 1 AND 8),
  learning_stage TEXT NOT NULL,
  curriculum_code TEXT,
  curriculum_pl TEXT,
  notes_pl TEXT,
  notes_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES Topics(id) ON DELETE RESTRICT,
  UNIQUE(topic_id, school_class)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_topic_id ON Curriculum(topic_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_school_class ON Curriculum(school_class);
CREATE INDEX IF NOT EXISTS idx_curriculum_learning_stage ON Curriculum(learning_stage);
CREATE INDEX IF NOT EXISTS idx_curriculum_is_active ON Curriculum(is_active);

CREATE TABLE IF NOT EXISTS Lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  subject_id INTEGER NOT NULL,
  school_class INTEGER NOT NULL CHECK (school_class BETWEEN 1 AND 8),
  lesson_type TEXT NOT NULL,
  duration INTEGER,
  title_pl TEXT NOT NULL,
  title_ua TEXT NOT NULL,
  goal_pl TEXT,
  goal_ua TEXT,
  learning_results_pl TEXT,
  learning_results_ua TEXT,
  terminology_pl TEXT,
  terminology_ua TEXT,
  equipment_pl TEXT,
  equipment_ua TEXT,
  scenario_pl TEXT,
  scenario_ua TEXT,
  homework_pl TEXT,
  homework_ua TEXT,
  assessment_pl TEXT,
  assessment_ua TEXT,
  teacher_notes_pl TEXT,
  teacher_notes_ua TEXT,
  author TEXT,
  version TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lessons_code ON Lessons(code);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_id ON Lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_school_class ON Lessons(school_class);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson_type ON Lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON Lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_is_active ON Lessons(is_active);

CREATE TABLE IF NOT EXISTS LessonTopics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  topic_id INTEGER NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES Topics(id) ON DELETE RESTRICT,
  UNIQUE(lesson_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_topics_lesson_id ON LessonTopics(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_topic_id ON LessonTopics(topic_id);
CREATE INDEX IF NOT EXISTS idx_lesson_topics_is_primary ON LessonTopics(is_primary);

CREATE TABLE IF NOT EXISTS LessonResources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  resource_type TEXT NOT NULL,
  storage_type TEXT NOT NULL,
  title_pl TEXT NOT NULL,
  title_ua TEXT NOT NULL,
  url TEXT NOT NULL,
  description_pl TEXT,
  description_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lesson_resources_lesson_id ON LessonResources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_resource_type ON LessonResources(resource_type);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_storage_type ON LessonResources(storage_type);
CREATE INDEX IF NOT EXISTS idx_lesson_resources_is_active ON LessonResources(is_active);

CREATE TABLE IF NOT EXISTS TopicRelations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  topic_id INTEGER NOT NULL,
  related_topic_id INTEGER NOT NULL,
  relation_type TEXT NOT NULL,
  description_pl TEXT,
  description_ua TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES Topics(id) ON DELETE CASCADE,
  FOREIGN KEY (related_topic_id) REFERENCES Topics(id) ON DELETE RESTRICT,
  UNIQUE(topic_id, related_topic_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_topic_relations_topic_id ON TopicRelations(topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_relations_related_topic_id ON TopicRelations(related_topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_relations_relation_type ON TopicRelations(relation_type);
CREATE INDEX IF NOT EXISTS idx_topic_relations_is_active ON TopicRelations(is_active);

CREATE TABLE IF NOT EXISTS Settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interface_language TEXT NOT NULL DEFAULT 'UA',
  database_path TEXT,
  backup_path TEXT,
  auto_backup INTEGER NOT NULL DEFAULT 1,
  backup_interval INTEGER,
  last_backup DATETIME,
  theme TEXT NOT NULL DEFAULT 'Light',
  app_version TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
