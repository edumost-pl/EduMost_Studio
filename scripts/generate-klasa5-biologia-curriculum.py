#!/usr/bin/env python3
"""Generate seed_klasa5_biologia.sql — Biologia Klasa 5 (Nowa Era „Puls życia 5”).

ISBN 978-83-267-3284-3 — 33 topics (wariant C), display_order 1–33.
Treści wyłącznie ze spisu treści, programu „Puls życia”, zeszytu ćwiczeń
oraz dostępnego fragmentu podręcznika (s. 7–32). Brak KN.
"""

from __future__ import annotations

from pathlib import Path

OUTPUT = (
    Path(__file__).resolve().parent.parent
    / "electron/database/seed/seed_klasa5_biologia.sql"
)

SUBJECT_CODE = "BIO"
SCHOOL_CLASS = 5
TOPIC_COUNT = 33
TEXTBOOK = "Nowa Era Puls życia 5 (2018), ISBN 978-83-267-3284-3, MEN 844/1/2018"
REVIEW_MSG = (
    "Wymaga uzupełnienia po pozyskaniu pełnego podręcznika lub książki nauczyciela."
)

SECTIONS = [
    ("NAU", "Biologia – nauka o życiu", "Біологія – наука про життя",
     "Rozdział I — wprowadzenie do biologii i metody naukowej.",
     "Розділ I — вступ до біології та наукового методу.", 1),
    ("ORG", "Budowa i czynności życiowe organizmów", "Будова і життєдіяльність організмів",
     "Rozdział II — chemizm życia, komórka, odżywianie i oddychanie.",
     "Розділ II — хімізм життя, клітина, живлення та дихання.", 2),
    ("MIK", "Wirusy, bakterie, protisty i grzyby", "Віруси, бактерії, прості та гриби",
     "Rozdział III — klasyfikacja i organizmy jednokomórkowe.",
     "Розділ III — класифікація та одноклітинні організми.", 3),
    ("TKA", "Tkanki i organy roślinne", "Тканини та органи рослин",
     "Rozdział IV — tkanki, korzeń, pęd i liść.",
     "Розділ IV — тканини, корінь, пагін та листок.", 4),
    ("ROZ", "Różnorodność roślin", "Різноманіття рослин",
     "Rozdział V — mszaki, paprotniki, nagonasienne i okrytonasienne.",
     "Розділ V — мохи, папороті, голонасінні та покритонасінні.", 5),
]

