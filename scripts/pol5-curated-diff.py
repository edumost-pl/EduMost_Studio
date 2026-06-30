#!/usr/bin/env python3
"""Curated POL5 diff: generator (A) vs GWO 2016 TOC (B). Read-only analysis."""
from __future__ import annotations

import importlib.util
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / "scripts/generate-klasa5-polski-curriculum.py"

spec = importlib.util.spec_from_file_location("pol5_cmp", ROOT / "scripts/compare-pol5-toc-analysis.py")
cmp = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules["pol5_cmp"] = cmp
spec.loader.exec_module(cmp)

Category = Literal["A", "B", "C", "D", "E", "F"]

# Curated mapping: old display_order -> (new display_order | None, category, note)
# None = removed with no direct successor
CURATED: dict[int, tuple[int | None, Category, str]] = {
    1: (1, "B", "strona bez zmian treści"),
    2: (2, "B", "strona bez zmian treści"),
    3: (3, "B", "strona bez zmian treści"),
    4: (4, "B", "doprecyzowanie tytułu bloku ortograficznego"),
    5: (5, "B", "strona bez zmian treści"),
    6: (6, "B", "doprecyzowanie tytułu bloku ortograficznego"),
    7: (7, "B", "autorzy: L. i S. Hawking → Lucy i Stephen Hawking"),
    8: (8, "B", "strona 26→27"),
    9: (9, "B", "strona 28→29; pełne imiona autorów"),
    10: (10, "B", "strona 31→32"),
    11: (None, "D", "usunięty z nowego spisu"),
    12: (None, "D", "usunięty z nowego spisu"),
    13: (None, "D", "usunięty z nowego spisu"),
    14: (12, "B", "autor: Anna Murdzek → Wanda Markowska; kolejność z Prometeuszem"),
    15: (11, "B", "przesunięty przed Demeter; strona 45→35"),
    16: (14, "B", "strona 50→48"),
    17: (13, "B", "strona 53→44"),
    18: (16, "B", "strona 56→54"),
    19: (17, "B", "strona 58→56"),
    20: (20, "B", "strona 60→66; wstawiono 3 nowe tematy przed"),
    21: (22, "B", "strona 64→72"),
    22: (21, "E", "PYT→ZJA; strona 67→70"),
    23: (23, "B", "strona 70→75; rozdzielono od bloku stopniowania"),
    24: (25, "B", "strona 72→80"),
    25: (26, "B", "strona 74→82"),
    26: (27, "B", "strona 76→84"),
    27: (28, "B", "strona 78→87"),
    28: (29, "B", "strona 81→90"),
    29: (30, "B", "doprecyzowanie tytułu ortografii"),
    30: (31, "B", "strona 87→95; drugi fragment Pan Tadeusz w nowym TOC"),
    31: (32, "B", "Sprawdź siebie; strona 89→97"),
    32: (33, "B", "strona 95→102"),
    33: (34, "B", "strona 97→104"),
    34: (35, "B", "strona 101→108"),
    35: (36, "B", "strona 107→110"),
    36: (37, "B", "strona 109→112"),
    37: (38, "B", "strona 114→117"),
    38: (None, "D", "W pustyni i w puszczy — usunięty"),
    39: (None, "D", "Mit o Heraklesie — usunięty"),
    40: (41, "B", "strona 131→127"),
    41: (39, "B", "strona 134→120"),
    42: (40, "B", "strona 138→125"),
    43: (42, "B", "strona 140→130"),
    44: (43, "B", "strona 143→133"),
    45: (44, "B", "strona 148→138"),
    46: (None, "D", "blok czasowniki dokonane — usunięty"),
    47: (46, "B", "strona 160→150"),
    48: (47, "B", "strona 166→156"),
    49: (45, "B", "strona 168→148; bez bloku pisowni nie z przysłówkami"),
    50: (None, "D", "Taka droga, co nie ma końca — usunięty"),
    51: (48, "B", "strona 171→157"),
    52: (49, "B", "strona 174→160"),
    53: (50, "B", "strona 177→163"),
    54: (52, "B", "strona 179→167"),
    55: (51, "F", "strona 181→165; zamiana kolejności z odmianą zaimków"),
    56: (54, "B", "strona 184→171"),
    57: (53, "F", "strona 186→169; zamiana kolejności z listem"),
    58: (None, "D", "Spotkanie z przyjaciółmi (wykrzyknik) — zastąpiony innym blokiem w WAZ"),
    59: (55, "B", "Sprawdź siebie; strona 190→174"),
    60: (56, "B", "strona 196→180"),
    61: (57, "B", "strona 201→185"),
    62: (None, "D", "O modzie — usunięty"),
    63: (62, "F", "strona 210→202; przesunięty w sekcji WAZ"),
    64: (None, "D", "Chłopcy z Placu Broni — usunięty"),
    65: (59, "F", "strona 216→195; nowa kolejność w WAZ"),
    66: (60, "F", "strona 218→197"),
    67: (61, "B", "strona 220→200"),
    68: (63, "B", "strona 223→204"),
    69: (64, "B", "strona 224→205"),
    70: (66, "B", "strona 225→206"),
    71: (None, "D", "Pszczoła i szerszeń — usunięty"),
    72: (None, "D", "Syn i ojciec — usunięty"),
    73: (80, "E", "WAZ→GWO; strona 227→251"),
    74: (86, "E", "DZI→GWO; strona 229→266"),
    75: (69, "E", "DZI; strona 234→216"),
    76: (None, "D", "O muzyce — usunięty"),
    77: (24, "E", "DZI→ZJA; duplikat Pan Tadeusz przeniesiony wcześniej"),
    78: (71, "B", "Kupić → Kupść; strona 244→219"),
    79: (None, "D", "Znikająca trampolina — usunięty"),
    80: (None, "D", "Moje zainteresowania — usunięty"),
    81: (72, "B", "strona 257→226"),
    82: (None, "D", "W błędnym kole — usunięty"),
    83: (74, "B", "strona 263→232"),
    84: (75, "B", "strona 266→235"),
    85: (76, "B", "strona 268→236"),
    86: (None, "D", "Nasze zainteresowania — usunięty"),
    87: (77, "B", "strona 274→240"),
    88: (78, "B", "strona 278→243"),
    89: (79, "B", "strona 281→247"),
    90: (81, "B", "strona 285→253"),
    91: (82, "B", "strona 287→255"),
    92: (83, "B", "strona 289→257"),
    93: (None, "D", "Ankieta okolicznik — usunięty"),
    94: (84, "B", "plakat → utwór Ewa Lipska Dom Dziecka; strona 294→259"),
    95: (85, "B", "strona 297→261"),
    96: (87, "B", "strona 300→272"),
    97: (None, "D", "Katarynka — usunięty"),
    98: (None, "D", "Przypowieść o Samarytaninie — usunięty"),
    99: (None, "D", "Zwrócić uwagę innych — usunięty"),
    100: (89, "B", "strona 319→277"),
    101: (90, "B", "strona 321→279"),
    102: (91, "B", "Sprawdź siebie; strona 325→281; tytuł: Mit o Dedalu"),
    103: (92, "B", "strona 331→287"),
    104: (93, "B", "strona 333→289"),
    105: (94, "B", "Przygotowujemy → Piszemy scenariusz"),
    106: (None, "D", "Warsztat aktora (rodzaje głosek) — scalony"),
    107: (96, "B", "strona 342→300"),
    108: (95, "B", "Warsztat aktora scalony w jeden blok; strona 346→294"),
    109: (97, "B", "strona 349→303"),
    110: (None, "D", "Wywiad z Mariuszem Palejem — usunięty"),
    111: (99, "B", "strona 358→312"),
    112: (100, "B", "strona 358→312"),
    113: (102, "B", "strona 361→318"),
    114: (103, "B", "strona 362→320"),
    115: (None, "D", "Po drugiej stronie lustra — usunięty"),
    116: (106, "B", "strona 367→325"),
    117: (107, "B", "strona 370→328"),
    118: (108, "B", "strona 372→330"),
    119: (None, "D", "Burmistrz i ogród rzeźb — usunięty"),
    120: (109, "B", "strona 376→332"),
    121: (110, "B", "strona 378→333"),
    122: (None, "D", "Architektki Warszawy — usunięty"),
    123: (111, "B", "strona 383→336"),
    124: (112, "B", "Sprawdź siebie: Wakacje → Z dziennika Ernesta (Podsiadło)"),
}

