-- EduMost Studio seed data (mockup-aligned)
-- Applied only when database is empty after migration.

BEGIN TRANSACTION;

-- Subjects
INSERT INTO Subjects (id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active) VALUES
(1, 'MAT', 'Matematyka', 'Математика', 'Nauka o liczbach, działaniach i figurach geometrycznych.', 'Наука про числа, дії та геометричні фігури.', 1, 1),
(2, 'POL', 'Język polski', 'Польська мова', 'Nauka języka polskiego.', 'Вивчення польської мови.', 2, 1),
(3, 'ENG', 'Język angielski', 'Англійська мова', 'Nauka języka angielskiego.', 'Вивчення англійської мови.', 3, 1),
(4, 'PRZ', 'Przyroda', 'Природознавство', 'Nauki przyrodnicze dla młodszych klas.', 'Природничі науки для молодших класів.', 4, 1),
(5, 'HIST', 'Historia', 'Історія', 'Historia Polski i świata.', 'Історія Польщі та світу.', 5, 1),
(6, 'INF', 'Informatyka', 'Інформатика', 'Podstawy informatyki i technologii.', 'Основи інформатики та технологій.', 6, 1),
(7, 'FIZ', 'Fizyka', 'Фізика', 'Podstawy fizyki.', 'Основи фізики.', 7, 1),
(8, 'CHEM', 'Chemia', 'Хімія', 'Podstawy chemii.', 'Основи хімії.', 8, 1);

-- Sections (Matematyka)
INSERT INTO Sections (id, subject_id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active) VALUES
(1, 1, 'NUM', 'Liczby i działania', 'Числа та дії', 'Operacje na liczbach naturalnych.', 'Дії з натуральними числами.', 1, 1),
(2, 1, 'QTY', 'Wielkości', 'Кількості', 'Pomiar i porównywanie wielkości.', 'Вимірювання та порівняння величин.', 2, 1),
(3, 1, 'GEO', 'Geometria', 'Геометрія', 'Figury geometryczne i ich właściwości.', 'Геометричні фігури та їх властивості.', 3, 1),
(4, 1, 'FRA', 'Ułamki zwykłe', 'Уламки звичайні', 'Dział obejmujący pojęcie ułamka, porównywanie, skracanie oraz działania na ułamkach zwykłych.', 'Розділ, що охоплює поняття дробу, порівняння, скорочення та дії зі звичайними дробами.', 4, 1),
(5, 1, 'DATA', 'Dane i statystyka', 'Дані та статистика', 'Zbieranie i analiza danych.', 'Збір та аналіз даних.', 5, 1);