# (section, name_pl, name_ua, page, topic_type, zc_page, pp_code, pp_pl, terminology, requires_review, pu_verbatim)
RAW: list[tuple] = [
    # NAU 001–005
    ("NAU", "Biologia jako nauka", "Біологія як наука", 7, "LEKCJA", 4,
     "I.1–I.8",
     "Uczeń przedstawia hierarchiczną organizację budowy organizmów; wymienia czynności życiowe organizmów.",
     "biologia; komórka; tkanka; narząd; układ; organizm; odżywianie; oddychanie; wydalanie; ruch; rozmnażanie",
     True, True),
    ("NAU", "Jak poznawać biologię?", "Як пізнавати біологію?", 12, "LEKCJA", 7,
     "I.1–I.8",
     "Uczeń rozróżnia obserwację i doświadczenie; stosuje etapy metody naukowej (obserwacja, problem, hipoteza, doświadczenie, wnioski).",
     "obserwacja; doświadczenie; hipoteza; problem badawczy; próba badawcza; próba kontrolna; metoda naukowa",
     True, True),
    ("NAU", "Obserwacje mikroskopowe", "Мікроскопічні спостереження", 16, "LEKCJA", 12,
     "I.4",
     "Uczeń dokonuje obserwacji mikroskopowych; przygotowuje preparat; oblicza powiększenie (okular × obiektyw).",
     "mikroskop optyczny; preparat mikroskopowy; szkiełko podstawowe; szkiełko nakrywkowe; powiększenie",
     True, True),
    ("NAU", "Podsumowanie — Biologia – nauka o życiu", "Підсумок — Біологія – наука про життя", 20, "POWTÓRZENIE", 16,
     "I.1–I.8",
     "Uczeń utrwala wiedzę z rozdziału I — biologia jako nauka, metoda naukowa, mikroskopia.",
     "powtórzenie",
     True, False),
    ("NAU", "Wiesz czy nie wiesz? — dział I", "Чи знаєш ти? — розділ I", 22, "SPRAWDZIAN", 16,
     "I.1–I.8",
     "Uczeń wykazuje się wiedzą z rozdziału I — test samooceny z podręcznika.",
     "sprawdzian; test",
     True, False),
    # ORG 006–013
    ("ORG", "Składniki chemiczne organizmów", "Хімічні складники організмів", 25, "LEKCJA", 18,
     "I.2–I.3",
     "Uczeń wymienia pierwiastki i grupy związków chemicznych w organizmach oraz podaje ich funkcje.",
     "woda; sole mineralne; cukry; białka; tłuszcze; kwasy nukleinowe; DNA; glukoza; skrobia; celuloza",
     True, True),
    ("ORG", "Budowa komórki zwierzęcej", "Будова тваринної клітини", 29, "LEKCJA", 21,
     "I.4",
     "Uczeń rozpoznaje elementy budowy komórki zwierzęcej (błona, cytoplazma, jądro) i ich funkcje.",
     "komórka; błona komórkowa; cytoplazma; jądro komórkowe; mitochondrium; wakuola; rybosomy",
     True, True),
    ("ORG", "Komórka roślinna. Inne rodzaje komórek", "Рослинна клітина. Інші види клітин", 33, "LEKCJA", 24,
     "I.4–I.5",
     "Uczeń porównuje budowę komórki bakterii, roślin, zwierząt i grzybów; wskazuje chloroplast i ścianę komórkową.",
     "chloroplast; ściana komórkowa; komórka bakteryjna; komórka grzyba",
     True, False),
    ("ORG", "Samożywność", "Автотрофність", 39, "LEKCJA", 28,
     "I.6",
     "Uczeń przedstawia istotę fotosyntezy — substraty, produkty i warunki przebiegu procesu.",
     "fotosynteza; samożywność; chlorofil; glukoza",
     True, False),
    ("ORG", "Cudzożywność", "Гетеротрофність", 44, "LEKCJA", 32,
     "I.6",
     "Uczeń przedstawia odżywianie cudzożywne organizmów.",
     "cudzożywność; pokarm; łańcuch pokarmowy",
     True, False),
    ("ORG", "Sposoby oddychania organizmów", "Способи дихання організмів", 49, "LEKCJA", 36,
     "I.7",
     "Uczeń przedstawia oddychanie tlenowe i fermentację — substraty, produkty i warunki.",
     "oddychanie tlenowe; fermentacja; tlen; dwutlenek węgla",
     True, False),
    ("ORG", "Podsumowanie — Budowa i czynności życiowe organizmów",
     "Підсумок — Будова і життєдіяльність організмів", 54, "POWTÓRZENIE", 41,
     "I.1–I.8",
     "Uczeń utrwala wiedzę z rozdziału II — chemizm, komórka, odżywianie, oddychanie.",
     "powtórzenie",
     True, False),
    ("ORG", "Wiesz czy nie wiesz? — dział II", "Чи знаєш ти? — розділ II", 57, "SPRAWDZIAN", 41,
     "I.1–I.8",
     "Uczeń wykazuje się wiedzą z rozdziału II — test samooceny z podręcznika.",
     "sprawdzian; test",
     True, False),
    # MIK 014–019
    ("MIK", "Klasyfikacja organizmów", "Класифікація організмів", 61, "LEKCJA", 43,
     "II.1",
     "Uczeń uzasadnia potrzebę klasyfikacji; przedstawia zasady klasyfikacji biologicznej i cechy królestw.",
     "klasyfikacja; królestwo; systematyka",
     True, False),
    ("MIK", "Wirusy i bakterie", "Віруси та бактерії", 68, "LEKCJA", 46,
     "II.2–II.3",
     "Uczeń uzasadnia, dlaczego wirusy nie są organizmami; opisuje budowę i znaczenie bakterii oraz profilaktykę chorób.",
     "wirus; bakteria; profilaktyka; choroba zakaźna",
     True, False),
    ("MIK", "Różnorodność protistów", "Різноманіття найпростіших", 75, "LEKCJA", 51,
     "II.4",
     "Uczeń wykazuje różnorodność protistów; zakłada hodowlę i dokonuje obserwacji mikroskopowej.",
     "protista; hodowla; obserwacja mikroskopowa",
     True, False),
    ("MIK", "Budowa i różnorodność grzybów. Porosty",
     "Будова і різноманіття грибів. Лишайники", 81, "LEKCJA", 55,
     "II.6",
     "Uczeń opisuje budowę grzybów i porostów; wskazuje ich znaczenie w przyrodzie.",
     "grzyb; porost; grzybnia; skala porostowa",
     True, False),
    ("MIK", "Podsumowanie — Wirusy, bakterie, protisty i grzyby",
     "Підсумок — Віруси, бактерії, найпростіші та гриби", 88, "POWTÓRZENIE", 59,
     "II.1–II.6",
     "Uczeń utrwala wiedzę z rozdziału III.",
     "powtórzenie",
     True, False),
    ("MIK", "Wiesz czy nie wiesz? — dział III", "Чи знаєш ти? — розділ III", 90, "SPRAWDZIAN", 59,
     "II.1–II.6",
     "Uczeń wykazuje się wiedzą z rozdziału III — test samooceny z podręcznika.",
     "sprawdzian; test",
     True, False),
    # TKA 020–025
    ("TKA", "Tkanki roślinne", "Рослинні тканини", 93, "LEKCJA", 62,
     "II.5.1",
     "Uczeń rozpoznaje tkanki roślinne (twórcza, okrywająca, miękiszowa, wzmacniająca, przewodząca) i ich cechy adaptacyjne.",
     "tkanka twórcza; tkanka okrywająca; tkanka miękiszowa; tkanka wzmacniająca; tkanka przewodząca",
     True, False),
    ("TKA", "Korzeń – organ podziemny rośliny", "Корінь – підземний орган рослини", 98, "LEKCJA", 66,
     "III",
     "Uczeń opisuje budowę i funkcje korzenia rośliny okrytonasiennej (program: organy roślin).",
     "korzeń; organ podziemny",
     True, False),
    ("TKA", "Pęd. Budowa i funkcje łodygi", "Пагін. Будова і функції стебла", 102, "LEKCJA", 69,
     "III",
     "Uczeń opisuje budowę i funkcje łodygi (pędu) rośliny.",
     "pęd; łodyga",
     True, False),
    ("TKA", "Liść – wytwórnia pokarmu", "Листок – фабрика їжі", 106, "LEKCJA", 72,
     "III",
     "Uczeń opisuje budowę i funkcje liścia jako wytwórni pokarmu.",
     "liść; fotosynteza",
     True, False),
    ("TKA", "Podsumowanie — Tkanki i organy roślinne",
     "Підсумок — Тканини та органи рослин", 110, "POWTÓRZENIE", 77,
     "II.5.1; III",
     "Uczeń utrwala wiedzę z rozdziału IV.",
     "powtórzenie",
     True, False),
    ("TKA", "Wiesz czy nie wiesz? — dział IV", "Чи знаєш ти? — розділ IV", 112, "SPRAWDZIAN", 77,
     "II.5.1; III",
     "Uczeń wykazuje się wiedzą z rozdziału IV — test samooceny z podręcznika.",
     "sprawdzian; test",
     True, False),
    # ROZ 026–033
    ("ROZ", "Mechy", "Мохи", 115, "LEKCJA", 79,
     "II.5.2",
     "Uczeń przedstawia cechy budowy mchów; wyjaśnia ich znaczenie; planuje doświadczenie wchłaniania wody.",
     "mech; mszak; wchłanianie wody",
     True, False),
    ("ROZ", "Paprotniki", "Папороті", 121, "LEKCJA", 82,
     "II.5.3",
     "Uczeń przedstawia cechy budowy paprociowych, widłakowych i skrzypowych oraz ich znaczenie.",
     "paproć; widłak; skrzyp",
     True, False),
    ("ROZ", "Nagonasienne", "Голонасінні", 129, "LEKCJA", 87,
     "II.5.4",
     "Uczeń przedstawia cechy roślin nagonasiennych; rozpoznaje rodzime drzewa nagonasienne.",
     "nagonasienne; sosna; szyszka",
     True, False),
    ("ROZ", "Okrytonasienne", "Покритонасінні", 137, "LEKCJA", 91,
     "II.5.5",
     "Uczeń rozpoznaje organy roślin okrytonasiennej; rozróżnia formy morfologiczne (zielna, krzew, drzewo).",
     "okrytonasienne; kwiat; nasiono",
     True, False),
    ("ROZ", "Rozprzestrzenianie się roślin okrytonasiennych",
     "Поширення покритонасінних рослин", 143, "LEKCJA", 95,
     "II.5.5",
     "Uczeń przedstawia sposoby rozprzestrzeniania się nasion i adaptacje owoców.",
     "rozsiew; owoc; nasiono",
     True, False),
    ("ROZ", "Znaczenie i przegląd roślin okrytonasiennych",
     "Значення та огляд покритонасінних рослин", 148, "LEKCJA", 98,
     "II.5.5",
     "Uczeń przedstawia znaczenie roślin okrytonasiennych; rozpoznaje rodzime drzewa liściaste.",
     "okrytonasienne; drzewo liściaste",
     True, False),
    ("ROZ", "Podsumowanie — Różnorodność roślin", "Підсумок — Різноманіття рослин", 154, "POWTÓRZENIE", 101,
     "II.5.2–II.5.5",
     "Uczeń utrwala wiedzę z rozdziału V.",
     "powtórzenie",
     True, False),
    ("ROZ", "Wiesz czy nie wiesz? — dział V", "Чи знаєш ти? — розділ V", 158, "SPRAWDZIAN", 101,
     "II.5.2–II.5.5",
     "Uczeń wykazuje się wiedzą z rozdziału V — test samooceny z podręcznika.",
     "sprawdzian; test",
     True, False),
]

