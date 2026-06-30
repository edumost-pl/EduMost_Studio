#!/usr/bin/env python3
"""Generate seed_klasa5_angielski.sql — Flash Klasa 5 (Express Publishing).

90 topics (wariant A) = 90 lekcji RM (90h). REQUIRES_REVIEW: wszystkie.
"""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

OUTPUT = (
    Path(__file__).resolve().parent.parent
    / "electron/database/seed/seed_klasa5_angielski.sql"
)
RM_DOC = (
    Path.home()
    / "Desktop/book_EduMost/klasa_5/flash5/rm_90h_flash_kl.5.doc"
)
RM_TXT_FALLBACK = (
    Path(__file__).resolve().parent.parent
    / ".tmp_flash5_audit/rm_teacher.txt"
)

SUBJECT_CODE = "ENG"
SCHOOL_CLASS = 5
TOPIC_COUNT = 90
TEXTBOOK = "Express Publishing Flash Klasa 5 (A1+ CEFR), Rozkład materiału 90h"
REVIEW_MSG = (
    "Wymaga uzupełnienia po pozyskaniu pełnego podręcznika, "
    "książki nauczyciela lub zeszytu ćwiczeń."
)

SECTIONS = [
    ("MYW", "My World", "My World",
     "Moduł 1 — codzienne czynności, szkoła, present simple/continuous.",
     "Модуль 1 — щоденні справи, школа, present simple/continuous.", 1),
    ("RWG", "Round we go!", "Round we go!",
     "Moduł 2 — transport, miasto, stopień wyższy i najwyższy przymiotników.",
     "Модуль 2 — транспорт, місто, порівняльний і найвищий ступінь.", 2),
    ("BIT", "Back in time", "Back in time",
     "Moduł 3 — postacie historyczne, past simple (to be, have got).",
     "Модуль 3 — історичні постаті, past simple (to be, have got).", 3),
    ("CLB", "Celebrities", "Celebrities",
     "Moduł 4 — celebryci, rozrywka, past simple regular/irregular.",
     "Модуль 4 — знаменитості, розваги, past simple.", 4),
    ("ADV", "What an adventure!", "What an adventure!",
     "Moduł 5 — wakacje, pogoda, should/shouldn't, przysłówki.",
     "Модуль 5 — канікули, погода, should/shouldn't, прислівники.", 5),
    ("LTC", "Let's celebrate!", "Let's celebrate!",
     "Moduł 6 — święta i uroczystości, be going to, zaimki zwrotne.",
     "Модуль 6 — свята, be going to, зворотні займенники.", 6),
    ("FST", "Festivities", "Festivities",
     "Lekcje okolicznościowe — Halloween, Sylwester, święta (SB s. 101–106).",
     "Святкові уроки — Halloween, Новий рік (SB s. 101–106).", 7),
]

MODULE_MAP = {i + 1: SECTIONS[i][:2] for i in range(6)}

TOC_META: dict[str, dict[str, str]] = {
    "MYW": {
        "grammar": "Present simple; adverbs of frequency; prepositions of movement; present continuous; stative verbs",
        "vocab": "Daily routines; free-time activities; school areas; school subjects",
    },
    "RWG": {
        "grammar": "Comparative; prepositions of place; superlative",
        "vocab": "Means of transport; signs in a city; shops & services; materials",
    },
    "BIT": {
        "grammar": "was/were; there was/there were; had (past simple of have got)",
        "vocab": "Famous historical people; landmarks; places in the city",
    },
    "CLB": {
        "grammar": "Past simple regular/irregular (affirmative, negative)",
        "vocab": "Celebrities; jobs; types of entertainment",
    },
    "ADV": {
        "grammar": "Past simple interrogative; should/shouldn't; adverbs -ly/-ily",
        "vocab": "Holiday activities; weather; everyday social behaviour",
    },
    "LTC": {
        "grammar": "be going to; reflexive pronouns",
        "vocab": "Celebrations & festivities; do/make phrases; festive food in the UK",
    },
    "FST": {
        "grammar": "—",
        "vocab": "Holiday greetings; Halloween; New Year; St Patrick's Day; Easter food",
    },
}

