#!/usr/bin/env python3
"""Generate seed_klasa5_historia.sql — Historia Klasa 5 (Nowa Era „Wczoraj i dziś 5”).

ISBN 978-83-267-3300-0 — 52 topics (wariant C), display_order 1–52.
"""

from __future__ import annotations

from pathlib import Path

OUTPUT = (
    Path(__file__).resolve().parent.parent
    / "electron/database/seed/seed_klasa5_historia.sql"
)

SUBJECT_ID = 5
SUBJECT_CODE = "HIST"
SCHOOL_CLASS = 5
TOPIC_COUNT = 52
TEXTBOOK = "Nowa Era Wczoraj i dziś 5 (2018), ISBN 978-83-267-3300-0"

SECTIONS = [
    ("PRE", "Pierwsze cywilizacje", "Перші цивілізації",
     "Rozdział I podręcznika — prehistoria i starożytne cywilizacje Bliskiego Wschodu i Dalekiego Wschodu.",
     "Розділ I підручника — доісторія та стародавні цивілізації Близького та Далекого Сходу.", 1),
    ("GRE", "Starożytna Grecja", "Стародавня Греція",
     "Rozdział II — demokracja ateńska, Sparta, mitologia i kultura grecka.",
     "Розділ II — афінська демократія, Спарта, міфологія та грецька культура.", 2),
    ("RZM", "Starożytny Rzym", "Стародавній Рим",
     "Rozdział III — ustrój, imperium, życie codzienne i dziedzictwo Rzymu.",
     "Розділ III — устрій, імперія, повсякденне життя та спадщина Риму.", 3),
    ("PSM", "Początki średniowiecza", "Початки середньовіччя",
     "Rozdział IV — Bizancjum, islam, nowe państwa europejskie, krucjaty.",
     "Розділ IV — Візантія, іслам, нові європейські держави, хрестові походи.", 4),
    ("SPO", "Społeczeństwo średniowiecza", "Суспільство середньовіччя",
     "Rozdział V — feudalizm, rycerstwo, miasto, Kościół i sztuka.",
     "Розділ V — феодалізм, лицарство, місто, Церква та мистецтво.", 5),
    ("PIA", "Polska pierwszych Piastów", "Польща перших П'ятів",
     "Rozdział VI — początki państwa polskiego i społeczeństwo Piastów.",
     "Розділ VI — початки польської держави та суспільство П'ятів.", 6),
    ("PLT", "Polska w XIII–XV wieku", "Польща в XIII–XV ст.",
     "Rozdział VII — rozbicie dzielnicowe, zjednoczenie, Jagiellonowie, monarchia stanowa.",
     "Розділ VII — роздробленість, об'єднання, Ягеллони, станова монархія.", 7),
]

