# EduMost Studio — Мовна архітектура

## Принцип

EduMost Studio розділяє **мову інтерфейсу програми** та **мову освітнього контенту**.

Це два незалежні шари, які не змішуються.

---

## 1. Мова інтерфейсу (UI Language)

**За замовчуванням:** українська (`UA`)

**Майбутнє:** перемикання на польську (`PL`) через Settings → `Settings.interface_language`

### Що перекладається

- меню та навігація;
- кнопки та підписи;
- фільтри та системні повідомлення;
- заголовки екранів;
- назви предметів/класів/розділів у sidebar (відображається `name_ua` при UI=UA).

### Приклади (UA)

| Ключ | Текст |
|---|---|
| nav.subjects | Предмети |
| nav.classes | Класи |
| nav.settings | Налаштування |
| action.save | Зберегти |
| action.delete | Видалити |
| action.editTopic | Редагувати тему |

### Реалізація в коді

```
src/i18n/
├── types.ts
├── index.ts
└── locales/
    ├── ua.ts
    └── pl.ts
```

Компоненти UI використовують `useI18n().t('key')`.  
Контент з бази даних **не проходить** через i18n.

---

## 2. Мова освітнього контенту (Content Language)

**Основна мова контенту:** польська (`PL`)

**Адаптація:** українська (`UA`)

Усі двомовні поля в SQLite зберіються як `*_pl` та `*_ua`.

### Правило відображення

Завжди **спочатку PL, потім UA**:

```
Skracanie ułamków        ← name_pl (основний, виділений)
Скорочення дробів        ← name_ua (адаптація, вторинний)
```

### Компонент

```
src/components/content/BilingualText.tsx
```

Параметри: `textPl`, `textUa`, `variant: 'stack' | 'inline' | 'table-cell'`

### Поля з правилом PL → UA

- назви (Topics, Lessons, Sections);
- описи;
- prerequisites / outcomes;
- цілі уроку;
- сценарій;
- очікувані результати;
- домашнє завдання;
- примітки для вчителя.

---

## 3. Таблиці (Knowledge Explorer)

Порядок колонок **фіксований**:

| # | Колонка | Джерело |
|---|---|---|
| 1 | Kod | `code` |
| 2 | Polska nazwa | `name_pl` / `title_pl` |
| 3 | Українська nazwa | `name_ua` / `title_ua` |
| 4+ | Клас, Розділ, Уроки… | метадані |

Константи: `src/constants/language.ts` → `KNOWLEDGE_EXPLORER_TOPIC_COLUMNS`

---

## 4. Редактори (Topic Editor, Lesson Studio)

Двомовні блоки завжди в порядку:

1. **PL** — вкладка/поле першим
2. **UA** — вкладка/поле другим

Компонент для редакторів (майбутні етапи):

```
src/components/content/BilingualFieldGroup.tsx
```

---

## 5. База даних

| Шар | Поля | Приклад |
|---|---|---|
| UI | `Settings.interface_language` | `UA` |
| Контент | `*_pl`, `*_ua` | `name_pl`, `name_ua` |

Контент **ніколи** не дублюється в UI-локалях.  
UI-рядки **ніколи** не зберігаються в таблицях Topics/Lessons.

---

## 6. Правила для розробки

1. UI-текст → `useI18n().t()`
2. Контент з БД → `<BilingualText textPl={...} textUa={...} />`
3. Sidebar labels предметів → `name_ua` (при UI=UA) або `name_pl` (при UI=PL)
4. Заголовки колонок контенту → «Polska nazwa» / «Українська nazwa» (не перекладаються)
5. Нові екрани обов'язково дотримуються порядку PL → UA



# Sborka na Aple
        npm run electron:build