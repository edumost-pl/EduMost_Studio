#!/usr/bin/env python3
"""Generate seed_klasa5_matematyka.sql — full textbook TOC for Matematyka Klasa 5."""

from __future__ import annotations
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / "electron/database/seed/seed_klasa5_matematyka.sql"

NEW_SECTIONS = [
    ("DEC", "Ułamki dziesiętne", "Десяткові дроби",
     "Dział IV podręcznika — ułamki dziesiętne i zamiana jednostek.",
     "Розділ IV підручника — десяткові дроби та перетворення одиниць.", 6),
    ("ARE", "Pola figur", "Площі фігур",
     "Dział V podręcznika — obliczanie pól figur płaskich.",
     "Розділ V підручника — обчислення площ плоских фігур.", 7),
    ("SOL", "Figury przestrzenne", "Просторові фігури",
     "Dział VII podręcznika — bryły, objętość i siatki.",
     "Розділ VII підручника — тіла, об'єм і розгортки.", 8),
]

TOPICS: list[dict] = []
TOPIC_BY_KEY: dict[str, dict] = {}


SUBJECT_CODE = "MAT"
SCHOOL_CLASS = 5


def topic_code(section: str, order: int) -> str:
    return f"{SUBJECT_CODE}{SCHOOL_CLASS}-{section}-{order:03d}"


def add(
    section: str,
    suffix: str,
    pl: str,
    ua: str,
    pp_code: str,
    pp_pl: str,
    stage: str,
    *,
    prereq_keys: list[str] | None = None,
    next_keys: list[str] | None = None,
    related_keys: list[str] | None = None,
    lesson_type: str = "New Knowledge",
    with_lesson: bool = True,
    textbook_dzial: str = "",
    is_review: bool = False,
) -> str:
    order = len(TOPICS) + 1
    key = topic_code(section, order)
    t = {
        "section": section,
        "suffix": suffix,
        "key": key,
        "name_pl": pl,
        "name_ua": ua,
        "pp_code": pp_code,
        "pp_pl": pp_pl,
        "stage": stage,
        "prereq_keys": prereq_keys or [],
        "next_keys": next_keys or [],
        "related_keys": related_keys or [],
        "lesson_type": lesson_type,
        "with_lesson": with_lesson,
        "textbook_dzial": textbook_dzial,
        "is_review": is_review,
    }
    TOPICS.append(t)
    TOPIC_BY_KEY[key] = t
    return key


def add_review_block(
    section: str,
    start_suffix: int,
    dzial_pl: str,
    dzial_ua: str,
    last_main: str,
    first_after: str | None,
    pp_base: str,
    pp_text: str,
) -> list[str]:
    """Powtórzenie przed klasówką + Zadania na temat + Zadania na deser."""
    s = start_suffix
    keys = []
    reviews = [
        ("Powtórzenie przed klasówką", "Повторення перед контрольною",
         f"{pp_base}.1", f"Uczeń powtarza materiał działu „{dzial_pl}” przed sprawdzianem.", "Revision", "Review"),
        ("Zadania na temat…", "Завдання на тему…",
         f"{pp_base}.2", f"Uczeń rozwiązuje zadania utrwalające tematy działu „{dzial_pl}”.", "Practiced", "Practice"),
        ("Zadania na deser", "Завданnia на десерт",
         f"{pp_base}.3", f"Uczeń rozwiązuje zadania dodatkowe i zadania o podwyższonej trudności z działu „{dzial_pl}”.", "Mastered", "Practice"),
    ]
    for i, (pl, ua, pp, pp_pl, stage, ltype) in enumerate(reviews):
        suf = f"{s + i:03d}"
        pk = [keys[-1]] if keys else [last_main]
        nk: list[str] = []
        if i < 2:
            next_order = len(TOPICS) + 1
            nk = [topic_code(section, next_order)]
        elif first_after:
            nk = [first_after]
        keys.append(add(
            section, suf, pl, ua, pp, pp_pl, stage,
            prereq_keys=pk, next_keys=[x for x in nk if x],
            lesson_type=ltype, textbook_dzial=dzial_pl, is_review=True,
        ))
    return keys


# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ I — Liczby naturalne (NUM)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_I = "I. Liczby naturalne"
num_main = [
    ("001", "Działania pamięciowe", "Дії усно", "I.1",
     "Uczeń wykonuje działania pamięciowe (dodawanie, odejmowanie, mnożenie, dzielenie) na liczbach naturalnych.", "Introduced"),
    ("002", "Potęgowanie", "Піднесення до степеня", "I.2",
     "Uczeń potęguje liczbę naturalną do potęgi naturalnej nie większej niż 3.", "Introduced"),
    ("003", "Kolejność wykonywania działań", "Порядок виконання дій", "I.3",
     "Uczeń stosuje reguły kolejności wykonywania działań, w tym działania w nawiasach.", "Developed"),
    ("004", "Cyfry rzymskie", "Римські цифри", "I.4",
     "Uczeń odczytuje i zapisuje liczby naturalne w zapisie rzymskim w zakresie studiowanym w klasie.", "Developed"),
    ("005", "Obliczenia przybliżone", "Наближені обчислення", "I.5",
     "Uczeń stosuje obliczenia przybliżone; zaokrągla liczby naturalne w zadaniach praktycznych.", "Developed"),
    ("006", "Dodawanie i odejmowanie pisemne", "Письмове додавання і віднімання", "I.6",
     "Uczeń dodaje i odejmuje pisemnie liczby naturalne wielocyfrowe.", "Practiced"),
    ("007", "Mnożenie pisemne", "Письмове множення", "I.7",
     "Uczeń mnoży pisemnie liczby naturalne wielocyfrowe.", "Practiced"),
    ("008", "Dzielenie i podzielność", "Ділення і подільність", "I.8",
     "Uczeń stosuje kryteria podzielności liczb naturalnych; rozpoznaje liczby podzielne przez 2, 3, 5, 9, 10.", "Practiced"),
    ("009", "Liczby pierwsze i liczby złożone", "Прості й складені числа", "I.9",
     "Uczeń rozpoznaje liczby pierwsze i złożone; rozkłada liczby naturalne na czynniki pierwsze.", "Mastered"),
    ("010", "Dzielenie pisemne", "Письмове ділення", "I.10",
     "Uczeń dzieli pisemnie liczby naturalne przez liczby jedno- i wielocyfrowe.", "Mastered"),
]
num_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(num_main):
    pk = [num_keys[-1]] if num_keys else []
    num_keys.append(add("NUM", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_I))

