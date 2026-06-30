#!/usr/bin/env python3
"""Validate seed_klasa5_angielski.sql without touching the database."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SEED = ROOT / "electron/database/seed/seed_klasa5_angielski.sql"
EXPECTED_SECTIONS = 7
EXPECTED_TOPICS = 90
EXPECTED_RELATIONS = 178  # 89 PREREQUISITE + 89 NEXT


def validate(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")

    section_codes = re.findall(
        r"SELECT sub\.id, '([A-Z]{3})',",
        text,
    )

    topic_codes = re.findall(r"SELECT s\.id, '(ENG5-[A-Z]{3}-\d{3})'", text)
    curriculum_orders = [
        int(m.group(1))
        for m in re.finditer(
            r"INSERT OR IGNORE INTO Curriculum[\s\S]*?, (\d+), 1\s*FROM Topics t WHERE t\.code = '(ENG5-[A-Z]{3}-\d{3})'",
            text,
        )
    ]

    lesson_codes = re.findall(
        r"SELECT\s+'(ENG5-L\d{3})', sub\.id",
        text,
    )
    lesson_topic_inserts = len(re.findall(r"INSERT OR IGNORE INTO LessonTopics", text))
    topic_relation_inserts = len(re.findall(r"INSERT OR IGNORE INTO TopicRelations", text))
    requires_review_count = text.count("'REQUIRES_REVIEW'")

    dup_topics = [c for c in topic_codes if topic_codes.count(c) > 1]
    dup_lessons = [c for c in lesson_codes if lesson_codes.count(c) > 1]

    expected_orders = set(range(1, EXPECTED_TOPICS + 1))
    curriculum_order_set = set(curriculum_orders)

    return {
        "path": path,
        "size": path.stat().st_size,
        "sections": len(section_codes),
        "section_codes": section_codes,
        "topics": len(topic_codes),
        "topic_codes": topic_codes,
        "curriculum": len(curriculum_orders),
        "lessons": len(lesson_codes),
        "lesson_topics": lesson_topic_inserts,
        "topic_relations": topic_relation_inserts,
        "requires_review": requires_review_count,
        "dup_topic_codes": sorted(set(dup_topics)),
        "dup_lesson_codes": sorted(set(dup_lessons)),
        "curriculum_order_gaps": sorted(expected_orders - curriculum_order_set),
    }


def print_report(r: dict) -> bool:
    ok = True
    print("=" * 72)
    print("ENG5 SEED — RAPORT WALIDACYJNY (plik, bez bazy)")
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
        ("Lessons REQUIRES_REVIEW", r["requires_review"], EXPECTED_TOPICS),
    ]

    for label, actual, expected in checks:
        status = "OK" if actual == expected else "FAIL"
        if actual != expected:
            ok = False
        print(f"  {label:28} {actual:4}  (oczekiwane {expected})  [{status}]")

    print(f"\nSekcje: {', '.join(r['section_codes'])}")
    print(f"Pierwszy temat: {r['topic_codes'][0] if r['topic_codes'] else '—'}")
    print(f"Ostatni temat:  {r['topic_codes'][-1] if r['topic_codes'] else '—'}")

    if r["dup_topic_codes"]:
        ok = False
        print(f"\nDuplikaty kodów tematów: {r['dup_topic_codes']}")
    if r["dup_lesson_codes"]:
        ok = False
        print(f"\nDuplikaty kodów lekcji: {r['dup_lesson_codes']}")
    if r["curriculum_order_gaps"]:
        ok = False
        print(f"\nLuki display_order (Curriculum): {r['curriculum_order_gaps']}")

    print("\n" + "=" * 72)
    print("WYNIK:", "PASS" if ok else "FAIL")
    print("=" * 72)
    return ok


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else SEED
    if not path.exists():
        print(f"Brak pliku: {path}")
        sys.exit(1)
    ok = print_report(validate(path))
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