LT_MAP = {
    "Organizational": "Intro",
    "Starter": "Intro",
    "Vocabulary": "New Knowledge",
    "Reading": "New Knowledge",
    "Grammar": "New Knowledge",
    "Everyday English": "Practice",
    "Culture": "Culture",
    "CLIL": "CLIL",
    "Flash Time": "Project",
    "Presentation": "Project",
    "Revision": "Review",
    "Module Test": "Test",
    "Test Review": "Review",
}

TOPICS: list[dict] = []
TOPIC_BY_KEY: dict[str, dict] = {}


def load_rm_text() -> str:
    if RM_DOC.exists():
        return subprocess.check_output(
            ["textutil", "-convert", "txt", "-stdout", str(RM_DOC)],
            text=True,
        )
    if RM_TXT_FALLBACK.exists():
        return RM_TXT_FALLBACK.read_text(encoding="utf-8", errors="replace")
    raise FileNotFoundError(f"Brak RM: {RM_DOC} lub {RM_TXT_FALLBACK}")


def detect_type(block: str, num: int) -> str:
    for pat, name in [
        (r"(\d+[a-f])\s*\n\s*Reading", "Reading"),
        (r"(\d+[a-f])\s*\n\s*Grammar", "Grammar"),
        (r"(\d+[a-f])\s*\n\s*Vocabulary", "Vocabulary"),
        (r"(\d+[a-f])\s*\n\s*Everyday English", "Everyday English"),
        (r"(\d+[a-f])\s*\n\s*Across Cultures", "Culture"),
        (r"CLIL", "CLIL"),
        (r"Flash Time", "Flash Time"),
        (r"Presentation Skills", "Presentation"),
        (r"Progress Check", "Revision"),
        (r"SpB:\s*str\.\s*100", "Starter"),
    ]:
        if re.search(pat, block, re.I):
            return name
    if num == 1:
        return "Organizational"
    if re.search(r"Halloween|New Year|Patryka|wielkanocne|Mother.s Day", block, re.I):
        return "Culture"
    return "Vocabulary"


def parse_rm() -> list[dict]:
    rm = load_rm_text()
    chunks = re.split(r"(LEKCJA\s+\d+|LEKCJE\s+\d+–\d+)", rm)
    current_module: int | None = None
    entries: list[dict] = []

    for i in range(1, len(chunks), 2):
        header = chunks[i].strip()
        body = chunks[i + 1] if i + 1 < len(chunks) else ""
        block = header + "\n" + body

        mod_m = re.search(r"Moduł\s+(\d+)\s*[–-]\s*([^\n]+)", block, re.I)
        if mod_m:
            current_module = int(mod_m.group(1))

        if header.startswith("LEKCJE"):
            nums = list(map(int, re.findall(r"\d+", header)))
            title_block = re.search(r"Tematy lekcji:\s*([^\n]+(?:\n\s+[^\n]+)?)", block)
            titles = (
                re.findall(r"\d+\.\s*([^\n]+)", title_block.group(1))
                if title_block
                else ["Module Test", "Test review"]
            )
            sb_m = re.search(r"SB:\s*str\.\s*([\d–\-]+)", block)
            sb = sb_m.group(1) if sb_m else None
            for n, title in zip(range(nums[0], nums[-1] + 1), titles):
                entries.append(_entry(n, current_module, sb, title, block))
            continue

        num = int(re.search(r"\d+", header).group())
        sb_m = re.search(r"SB:\s*str\.\s*([\d–\-]+)", block)
        sb = sb_m.group(1) if sb_m else None
        title_m = re.search(r"Temat lekcji:\s*([^\n]+)", block)
        title = title_m.group(1).strip() if title_m else f"Lesson {num}"
        entries.append(_entry(num, current_module, sb, title, block))

    entries.sort(key=lambda x: x["num"])
    if len(entries) != TOPIC_COUNT:
        raise ValueError(f"Expected {TOPIC_COUNT} topics from RM, got {len(entries)}")
    return entries