-- Topics (32 topics in Ułamki zwykłe — FRA-001 … FRA-032)
INSERT INTO Topics (id, section_id, code, name_pl, name_ua, description_pl, description_ua, prerequisites_pl, prerequisites_ua, outcomes_pl, outcomes_ua, terminology_pl, terminology_ua, methodology_pl, methodology_ua, display_order, is_active) VALUES
(1, 4, 'FRA-001', 'Pojęcie ułamka', 'Поняття дробу', 'Uczeń poznaje pojęcie ułamka jako części całości.', 'Учень знайомиться з поняттям дробу як частини цілого.', NULL, NULL, NULL, NULL, 'ułamek; część; całość', 'дріб; частина; ціле', NULL, NULL, 1, 1),
(2, 4, 'FRA-002', 'Licznik i mianownik', 'Чисельник і знаменник', 'Uczeń rozróżnia licznik i mianownik ułamka.', 'Учень розрізняє чисельник і знаменник дробу.', 'Pojęcie ułamka', 'Поняття дробу', NULL, NULL, 'licznik; mianownik', 'чисельник; знаменник', NULL, NULL, 2, 1),
(3, 4, 'FRA-003', 'Ułamek właściwy i niewłaściwy', 'Правильний і неправильний дріб', 'Uczeń rozpoznaje ułamki właściwe i niewłaściwe.', 'Учень розпізнає правильні та неправильні дроби.', 'Licznik i mianownik', 'Чисельник і знаменник', NULL, NULL, 'ułamek właściwy; ułamek niewłaściwy', 'правильний дріб; неправильний дріб', NULL, NULL, 3, 1),
(4, 4, 'FRA-004', 'Ułamek jako część całości', 'Дріб як частина цілого', 'Uczeń przedstawia ułamek na modelu graficznym.', 'Учень зображує дріб на графічній моделі.', 'Pojęcie ułamka', 'Поняття дробу', NULL, NULL, 'model; wykres', 'модель; графік', NULL, NULL, 4, 1),
(5, 4, 'FRA-005', 'Odczytywanie ułamków', 'Читання дробів', 'Uczeń odczytuje ułamki z różnych reprezentacji.', 'Учень читає дроби з різних представлень.', 'Licznik i mianownik', 'Чисельник і знаменник', NULL, NULL, 'reprezentacja', 'представлення', NULL, NULL, 5, 1),
(6, 4, 'FRA-006', 'Zapisywanie ułamków', 'Запис дробів', 'Uczeń zapisuje ułamki w postaci liczbowej.', 'Учень записує дроби у числовому вигляді.', 'Odczytywanie ułamków', 'Читання дробів', NULL, NULL, 'zapis', 'запис', NULL, NULL, 6, 1),
(7, 4, 'FRA-007', 'Porównywanie ułamków o tym samym mianowniku', 'Порівняння дробів з однаковим знаменником', 'Uczeń porównuje ułamki o jednakowym mianowniku.', 'Учень порівнює дроби з однаковим знаменником.', 'Licznik i mianownik', 'Чисельник і знаменник', NULL, NULL, 'porównanie', 'порівняння', NULL, NULL, 7, 1),
(8, 4, 'FRA-008', 'Porównywanie ułamków o tym samym liczniku', 'Порівняння дробів з однаковим чисельником', 'Uczeń porównuje ułamki o jednakowym liczniku.', 'Учень порівнює дроби з однаковим чисельником.', 'Porównywanie ułamków o tym samym mianowniku', 'Порівняння дробів з однаковим знаменником', NULL, NULL, 'porównanie', 'порівняння', NULL, NULL, 8, 1),
(9, 4, 'FRA-009', 'Ułamki równoważne', 'Рівнозначні дроби', 'Uczeń rozpoznaje ułamki równoważne.', 'Учень розпізнає рівнозначні дроби.', 'Porównywanie ułamków', 'Порівняння дробів', NULL, NULL, 'ułamek równoważny', 'рівнозначний дріб', NULL, NULL, 9, 1),
(10, 4, 'FRA-010', 'Rozszerzanie ułamków', 'Розширення дробів', 'Uczeń rozszerza ułamki przez mnożenie licznika i mianownika.', 'Учень розширює дроби множенням чисельника і знаменника.', 'Ułamki równoważne', 'Рівнозначні дроби', NULL, NULL, 'rozszerzanie', 'розширення', NULL, NULL, 10, 1),
(11, 4, 'FRA-011', 'Największy wspólny dzielnik', 'Найбільший спільний дільник', 'Uczeń wyznacza NWD dwóch liczb.', 'Учень знаходить НСД двох чисел.', 'Dzielniki liczb', 'Дільники чисел', NULL, NULL, 'NWD; dzielnik', 'НСД; дільник', NULL, NULL, 11, 1),
(12, 4, 'FRA-012', 'Najmniejsza wspólna wielokrotność', 'Найменше спільне кратне', 'Uczeń wyznacza NWW dwóch liczb.', 'Учень знаходить НСК двох чисел.', 'Wielokrotności liczb', 'Кратні числа', NULL, NULL, 'NWW; wielokrotność', 'НСК; кратне', NULL, NULL, 12, 1),
(13, 4, 'FRA-013', 'Sprowadzanie ułamków do wspólnego mianownika', 'Зведення дробів до спільного знаменника', 'Uczeń sprowadza ułamki do wspólnego mianownika.', 'Учень зводить дроби до спільного знаменника.', 'NWW', 'НСК', NULL, NULL, 'wspólny mianownik', 'спільний знаменник', NULL, NULL, 13, 1),
(14, 4, 'FRA-014', 'Ułamek jako liczba', 'Дріб як число', 'Uczeń traktuje ułamek jako liczbę na osi liczbowej.', 'Учень розглядає дріб як число на числовій осі.', 'Pojęcie ułamka', 'Поняття дробу', NULL, NULL, 'oś liczbowa', 'числова вісь', NULL, NULL, 14, 1),
(15, 4, 'FRA-015', 'Ułamek nieskracalny', 'Нескоротний дріб', 'Uczeń rozpoznaje ułamek w postaci nieskracalnej.', 'Учень розпізнає дріб у нескоротному вигляді.', 'NWD', 'НСД', NULL, NULL, 'ułamek nieskracalny', 'нескоротний дріб', NULL, NULL, 15, 1),
(16, 4, 'FRA-016', 'Dzielniki liczby naturalnej', 'Дільники натурального числа', 'Uczeń wyznacza dzielniki liczb naturalnych.', 'Учень знаходить дільники натуральних чисел.', 'Mnożenie i dzielenie', 'Множення і ділення', NULL, NULL, 'dzielnik', 'дільник', NULL, NULL, 16, 1),
(17, 4, 'FRA-017', 'Wielokrotności liczby naturalnej', 'Кратні натурального числа', 'Uczeń wyznacza wielokrotności liczb naturalnych.', 'Учень знаходить кратні натуральних чисел.', 'Mnożenie', 'Множення', NULL, NULL, 'wielokrotność', 'кратне', NULL, NULL, 17, 1),
(18, 4, 'FRA-018', 'Przygotowanie do skracania ułamków', 'Підготовка до скорочення дробів', 'Uczeń utrwala NWD przed skracaniem ułamków.', 'Учень закріплює НСД перед скороченням дробів.', 'NWD; ułamek', 'НСД; дріб', NULL, NULL, 'NWD; skracanie', 'НСД; скорочення', NULL, NULL, 18, 1),
(19, 4, 'FRA-019', 'Skracanie ułamków', 'Скорочення дробів',
 'Uczniowie uczą się skracać ułamki do najprostszej postaci.',
 'Учні навчаються скорочувати дроби до найпростішого вигляду, використовуючи найбільший спільний дільник чисельника та знаменника.',
 '• Rozumienie pojęcia ułamka
• Znajomość licznika i mianownika
• Umiejętność wyznaczania wspólnych dzielników',
 '• Розуміння поняття дробу
• Знання чисельника та знаменника
• Вміння знаходити спільні дільники',
 '• Porównywanie ułamków
• Dodawanie i odejmowanie ułamków o tym samym mianowniku',
 '• Порівняння дробів
• Додавання та віднімання дробів з однаковим знаменником',
 'ułamek; licznik; mianownik; NWD',
 'дріб; чисельник; знаменник; НСД',
 'Rozpoczynać od modeli graficznych, następnie przechodzić do skracania liczbowego.',
 'Починати з наочних моделей, після чого переходити до числового скорочення дробів.',
 19, 1),
