#!/usr/bin/env python3
"""Validate seed_klasa5_historia.sql without touching the database."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "electron/database/seed/seed_klasa5_historia.sql"
EXPECTED_SECTIONS = 7
EXPECTED_TOPICS = 52
EXPECTED_RELATIONS = 102  # 51 PREREQUISITE + 51 NEXT


def validate(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")

    section_codes_from_insert = re.findall(
        r"SELECT 5, '([A-Z]{3})',",
        text,
    )

    topic_codes = re.findall(r"SELECT s\.id, '(HIST5-[A-Z]{3}-\d{3})'", text)
    topic_display_orders = [int(c.rsplit("-", 1)[-1]) for c in topic_codes]

    curriculum_orders = [
        int(m.group(1))
        for m in re.finditer(
            r"INSERT OR IGNORE INTO Curriculum[\s\S]*?, (\d+), 1\s*FROM Topics t WHERE t\.code = '(HIST5-[A-Z]{3}-\d{3})'",
            text,
        )
    ]

    lesson_codes = re.findall(r"VALUES \(\s*'(HIST5-L\d{3})'", text)
    lesson_topic_inserts = len(re.findall(r"INSERT OR IGNORE INTO LessonTopics", text))
    topic_relation_inserts = len(re.findall(r"INSERT OR IGNORE INTO TopicRelations", text))

    dup_topics = [c for c in topic_codes if topic_codes.count(c) > 1]
    dup_lessons = [c for c in lesson_codes if lesson_codes.count(c) > 1]

    expected_orders = set(range(1, EXPECTED_TOPICS + 1))
    topic_order_set = set(topic_display_orders)
    curriculum_order_set = set(curriculum_orders)

    return {
        "path": path,
        "size": path.stat().st_size,
        "sections": len(section_codes_from_insert),
        "section_codes": section_codes_from_insert,
        "topics": len(topic_codes),
        "topic_codes": topic_codes,
        "curriculum": len(curriculum_orders),
        "curriculum_orders": curriculum_orders,
        "lessons": len(lesson_codes),
        "lesson_codes": lesson_codes,
        "lesson_topics": lesson_topic_inserts,
        "topic_relations": topic_relation_inserts,
        "topic_display_orders": topic_display_orders,
        "dup_topic_codes": sorted(set(dup_topics)),
        "dup_lesson_codes": sorted(set(dup_lessons)),
        "topic_order_gaps": sorted(expected_orders - topic_order_set),
        "curriculum_order_gaps": sorted(expected_orders - curriculum_order_set),
    }


def print_report(r: dict) -> bool:
    ok = True
    print("=" * 72)
    print("HIST5 SEED — RAPORT WALIDACYJNY (plik, bez bazy)")
    print("=" * 72)
    print(f"\nPlik: {r['path']}")
    print(f"Rozmiar: {r['size']:,} bajtów\n")

    checks = [
        ("Sekcje", r["sections"], EXPECTED_SECTIONS),
        ("Topics (INSERT)", r["topics"], EXPECTED_TOPICS),
        ("Curriculum (INSERT)", r["curriculum"], EXPECTED_TOPICS),
        ("Lessons (INSERT)", r["lessons"], EXPECTED_TOPICS),
        ("LessonTopics (INSERT)", r["lesson_topics"], EXPECTED_TOPICS),
        ("TopicRelations (INSERT)", r["topic_relations"], EXPECTED_RELATIONS),
    ]
    print("| Metryka | Otrzymano | Oczekiwano | Status |")
    print("|---------|----------:|-----------:|--------|")
    for name, got, exp in checks:
        status = "OK" if got == exp else "FAIL"
        if got != exp:
            ok = False
        print(f"| {name} | {got} | {exp} | **{status}** |")

    print(f"\n### Kody sekcji ({len(r['section_codes'])})\n")
    print(", ".join(r["section_codes"]))

    dup_t = r["dup_topic_codes"]
    dup_l = r["dup_lesson_codes"]
    gaps_t = r["topic_order_gaps"]
    gaps_c = r["curriculum_order_gaps"]

    print("\n### Duplikaty code\n")
    if dup_t:
        ok = False
        print(f"- Topics: **{dup_t}**")
    else:
        print("- Topics: brak")
    if dup_l:
        ok = False
        print(f"- Lessons: **{dup_l}**")
    else:
        print("- Lessons: brak")

    print("\n### display_order Topics\n")
    orders = r["topic_display_orders"]
    if orders == list(range(1, EXPECTED_TOPICS + 1)):
        print(f"- 1–{EXPECTED_TOPICS} ciągły: **OK**")
    else:
        ok = False
        print(f"- Luki: {gaps_t or 'brak'}")
        print(f"- Zakres: {min(orders) if orders else '?'}–{max(orders) if orders else '?'}")

    print("\n### display_order Curriculum\n")
    if r["curriculum_orders"] == list(range(1, EXPECTED_TOPICS + 1)):
        print(f"- 1–{EXPECTED_TOPICS} ciągły: **OK**")
    else:
        ok = False
        print(f"- Luki: {gaps_c or 'brak'}")

    print("\n### Przykładowe kody\n")
    tc = r["topic_codes"]
    if tc:
        print(f"- Pierwszy topic: `{tc[0]}`")
        print(f"- Ostatni topic: `{tc[-1]}`")
    lc = r["lesson_codes"]
    if lc:
        print(f"- Pierwszy lesson: `{lc[0]}`")
        print(f"- Ostatni lesson: `{lc[-1]}`")

    print("\n" + "=" * 72)
    print("WYNIK:", "PASS" if ok else "FAIL")
    print("=" * 72)
    return ok


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else SEED
    if not path.exists():
        print(f"Brak pliku: {path}", file=sys.stderr)
        sys.exit(1)
    ok = print_report(validate(path))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