def _entry(num: int, module: int | None, sb: str | None, title: str, block: str) -> dict:
    title_clean = re.sub(r"^\d+\.\s*", "", title).strip()
    ltype = detect_type(block, num)
    if "sprawdzian" in title_clean.lower() and "omówienie" not in title_clean.lower():
        ltype = "Module Test"
    elif "omówienie sprawdzian" in title_clean.lower():
        ltype = "Test Review"

    skills: list[str] = []
    if re.search(r"Słuchanie", block):
        skills.append("Listening")
    if re.search(r"Czytanie", block):
        skills.append("Reading")
    if re.search(r"Mówienie", block):
        skills.append("Speaking")
    if re.search(r"Pisanie", block):
        skills.append("Writing")

    gram = " | ".join(re.findall(r"Gramatyka:\s*([^\n]+)", block)[:2])
    leks_m = re.search(r"Leksyka:\s*\n([^\n]+(?:\n[^\nLEKCJA]{0,60}){0,6})", block)
    leks = leks_m.group(1).replace("\n", " ").strip()[:400] if leks_m else ""
    wb_m = re.search(r"WB\s*\n?●str\.\s*([^\n]+)", block)

    if sb and str(sb).startswith("101"):
        sec, sname = "FST", "Festivities"
    elif num >= 86:
        sec, sname = "FST", "Festivities"
    elif module:
        sec, sname = MODULE_MAP[module]
    else:
        sec, sname = "FST", "Festivities"

    diff = "A1" if module == 1 else ("A2" if module and module >= 4 else "A1+")

    return {
        "num": num,
        "section": sec,
        "section_name": sname,
        "sb": sb,
        "type": ltype,
        "title_pl": title_clean,
        "title_ua": title_clean,
        "skills": skills,
        "grammar": gram,
        "vocabulary": leks,
        "wb": wb_m.group(1).strip() if wb_m else None,
        "lesson_type": LT_MAP.get(ltype, "New Knowledge"),
        "difficulty": diff,
    }


def build_topics() -> None:
    TOPICS.clear()
    TOPIC_BY_KEY.clear()
    raw = parse_rm()
    for order, e in enumerate(raw, start=1):
        t = {
            **e,
            "order": order,
            "key": f"{SUBJECT_CODE}{SCHOOL_CLASS}-{e['section']}-{order:03d}",
            "curriculum_code": f"ENG5.{order:03d}",
            "requires_review": True,
            "prereq_keys": [],
            "next_keys": [],
        }
        TOPICS.append(t)
        TOPIC_BY_KEY[t["key"]] = t

    for i, t in enumerate(TOPICS):
        if i > 0:
            t["prereq_keys"] = [TOPICS[i - 1]["key"]]
        if i < len(TOPICS) - 1:
            t["next_keys"] = [TOPICS[i + 1]["key"]]