SECTION_BY_CODE = {s[0]: s for s in SECTIONS}
TOPICS: list[dict] = []
TOPIC_BY_KEY: dict[str, dict] = {}


def topic_code(section: str, order: int) -> str:
    return f"{SUBJECT_CODE}{SCHOOL_CLASS}-{section}-{order:03d}"


def lesson_type_for(topic_type: str) -> str:
    if topic_type == "POWTÓRZENIE":
        return "Review"
    if topic_type == "SPRAWDZIAN":
        return "Test"
    return "New Knowledge"


def stage_for(order: int, topic_type: str) -> str:
    if topic_type in ("POWTÓRZENIE", "SPRAWDZIAN"):
        return "Consolidated"
    if order <= 5:
        return "Introduced"
    if order <= 19:
        return "Developed"
    if order <= 25:
        return "Practiced"
    return "Mastered"


def build_topics() -> None:
    TOPICS.clear()
    TOPIC_BY_KEY.clear()
    if len(RAW) != TOPIC_COUNT:
        raise ValueError(f"Expected {TOPIC_COUNT} topics, got {len(RAW)}")
    for order, row in enumerate(RAW, start=1):
        (section, name_pl, name_ua, page, topic_type, zc_page, pp_code, pp_pl,
         terminology, requires_review, pu_verbatim) = row
        sec = SECTION_BY_CODE[section]
        key = topic_code(section, order)
        t = {
            "section": section,
            "section_name_pl": sec[1],
            "key": key,
            "name_pl": name_pl,
            "name_ua": name_ua,
            "page": page,
            "zc_page": zc_page,
            "topic_type": topic_type,
            "pp_code": pp_code,
            "pp_pl": pp_pl,
            "terminology": terminology,
            "requires_review": requires_review,
            "pu_verbatim": pu_verbatim,
            "curriculum_code": f"BIO5.{order:03d}",
            "stage": stage_for(order, topic_type),
            "lesson_type": lesson_type_for(topic_type),
            "prereq_keys": [],
            "next_keys": [],
        }
        TOPICS.append(t)
        TOPIC_BY_KEY[key] = t

    for i, t in enumerate(TOPICS):
        if i > 0:
            t["prereq_keys"] = [TOPICS[i - 1]["key"]]
        if i < len(TOPICS) - 1:
            t["next_keys"] = [TOPICS[i + 1]["key"]]