(20, 4, 'FRA-020', 'Porównanie ułamków zwykłych', 'Порівняння звичайних дробів', 'Uczeń porównuje ułamki o różnych mianownikach.', 'Учень порівнює дроби з різними знаменниками.', 'Skracanie ułamków', 'Скорочення дробів', NULL, NULL, 'porównanie; mianownik', 'порівняння; знаменник', NULL, NULL, 20, 1),
(21, 4, 'FRA-021', 'Składanie ułamków o tym samym mianowniku', 'Додавання дробів з однаковим знаменником', 'Uczeń dodaje ułamki o jednakowym mianowniku.', 'Учень додає дроби з однаковим знаменником.', 'Porównanie ułamków', 'Порівняння дробів', NULL, NULL, 'dodawanie; mianownik', 'додавання; знаменник', NULL, NULL, 21, 1),
(22, 4, 'FRA-022', 'Odejmowanie ułamków o tym samym mianowniku', 'Віднімання дробів з однаковим знаменником', 'Uczeń odejmuje ułamki o jednakowym mianowniku.', 'Учень віднімає дроби з однаковим знаменником.', 'Składanie ułamków o tym samym mianowniku', 'Додавання дробів з однаковим знаменником', NULL, NULL, 'odejmowanie; mianownik', 'віднімання; знаменник', NULL, NULL, 22, 1),
(23, 4, 'FRA-023', 'Mnożenie ułamków przez liczbę naturalną', 'Множення дробів на натуральне число', 'Uczeń mnoży ułamek przez liczbę naturalną.', 'Учень множить дріб на натуральне число.', 'Składanie ułamków', 'Додавання дробів', NULL, NULL, 'mnożenie', 'множення', NULL, NULL, 23, 1),
(24, 4, 'FRA-024', 'Dzielenie ułamków przez liczbę naturalną', 'Ділення дробів на натуральне число', 'Uczeń dzieli ułamek przez liczbę naturalną.', 'Учень ділить дріб на натуральне число.', 'Mnożenie ułamków przez liczbę naturalną', 'Множення дробів на натуральне число', NULL, NULL, 'dzielenie', 'ділення', NULL, NULL, 24, 1),
(25, 4, 'FRA-025', 'Ułamek jako część liczby', 'Дріб як частина числа', 'Uczeń oblicza część liczby wyrażoną ułamkiem.', 'Учень обчислює частину числа, виражену дробом.', 'Mnożenie ułamków', 'Множення дробів', NULL, NULL, 'część liczby', 'частина числа', NULL, NULL, 25, 1),
(26, 4, 'FRA-026', 'Dodawanie ułamków o różnych mianownikach', 'Додавання дробів з різними знаменниками', 'Uczeń dodaje ułamki o różnych mianownikach.', 'Учень додає дроби з різними знаменниками.', 'Sprowadzanie do wspólnego mianownika', 'Зведення до спільного знаменника', NULL, NULL, 'wspólny mianownik', 'спільний знаменник', NULL, NULL, 26, 1),
(27, 4, 'FRA-027', 'Odejmowanie ułamków o różnych mianownikach', 'Віднімання дробів з різними знаменниками', 'Uczeń odejmuje ułamki o różnych mianownikach.', 'Учень віднімає дроби з різними знаменниками.', 'Dodawanie ułamków o różnych mianownikach', 'Додавання дробів з різними знаменниками', NULL, NULL, 'wspólny mianownik', 'спільний знаменник', NULL, NULL, 27, 1),
(28, 4, 'FRA-028', 'Ułamki na osi liczbowej', 'Дроби на числовій осі', 'Uczeń zaznacza ułamki na osi liczbowej.', 'Учень позначає дроби на числовій осі.', 'Ułamek jako liczba', 'Дріб як число', NULL, NULL, 'oś liczbowa', 'числова вісь', NULL, NULL, 28, 1),
(29, 4, 'FRA-029', 'Ułamek dziesiętny a ułamek zwykły', 'Десятковий і звичайний дріб', 'Uczeń przekształca ułamek zwykły w dziesiętny.', 'Учень перетворює звичайний дріб у десятковий.', 'Ułamek jako liczba', 'Дріб як число', NULL, NULL, 'ułamek dziesiętny', 'десятковий дріб', NULL, NULL, 29, 1),
(30, 4, 'FRA-030', 'Zadania tekstowe z ułamkami', 'Текстові задачі з дробами', 'Uczeń rozwiązuje zadania tekstowe z ułamkami.', 'Учень розв''язує текстові задачі з дробами.', 'Działania na ułamkach', 'Дії з дробами', NULL, NULL, 'zadanie tekstowe', 'текстова задача', NULL, NULL, 30, 1),
(31, 4, 'FRA-031', 'Powtórzenie ułamków', 'Повторення дробів', 'Uczeń utrwala wiedzę o ułamkach zwykłych.', 'Учень закріплює знання про звичайні дроби.', 'Wszystkie tematy rozdziału', 'Усі теми розділу', NULL, NULL, 'powtórzenie', 'повторення', NULL, NULL, 31, 1),
(32, 4, 'FRA-032', 'Sprawdzian wiedzy — ułamki', 'Перевірка знань — дроби', 'Uczeń rozwiązuje zadania sprawdzające wiedzę o ułamkach.', 'Учень виконує завдання для перевірки знань про дроби.', 'Powtórzenie ułamków', 'Повторення дробів', NULL, NULL, 'sprawdzian', 'перевірка', NULL, NULL, 32, 1);