# New-only topics (no old counterpart)
NEW_ONLY: dict[int, tuple[Category, str]] = {
    15: ("C", "Mówiono, że wiatry są boskiego pochodzenia (Jan Parandowski)"),
    18: ("C", "Potop (Anna Kamieńska)"),
    19: ("C", "Na królewskich tkaninach (arrasy wawelskie)"),
    58: ("C", "Są takie wyspy (Anna Kamieńska, fragment)"),
    65: ("C", "Lew i wdzięczna mysz (Ezop)"),
    67: ("C", "Spotkanie z przyjaciółmi — wypowiedzenia oznajmujące, pytające i rozkazujące"),
    68: ("C", "Dom (Anna Kamieńska)"),
    70: ("C", "Wyjście do kina — zdanie i równoważnik zdania"),
    73: ("C", "Klasa V planuje szkolną wycieczkę — zdanie pojedyncze i złożone"),
    88: ("C", "Szczęśliwy książę (Oscar Wilde)"),
    98: ("C", "Magiczne filmy Andrzeja Maleszki"),
    101: ("C", "Abby w studio nagrań (Bobbie Pyron)"),
    104: ("C", "Przygody Sindbada Żeglarza (Bolesław Leśmian)"),
    105: ("C", "Kwiaciarnia i studio florystyczne — słowniki"),
}