# (section, name_pl, name_ua, page, topic_type, difficulty, has_scenario, pp_code, pp_pl, terminology, key_dates)
RAW: list[tuple] = [
    ("PRE", "Życie pierwszych ludzi", "Життя перших людей", 8, "HISTORIA", 2, False,
     "I.1", "Uczeń porównuje koczownictwo i osiadłość; wyjaśnia rewolucję neolityczną; opisuje epoki kamienia, brązu i żelaza.",
     "koczownictwo; rewolucja neolityczna; epoka kamienia; epoka brązu; epoka żelaza",
     "~10 000 p.n.e. (rolnictwo); ~1200 p.n.e. (epoka żelaza)"),
    ("PRE", "Miasta-państwa Mezopotamii", "Міста-держави Месopotamії", 14, "HISTORIA", 2, False,
     "I.2–I.5", "Uczeń wskazuje Mezopotamii na mapie; opisuje rolę rzek; strukturę społeczną; osiągnięcia; Kodeks Hammurabiego.",
     "Mezopotamia; zikkurat; politeizm; kodeks Hammurabiego; nawadnianie",
     "~4000 p.n.e. (pismo); II tys. p.n.e. (Hammurabi)"),
    ("PRE", "W Egipcie faraonów", "В Єгипті фараонів", 20, "HISTORIA", 2, True,
     "I.2–I.5", "Uczeń opisuje warunki naturalne Nilu; władzę faraona; społeczeństwo; wierzenia; mumifikację i piramidy.",
     "faraon; Nil; hieroglify; mumia; piramida; politeizm",
     "~3000 p.n.e. (państwo egipskie)"),
    ("PRE", "W starożytnym Izraelu", "В стародавньому Ізраїлі", 26, "HISTORIA", 3, False,
     "I.2–I.3", "Uczeń wskazuje Palestynę na mapie; opisuje dzieje narodu żydowskiego; judaizm; monoteizm.",
     "monoteizm; judaizm; Jahwe; Dekalog; Tora; Mesjasz",
     "X w. p.n.e. (Salomon — orientacyjnie)"),
    ("PRE", "Cywilizacje Indii i Chin", "Цивілізації Індії та Китаю", 30, "HISTORIA", 3, True,
     "I.2; I.5", "Uczeń wskazuje Daleki Wschód na mapie; opisuje kasty; cesarzy chińskich; osiągnięcia cywilizacji.",
     "Daleki Wschód; kasta; cesarz; Indus; Huang He",
     ""),
    ("PRE", "Od hieroglifów do alfabetu", "Від ієrogліфів до алфавіту", 35, "KULTURA", 3, False,
     "I.5", "Uczeń rozpoznaje rodzaje pisma; przypisuje je do cywilizacji; wyjaśnia znaczenie wynalezienia pisma.",
     "piktogram; pismo klinowe; hieroglify; alfabet; Fenicjanie",
     "~4000 p.n.e. (pismo)"),
    ("PRE", "Podsumowanie — Pierwsze cywilizacje", "Підсумок — Перші цивілізації", 36, "POWTÓRZENIE", 2, False,
     "I.1–I.5", "Uczeń utrwala wiedzę z rozdziału I — pierwsze cywilizacje i prehistoria.",
     "powtórzenie; cywilizacja; chronologia",
     ""),
    ("PRE", "Sprawdzian — Pierwsze cywilizacje", "Перевірка — Перші цивілізації", 37, "SPRAWDZIAN", 2, False,
     "I.1–I.5", "Uczeń wykazuje się wiedzą z rozdziału I — test podsumowujący (KN wersja A/B).",
     "sprawdzian; test",
     ""),
    ("GRE", "Demokratyczne Ateny", "Демократичні Афіни", 40, "HISTORIA", 3, False,
     "I.4", "Uczeń opisuje ustrój Aten; demokrację; rolę obywateli; porównuje z innymi formami władzy.",
     "demokracja; ateński obywatel; ekklesia; strateg; polis",
     "490 p.n.e.; 480 p.n.e. (wojny z Persami)"),
    ("GRE", "Sparta i wojny z Persami", "Спарта та війни з персами", 44, "HISTORIA", 3, False,
     "I.2; I.4", "Uczeń opisuje ustrój Sparty; wojny grecko-perskie; bitwy Maraton, Termopile, Salamina.",
     "Sparta; helot; hoplita; Persja; Maraton; Termopile",
     "490 p.n.e.; 480 p.n.e."),
    ("GRE", "Bogowie i mity", "Боги та міфи", 48, "KULTURA", 2, True,
     "I.3; I.5", "Uczeń opisuje panteon grecki; mity; wpływ mitologii na kulturę.",
     "Olimp; Zeus; mit; heroizacja; teatr",
     ""),
    ("GRE", "Kultura starożytnej Grecji", "Культура стародavньої Греції", 52, "KULTURA", 3, False,
     "I.5", "Uczeń wymienia osiągnięcia kultury greckiej: filozofia, teatr, architektura, sport.",
     "filozofia; teatr; olimpijada; kolumny; demokracja",
     ""),
    ("GRE", "Imperium Aleksandra Wielkiego", "Імперія Олександра Македонського", 58, "HISTORIA", 4, False,
     "I.2; I.4", "Uczeń opisuje podboje Aleksandra; hellenizację; mapę imperium.",
     "Aleksander Wielki; hellenizacja; Macedonia; imperium",
     "IV w. p.n.e."),
    ("GRE", "Podsumowanie — Starożytna Grecja", "Підсумок — Стародавня Греція", 64, "POWTÓRZENIE", 3, True,
     "I.1–I.5", "Uczeń utrwala wiedzę z rozdziału II — lekcja powtórzeniowa (scenariusz KN).",
     "powtórzenie; Grecja",
     ""),
    ("GRE", "Sprawdzian — Starożytna Grecja", "Перевірка — Стародавня Греція", 66, "SPRAWDZIAN", 3, False,
     "I.1–I.5", "Uczeń wykazuje się wiedzą z rozdziału II — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
    ("RZM", "Ustrój starożytnego Rzymu", "Устрій стародavнього Риму", 68, "HISTORIA", 3, False,
     "I.4", "Uczeń opisuje legendę o założeniu Rzymu; monarchię, republikę, pryncypat; urzędy rzymskie.",
     "patrycjusz; plebejusz; senat; konsul; pryncypat",
     "753 p.n.e.; 44 p.n.e. (Cezar)"),
    ("RZM", "Imperium Rzymskie", "Римська імперія", 72, "HISTORIA", 3, False,
     "I.2; I.4", "Uczeń opisuje podboje Rzymu; prowincje; romanizację; pax Romana; podział imperium.",
     "legion; prowincja; romanizacja; pax Romana; Konstantynopol",
     ""),
    ("RZM", "Życie w Wiecznym Mieście", "Життя у Вічному Місті", 76, "ŹRÓDŁA", 3, True,
     "I.3–I.4", "Uczeń opisuje społeczeństwo rzymskie; życie codzienne; Pompeje i Herkulanum jako źródła.",
     "niewolnik; wyzwoleńiec; willa; gladiator; Panteon",
     ""),
    ("RZM", "Dokonania starożytnych Rzymian", "Досягнення стародavніх римлян", 82, "KULTURA", 3, True,
     "I.5", "Uczeń wymienia osiągnięcia Rzymian: drogi, architektura, prawo, wpływ na Europę.",
     "akwedukt; Koloseum; Forum Romanum; kodeks; bazylika",
     ""),
    ("RZM", "Początki chrześcijaństwa", "Початки християнства", 88, "HISTORIA", 4, False,
     "I.3; I.6", "Uczeń opisuje początki chrześcijaństwa; edykt mediolański; upadek Cesarstwa Zachodniego.",
     "Mesjasz; Ewangelia; Biblia; papież; barbarzyńcy",
     "313; 476"),
    ("RZM", "Podsumowanie — Starożytny Rzym", "Підсумок — Стародavній Рим", 94, "POWTÓRZENIE", 3, False,
     "I.1–I.6", "Uczeń utrwala wiedzę z rozdziału III.",
     "powtórzenie; Rzym",
     ""),
    ("RZM", "Sprawdzian — Starożytny Rzym", "Перевірка — Стародavній Рим", 96, "SPRAWDZIAN", 3, False,
     "I.1–I.6", "Uczeń wykazuje się wiedzą z rozdziału III — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
    ("PSM", "Bizancjum w czasach świetności", "Візантія в часи розквіту", 104, "HISTORIA", 3, False,
     "II.2", "Uczeń opisuje Bizancjum; Kodeks Justyniana; kulturę bizantyjską.",
     "Bizancjum; Kodeks Justyniana; ikona; patriarchat",
     "VI w. (Justynian)"),
    ("PSM", "Arabiowie i początki islamu", "Араби та початки ісламу", 110, "HISTORIA", 3, True,
     "II.1", "Uczeń opisuje powstanie islamu; pięć filarów; ekspansję arabską.",
     "Koran; meczet; kalif; dżihad; hidra",
     "622 (hidra)"),
    ("PSM", "Nowe państwa w Europie", "Нові держави в Європі", 116, "HISTORIA", 3, False,
     "III.1–III.2", "Uczeń opisuje państwo Franków; Karola Wielkiego; podział imperium; Rzeszę.",
     "Frankowie; Karol Wielki; Verdun; Rzesza",
     "800; 843; 962"),
    ("PSM", "Konflikt papiestwa z cesarstwem", "Конфлікт папства з імперією", 122, "HISTORIA", 4, False,
     "III.3", "Uczeń opisuje spór o inwestyturę; schizmę; konkordat wormacki.",
     "schizma; inwestytura; ekskomunika; konkordat",
     "1054; 1077; 1122"),
    ("PSM", "Wyprawy krzyżowe", "Хрестові походи", 128, "HISTORIA", 4, True,
     "III.4", "Uczeń opisuje przyczyny, przebieg i skutki krucjat; Królestwo Jerozolimskie.",
     "krucjata; zakon rycerski; Królestwo Jerozolimskie; Levant",
     "1096; 1291"),
    ("PSM", "Podsumowanie — Początki średniowiecza", "Підсумок — Початки середньовіччя", 130, "POWTÓRZENIE", 3, False,
     "II.1–III.4", "Uczeń utrwala wiedzę z rozdziału IV.",
     "powtórzenie; średniowiecze",
     ""),
    ("PSM", "Sprawdzian — Początki średniowiecza", "Перевірка — Початки середньовіччя", 132, "SPRAWDZIAN", 3, False,
     "II.1–III.4", "Uczeń wykazuje się wiedzą z rozdziału IV — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
    ("SPO", "System feudalny", "Система феодалізму", 134, "HISTORIA", 3, True,
     "IV.1", "Uczeń opisuje lenno, seniora, wasala; diagram feudalizmu.",
     "lenno; senior; wasal; stan; suweren",
     ""),
    ("SPO", "Epoka rycerzy", "Епоха лицарів", 138, "KULTURA", 3, False,
     "IV.2–IV.3", "Uczeń opisuje drogę giermka do rycerstwa; uzbrojenie; ład rycerski.",
     "giermek; pasowanie; herb; turniej; łada rycerska",
     ""),
    ("SPO", "Średniowieczne miasto i wieś", "Середньovічне місто і село", 142, "HISTORIA", 3, False,
     "IV.2", "Uczeń opisuje lokację miast; cechy; pańszczyznę; trójpolówkę.",
     "lokacja; cech; wójt; pańszczyzna; trójpolówka",
     ""),
    ("SPO", "Kościół w średniowieczu", "Церква в середньовіччі", 146, "HISTORIA", 3, False,
     "IV.4", "Uczeń opisuje rolę Kościoła; zakony; uniwersytety; scholastykę.",
     "zakon; reguła; uniwersytet; scholastyka; skryptorium",
     ""),
    ("SPO", "Sztuka średniowiecza", "Мистецтво середньовіччя", 150, "KULTURA", 3, True,
     "IV.3–IV.4", "Uczeń porównuje sztukę romańską i gotycką; przykłady z Polski.",
     "romański; gotyk; witraż; katedra",
     ""),
    ("SPO", "Podsumowanie — Społeczeństwo średniowiecza", "Підсумок — Суспільство середньовіччя", 156, "POWTÓRZENIE", 3, False,
     "IV.1–IV.4", "Uczeń utrwala wiedzę z rozdziału V.",
     "powtórzenie; feudalizm",
     ""),
    ("SPO", "Sprawdzian — Społeczeństwo średniowiecza", "Перевірка — Суспільство середньовіччя", 158, "SPRAWDZIAN", 3, False,
     "IV.1–IV.4", "Uczeń wykazuje się wiedzą z rozdziału V — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
    ("PIA", "Zanim powstała Polska", "Перед утворенням Польщі", 160, "HISTORIA", 2, False,
     "V.1", "Uczeń opisuje osadnictwo słowiańskie; Biskupin; plemiona polskie.",
     "Biskupin; kurhan; plemię; Wiślanie; Polanie",
     ""),
    ("PIA", "Mieszko I i początki Polski", "Мешко I та початки Польщі", 164, "HISTORIA", 3, True,
     "V.1–V.2", "Uczeń opisuje dzieło Mieszka I; chrzest Polski; Dagome iudex.",
     "Mieszko I; chrzest; Dagome iudex; gród",
     "966"),
    ("PIA", "Polska Bolesława Chrobrego", "Польща Болеслава Храброго", 170, "HISTORIA", 4, True,
     "V.3", "Uczeń opisuje rządy Bolesława Chrobrego; zjazd gnieźnieński; koronację.",
     "Bolesław Chrobry; koronacja; zjazd gnieźnieński",
     "1000; 1025"),
    ("PIA", "Kryzys i odbudowa państwa polskiego", "Криза та відновлення польської держави", 176, "HISTORIA", 4, False,
     "V.3–V.4", "Uczeń opisuje kryzys monarchii; rządy Kazimierza Odnowiciela; koronację Bolesława Śmiałego.",
     "Odnowiciel; koronacja; biskup Stanisław",
     ""),
    ("PIA", "Rządy Bolesława Krzywoustego", "Правління Болеслава Кривоустого", 180, "HISTORIA", 4, False,
     "V.5", "Uczeń opisuje statut Krzywoustego; zasadę senioratu; podział dzielnicowy.",
     "seniorat; junior; statut; dzielnica",
     "1109; 1138"),
    ("PIA", "Społeczeństwo w czasach pierwszych Piastów", "Суспільство за часів перших П'ятів", 184, "HISTORIA", 3, False,
     "V.6", "Uczeń opisuje strukturę społeczeństwa: podgrodzie, danina, drużyna.",
     "podgrodzie; danina; drużyna; osada służebna",
     ""),
    ("PIA", "Podsumowanie — Polska pierwszych Piastów", "Підсумок — Польща перших П'ятів", 188, "POWTÓRZENIE", 3, False,
     "V.1–V.6", "Uczeń utrwala wiedzę z rozdziału VI.",
     "powtórzenie; Piastowie",
     ""),
    ("PIA", "Sprawdzian — Polska pierwszych Piastów", "Перевірка — Польща перших П'ятів", 190, "SPRAWDZIAN", 3, False,
     "V.1–V.6", "Uczeń wykazuje się wiedzą z rozdziału VI — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
    ("PLT", "Rozbicie dzielnicowe", "Роздробленість", 192, "HISTORIA", 4, False,
     "VI.1–VI.4", "Uczeń opisuje rozbicie dzielnicowe; najazd mongolski; zakon krzyżacki.",
     "dzielnica; Tatarzy; Krzyżacy; Malbork",
     "1226; 1241"),
    ("PLT", "Zjednoczenie Polski", "Об'єднання Польщі", 198, "HISTORIA", 4, True,
     "VI.5", "Uczeń opisuje zjednoczenie przez Władysława Łokietka; koronację; bitwę pod Płowcami.",
     "Łokietek; zjednoczenie; koronacja; Płowce",
     "1320; 1331"),
    ("PLT", "Czasy Kazimierza Wielkiego", "Часи Казimira Великого", 204, "HISTORIA", 4, False,
     "VII.1–VII.2", "Uczeń opisuje rządy Kazimierza Wielkiego; rozwój miast; Akademię Krakowską.",
     "Kazimierz Wielki; Orle Gniazda; Akademia Krakowska",
     "1333; 1364"),
    ("PLT", "Unia polsko-litewska", "Польсько-литовська унія", 210, "HISTORIA", 5, True,
     "VII.4", "Uczeń opisuje unię w Krewie; bitwę pod Grunwaldem; wspólną politykę.",
     "unia; Krewa; Grunwald; Jagiellonowie",
     "1385; 1410"),
    ("PLT", "Czasy świetności dynastii Jagiellonów", "Часи розквіту династії Ягеллонів", 216, "HISTORIA", 4, False,
     "VII.5–VII.6", "Uczeń opisuje rządy Jagiellonów; wojnę trzynastoletnią; rozwój kultury.",
     "Jagiellonowie; wojna trzynastoletnia; Toruń",
     "1410; 1466"),
    ("PLT", "Monarchia stanowa w Polsce", "Станова монархія в Польщі", 222, "HISTORIA", 5, False,
     "VII.7", "Uczeń opisuje sejm; nihil novi; rolę szlachty w państwie.",
     "nihil novi; sejm; szlachta; przywilej koszycki",
     "1505"),
    ("PLT", "Podsumowanie — Polska XIII–XV w.", "Підсумок — Польща XIII–XV ст.", 226, "POWTÓRZENIE", 4, False,
     "VI.1–VII.7", "Uczeń utrwala wiedzę z rozdziału VII.",
     "powtórzenie; Jagiellonowie",
     ""),
    ("PLT", "Sprawdzian — Polska XIII–XV w.", "Перевірка — Польща XIII–XV ст.", 228, "SPRAWDZIAN", 4, False,
     "VI.1–VII.7", "Uczeń wykazuje się wiedzą z rozdziału VII — test KN wersja A/B.",
     "sprawdzian; test",
     ""),
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
    if order == 1:
        return "Introduced"
    if order <= 20:
        return "Developed"
    if order <= 40:
        return "Practiced"
    return "Mastered"


def build_topics() -> None:
    TOPICS.clear()
    TOPIC_BY_KEY.clear()
    if len(RAW) != TOPIC_COUNT:
        raise ValueError(f"Expected {TOPIC_COUNT} topics, got {len(RAW)}")
    for order, row in enumerate(RAW, start=1):
        (section, name_pl, name_ua, page, topic_type, difficulty,
         has_scenario, pp_code, pp_pl, terminology, key_dates) = row
        sec = SECTION_BY_CODE[section]
        key = topic_code(section, order)
        t = {
            "section": section,
            "section_name_pl": sec[1],
            "key": key,
            "name_pl": name_pl,
            "name_ua": name_ua,
            "page": page,
            "topic_type": topic_type,
            "difficulty": difficulty,
            "has_scenario": has_scenario,
            "pp_code": pp_code,
            "pp_pl": pp_pl,
            "terminology": terminology,
            "key_dates": key_dates,
            "curriculum_code": f"HIST5.{order:03d}",
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


def topic_content(t: dict) -> dict[str, str]:
    pl, ua = t["name_pl"], t["name_ua"]
    dzial = t["section_name_pl"]
    scenario_note = " [SCENARIUSZ KN]" if t["has_scenario"] else ""

    desc_pl = (
        f"Rozdział „{dzial}” — Historia kl. 5. Temat „{pl}” (s. {t['page']})"
        f"{scenario_note}. Typ: {t['topic_type']}. Trudność: {t['difficulty']}/5."
    )
    desc_ua = (
        f"Розділ «{SECTION_BY_CODE[t['section']][2]}» — Історія, 5 клас. "
        f"Тема «{ua}» (s. {t['page']}){scenario_note}. Тип: {t['topic_type']}."
    )
    prereq_pl = (f"• {TOPIC_BY_KEY[k]['name_pl']}" for k in t["prereq_keys"])
    prereq_ua = (f"• {TOPIC_BY_KEY[k]['name_ua']}" for k in t["prereq_keys"])

    outcomes_pl = f"• {t['pp_pl']}\n• Kod PP: {t['pp_code']}.\n• Typ tematu: {t['topic_type']}."
    if t["key_dates"]:
        outcomes_pl += f"\n• Daty kluczowe: {t['key_dates']}."

    outcomes_ua = (
        f"• {t['pp_pl']}\n• Код PP: {t['pp_code']}.\n• Тип теми: {t['topic_type']}."
    )

    notes_pl = (
        f"Podręcznik Historia kl. 5, s. {t['page']}. "
        f"Dział: {dzial}. PP: {t['pp_code']}."
    )
    if t["key_dates"]:
        notes_pl += f" Daty: {t['key_dates']}."
    notes_pl += f" Kolejność: {t['key'].split('-')[-1]}."

    meth_pl = (
        "Metodyka historii (II etap): tekst przewodni → mapa → źródła → ćwiczenia. "
        "Praca indywidualna i w grupach."
    )
    if t["has_scenario"]:
        meth_pl = (
            "Scenariusz KN: burza mózgów, mapa myśli, praca w grupach, infografika, "
            "analiza źródeł — zgodnie z książką nauczyciela."
        )

    return {
        "description_pl": desc_pl,
        "description_ua": desc_ua,
        "prerequisites_pl": "\n".join(prereq_pl) if t["prereq_keys"] else "• Wiedza z klasy 4 w zakresie historii",
        "prerequisites_ua": "\n".join(prereq_ua) if t["prereq_keys"] else "• Знання з 4 класу з історії",
        "outcomes_pl": outcomes_pl,
        "outcomes_ua": outcomes_ua,
        "terminology_pl": t["terminology"],
        "terminology_ua": t["terminology"],
        "methodology_pl": meth_pl,
        "methodology_ua": "Методика історії (II етап): текст → карта → джерела → вправи.",
        "notes_pl": notes_pl,
        "notes_ua": f"Підручник Історія 5 клас, s. {t['page']}. PP: {t['pp_code']}.",
    }


def scenario_pl_for(t: dict) -> str:
    pl = t["name_pl"]
    page = t["page"]
    if t["has_scenario"]:
        return (
            f"I. WPROWADZENIE (10 min)\n"
            f"Aktywizacja wiedzy — temat „{pl}”. Tekst przewodni (podręcznik s. {page}).\n\n"
            f"II. GŁÓWNA CZĘŚĆ (25 min)\n"
            f"Scenariusz KN: burza mózgów / mapa myśli / praca w grupach.\n"
            f"Realizacja wymagań PP ({t['pp_code']}).\n\n"
            f"III. ĆWICZENIA (10 min)\n"
            f"Karta pracy KN (jeśli dostępna) + ćwiczenia z podręcznika.\n\n"
            f"IV. PODSUMOWANIE (5 min)\n"
            f"Refleksja: {t['pp_pl'][:120]}…"
        )
    if t["topic_type"] == "POWTÓRZENIE":
        return (
            f"I. WPROWADZENIE (5 min)\n"
            f"Cel: powtórzenie rozdziału „{t['section_name_pl']}”.\n\n"
            f"II. POWTÓRZENIE (30 min)\n"
            f"Ranking diamentowy / mapa myśli / zadania „Sprawdź się” (s. {page}).\n\n"
            f"III. PRZYGOTOWANIE DO TESTU (10 min)\n"
            f"Omówienie typowych pytań.\n\n"
            f"IV. PODSUMOWANIE (5 min)\n"
            f"Samokontrola wymagań PP: {t['pp_code']}."
        )
    if t["topic_type"] == "SPRAWDZIAN":
        return (
            f"I. INSTRUKCJA (5 min)\n"
            f"Test podsumowujący rozdział „{t['section_name_pl']}” (KN wersja A/B).\n\n"
            f"II. TEST (35 min)\n"
            f"Praca pisemna — weryfikacja wymagań PP: {t['pp_code']}.\n\n"
            f"III. ODDANIE PRAC (5 min)\n\n"
            f"IV. OMÓWIENIE (opcjonalnie, następna lekcja)"
        )
    return (
        f"I. WPROWADZENIE (10 min)\n"
        f"Temat: {pl}. Tekst przewodni, s. {page}.\n\n"
        f"II. GŁÓWNA CZĘŚĆ (25 min)\n"
        f"Praca z podręcznikiem i mapą — PP {t['pp_code']}.\n\n"
        f"III. ĆWICZENIA (10 min)\n"
        f"Zadania utrwalające z podręcznika.\n\n"
        f"IV. PODSUMOWANIE (5 min)\n"
        f"Refleksja: kluczowe pojęcia — {t['terminology'][:80]}…"
    )


def lesson_for(t: dict, num: int) -> str:
    c = topic_content(t)
    code = f"HIST5-L{num:03d}"
    pl, ua = t["name_pl"], t["name_ua"]
    scen = scenario_pl_for(t)

    if t["topic_type"] == "SPRAWDZIAN":
        assess = f"Test KN wersja A/B — rozdział „{t['section_name_pl']}”."
        hw = "Przygotowanie do omówienia testu (jeśli wymagane)."
    elif t["topic_type"] == "POWTÓRZENIE":
        assess = "Obserwacja aktywności, samoocena, przygotowanie do testu."
        hw = f"Powtórzenie materiału — s. {t['page']} w podręczniku."
    else:
        assess = "Obserwacja, praca pisemna, mapa / infografika, samoocena."
        hw = f"Zadania domowe — s. {t['page']} w podręczniku."

    teacher_notes = ""
    if t["has_scenario"]:
        teacher_notes = f"Pełny scenariusz KN dla tematu „{pl}”. KP dostępna w książce nauczyciela."

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
VALUES (
  {sql_str(code)}, {SUBJECT_ID}, {SCHOOL_CLASS}, {sql_str(t['lesson_type'])}, 45,
  {sql_str(pl)}, {sql_str(ua)},
  {sql_str(f'Uczeń realizuje temat „{pl}” zgodnie z wymaganiami PP ({t["pp_code"]}).')},
  {sql_str(f'Учень реалізує тему «{ua}» згідно з вимогами PP ({t["pp_code"]}).')},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(scen)},
  {sql_str(scen.replace('WPROWADZENIE', 'ВСТУП').replace('GŁÓWNA CZĘŚĆ', 'ОСНОВНА ЧАСТИНА').replace('ĆWICZENIA', 'ВПРАВИ').replace('PODSUMOWANIE', 'ПІДСУМОК'))},
  {sql_str(hw)}, {sql_str(hw)},
  {sql_str(assess)}, {sql_str(assess)},
  {sql_str(teacher_notes) if teacher_notes else 'NULL'}, {sql_str(teacher_notes) if teacher_notes else 'NULL'},
  'EduMost', '1.0', 'Draft', 1
);"""


def generate_sql() -> str:
    build_topics()
    lines = [
        "-- EduMost Studio: Historia Klasa 5 — Wczoraj i dziś 5 (wariant C, 52 tematy)",
        "-- Generated by scripts/generate-klasa5-historia-curriculum.py",
        f"-- {TEXTBOOK}",
        f"-- Subject: HIST (id={SUBJECT_ID}), {TOPIC_COUNT} topics, display_order 1–{TOPIC_COUNT}",
        "",
        "BEGIN TRANSACTION;",
        "",
    ]

    lines.append("-- Sections (7 rozdziałów podręcznika)")
    for code, pl, ua, dpl, dua, order in SECTIONS:
        lines.append(f"""
INSERT OR IGNORE INTO Sections (subject_id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT {SUBJECT_ID}, {sql_str(code)}, {sql_str(pl)}, {sql_str(ua)}, {sql_str(dpl)}, {sql_str(dua)}, {order}, 1
WHERE NOT EXISTS (SELECT 1 FROM Sections WHERE subject_id = {SUBJECT_ID} AND code = {sql_str(code)});""")

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
FROM Sections s
WHERE s.subject_id = {SUBJECT_ID} AND s.code = {sql_str(t['section'])}
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
                    "NEXT": "Настępna temat zгідно зі змістом підручника.",
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
        lesson_links.append((f"HIST5-L{i:03d}", t["key"]))

    for lcode, tkey in lesson_links:
        lines.append(f"""
INSERT OR IGNORE INTO LessonTopics (lesson_id, topic_id, is_primary, display_order)
SELECT l.id, t.id, 1, 1
FROM Lessons l, Topics t
WHERE l.code = {sql_str(lcode)} AND t.code = {sql_str(tkey)}
  AND NOT EXISTS (SELECT 1 FROM LessonTopics lt WHERE lt.lesson_id = l.id AND lt.topic_id = t.id);""")

    lines.append("\nCOMMIT;")
    return "\n".join(lines)


def validate_codes() -> list[str]:
    errors: list[str] = []
    build_topics()
    orders = [int(t["key"].split("-")[-1]) for t in TOPICS]
    if orders != list(range(1, TOPIC_COUNT + 1)):
        errors.append(f"display_order nieciągły: {orders[:5]}…{orders[-5:]}")
    if len(orders) != len(set(orders)):
        errors.append("duplikaty display_order w kodach")
    pages = [t["page"] for t in TOPICS]
    if pages != sorted(pages):
        errors.append("numery stron nie są niemalejące w całym spisie")
    return errors


def write_seed() -> Path:
    errors = validate_codes()
    if errors:
        raise RuntimeError("Walidacja kodów nieudana:\n" + "\n".join(errors))
    sql = generate_sql()
    OUTPUT.write_text(sql, encoding="utf-8")
    return OUTPUT


def main() -> None:
    import sys

    if "--write" in sys.argv:
        path = write_seed()
        print(f"Zapisano: {path}")
        print(f"Rozmiar: {path.stat().st_size:,} bajtów")
        print(f"Tematy: {TOPIC_COUNT}, sekcje: {len(SECTIONS)}")
        print(f"Scenariusze KN: {sum(1 for t in TOPICS if t.get('has_scenario'))}")
        return

    build_topics()
    errors = validate_codes()
    print(f"HIST5 — {TOPIC_COUNT} tematów, {len(SECTIONS)} sekcji")
    print(f"Pierwszy: {TOPICS[0]['key']} — {TOPICS[0]['name_pl']}")
    print(f"Ostatni:  {TOPICS[-1]['key']} — {TOPICS[-1]['name_pl']}")
    if errors:
        print("BŁĘDY:", errors)
    else:
        print("Walidacja kodów: OK")


if __name__ == "__main__":
    main()