-- Curriculum (all FRA topics in class 4)
INSERT INTO Curriculum (topic_id, school_class, learning_stage, curriculum_code, curriculum_pl, notes_pl, notes_ua, display_order, is_active)
SELECT id, 4, CASE
  WHEN id IN (1, 2, 3, 4) THEN 'Introduced'
  WHEN id BETWEEN 5 AND 14 THEN 'Developed'
  WHEN id BETWEEN 15 AND 24 THEN 'Practiced'
  WHEN id BETWEEN 25 AND 31 THEN 'Mastered'
  ELSE 'Revision'
END,
CASE WHEN id = 19 THEN 'II.2.3' ELSE NULL END,
CASE WHEN id = 19 THEN 'Uczeń skraca ułamki zwykłe do najprostszej postaci.' ELSE NULL END,
CASE WHEN id = 19 THEN 'Temat realizowany po pojęciu NWD.' ELSE NULL END,
CASE WHEN id = 19 THEN 'Тема вивчається після поняття НСД.' ELSE NULL END,
display_order,
1
FROM Topics WHERE section_id = 4;

-- Lessons
INSERT INTO Lessons (id, code, subject_id, school_class, lesson_type, duration, title_pl, title_ua, goal_pl, goal_ua, learning_results_pl, learning_results_ua, terminology_pl, terminology_ua, scenario_pl, scenario_ua, homework_pl, homework_ua, assessment_pl, assessment_ua, teacher_notes_pl, teacher_notes_ua, author, version, status, is_active) VALUES
(1, 'MAT4-021', 1, 4, 'New Knowledge', 45,
 'Co to jest skracanie ułamków?',
 'Що таке скорочення дробів?',
 'Uczeń poznaje pojęcie skracania ułamków i potrafi skrócić ułamek do postaci nieskracalnej.',
 'Учень знайомиться з поняттям скорочення дробів і вміє скоротити дріб до нескоротного вигляду.',
 'Uczeń potrafi wyznaczyć NWD i zastosować go do skracania ułamków.',
 'Учень уміє знайти НСД і застосувати його для скорочення дробів.',
 'ułamek; licznik; mianownik; NWD; skracanie',
 'дріб; чисельник; знаменник; НСД; скорочення',
 'I. WPROWADZENIE
Nauczyciel przypomina uczniom pojęcie ułamka, licznika i mianownika.

II. WPROWADZENIE NOWEGO MATERIAŁU
Na tablicy przykład: 8/12. Uczniowie wyznaczają NWD(8,12)=4 i skracają do 2/3.

III. ĆWICZENIA
Uczniowie samodzielnie skracają ułamki: 6/9, 10/15, 12/18.',
 'I. ВСТУП
Вчитель нагадує учням поняття дробу, чисельника та знаменника.

II. ПРЕДСТАВЛЕННЯ НОВОГО МАТЕРІАЛУ
На дошці приклад: 8/12. Учні знаходять НСД(8,12)=4 і скорочують до 2/3.

III. ВПРАВИ
Учні самостійно скорочують дроби: 6/9, 10/15, 12/18.',
 'Skróć ułamki: 12/16, 15/20, 18/24.',
 'Скороти дроби: 12/16, 15/20, 18/24.',
 'Obserwacja pracy uczniów, kartkówka z 3 zadaniami.',
 'Спостереження за роботою учнів, картка з 3 завданнями.',
 'Rozpoczynać od modeli graficznych, następnie przechodzić do skracania liczbowego.',
 'Починати з наочних моделей, після чого переходити до числового скорочення.',
 'EduMost', '1.0', 'Ready', 1),