def sql_str(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def review_tag(t: dict) -> str:
    return " [REQUIRES_REVIEW]" if t["requires_review"] else ""


def topic_content(t: dict) -> dict[str, str]:
    pl, ua = t["name_pl"], t["name_ua"]
    dzial = t["section_name_pl"]
    tag = review_tag(t)

    desc_pl = (
        f"Rozdział „{dzial}” — Biologia kl. 5. Temat „{pl}” (podręcznik s. {t['page']}, "
        f"zeszyt ćwiczeń s. {t['zc_page']}){tag}. Typ: {t['topic_type']}."
    )
    if t["requires_review"]:
        desc_pl += f" {REVIEW_MSG}"

    desc_ua = (
        f"Розділ «{SECTION_BY_CODE[t['section']][2]}» — Біологія, 5 клас. "
        f"Тема «{ua}» (s. {t['page']}){tag}."
    )

    prereq_pl = (f"• {TOPIC_BY_KEY[k]['name_pl']}" for k in t["prereq_keys"])
    prereq_ua = (f"• {TOPIC_BY_KEY[k]['name_ua']}" for k in t["prereq_keys"])

    outcomes_pl = f"• {t['pp_pl']}\n• Kod programu (Puls życia): {t['pp_code']}."
    if t["pu_verbatim"]:
        outcomes_pl += "\n• Fragment treści potwierdzony w dostępnym podręczniku."
    if t["requires_review"]:
        outcomes_pl += f"\n• {REVIEW_MSG}"

    notes_pl = (
        f"Podręcznik Biologia kl. 5, s. {t['page']}. "
        f"Zeszyt ćwiczeń s. {t['zc_page']}. "
        f"Program PP: {t['pp_code']}. {REVIEW_MSG if t['requires_review'] else ''}"
    )

    meth_pl = (
        "Metodyka biologii (II etap): obserwacja / doświadczenie → analiza → ćwiczenia. "
        f"Zeszyt ćwiczeń s. {t['zc_page']}."
    )
    if not t["pu_verbatim"]:
        meth_pl += f" Scenariusz szczegółowy — {REVIEW_MSG}"

    return {
        "description_pl": desc_pl,
        "description_ua": desc_ua,
        "prerequisites_pl": "\n".join(prereq_pl) if t["prereq_keys"] else "• Wiedza z klasy 4 w zakresie przyrody",
        "prerequisites_ua": "\n".join(prereq_ua) if t["prereq_keys"] else "• Знання з 4 класу з природознавства",
        "outcomes_pl": outcomes_pl,
        "outcomes_ua": outcomes_pl.replace("Kod programu", "Код програми"),
        "terminology_pl": t["terminology"],
        "terminology_ua": t["terminology"],
        "methodology_pl": meth_pl,
        "methodology_ua": "Методика біології (II етап): спостереження → досвід → вправи.",
        "notes_pl": notes_pl,
        "notes_ua": f"Підручник s. {t['page']}. Зошит вправ s. {t['zc_page']}. PP: {t['pp_code']}.",
    }


def scenario_pl_for(t: dict) -> str:
    pl = t["name_pl"]
    page = t["page"]
    zc = t["zc_page"]

    if t["topic_type"] == "SPRAWDZIAN":
        return (
            f"Test samooceny „Wiesz czy nie wiesz?” — rozdział „{t['section_name_pl']}” "
            f"(podręcznik s. {page}). Zeszyt ćwiczeń: Sprawdź, czy potrafisz (s. {zc})."
        )
    if t["topic_type"] == "POWTÓRZENIE":
        return (
            f"Powtórzenie rozdziału „{t['section_name_pl']}” (podręcznik s. {page}). "
            f"Zeszyt ćwiczeń s. {zc}. {REVIEW_MSG}"
        )
    if t["pu_verbatim"]:
        return (
            f"Realizacja tematu „{pl}” wg podręcznika s. {page} "
            f"i zeszytu ćwiczeń s. {zc}. "
            f"Wymagania programu: {t['pp_code']}."
        )
    return (
        f"Szkic lekcji „{pl}” — podręcznik s. {page}, zeszyt ćwiczeń s. {zc}. "
        f"Program PP: {t['pp_code']}. {REVIEW_MSG}"
    )


def lesson_status_for(t: dict) -> str:
    return "REQUIRES_REVIEW" if t["requires_review"] else "Draft"


def lesson_for(t: dict, num: int) -> str:
    c = topic_content(t)
    code = f"BIO5-L{num:03d}"
    pl, ua = t["name_pl"], t["name_ua"]
    scen = scenario_pl_for(t)
    status = lesson_status_for(t)
    teacher_notes = REVIEW_MSG if t["requires_review"] else ""

    if t["topic_type"] == "SPRAWDZIAN":
        assess = f"Test „Wiesz czy nie wiesz?” — rozdział „{t['section_name_pl']}” (s. {t['page']})."
        hw = f"Zeszyt ćwiczeń s. {t['zc_page']} — przygotowanie do omówienia testu."
    elif t["topic_type"] == "POWTÓRZENIE":
        assess = "Samoocena; zeszyt ćwiczeń — Sprawdź, czy potrafisz."
        hw = f"Powtórzenie — podręcznik s. {t['page']}."
    else:
        assess = f"Zeszyt ćwiczeń s. {t['zc_page']}; obserwacja pracy ucznia."
        hw = f"Zadania z zeszytu ćwiczeń s. {t['zc_page']}."

    return f"""
INSERT OR IGNORE INTO Lessons (code, subject_id, school_class, lesson_type, duration,
  title_pl, title_ua, goal_pl, goal_ua,
  learning_results_pl, learning_results_ua,
  terminology_pl, terminology_ua,
  scenario_pl, scenario_ua,
  homework_pl, homework_ua,
  assessment_pl, assessment_ua,
  teacher_notes_pl, teacher_notes_ua,
  author, version, status, is_active)
SELECT
  {sql_str(code)}, sub.id, {SCHOOL_CLASS}, {sql_str(t['lesson_type'])}, 45,
  {sql_str(pl)}, {sql_str(ua)},
  {sql_str(f'Uczeń realizuje temat „{pl}” zgodnie z programem PP ({t["pp_code"]}).')},
  {sql_str(f'Учень реалізує тему «{ua}» згідно з програмою PP ({t["pp_code"]}).')},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(scen)}, {sql_str(scen)},
  {sql_str(hw)}, {sql_str(hw)},
  {sql_str(assess)}, {sql_str(assess)},
  {sql_str(teacher_notes)}, {sql_str(teacher_notes)},
  'EduMost', '1.0', {sql_str(status)}, 1
FROM Subjects sub WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Lessons WHERE code = {sql_str(code)});"""


def generate_sql() -> str:
    build_topics()
    lines = [
        "-- EduMost Studio: Biologia Klasa 5 — Puls życia 5 (wariant C, 33 tematy)",
        "-- Generated by scripts/generate-klasa5-biologia-curriculum.py",
        f"-- {TEXTBOOK}",
        f"-- Subject: BIO, {TOPIC_COUNT} topics, display_order 1–{TOPIC_COUNT}",
        f"-- REQUIRES_REVIEW: {sum(1 for t in TOPICS if t['requires_review'])} tematów",
        "",
        "BEGIN TRANSACTION;",
        "",
        "-- Subject Biologia (jeśli brak w bazie)",
        """
INSERT OR IGNORE INTO Subjects (code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT 'BIO', 'Biologia', 'Біологія',
  'Nauka o organizmach żywych i ich funkcjonowaniu.', 'Наука про живі організми та їх функціонування.',
  COALESCE((SELECT MAX(display_order) FROM Subjects), 0) + 1, 1
WHERE NOT EXISTS (SELECT 1 FROM Subjects WHERE code = 'BIO');""",
    ]

    lines.append("\n-- Sections (5 rozdziałów podręcznika)")
    for code, pl, ua, dpl, dua, order in SECTIONS:
        lines.append(f"""
INSERT OR IGNORE INTO Sections (subject_id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT sub.id, {sql_str(code)}, {sql_str(pl)}, {sql_str(ua)}, {sql_str(dpl)}, {sql_str(dua)}, {order}, 1
FROM Subjects sub WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Sections WHERE subject_id = sub.id AND code = {sql_str(code)});""")

    lines.append("\n-- Topics")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
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
  {order_idx}, 1
FROM Subjects sub
INNER JOIN Sections s ON s.subject_id = sub.id AND s.code = {sql_str(t['section'])}
WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Topics WHERE code = {sql_str(t['key'])});""")

    lines.append("\n-- Curriculum (school_class = 5)")
    for order_idx, t in enumerate(TOPICS, start=1):
        c = topic_content(t)
        lines.append(f"""