num_review = add_review_block("NUM", 11, DZIAL_I, "I. Натуральні числа",
                              num_keys[-1], None, "I.R", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ II — Figury geometryczne (GEO)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_II = "II. Figury geometryczne"
geo_main = [
    ("001", "Płaszczyzna, proste i półproste", "Площина, прямі та промені", "V.1",
     "Uczeń rozpoznaje proste, półproste i odcinki; rysuje proste prostopadłe i równoległe.", "Introduced"),
    ("002", "Kąty. Rodzaje kątów", "Кути. Види кутів", "V.2",
     "Uczeń rozpoznaje kąty ostre, proste, rozwarte i pełne; nazywa kąty przyległe i wierzchołkowe.", "Introduced"),
    ("003", "Mierzenie kątów", "Вимірювання кутів", "V.3",
     "Uczeń mierzy kąty kątomierzem i konstruuje kąty o zadanej mierze.", "Developed"),
    ("004", "Rodzaje i własności trójkątów", "Види та властивості трикутників", "V.4",
     "Uczeń klasyfikuje trójkąty według boków i kątów; stosuje własność sumy kątów trójkąta.", "Developed"),
    ("005", "Własności niektórych trójkątów", "Властивості окремих трикутників", "V.5",
     "Uczeń rozpoznaje trójkąty równoramienne, równoboczne i prostokątne oraz ich własności.", "Practiced"),
    ("006", "Wysokość trójkąta", "Висота трикутника", "V.6",
     "Uczeń wyznacza wysokości trójkąta i wykorzystuje je w zadaniach geometrycznych.", "Practiced"),
    ("007", "Równoległoboki", "Паралелограми", "V.7",
     "Uczeń rozpoznaje równoległoboki, prostokąty, romby i kwadraty; wskazuje ich własności.", "Practiced"),
    ("008", "Wysokość równoległoboku", "Висота паралелограма", "V.8",
     "Uczeń wyznacza wysokość równoległoboku względem wybranego boku.", "Mastered"),
    ("009", "Trapezy", "Трапеції", "V.9",
     "Uczeń rozpoznaje trapezy różnych rodzajów i wskazuje ich elementy.", "Mastered"),
    ("010", "Klasyfikacja czworokątów", "Класифікація чотирикутників", "V.10",
     "Uczeń klasyfikuje czworokąty; tworzy diagram hierarchii czworokątów.", "Mastered"),
]
geo_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(geo_main):
    pk = [geo_keys[-1]] if geo_keys else [num_review[-1]]
    geo_keys.append(add("GEO", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_II))

geo_review = add_review_block("GEO", 11, DZIAL_II, "II. Геометричні фігури",
                              geo_keys[-1], None, "V.R", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ III — Ułamki zwykłe (FRA)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_III = "III. Ułamki zwykłe"
fra_main = [
    ("033", "Ułamek jako część i jako iloraz", "Дріб як частина і як частка", "II.1",
     "Uczeń interpretuje ułamek zwykły jako część całości i jako iloraz liczb naturalnych.", "Introduced"),
    ("034", "Rozszerzanie i skracanie ułamków", "Розширення й скорочення дробів", "II.2",
     "Uczeń rozszerza i skraca ułamki zwykłe do postaci nieskracalnej.", "Introduced"),
    ("035", "Dodawanie i odejmowanie ułamków o tych samych mianownikach", "Додавання й віднімання дробів з однаковими знаменниками", "II.3",
     "Uczeń dodaje i odejmuje ułamki o jednakowych mianownikach.", "Developed"),
    ("036", "Dodawanie i odejmowanie ułamków o różnych mianownikach", "Додавання й віднімання дробів з різними знаменниками", "II.4",
     "Uczeń dodaje i odejmuje ułamki o różnych mianownikach po sprowadzeniu do wspólnego mianownika.", "Developed"),
    ("037", "Mnożenie ułamka przez liczbę naturalną. Ułamek liczby", "Множення дробу на натуральне число. Дріб числа", "II.5",
     "Uczeń mnoży ułamek przez liczbę naturalną; oblicza ułamek wskazanej liczby.", "Practiced"),
    ("038", "Mnożenie ułamków", "Множення дробів", "II.6",
     "Uczeń mnoży ułamki zwykłe.", "Practiced"),
    ("039", "Odwrotności liczb", "Обернені числа", "II.7",
     "Uczeń rozpoznaje odwrotności liczb; stosuje odwrotność przy dzieleniu ułamków.", "Practiced"),
    ("040", "Dzielenie ułamków", "Ділення дробів", "II.8",
     "Uczeń dzieli ułamki zwykłe przez mnożenie przez odwrotność dzielnika.", "Mastered"),
    ("041", "Działania na ułamkach", "Дії з дробами", "II.9",
     "Uczeń wykonuje łącznie dodawanie, odejmowanie, mnożenie i dzielenie ułamków w zadaniach.", "Mastered"),
]
fra_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(fra_main):
    pk = [fra_keys[-1]] if fra_keys else [geo_review[-1]]
    rel = [num_keys[8]] if i == 0 else []
    fra_keys.append(add("FRA", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, related_keys=rel, textbook_dzial=DZIAL_III))

fra_review = add_review_block("FRA", 42, DZIAL_III, "III. Звичайні дроби",
                              fra_keys[-1], None, "II.R", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ IV — Ułamki dziesiętne (DEC)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_IV = "IV. Ułamki dziesiętne"
dec_main = [
    ("001", "Ułamek dziesiętny", "Десятковий дріб", "II.10",
     "Uczeń odczytuje, zapisuje i porównuje ułamki dziesiętne; łączy ułamek dziesiętny z ułamkiem zwykłym.", "Introduced"),
    ("002", "Dodawanie i odejmowanie ułamków dziesiętnych", "Додавання й віднімання десяткових дробів", "II.11",
     "Uczeń dodaje i odejmuje ułamki dziesiętne.", "Developed"),
    ("003", "Mnożenie ułamków dziesiętnych", "Множення десяткових дробів", "II.12",
     "Uczeń mnoży ułamki dziesiętne przez liczby naturalne i przez ułamki dziesiętne.", "Practiced"),
    ("004", "Dzielenie ułamków dziesiętnych", "Ділення десяткових дробів", "II.13",
     "Uczeń dzieli ułamki dziesiętne przez liczby naturalne i przez ułamki dziesiętne.", "Practiced"),
    ("005", "Zamiana jednostek", "Перетворення одиниць", "VII.1",
     "Uczeń zamienia jednostki długości, masy i pojemności, stosując ułamki dziesiętne.", "Mastered"),
]
dec_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(dec_main):
    pk = [dec_keys[-1]] if dec_keys else [fra_review[-1]]
    dec_keys.append(add("DEC", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_IV))

dec_review = add_review_block("DEC", 6, DZIAL_IV, "IV. Десяткові дроби",
                              dec_keys[-1], None, "II.RD", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ V — Pola figur (ARE)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_V = "V. Pola figur"
are_main = [
    ("001", "Pole figury", "Площа фігури", "V.11",
     "Uczeń rozumie pojęcie pola figury; stosuje jednostki pola.", "Introduced"),
    ("002", "Pole równoległoboku i rombu", "Площа паралелограма й ромба", "V.12",
     "Uczeń oblicza pole równoległoboku i rombu ze wzoru P = a·h.", "Developed"),
    ("003", "Pole trójkąta", "Площа трикутника", "V.13",
     "Uczeń oblicza pole trójkąta ze wzoru P = a·h/2.", "Developed"),
    ("004", "Pole trapezu", "Площа трапеції", "V.14",
     "Uczeń oblicza pole trapezu ze wzoru P = (a + b)·h/2.", "Practiced"),
    ("005", "Różne jednostki pola", "Різні одиниці площі", "V.15",
     "Uczeń zamienia jednostki pola: mm², cm², dm², m², ar, ha.", "Mastered"),
]
are_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(are_main):
    pk = [are_keys[-1]] if are_keys else [dec_review[-1], geo_keys[5]]
    rel = [geo_keys[5], geo_keys[7]] if suf in ("002", "003", "004") else []
    are_keys.append(add("ARE", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, related_keys=rel, textbook_dzial=DZIAL_V))

are_review = add_review_block("ARE", 6, DZIAL_V, "V. Площі фігур",
                              are_keys[-1], None, "V.R", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ VI — Matematyka i my (QTY + DATA + NUM integers)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_VI = "VI. Matematyka i my"
qty_keys = []
qty_main = [
    ("001", "Kalendarz i zegar", "Календар і годинник", "VII.2",
     "Uczeń odczytuje daty z kalendarza i godziny ze zegara; oblicza upływ czasu.", "Introduced"),
    ("002", "Miary, wagi i pieniądze", "Міри, ваги й гроші", "VII.3",
     "Uczeń wykonuje obliczenia praktyczne z miarami długości, masy i pieniędzmi.", "Developed"),
]
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(qty_main):
    pk = [qty_keys[-1]] if qty_keys else [are_review[-1]]
    qty_keys.append(add("QTY", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_VI))

data_key = add("DATA", "001", "Średnia arytmetyczna", "Середнє арифметичне", "IV.1",
               "Uczeń oblicza średnią arytmetyczną zestawu danych liczbowych.", "Developed",
               prereq_keys=[qty_keys[-1]], textbook_dzial=DZIAL_VI)

int_main = [
    ("017", "Liczby dodatnie i ujemne", "Додатні й від'ємні числа", "I.11",
     "Uczeń rozpoznaje liczby całkowite; zapisuje je na osi liczbowej i porównuje.", "Introduced"),
    ("018", "Dodawanie liczb całkowitych", "Додавання цілих чисел", "I.12",
     "Uczeń dodaje liczby całkowite, w tym liczby przeciwne.", "Developed"),
    ("019", "O ile różnią się liczby", "На скільки відрізняються числа", "I.13",
     "Uczeń oblicza, o ile jedna liczba różni się od drugiej, w zadaniach praktycznych.", "Developed"),
]
int_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(int_main):
    pk = [int_keys[-1]] if int_keys else [data_key]
    int_keys.append(add("NUM", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_VI))

qty_review = add_review_block("QTY", 3, DZIAL_VI, "VI. Математика і ми",
                              int_keys[-1], None, "VI.R", "Powtórzenie i utrwalenie")

# ══════════════════════════════════════════════════════════════════════════════
# DZIAŁ VII — Figury przestrzenne (SOL)
# ══════════════════════════════════════════════════════════════════════════════
DZIAL_VII = "VII. Figury przestrzenne"
sol_main = [
    ("001", "Figury przestrzenne – bryły", "Просторові фігури — тіла", "VI.1",
     "Uczeń rozpoznaje graniastosłupy i ostrosłupy; wskazuje krawędzie, ściany i wierzchołki.", "Introduced"),
    ("002", "Objętość i pojemność", "Об'єм і місткість", "VI.2",
     "Uczeń rozróżnia pojęcia objętości i pojemności; stosuje jednostki cm³, dm³, m³ i litr.", "Introduced"),
    ("003", "Objętość prostopadłościanu", "Об'єм прямокутного паралелепіпеда", "VI.3",
     "Uczeń oblicza objętość prostopadłościanu ze wzoru V = a·b·c.", "Developed"),
    ("004", "Siatki prostopadłościanów", "Розгортки прямокутних паралелепіпедів", "VI.4",
     "Uczeń rozpoznaje i rysuje siatki prostopadłościanów.", "Practiced"),
    ("005", "Siatki graniastosłupów", "Розгортки призм", "VI.5",
     "Uczeń rozpoznaje siatki graniastosłupów; tworzy modele brył.", "Mastered"),
]
sol_keys = []
for i, (suf, pl, ua, pp, pp_pl, stage) in enumerate(sol_main):
    pk = [sol_keys[-1]] if sol_keys else [qty_review[-1]]
    sol_keys.append(add("SOL", suf, pl, ua, pp, pp_pl, stage,
                        prereq_keys=pk, textbook_dzial=DZIAL_VII))

sol_review = add_review_block("SOL", 6, DZIAL_VII, "VII. Просторові фігури",
                              sol_keys[-1], None, "VI.R", "Powtórzenie i utrwalenie")
# Cross-section NEXT links (textbook order)
TOPIC_BY_KEY[num_review[-1]]["next_keys"] = [geo_keys[0]]
TOPIC_BY_KEY[geo_review[-1]]["next_keys"] = [fra_keys[0]]
TOPIC_BY_KEY[fra_review[-1]]["next_keys"] = [dec_keys[0]]
TOPIC_BY_KEY[dec_review[-1]]["next_keys"] = [are_keys[0]]
TOPIC_BY_KEY[are_review[-1]]["next_keys"] = [qty_keys[0]]
TOPIC_BY_KEY[qty_review[-1]]["next_keys"] = [sol_keys[0]]


# ── Updates for topics that may exist from previous seed version ──
UPDATES = [
    ("MAT5-NUM-014", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-NUM-011", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-GEO-018", "Własności niektórych trójkątów", "Властивості окремих трикутників"),
    ("MAT5-GEO-024", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-FRA-036", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-DEC-043", "Zamiana jednostek", "Перетворення одиниць"),
    ("MAT5-DEC-044", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-ARE-052", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-QTY-061", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
    ("MAT5-SOL-069", "Powtórzenie przed klasówką", "Повторення перед контрольною"),
]


def sql_str(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def topic_content(t: dict) -> dict[str, str]:
    pl, ua = t["name_pl"], t["name_ua"]
    dzial = t.get("textbook_dzial", "")
    is_rev = t.get("is_review", False)

    if is_rev:
        desc_pl = (f"Sekcja podręcznika w dziale {dzial}. Temat „{pl}” — utrwalenie i rozszerzenie "
                   f"wiadomości zgodnie z wymaganiem {t['pp_code']} podstawy programowej.")
        desc_ua = (f"Розділ підручника в ділянці {dzial}. Тема «{ua}» — закріплення та розширення "
                   f"знань згідно з вимогою {t['pp_code']} подstawy programowej.")
        meth_pl = "Metodyka polska: praca zespołowa, zadania z podręcznika, samoocena. Czas: 1–2 lekcje."
        meth_ua = "Польська методика: групова робота, завдання з підручника, самооцінка. Час: 1–2 уроки."
    else:
        desc_pl = (f"Dział {dzial} podręcznika klasy 5. Temat „{pl}” realizuje wymaganie {t['pp_code']} "
                   f"podstawy programowej. Metoda: odkrywanie → modelowanie → utrwalanie (CKE).")
        desc_ua = (f"Розділ {dzial} підручника 5 класу. Тема «{ua}» реалізує вимогу {t['pp_code']} "
                   f"podstawy programowej. Метод: відкриття → моделювання → закріплення (CKE).")
        meth_pl = ("Metodyka polska (II etap): model konkretny → obrazowy → symboliczny. "
                   "Praca w parach, manipulatywy, zadania problemowe. Czas: 2–3 lekcje.")
        meth_ua = ("Польська методика (II етап): конкретна → образна → символічна модель. "
                   "Робота в парах, маніпулятиви, задачі. Час: 2–3 уроки.")

    know_pl = f"Uczeń zna pojęcia i definicje z tematu „{pl}”."
    know_ua = f"Учень знає поняття та визначення з теми «{ua}»."
    skill_pl = f"Uczeń stosuje wiedzę z tematu „{pl}” w zadaniach podstawowych i rozszerzonych."
    skill_ua = f"Учень застосовує знання з теми «{ua}» у базових і розширених завданнях."

    return {
        "description_pl": desc_pl,
        "description_ua": desc_ua,
        "prerequisites_pl": "\n".join(f"• {TOPIC_BY_KEY[k]['name_pl']}" for k in t["prereq_keys"]) if t["prereq_keys"] else "• Wiedza z klasy 4 w zakresie matematyki",
        "prerequisites_ua": "\n".join(f"• {TOPIC_BY_KEY[k]['name_ua']}" for k in t["prereq_keys"]) if t["prereq_keys"] else "• Знання з 4 класу з математики",
        "outcomes_pl": f"• Co uczeń powinien wiedzieć: {know_pl}\n• Co uczeń powinien umieć: {skill_pl}\n• Wymaganie PP ({t['pp_code']}): {t['pp_pl']}",
        "outcomes_ua": f"• Що учень повинен знати: {know_ua}\n• Що учень повинен вміти: {skill_ua}\n• Вимога PP ({t['pp_code']}): {t['pp_pl']}",
        "terminology_pl": t["pp_code"] + "; " + "; ".join(w for w in pl.replace(",", "").split()[:5]),
        "terminology_ua": t["pp_code"] + "; " + "; ".join(w for w in ua.replace(",", "").split()[:5]),
        "methodology_pl": meth_pl,
        "methodology_ua": meth_ua,
        "notes_pl": f"Podręcznik: {dzial}. PP: {t['pp_code']}. Klasa 5.",
        "notes_ua": f"Підручник: {dzial}. PP: {t['pp_code']}. 5 клас.",
    }


def lesson_for(t: dict, num: int) -> str:
    c = topic_content(t)
    code = f"MAT5-{num:03d}"
    pl, ua = t["name_pl"], t["name_ua"]
    ltype = t.get("lesson_type", "New Knowledge")
    return f"""
INSERT OR IGNORE INTO Lessons (code, subject_id, school_class, lesson_type, duration,
  title_pl, title_ua, goal_pl, goal_ua,
  learning_results_pl, learning_results_ua,
  terminology_pl, terminology_ua,
  scenario_pl, scenario_ua,
  homework_pl, homework_ua,
  assessment_pl, assessment_ua,
  author, version, status, is_active)
VALUES (
  {sql_str(code)}, 1, 5, {sql_str(ltype)}, 45,
  {sql_str(pl)}, {sql_str(ua)},
  {sql_str(f'Uczeń realizuje wymagania PP ({t["pp_code"]}) w temacie „{pl}".')},
  {sql_str(f'Учень реалізує вимоги PP ({t["pp_code"]}) у темі «{ua}».')},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(f'''I. WPROWADZENIE (10 min)
Aktywizacja wiedzy poprzedniej ({c['prerequisites_pl'].split(chr(10))[0]}).

II. GŁÓWNA CZĘŚĆ (25 min)
Realizacja tematu „{pl}” — zgodnie ze spisem treści podręcznika kl. 5.
Praca: tablica, karta pracy, omówienie przykładów.

III. ĆWICZENIA (10 min)
Zadania z podręcznika i karty pracy — poziom podstawowy.

IV. PODSUMOWANIE (5 min)
Refleksja: co uczeń powinien wiedzieć i umieć po lekcji.''')},
  {sql_str(f'''I. ВСТУП (10 хв)
Активізація попередніх знань.

II. ОСНОВНА ЧАСТИНА (25 хв)
Реалізація теми «{ua}» — згідно зі змістом підручника 5 класу.

III. ВПРАВИ (10 хв)
Завдання з підручника та робочого аркуша.

IV. ПІДСУМОК (5 хв)
Рефлексія: що учень повинен знати та вміти після уроку.''')},
  {sql_str(f'Zadania domowe — sekcja „{pl}” w podręczniku.')},
  {sql_str(f'Домашнє завдання — розділ «{ua}» у підручнику.')},
  {sql_str('Obserwacja, krótka kartkówka lub samoocena.')},
  {sql_str('Спостереження, коротка картка або самооцінка.')},
  'EduMost', '1.0', 'Draft', 1
);"""


def main():
    lines = [
        "-- EduMost Studio: Matematyka Klasa 5 — pełny spis treści podręcznika",
        "-- Generated by scripts/generate-klasa5-curriculum.py",
        "-- Podstawa Programowa: Matematyka, klasy IV–VI (MEN 2017)",
        "",
        "BEGIN TRANSACTION;",
        "",
    ]

    for code, pl, ua, dpl, dua, order in NEW_SECTIONS:
        lines.append(f"""
INSERT OR IGNORE INTO Sections (subject_id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT 1, {sql_str(code)}, {sql_str(pl)}, {sql_str(ua)}, {sql_str(dpl)}, {sql_str(dua)}, {order}, 1
WHERE NOT EXISTS (SELECT 1 FROM Sections WHERE subject_id = 1 AND code = {sql_str(code)});""")

    lines.append("\n-- Rename / fix topics from earlier seed versions")
    for code, pl, ua in UPDATES:
        lines.append(f"""
UPDATE Topics SET name_pl = {sql_str(pl)}, name_ua = {sql_str(ua)},
  updated_at = CURRENT_TIMESTAMP
WHERE code = {sql_str(code)};""")

    lines.append("\n-- Deactivate obsolete topic codes from earlier seed versions")
    lines.append("""
UPDATE Topics SET is_active = 0, updated_at = CURRENT_TIMESTAMP
WHERE code = 'NUM-014'
  AND EXISTS (SELECT 1 FROM Topics WHERE code = 'NUM-011' AND name_pl = 'Powtórzenie przed klasówką');""")

    lines.append("\n-- Topics")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
        disp = order_idx
        lines.append(f"""
INSERT OR IGNORE INTO Topics (section_id, code, name_pl, name_ua,
  description_pl, description_ua, prerequisites_pl, prerequisites_ua,
  outcomes_pl, outcomes_ua, terminology_pl, terminology_ua,
  methodology_pl, methodology_ua, display_order, is_active)
SELECT s.id, {sql_str(t['key'])}, {sql_str(t['name_pl'])}, {sql_str(t['name_ua'])},
  {sql_str(c['description_pl'])}, {sql_str(c['description_ua'])},
  {sql_str(c['prerequisites_pl'])}, {sql_str(c['prerequisites_ua'])},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(c['methodology_pl'])}, {sql_str(c['methodology_ua'])},
  {disp}, 1
FROM Sections s
WHERE s.subject_id = 1 AND s.code = {sql_str(t['section'])}
  AND NOT EXISTS (SELECT 1 FROM Topics WHERE code = {sql_str(t['key'])});""")

    lines.append("\n-- Fill missing fields on existing topics (upgrade path)")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
        lines.append(f"""
UPDATE Topics SET
  name_pl = {sql_str(t['name_pl'])}, name_ua = {sql_str(t['name_ua'])},
  description_pl = {sql_str(c['description_pl'])}, description_ua = {sql_str(c['description_ua'])},
  prerequisites_pl = {sql_str(c['prerequisites_pl'])}, prerequisites_ua = {sql_str(c['prerequisites_ua'])},
  outcomes_pl = {sql_str(c['outcomes_pl'])}, outcomes_ua = {sql_str(c['outcomes_ua'])},
  terminology_pl = {sql_str(c['terminology_pl'])}, terminology_ua = {sql_str(c['terminology_ua'])},
  methodology_pl = {sql_str(c['methodology_pl'])}, methodology_ua = {sql_str(c['methodology_ua'])},
  updated_at = CURRENT_TIMESTAMP
WHERE code = {sql_str(t['key'])};""")

    lines.append("\n-- Curriculum (school_class = 5, textbook order)")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
        lines.append(f"""
INSERT OR IGNORE INTO Curriculum (topic_id, school_class, learning_stage, curriculum_code, curriculum_pl, notes_pl, notes_ua, display_order, is_active)
SELECT t.id, 5, {sql_str(t['stage'])}, {sql_str(t['pp_code'])}, {sql_str(t['pp_pl'])},
  {sql_str(c['notes_pl'])}, {sql_str(c['notes_ua'])}, {order_idx}, 1
FROM Topics t WHERE t.code = {sql_str(t['key'])}
  AND NOT EXISTS (SELECT 1 FROM Curriculum c WHERE c.topic_id = t.id AND c.school_class = 5);""")

    lines.append("\n-- Refresh curriculum on existing rows")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
        lines.append(f"""
UPDATE Curriculum SET
  learning_stage = {sql_str(t['stage'])},
  curriculum_code = {sql_str(t['pp_code'])},
  curriculum_pl = {sql_str(t['pp_pl'])},
  notes_pl = {sql_str(c['notes_pl'])},
  notes_ua = {sql_str(c['notes_ua'])},
  display_order = {order_idx},
  updated_at = CURRENT_TIMESTAMP
WHERE topic_id = (SELECT id FROM Topics WHERE code = {sql_str(t['key'])})
  AND school_class = 5;""")

    lines.append("\n-- TopicRelations")
    for t in TOPICS:
        for rt, keys in [("PREREQUISITE", t["prereq_keys"]), ("NEXT", t["next_keys"]), ("RELATED", t["related_keys"])]:
            for j, rk in enumerate(keys):
                if rk not in TOPIC_BY_KEY:
                    continue
                desc_pl = {"PREREQUISITE": "Wymagane wcześniejsze opanowanie (kolejność podręcznika).",
                           "NEXT": "Następny temat wg spisu treści podręcznika.",
                           "RELATED": "Temat powiązany merytorycznie."}[rt]
                desc_ua = {"PREREQUISITE": "Потрібне попереднє опанування (порядок підручника).",
                           "NEXT": "Наступна тема згідно зі змістом підручника.",
                           "RELATED": "Пов'язана тема."}[rt]
                lines.append(f"""
INSERT OR IGNORE INTO TopicRelations (topic_id, related_topic_id, relation_type, description_pl, description_ua, display_order, is_active)
SELECT src.id, tgt.id, {sql_str(rt)}, {sql_str(desc_pl)}, {sql_str(desc_ua)}, {j + 1}, 1
FROM Topics src, Topics tgt
WHERE src.code = {sql_str(t['key'])} AND tgt.code = {sql_str(rk)}
  AND NOT EXISTS (
    SELECT 1 FROM TopicRelations tr
    WHERE tr.topic_id = src.id AND tr.related_topic_id = tgt.id AND tr.relation_type = {sql_str(rt)}
  );""")

    lines.append("\n-- Lessons")
    lesson_num = 0
    lesson_links: list[tuple[str, str]] = []
    for t in TOPICS:
        if not t.get("with_lesson", True):
            continue
        lesson_num += 1
        lines.append(lesson_for(t, lesson_num))
        lesson_links.append((f"MAT5-{lesson_num:03d}", t["key"]))

    lines.append("\n-- LessonTopics")
    for code, tkey in lesson_links:
        lines.append(f"""
INSERT OR IGNORE INTO LessonTopics (lesson_id, topic_id, is_primary, display_order)
SELECT l.id, t.id, 1, 1
FROM Lessons l, Topics t
WHERE l.code = {sql_str(code)} AND t.code = {sql_str(tkey)}
  AND NOT EXISTS (SELECT 1 FROM LessonTopics lt WHERE lt.lesson_id = l.id AND lt.topic_id = t.id);""")

    lines.append("\n-- Deactivate manual test topics (break sort order with display_order=0)")
    lines.append("""
UPDATE Topics SET is_active = 0, updated_at = CURRENT_TIMESTAMP
WHERE code IN ('aaA-050', 'SТ01-001');""")

    lines.append("\nCOMMIT;")
    OUTPUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Written {OUTPUT}")
    print(f"  Topics: {len(TOPICS)} (expected 71 = 50 main + 21 review)")
    print(f"  Lessons: {lesson_num}")


if __name__ == "__main__":
    main()