(2, 'MAT4-022', 1, 4, 'Practice', 45,
 'Skracanie ułamków — praktyka',
 'Скорочення дробів — практика',
 'Uczeń utrwala umiejętność skracania ułamków.',
 'Учень закріплює вміння скорочувати дроби.',
 'Uczeń samodzielnie skraca ułamki w zadaniach o różnym stopniu trudności.',
 'Учень самостійно скорочує дроби у завданнях різного рівня складності.',
 'NWD; skracanie; ułamek nieskracalny',
 'НСД; скорочення; нескоротний дріб',
 'Zadania na karcie pracy, praca w parach, omówienie rozwiązań.',
 'Завдання на робочому аркуші, робота в парах, обговорення розв''язків.',
 'Karta pracy — zadania 1-6.',
 'Робочий аркуш — завдання 1-6.',
 'Sprawdzenie poprawności skracania.',
 'Перевірка правильності скорочення.',
 NULL, NULL, 'EduMost', '1.0', 'Ready', 1),
(3, 'MAT4-023', 1, 4, 'Assessment', 45,
 'Zadania na skracanie ułamków',
 'Завдання на скорочення дробів',
 'Uczeń rozwiązuje zadania sprawdzające umiejętność skracania ułamków.',
 'Учень виконує завдання для перевірки вміння скорочувати дроби.',
 'Uczeń otrzymuje ocenę za poprawność skracania ułamków.',
 'Учень отримує оцінку за правильність скорочення дробів.',
 'skracanie; NWD',
 'скорочення; НСД',
 'Sprawdzian pisemny — 8 zadań.',
 'Письмова перевірка — 8 завдань.',
 'Przygotować się do sprawdzianu z ułamków.',
 'Підготуватися до контрольної з дробів.',
 'Sprawdzian — 8 zadań, ocena opisowa.',
 'Контрольна — 8 завдань, описова оцінка.',
 NULL, NULL, 'EduMost', '1.0', 'Draft', 1);

