#!/usr/bin/env python3
"""Validate POL5 diff report against NEW_TOC and generator (read-only)."""
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

spec = importlib.util.spec_from_file_location("pol5_cmp", ROOT / "scripts/compare-pol5-toc-analysis.py")
cmp = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules["pol5_cmp"] = cmp
spec.loader.exec_module(cmp)

spec2 = importlib.util.spec_from_file_location("cur", ROOT / "scripts/pol5-curated-diff.py")
cur = importlib.util.module_from_spec(spec2)
sys.modules["cur"] = cur
spec2.loader.exec_module(cur)


def norm(s: str) -> str:
    return cmp.norm(s)


def search_new(query: str) -> list[tuple[int, str, int, str]]:
    hits = []
    q = norm(query)
    for i, row in enumerate(cmp.NEW_TOC, start=1):
        name = row[3]
        if q in norm(name) or norm(name) in q:
            hits.append((i, row[1], row[4], name))
    return hits


def extract_author(title: str) -> str:
    m = re.search(r"\(([^)]+)\)", title)
    return m.group(1) if m else "—"


def extract_work(title: str) -> str:
    t = re.sub(r"\([^)]*\)", "", title).strip()
    t = re.sub(r"^Sprawdź siebie — ", "", t)
    t = re.sub(r"^Listy z podróży z gramatyką w tle — ", "", t)
    return t.strip()


old = {t.order: t for t in cmp.load_old()}
new_list = cmp.load_new()
new = {t.order: t for t in new_list}

removed_orders = [o for o, (n, c, _) in cur.CURATED.items() if n is None]
new_only = sorted(cur.NEW_ONLY.keys())
moved = [(o, n) for o, (n, c, _) in cur.CURATED.items() if c == "E" and n]

print("=" * 70)
print("WALIDACJA RAPORTU POL5")
print("=" * 70)

# 4. Count
print(f"\n[4] LICZBA TEMATÓW")
print(f"  len(NEW_TOC)           = {len(cmp.NEW_TOC)}")
print(f"  load_new()             = {len(new_list)}")
print(f"  NEW_ONLY entries       = {len(new_only)}")
print(f"  REMOVED (curated D)    = {len(removed_orders)}")
print(f"  MAPPED old->new        = {len(cur.CURATED) - len(removed_orders)}")
print(f"  124 - {len(removed_orders)} + {len(new_only)} = {124 - len(removed_orders) + len(new_only)}")

# Check unique new targets
targets = {n for o, (n, c, _) in cur.CURATED.items() if n is not None}
overlap = targets & set(new_only)
print(f"  Unique new map targets = {len(targets)}")
print(f"  Overlap targets/NEW_ONLY = {overlap or 'brak'}")

# 1. New topics
print(f"\n[1] NOWE TEMATY ({len(new_only)})")
for ord_ in new_only:
    t = new[ord_]
    row = cmp.NEW_TOC[ord_ - 1]
    ch, sec, subsec, name, page, kind = row
    print(f"\n  #{ord_} | {sec} | s.{page}")
    print(f"  Tytuł:   {extract_work(name)}")
    print(f"  Autor:   {extract_author(name)}")
    print(f"  Spis:    «{ch}» → «{subsec}»")
    print(f"  Wpis:    {name} — p. {page}")

# 2. Removed
print(f"\n[2] USUNIĘTE TEMATY ({len(removed_orders)})")
for o in removed_orders:
    t = old[o]
    # build search tokens from title
    work = extract_work(t.name_pl)
    tokens = [work[:30], work.split("—")[0].strip()[:25]]
    if "(" in t.name_pl:
        tokens.append(extract_author(t.name_pl).split(",")[0][:20])
    hits: list[tuple[int, str, int, str]] = []
    seen = set()
    for tok in tokens:
        if len(tok) < 4:
            continue
        for h in search_new(tok):
            if h[0] not in seen:
                seen.add(h[0])
                hits.append(h)
    status = "BRAK w nowym spisie" if not hits else f"UWAGA: {len(hits)} trafień!"
    print(f"\n  OLD #{o} {t.code} | {t.section} | s.{t.page}")
    print(f"  Nazwa: {t.name_pl}")
    print(f"  Status: {status}")
    for h in hits:
        print(f"    → trafienie #{h[0]} {h[1]} s.{h[2]}: {h[3][:70]}")

# 3. Moved
print(f"\n[3] PRZENIESIONE ({len(moved)})")
for o, n in moved:
    ot, nt = old[o], new[n]
    print(f"\n  {ot.code} #{o}→#{n}")
    print(f"  Stara sekcja: {ot.section} ({ot.name_pl[:50]}...)")
    print(f"  Nowa sekcja:  {nt.section} | s.{nt.page}")
    print(f"  Nowy wpis:    {nt.name_pl}")

# Edge cases
print(f"\n[EDGE] Tematy zastąpione (nie w REMOVED, podobna nazwa w B):")
replacements = [
    ("Kupić", "Kupść"),
    ("Dom dziecka", "Dom Dziecka"),
    ("Przygotowujemy przedstawienie", "Piszemy scenariusz"),
    ("Spotkanie z przyjaciółmi — wykrzyknik", "Spotkanie z przyjaciółmi — wypowiedzenia"),
    ("Sprawdź siebie — Wakacje", "Sprawdź siebie — Z dziennika Ernesta"),
    ("Warsztat aktora — rodzaje głosek", "Warsztat aktora — poprawna"),
]
for old_q, new_q in replacements:
    oh = search_new(old_q)
    nh = search_new(new_q)
    print(f"  '{old_q[:40]}': old_in_B={len(oh)}, new_in_B={len(nh)}")

print("\n" + "=" * 70)