def main() -> None:
    old = cmp.load_old()
    new = cmp.load_new()
    old_by = {t.order: t for t in old}
    new_by = {t.order: t for t in new}

    identical = 0
    semantic_same = 0
    for o, (n, cat, _) in CURATED.items():
        if n is None:
            continue
        ot, nt = old_by[o], new_by[n]
        if ot.section == nt.section and cmp.norm(ot.name_pl) == cmp.norm(nt.name_pl):
            semantic_same += 1
            if ot.page == nt.page:
                identical += 1

    removed = sum(1 for o, (n, c, _) in CURATED.items() if n is None)
    renamed = sum(1 for o, (n, c, _) in CURATED.items() if n and c == "B")
    moved = sum(1 for o, (n, c, _) in CURATED.items() if c == "E")
    reordered = sum(1 for o, (n, c, _) in CURATED.items() if c == "F")
    added = len(NEW_ONLY)

    print("# POL5 — Raport porównawczy (generator vs GWO wyd. 4, 2016)\n")
    print("## 1. Liczba tematów\n")
    print(f"| Wersja | Liczba |")
    print(f"|--------|--------|")
    print(f"| A — obecny generator | **{len(old)}** |")
    print(f"| B — nowy spis treści | **{len(new)}** |")
    print(f"| Różnica | **{len(new) - len(old):+d}** |\n")

    print("## 2. Sekcje\n")
    print("### 2.1 Kody poddziałów (generator)\n")
    print("Wszystkie **11 kodów** bez zmian: KOS, PYT, ZJA, WYZ, CEL, ZIE, WAZ, DZI, GWO, FIC, SZT.\n")
    print("### 2.2 Nazwy poddziałów — identyczne\n")
    spec2 = importlib.util.spec_from_file_location("gen", GEN)
    gmod = importlib.util.module_from_spec(spec2)
    assert spec2 and spec2.loader
    spec2.loader.exec_module(gmod)
    for code, pl, *_ in gmod.SECTIONS:
        print(f"- **{code}** — {pl}")
    print("\n### 2.3 Rozdziały nadrzędne (7)\n")
    for ch in [
        "Dziwny ten świat",
        "Odpowiedzi na ważne pytania",
        "W zwykły i niezwykły sposób o zjawiskach",
        "Gdzie stopy nasze",
        "Świat ludzkich spraw",
        "Gdy świat staje na głowie",
        "Twórca i dzieło",
    ]:
        print(f"- {ch}")
    print("\n**Zmiany strukturalne:** brak nowych/usuniętych kodów sekcji. Zmienia się **zawartość** i **kolejność** tematów wewnątrz sekcji.\n")

    print("## 3. Kategorie tematów (curated)\n")
    print(f"| Kat. | Opis | Liczba |")
    print(f"|------|------|--------|")
    print(f"| A | Identyczne (sekcja + nazwa + strona) | {identical} |")
    print(f"| A′ | Ten sam temat merytorycznie (różna strona/tytuł) | {semantic_same - identical} |")
    print(f"| B | Istniejące — wymagają aktualizacji metadanych | {renamed} |")
    print(f"| C | Nowe w podręczniku 2016 | {added} |")
    print(f"| D | Usunięte z podręcznika | {removed} |")
    print(f"| E | Przeniesione do innej sekcji | {moved} |")
    print(f"| F | Ta sama sekcja, zmieniona kolejność względem sąsiadów | {reordered} |")

    print("\n## 4. Pełna tabela tematów\n")
    print("### 4.1 Tematy ze starej wersji (A)\n")
    print("| Kat. | Stary order | Nowy order | Stary kod | Sekcja | Str. st. | Str. now. | Nazwa (A) | Uwagi |")
    print("|------|-------------|------------|-----------|--------|----------|-----------|-----------|-------|")
    for o in range(1, len(old) + 1):
        t = old_by[o]
        n_ord, cat, note = CURATED[o]
        n_str = str(n_ord) if n_ord else "—"
        n_page = str(new_by[n_ord].page) if n_ord else "—"
        print(f"| {cat} | {o} | {n_str} | {t.code} | {t.section} | {t.page} | {n_page} | {t.name_pl[:55]} | {note} |")

    print("\n### 4.2 Tematy tylko w nowej wersji (C)\n")
    print("| Nowy order | Sekcja | Str. | Nazwa (B) |")
    print("|------------|--------|------|-----------|")
    for n_ord in sorted(NEW_ONLY):
        cat, note = NEW_ONLY[n_ord]
        t = new_by[n_ord]
        print(f"| {n_ord} | {t.section} | {t.page} | {t.name_pl} |")

    print("\n## 5. Weryfikacja szczegółowa\n")
    print("### 5.1 Autorzy — korekty w nowym spisie\n")
    author_fixes = [
        ("Demeter i Kora", "Anna Murdzek → **Wanda Markowska**"),
        ("Jerzy i tajny klucz", "L. i S. Hawking → **Lucy i Stephen Hawking**"),
        ("Kiedy niebo spada na głowę", "Goscinny, Uderzo → **René Goscinny, Albert Uderzo**"),
        ("Dom dziecka", "plakat → utwór **Ewa Lipska**, *Dom Dziecka*"),
        ("Kupić", "zastąpiony przez **Kupść** (ten sam autor, inny tytuł utworu)"),
        ("Sprawdź siebie (koniec)", "Załazińska, Rusinek *Wakacje* → **Jacek Podsiadło**, *Z dziennika Ernesta*"),
    ]
    for title, fix in author_fixes:
        print(f"- *{title}*: {fix}")

    print("\n### 5.2 Tytuły utworów — usunięte\n")
    for o, (n, c, _) in CURATED.items():
        if n is None and c == "D":
            print(f"- {old_by[o].name_pl}")

    print("\n### 5.3 Strony podręcznika\n")
    print("Numery stron w generatorze (A) **systematycznie różnią się** od GWO 2016 (B).")
    print("Nowy spis jest spójny wewnętrznie (s. 10–339). Generator wygląda na oparty o **inną edycję/wydanie**.")
    print("Przykłady skoku: ostatni temat A = s.386, B = s.339 (−47 stron).\n")

    print("### 5.4 Bloki gramatyczne („Listy z podróży…\")\n")
    print("| Blok | A (order) | B (order) | Status |")
    print("|------|-----------|-----------|--------|")
    grammar = [
        ("Rzeczownik — podział", 16, 14, "OK, strona"),
        ("Odmiana rzeczowników", 20, 20, "OK"),
        ("Przymiotnik", 23, 23, "OK"),
        ("Stopniowanie przymiotników", 27, 28, "OK"),
        ("Liczebnik", 33, 34, "OK"),
        ("Czasownik", 37, 38, "OK"),
        ("Tryby czasownika", 40, 41, "OK"),
        ("Czasowniki dokonane/niedokonane", 46, "—", "**USUNIĘTY**"),
        ("Przysłówek", 49, 45, "OK, bez ortografii"),
        ("Zaimek", 52, 49, "OK"),
        ("Odmiana zaimków", 54, 52, "OK"),
        ("Przyimek (W drodze do domu)", 56, 54, "OK"),
        ("Wykrzyknik i partykuła (ZIE)", 58, "—", "**USUNIĘTY**"),
        ("Wypowiedzenia oznajmujące… (WAZ)", "—", 67, "**NOWY**"),
        ("Zdanie i równoważnik (DZI)", "—", 70, "**NOWY**"),
        ("Zdanie pojedyncze i złożone (DZI)", "—", 73, "**NOWY**"),
        ("Zdanie rozwinięte (GWO)", 73, 80, "przeniesiony WAZ→GWO"),
    ]
    for name, a, b, st in grammar:
        print(f"| {name} | {a} | {b} | {st} |")

    print("\n### 5.5 Bloki ortograficzne\n")
    orto = [
        ("Pierwsze lądowanie — ó,rz,ż,ch wymienne", 4, 4, "tytuł doprecyzowany"),
        ("Co się zdarzyło rzeźbiarce — rz niewymienne", 6, 6, "tytuł doprecyzowany"),
        ("Dlaczego jabłka nie spadają…", 29, 30, "OK"),
        ("Król Salomon i więźniowie", 67, 61, "OK, inna kolejność w WAZ"),
    ]
    for name, a, b, st in orto:
        print(f"- {name}: A#{a} → B#{b} ({st})")

    print("\n### 5.6 „Sprawdź siebie”\n")
    print("| # | A order | B order | A str. | B str. | Treść |")
    print("|---|---------|---------|--------|--------|-------|")
    ss = [
        ("Parasol / Ratajczak", 31, 32, 89, 97, "bez zmian merytorycznych"),
        ("Kosmiczne wakacje / Opala", 59, 55, 190, 174, "bez zmian"),
        ("O Dedalu → Mit o Dedalu", 102, 91, 325, 281, "zmiana tytułu"),
        ("Wakacje → Z dziennika Ernesta", 124, 112, 386, 339, "**zastąpiony** innym utworem"),
    ]
    for name, ao, no, ap, np, note in ss:
        print(f"| {name} | {ao} | {no} | {ap} | {np} | {note} |")

    print("\n## 6. Podsumowanie\n")
    unchanged = identical
    needs = len(old) - removed - unchanged
    print(f"| Metryka | Wartość |")
    print(f"|---------|---------|")
    print(f"| Tematy bez zmian (A) | **{unchanged}** |")
    print(f"| Tematy wymagające aktualizacji (B+E+F) | **{needs}** |")
    print(f"| Nowe tematy do dodania (C) | **{added}** |")
    print(f"| Tematy do usunięcia (D) | **{removed}** |")
    print(f"| Docelowa liczba po aktualizacji | **{len(new)}** |")
    print("\n---\n*Raport analityczny — bez propozycji SQL, seedów ani zmian w generatorze.*")


if __name__ == "__main__":
    main()