def sql_str(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def stage_for(order: int, lesson_type: str) -> str:
    if lesson_type in ("Review", "Test"):
        return "Consolidated"
    if order <= 15:
        return "Introduced"
    if order <= 45:
        return "Developed"
    if order <= 75:
        return "Practiced"
    return "Mastered"


def topic_content(t: dict) -> dict[str, str]:
    meta = TOC_META.get(t["section"], {})
    sb = t["sb"] or "—"
    skills = ", ".join(t["skills"]) if t["skills"] else "—"
    desc_pl = (
        f"Flash Klasa 5 — {t['section_name']}. Lekcja RM {t['num']}: „{t['title_pl']}” "
        f"(SB s. {sb}, typ: {t['type']}) [REQUIRES_REVIEW]. {REVIEW_MSG}"
    )
    desc_ua = (
        f"Flash Klasa 5 — {t['section_name']}. Урок RM {t['num']}: «{t['title_ua']}» "
        f"(SB s. {sb}) [REQUIRES_REVIEW]."
    )
    prereq_pl = (
        "\n".join(f"• {TOPIC_BY_KEY[k]['title_pl']}" for k in t["prereq_keys"])
        if t["prereq_keys"]
        else "• Kontynuacja kursu Flash Klasa 4"
    )
    outcomes_pl = (
        f"• Temat lekcji (RM): {t['title_pl']}\n"
        f"• Umiejętności: {skills}\n"
        f"• Słownictwo modułu: {meta.get('vocab', '—')}\n"
        f"• Gramatyka modułu: {meta.get('grammar', '—')}"
    )
    if t["grammar"]:
        outcomes_pl += f"\n• Gramatyka lekcji: {t['grammar']}"
    if t["vocabulary"]:
        outcomes_pl += f"\n• Leksyka lekcji: {t['vocabulary'][:300]}"
    outcomes_pl += f"\n• {REVIEW_MSG}"

    term = meta.get("vocab", "")
    if t["vocabulary"]:
        term = (term + "; " + t["vocabulary"][:200]) if term else t["vocabulary"][:200]

    notes = f"RM lekcja {t['num']}, SB s. {sb}."
    if t["wb"]:
        notes += f" WB: str. {t['wb']}."
    notes += f" {REVIEW_MSG}"

    return {
        "description_pl": desc_pl,
        "description_ua": desc_ua,
        "prerequisites_pl": prereq_pl,
        "prerequisites_ua": prereq_pl,
        "outcomes_pl": outcomes_pl,
        "outcomes_ua": outcomes_pl,
        "terminology_pl": term[:500] if term else t["section_name"],
        "terminology_ua": term[:500] if term else t["section_name"],
        "methodology_pl": (
            f"Flash 5 — {t['type']}: słuchanie, mówienie, czytanie, pisanie wg RM. "
            f"Poziom {t['difficulty']}. {REVIEW_MSG}"
        ),
        "methodology_ua": f"Flash 5 — {t['type']}, poziom {t['difficulty']}.",
        "notes_pl": notes,
        "notes_ua": notes,
    }


def scenario_pl_for(t: dict) -> str:
    sb = t["sb"] or "—"
    base = f"Realizacja lekcji RM {t['num']} „{t['title_pl']}” (SB s. {sb}, typ: {t['type']})."
    if t["wb"]:
        base += f" Materiał ćwiczeniowy: WB str. {t['wb']}."
    return base + f" {REVIEW_MSG}"


def lesson_for(t: dict, num: int) -> str:
    c = topic_content(t)
    code = f"ENG5-L{num:03d}"
    scen = scenario_pl_for(t)
    skills = ", ".join(t["skills"]) if t["skills"] else "Listening, Speaking, Reading, Writing"
    goal = f"Uczeń realizuje lekcję „{t['title_pl']}” — {t['type']} (Flash Klasa 5, {t['difficulty']})."
    hw = f"WB / DigiBook — po uzupełnieniu materiałów. {REVIEW_MSG}"
    assess = f"Ocena wg planu wynikowego Flash Klasa 5 — {t['type']}."
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
  {sql_str(t['title_pl'])}, {sql_str(t['title_ua'])},
  {sql_str(goal)}, {sql_str(goal)},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(scen)}, {sql_str(scen)},
  {sql_str(hw)}, {sql_str(hw)},
  {sql_str(assess)}, {sql_str(assess)},
  {sql_str(REVIEW_MSG)}, {sql_str(REVIEW_MSG)},
  'EduMost', '1.0', 'REQUIRES_REVIEW', 1
FROM Subjects sub WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Lessons WHERE code = {sql_str(code)});"""


def generate_sql() -> str:
    build_topics()
    lines = [
        "-- EduMost Studio: Język angielski Klasa 5 — Flash 5 (wariant A, 90 tematów)",
        "-- Generated by scripts/generate-klasa5-angielski-curriculum.py",
        f"-- {TEXTBOOK}",
        f"-- Subject: ENG, {TOPIC_COUNT} topics, display_order 1–{TOPIC_COUNT}",
        "-- REQUIRES_REVIEW: 90",
        "",
        "BEGIN TRANSACTION;",
        "",
        """
INSERT OR IGNORE INTO Subjects (code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT 'ENG', 'Język angielski', 'Англійська мова',
  'Komunikacja w języku angielskim — poziom A1+ (CEFR), klasa 5.',
  'Комунікація англійською — рівень A1+ (CEFR), 5 клас.',
  COALESCE((SELECT MAX(display_order) FROM Subjects), 0) + 1, 1
WHERE NOT EXISTS (SELECT 1 FROM Subjects WHERE code = 'ENG');""",
    ]

    lines.append("\n-- Sections (7)")
    for code, pl, ua, dpl, dua, order in SECTIONS:
        lines.append(f"""
INSERT OR IGNORE INTO Sections (subject_id, code, name_pl, name_ua, description_pl, description_ua, display_order, is_active)
SELECT sub.id, {sql_str(code)}, {sql_str(pl)}, {sql_str(ua)}, {sql_str(dpl)}, {sql_str(dua)}, {order}, 1
FROM Subjects sub WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Sections WHERE subject_id = sub.id AND code = {sql_str(code)});""")

    lines.append("\n-- Topics")
    for t in TOPICS:
        c = topic_content(t)
        lines.append(f"""
