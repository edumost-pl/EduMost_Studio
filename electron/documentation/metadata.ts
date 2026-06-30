/** Human-readable metadata; auto-discovery fills gaps for unknown tables/migrations. */
export const TABLE_PURPOSES: Record<string, string> = {
  schema_migrations: 'Журнал застосованих SQL-міграцій',
  Subjects: 'Довідник шкільних предметів (код, назви UA/PL, іконка)',
  Sections: 'Розділи навчальної програми в межах предмета',
  Topics: 'Теми з навчальним змістом (опис, результати, термінологія)',
  Curriculum: "Прив'язка тем до класів та етапів навчання",
  Lessons: 'Уроки з двомовним змістом та статусом робочого процесу',
  LessonTopics: "Зв'язок many-to-many між уроками та темами",
  LessonResources: 'Матеріали та посилання до уроків',
  TopicRelations: 'Граф пов\'язаних тем (передумови, наступні, related)',
  Settings: 'Singleton-налаштування програми',
  LessonTypes: 'Довідник типів уроків',
  LessonStatuses: 'Довідник статусів уроків',
  SchoolClasses: 'Довідник шкільних класів',
};

export const MIGRATION_FEATURES: Record<string, string[]> = {
  '001_initial': [
    'Початкова схема SQLite: предмети, розділи, теми, уроки, матеріали',
    'Knowledge Explorer, Topic Editor, Lesson Studio',
    'Двомовний контент (UA/PL)',
  ],
  '002_settings_extensions': [
    'Сторінка налаштувань: експорт/імпорт БД, резервні копії',
    'auto_backup_before_import, materials_path',
  ],
  '003_reference_dictionaries': [
    'Модуль «Довідники»: предмети, розділи, типи уроків, статуси, класи',
    'Експорт довідників у Excel',
    'Колонка Subjects.icon',
  ],
};

export const PROJECT_FOLDERS: Array<{ path: string; description: string }> = [
  { path: 'src/', description: 'React-інтерфейс (renderer process)' },
  { path: 'src/pages/', description: 'Сторінки: Dashboard, Explorer, редактори, налаштування' },
  { path: 'src/components/', description: 'Спільні UI-компоненти та layout' },
  { path: 'src/services/', description: 'Обгортки IPC для renderer' },
  { path: 'src/hooks/', description: 'React-хуки (дані навігації, Explorer)' },
  { path: 'src/context/', description: 'NavigationContext, ShellContext, i18n' },
  { path: 'electron/', description: 'Main process Electron' },
  { path: 'electron/database/', description: 'SQLite, міграції, seed, backup manager' },
  { path: 'electron/repositories/', description: 'Repository Pattern — доступ до таблиць' },
  { path: 'electron/ipc/', description: 'IPC-канали та handlers' },
  { path: 'electron/documentation/', description: 'Автогенерація знімка документації' },
];

export const CODE_GENERATION_RULES = [
  {
    entity: 'Section',
    format: 'ABC або S01',
    method: 'SectionRepository.suggestNewSectionCode',
    description:
      '3 літери з назви розділу; якщо зайнято — варіанти з цифрою; інакше S01…S99',
  },
  {
    entity: 'Topic',
    format: '{SECTION_CODE}-{NNN}',
    method: 'TopicRepository.suggestNextCodeForPrefix',
    description: 'Префікс — код розділу; суфікс — три цифри (001, 002, …)',
  },
  {
    entity: 'Lesson',
    format: '{SUBJECT_CODE}{CLASS}-{NNN}',
    method: 'LessonRepository.suggestNextCode',
    description: 'Наприклад MAT4-021: код предмета + номер класу + порядковий номер',
  },
];

export const SETTING_DESCRIPTIONS: Record<string, string> = {
  interface_language: 'Мова інтерфейсу (UA / PL)',
  database_path: 'Шлях до файлу SQLite',
  backup_path: 'Каталог резервних копій',
  auto_backup: 'Автоматичний бекап при запуску',
  auto_backup_before_import: 'Створювати бекап перед імпортом БД',
  backup_interval: 'Інтервал автобекапу (дні)',
  last_backup: 'Дата останнього бекапу',
  materials_path: 'Папка локальних матеріалів',
  theme: 'Тема оформлення (зараз лише Light)',
  app_version: 'Версія програми (синхронізується з package.json)',
};

export const HOTKEYS: Array<{ keys: string; action: string; implemented: boolean }> = [
  { keys: 'Ctrl+K', action: 'Глобальний пошук (у розробці)', implemented: false },
  { keys: 'Escape', action: 'Закрити модальне вікно попереднього перегляду матеріалу', implemented: true },
  { keys: 'Enter', action: 'Додати термін у редакторі термінології теми', implemented: true },
];