-- LessonTopics
INSERT INTO LessonTopics (lesson_id, topic_id, is_primary, display_order) VALUES
(1, 19, 1, 1),
(2, 19, 1, 1),
(3, 19, 1, 1);

-- LessonResources
INSERT INTO LessonResources (lesson_id, resource_type, storage_type, title_pl, title_ua, url, description_pl, description_ua, display_order, is_active) VALUES
(1, 'PPTX', 'LOCAL', 'Skracanie ułamków.pptx', 'Скорочення дробів.pptx', 'Materials/Skracanie_ulamkow.pptx', 'Prezentacja wprowadzająca temat skracania ułamków.', 'Презентація з введення теми скорочення дробів.', 1, 1),
(1, 'PDF', 'GDRIVE', 'Karta pracy.pdf', 'Робочий аркуш.pdf', 'https://drive.google.com/file/d/example-karta-pracy/view', 'Zadania do samodzielnej pracy.', 'Завдання для самостійної роботи.', 2, 1),
(1, 'LINK', 'URL', 'GeoGebra — Skracanie ułamków', 'GeoGebra — Скорочення дробів', 'https://www.geogebra.org/m/example-skracanie', 'Interaktywne ćwiczenia online.', 'Інтерактивні вправи онлайн.', 3, 1);

-- TopicRelations
INSERT INTO TopicRelations (topic_id, related_topic_id, relation_type, description_pl, description_ua, display_order, is_active) VALUES
(19, 18, 'PREREQUISITE', 'Temat należy opanować przed skracaniem ułamków.', 'Тему необхідно опанувати перед вивченням скорочення дробів.', 1, 1),
(19, 2, 'PREREQUISITE', 'Znajomość licznika i mianownika.', 'Знання чисельника та знаменника.', 2, 1),
(19, 20, 'NEXT', 'Następny temat po skracaniu ułamków.', 'Наступна тема після скорочення дробів.', 1, 1),
(19, 21, 'NEXT', 'Dodawanie ułamków po opanowaniu skracania.', 'Додавання дробів після опанування скорочення.', 2, 1),
(19, 20, 'RELATED', 'Tematy powiązane w rozdziale ułamków.', 'Пов''язані теми в розділі дробів.', 1, 1),
(19, 21, 'RELATED', 'Tematy powiązane w rozdziale ułamków.', 'Пов''язані теми в розділі дробів.', 2, 1);

-- Settings (database_path updated at runtime by DatabaseService)
INSERT INTO Settings (id, interface_language, database_path, backup_path, auto_backup, backup_interval, theme, app_version)
VALUES (1, 'UA', NULL, NULL, 1, 7, 'Light', '1.0.0');

COMMIT;