INSERT OR IGNORE INTO Curriculum (topic_id, school_class, learning_stage, curriculum_code, curriculum_pl, notes_pl, notes_ua, display_order, is_active)
SELECT t.id, {SCHOOL_CLASS}, {sql_str(t['stage'])}, {sql_str(t['curriculum_code'])},
  {sql_str(t['pp_pl'])}, {sql_str(c['notes_pl'])}, {sql_str(c['notes_ua'])}, {order_idx}, 1
FROM Topics t WHERE t.code = {sql_str(t['key'])}
  AND NOT EXISTS (SELECT 1 FROM Curriculum c WHERE c.topic_id = t.id AND c.school_class = {SCHOOL_CLASS});""")

    lines.append("\n-- TopicRelations (PREREQUISITE + NEXT chain)")
    for t in TOPICS:
        for rt, keys in [("PREREQUISITE", t["prereq_keys"]), ("NEXT", t["next_keys"])]:
            for j, rk in enumerate(keys):
                desc_pl = {
                    "PREREQUISITE": "Wymagane wcześniejsze opanowanie (kolejność podręcznika).",
                    "NEXT": "Następny temat wg spisu treści podręcznika.",
                }[rt]
                desc_ua = {
                    "PREREQUISITE": "Потрібне попереднє опанування (порядок підручника).",
                    "NEXT": "Наступна тема згідно зі змістом підручника.",
                }[rt]
                lines.append(f"""