INSERT OR IGNORE INTO Topics (section_id, code, name_pl, name_ua,
  description_pl, description_ua, prerequisites_pl, prerequisites_ua,
  outcomes_pl, outcomes_ua, terminology_pl, terminology_ua,
  methodology_pl, methodology_ua, display_order, is_active)
SELECT s.id, {sql_str(t['key'])}, {sql_str(t['title_pl'])}, {sql_str(t['title_ua'])},
  {sql_str(c['description_pl'])}, {sql_str(c['description_ua'])},
  {sql_str(c['prerequisites_pl'])}, {sql_str(c['prerequisites_ua'])},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(c['methodology_pl'])}, {sql_str(c['methodology_ua'])},
  {t['order']}, 1
FROM Subjects sub
INNER JOIN Sections s ON s.subject_id = sub.id AND s.code = {sql_str(t['section'])}
WHERE sub.code = {sql_str(SUBJECT_CODE)}
  AND NOT EXISTS (SELECT 1 FROM Topics WHERE code = {sql_str(t['key'])});""")

    lines.append("\n-- Curriculum")
    for t in TOPICS:
        c = topic_content(t)
        lines.append(f"""
INSERT OR IGNORE INTO Curriculum (topic_id, school_class, learning_stage, curriculum_code, curriculum_pl, notes_pl, notes_ua, display_order, is_active)
SELECT t.id, {SCHOOL_CLASS}, {sql_str(stage_for(t['order'], t['lesson_type']))}, {sql_str(t['curriculum_code'])},
  {sql_str(t['title_pl'])}, {sql_str(c['notes_pl'])}, {sql_str(c['notes_ua'])}, {t['order']}, 1
FROM Topics t WHERE t.code = {sql_str(t['key'])}
  AND NOT EXISTS (SELECT 1 FROM Curriculum c WHERE c.topic_id = t.id AND c.school_class = {SCHOOL_CLASS});""")

    lines.append("\n-- TopicRelations")
    for t in TOPICS:
        for rt, keys in [("PREREQUISITE", t["prereq_keys"]), ("NEXT", t["next_keys"])]:
            for j, rk in enumerate(keys):
                desc_pl = {
                    "PREREQUISITE": "Wymagane wcześniejsze opanowanie (kolejność RM 90h).",
                    "NEXT": "Następna lekcja wg rozkładu materiału Flash Klasa 5.",
                }[rt]
                desc_ua = {
                    "PREREQUISITE": "Потрібне попереднє опанування (порядок RM 90h).",
                    "NEXT": "Наступний урок згідно з розкладом Flash Klasa 5.",
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
    for i, t in enumerate(TOPICS, start=1):
        lines.append(lesson_for(t, i))
        lcode = f"ENG5-L{i:03d}"
        lines.append(f"""
INSERT OR IGNORE INTO LessonTopics (lesson_id, topic_id, is_primary, display_order)
SELECT l.id, t.id, 1, 1
FROM Lessons l, Topics t
WHERE l.code = {sql_str(lcode)} AND t.code = {sql_str(t['key'])}
  AND NOT EXISTS (SELECT 1 FROM LessonTopics lt WHERE lt.lesson_id = l.id AND lt.topic_id = t.id);""")

    lines.append("\nCOMMIT;")
    return "\n".join(lines)


def write_seed() -> Path:
    sql = generate_sql()
    OUTPUT.write_text(sql, encoding="utf-8")
    return OUTPUT


def main() -> None:
    import sys

    if "--write" in sys.argv:
        path = write_seed()
        build_topics()
        print(f"Zapisano: {path}")
        print(f"Rozmiar: {path.stat().st_size:,} bajtów")
        print(f"Tematy: {len(TOPICS)}, REQUIRES_REVIEW: {sum(1 for t in TOPICS if t['requires_review'])}")
        return
    build_topics()
    print(f"ENG5 — {len(TOPICS)} tematów, {len(SECTIONS)} sekcji")
    print(f"Pierwszy: {TOPICS[0]['key']} — {TOPICS[0]['title_pl']}")
    print(f"Ostatni:  {TOPICS[-1]['key']} — {TOPICS[-1]['title_pl']}")


if __name__ == "__main__":
    main()
