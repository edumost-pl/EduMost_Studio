ALTER TABLE Subjects ADD COLUMN icon TEXT;

CREATE TABLE IF NOT EXISTS LessonTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LessonStatuses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS SchoolClasses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_number INTEGER NOT NULL UNIQUE,
  name_ua TEXT NOT NULL,
  name_pl TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_types_is_active ON LessonTypes(is_active);
CREATE INDEX IF NOT EXISTS idx_lesson_statuses_is_active ON LessonStatuses(is_active);
CREATE INDEX IF NOT EXISTS idx_school_classes_is_active ON SchoolClasses(is_active);

UPDATE Subjects SET icon = '📐' WHERE code = 'MAT' AND icon IS NULL;
UPDATE Subjects SET icon = '🇵🇱' WHERE code = 'POL' AND icon IS NULL;
UPDATE Subjects SET icon = '🇬🇧' WHERE code = 'ENG' AND icon IS NULL;
UPDATE Subjects SET icon = '🌿' WHERE code = 'PRZ' AND icon IS NULL;
UPDATE Subjects SET icon = '🏛️' WHERE code = 'HIST' AND icon IS NULL;
UPDATE Subjects SET icon = '💻' WHERE code = 'INF' AND icon IS NULL;
UPDATE Subjects SET icon = '⚛️' WHERE code = 'FIZ' AND icon IS NULL;
UPDATE Subjects SET icon = '🧪' WHERE code = 'CHEM' AND icon IS NULL;

INSERT OR IGNORE INTO LessonTypes (name, display_order, is_active) VALUES
('New Knowledge', 1, 1),
('Practice', 2, 1),
('Review', 3, 1),
('Assessment', 4, 1);

INSERT OR IGNORE INTO LessonStatuses (name, display_order, is_active) VALUES
('Чернетка', 1, 1),
('Готовий', 2, 1),
('Опублікований', 3, 1),
('Архів', 4, 1);

INSERT OR IGNORE INTO SchoolClasses (class_number, name_ua, name_pl, display_order, is_active) VALUES
(1, '1 клас', 'klasa 1', 1, 1),
(2, '2 клас', 'klasa 2', 2, 1),
(3, '3 клас', 'klasa 3', 3, 1),
(4, '4 клас', 'klasa 4', 4, 1),
(5, '5 клас', 'klasa 5', 5, 1),
(6, '6 клас', 'klasa 6', 6, 1),
(7, '7 клас', 'klasa 7', 7, 1),
(8, '8 клас', 'klasa 8', 8, 1);