INSERT OR IGNORE INTO TopicRelations (topic_id, related_topic_id, relation_type, description_pl, description_ua, display_order, is_active)
SELECT src.id, tgt.id, {sql_str(rt)}, {sql_str(desc_pl)}, {sql_str(desc_ua)}, {j + 1}, 1
FROM Topics src, Topics tgt
WHERE src.code = {sql_str(t['key'])} AND tgt.code = {sql_str(rk)}
  AND NOT EXISTS (
    SELECT 1 FROM TopicRelations tr
    WHERE tr.topic_id = src.id AND tr.related_topic_id = tgt.id AND tr.relation_type = {sql_str(rt)}
  );""")

    lines.append("\n-- Lessons + LessonTopics")
    lesson_links: list[tuple[str, str]] = []
    for i, t in enumerate(TOPICS, start=1):
        lines.append(lesson_for(t, i))
        lesson_links.append((f"BIO5-L{i:03d}", t["key"]))

    for lcode, tkey in lesson_links:
        lines.append(f"""
INSERT OR IGNORE INTO LessonTopics (lesson_id, topic_id, is_primary, display_order)
SELECT l.id, t.id, 1, 1
FROM Lessons l, Topics t
WHERE l.code = {sql_str(lcode)} AND t.code = {sql_str(tkey)}
  AND NOT EXISTS (SELECT 1 FROM LessonTopics lt WHERE lt.lesson_id = l.id AND lt.topic_id = t.id);""")

    lines.append("\nCOMMIT;")
    return "\n".join(lines)


def write_seed() -> Path:
    build_topics()
    sql = generate_sql()
    OUTPUT.write_text(sql, encoding="utf-8")
    return OUTPUT


def main() -> None:
    import sys

    if "--write" in sys.argv:
        path = write_seed()
        print(f"Zapisano: {path}")
        print(f"Rozmiar: {path.stat().st_size:,} bajtów")
        print(f"Tematy: {TOPIC_COUNT}, REQUIRES_REVIEW: {sum(1 for t in TOPICS if t['requires_review'])}")
        return
    build_topics()
    print(f"BIO5 — {TOPIC_COUNT} tematów, {len(SECTIONS)} sekcji")
    print(f"Pierwszy: {TOPICS[0]['key']} — {TOPICS[0]['name_pl']}")
    print(f"Ostatni:  {TOPICS[-1]['key']} — {TOPICS[-1]['name_pl']}")


if __name__ == "__main__":
    main()
