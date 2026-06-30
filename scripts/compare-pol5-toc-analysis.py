#!/usr/bin/env python3
"""Analytical comparison: POL5 generator (A) vs new GWO textbook TOC (B). Read-only."""
from __future__ import annotations

import importlib.util
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEN = ROOT / "scripts/generate-klasa5-polski-curriculum.py"

# Source B: new textbook TOC (GWO, wyd. 4, 2016) transcribed from provided screenshots
# Format: (chapter, subsection_code, subsection_name, name_pl, page, kind_hint)
# subsection_code maps to generator section where applicable

NEW_TOC: list[tuple[str, str, str, str, int, str]] = [
    # Dziwny ten świat → KOS
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos", "Preludium (Jan Lechoń)", 10, "L"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos", "Tajemnice kosmosu (zdjęcia)", 12, "K"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos", "Ziemia we Wszechświecie", 14, "K"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos",
     "Pierwsze lądowanie na Księżycu. Pisownia wyrazów z ó, rz, ż, ch wymiennym", 16, "O"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos", "Noc (Antoni Wic)", 18, "L"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos",
     "Co się zdarzyło rzeźbiarce Katarzynie? Pisownia wyrazów z rz niewymiennym", 20, "O"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos",
     "Jerzy i tajny klucz do Wszechświata (Lucy i Stephen Hawking, fragment)", 23, "L"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos", "Przypowieść o maku (Czesław Miłosz)", 27, "L"),
    ("Dziwny ten świat", "KOS", "Zachwycający kosmos",
     "Kiedy niebo spada na głowę (René Goscinny, Albert Uderzo, fragment)", 29, "L"),
    # Odpowiedzi na ważne pytania → PYT
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Początek świata (Wojciech Rzehak)", 32, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Prometeusz (Wanda Markowska)", 35, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Demeter i Kora (Wanda Markowska)", 39, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Królestwo morza (Jan Parandowski)", 44, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania",
     "Listy z podróży z gramatyką w tle — rzeczownik. Podział rzeczowników", 48, "G"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania",
     "Mówiono, że wiatry są boskiego pochodzenia (Jan Parandowski)", 51, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania",
     "Pracujemy ze słownikami — wyrazy bliskoznaczne", 54, "S"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Helios i Faeton (Jan Parandowski)", 56, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Potop (Anna Kamieńska)", 58, "L"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Na królewskich tkaninach (arrasy wawelskie)", 65, "K"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania",
     "Listy z podróży z gramatyką w tle — odmiana rzeczowników. Pisownia nie z rzeczownikami", 66, "G"),
    ("Odpowiedzi na ważne pytania", "PYT", "Odpowiedzi na ważne pytania", "Jaka będzie pogoda?", 70, "W"),
    # W zwykły i niezwykły sposób → ZJA
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Dwa wiatry (Julian Tuwim)", 72, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Listy z podróży z gramatyką w tle — przymiotnik", 75, "G"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Pan Tadeusz (Adam Mickiewicz, fragment)", 78, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Dwa słońca (Józef Ratajczak)", 80, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Słoneczniki (Vincent van Gogh, obraz)", 82, "K"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Deszczyk (Julian Tuwim)", 84, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Listy z podróży z gramatyką w tle — stopniowanie przymiotników. Pisownia nie z przymiotnikami", 87, "G"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Podniebna kanonada (Marcin Szczygielski)", 90, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Dlaczego jabłka nie spadają na boki? Pisownia ó, u, ż, rz, ch, h w zakończeniach wyrazów", 94, "O"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Pan Tadeusz (Adam Mickiewicz, fragment)", 95, "L"),
    ("W zwykły i niezwykły sposób o zjawiskach", "ZJA", "W zwykły i niezwykły sposób o zjawiskach",
     "Sprawdź siebie — Parasol (Józef Ratajczak)", 97, "W"),
    # Gdzie stopy nasze → WYZ, CEL, ZIE
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie",
     "Kronika olsztyńska (Konstanty Ildefons Gałczyński, fragment)", 102, "L"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie",
     "Listy z podróży z gramatyką w tle — liczebnik. Pisownia nie z liczebnikami", 104, "G"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie", "Początek wielkiej przygody (Juliusz Verne)", 108, "L"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie", "Pracujemy ze słownikami — poprawna polszczyzna", 110, "S"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie", "Próba odwagi (Paweł Beręsewicz)", 112, "L"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie",
     "Listy z podróży z gramatyką w tle — czasownik. Pisownia nie z czasownikami", 117, "G"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie", "Razem na bieguny (Marek Kamiński, fragment)", 120, "L"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie", "Podróże (Zofia Beszczyńska)", 125, "L"),
    ("Gdzie stopy nasze", "WYZ", "Podjąć wyzwanie",
     "Listy z podróży z gramatyką w tle — tryby czasownika. Pisownia -bym, -byś, -by", 127, "G"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu", "Słońce – gorąca gwiazda (Ludmiła Marjańska)", 130, "L"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu",
     "Bajka o biednym chłopcu, który znalazł skarb (C.W. Ceram, fragment)", 133, "L"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu", "Tułaczka Odyseusza (Jan Parandowski)", 138, "L"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu",
     "Listy z podróży z gramatyką w tle — przysłówek", 148, "G"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu", "Skarb Troi (Olaf Fritsche, fragment)", 150, "L"),
    ("Gdzie stopy nasze", "CEL", "W drodze do celu", "Prezentujemy ofertę biura podróży", 156, "W"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!", "Chrońmy nasze środowisko!", 157, "W"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!",
     "Listy z podróży z gramatyką w tle — zaimek", 160, "G"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!", "Zieleń (Kazimierz Śladewski)", 163, "L"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!", "Piszemy list oficjalny", 165, "W"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!",
     "Listy z podróży z gramatyką w tle — odmiana zaimków", 167, "G"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!", "To nasza Ziemia (plakat)", 169, "K"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!",
     "W drodze do domu — przyimek. Wyrażenie przyimkowe", 171, "G"),
    ("Gdzie stopy nasze", "ZIE", "Ocalmy Ziemię!",
     "Sprawdź siebie — Kosmiczne wakacje (Renata Opala, fragment)", 174, "W"),
    # Świat ludzkich spraw → WAZ, DZI
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Loteria (Olga Tokarczuk)", 180, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze",
     "Pieniądze szczęścia nie dają (Tadeusz Baranowski, fragment)", 185, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze",
     "Są takie wyspy (Anna Kamieńska, fragment)", 192, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Czucie niewinne (Leopold Staff)", 195, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Bajka (Henryk Sienkiewicz)", 197, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze",
     "Król Salomon i więźniowie — pisownia rz, ż, ch, h", 200, "O"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze",
     "Ballada o szczęściu (s. Magdalena Nazaretanka)", 202, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Kruk i lis (Ignacy Krasicki)", 204, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Lis i kozieł (Adam Mickiewicz)", 205, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Lew i wdzięczna mysz (Ezop)", 206, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze", "Trzcina i oliwka (Ezop)", 206, "L"),
    ("Świat ludzkich spraw", "WAZ", "Ważne, ważniejsze, najważniejsze",
     "Spotkanie z przyjaciółmi — wypowiedzenia oznajmujące, pytające i rozkazujące", 208, "G"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Dom (Anna Kamieńska)", 211, "L"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Kołysanka dla Okruszka (Osiecka, Krajewski)", 216, "L"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień",
     "Wyjście do kina — zdanie i równoważnik zdania", 217, "G"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Kupść (Radomiła Birkenmajer-Walczy)", 219, "L"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Dieta cud, w domu głód (Krystyna Drzewiecka)", 226, "L"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień",
     "Klasa V planuje szkolną wycieczkę — zdanie pojedyncze i zdanie złożone", 228, "G"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Zadanie domowe (Jacek Dubois)", 232, "L"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Informacje, wiadomości, relacje… (zdjęcia)", 235, "K"),
    ("Świat ludzkich spraw", "DZI", "Dzień jak co dzień", "Syzyf (Jan Parandowski)", 236, "L"),
    # Gdy świat staje na głowie → GWO
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Puszka Pandory (Wanda Markowska)", 240, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie",
     "Za niebieskimi drzwiami (Marcin Szczygielski, fragment)", 243, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Juniper Berry (M.P. Kozłowski)", 247, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie",
     "Z dodatkowymi informacjami i bez nich — zdanie pojedyncze rozwinięte i nierozwinięte", 251, "G"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie",
     "To nie było… (Małgorzata Strękowska-Zaremba)", 253, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "W komputerowym świecie (Dorota Suwalska)", 255, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Uzależnieni od komputera (Anna Jasińska)", 257, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Dom Dziecka (Ewa Lipska)", 259, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie",
     "O diabełku, który odważył się śmiać (Mieczysław Maliński, fragment)", 261, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Przeprowadzka (Tomasz Małkowski)", 266, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Pan Wredzik (Grzegorz Kasdepke)", 272, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Szczęśliwy książę (Oscar Wilde)", 275, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Rzeźba boskiego buntownika (rzeźby)", 277, "K"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "W świecie greckich mitów", 279, "L"),
    ("Gdy świat staje na głowie", "GWO", "Gdy świat staje na głowie", "Sprawdź siebie — Mit o Dedalu", 281, "W"),
    # Twórca i dzieło → FIC, SZT
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Pudełko zwane wyobraźnią (Zbigniew Herbert)", 287, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Proces przeciwko pociągowi (Gianni Rodari)", 289, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Piszemy scenariusz przedstawienia (zdjęcia)", 292, "K"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych",
     "Warsztat aktora — poprawna i staranna wymowa wyrazów. Akcent", 294, "G"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "W teatrze (plansza)", 300, "K"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Jak powstaje film? (Krzysztof Kornacki)", 303, "K"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Magiczne filmy Andrzeja Maleszki", 306, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Nokturn (Izabella Klebańska)", 312, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Wariacje (Izabella Klebańska)", 312, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Abby w studio nagrań (Bobbie Pyron)", 314, "L"),
    ("Twórca i dzieło", "FIC", "Twórcy światów fikcyjnych", "Kto? Co? Gdzie i kiedy? — piszemy ogłoszenie", 318, "W"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "Sztuka przeżywania", 320, "K"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki",
     "Przygody Sindbada Żeglarza (Bolesław Leśmian)", 321, "L"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki",
     "Kwiaciarnia i studio florystyczne — słownik języka polskiego i wyrazów obcych", 322, "S"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "Geniusz muzyczny (Anna Czerwińska-Rydel)", 325, "L"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "Po konkursie — cytat", 328, "W"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "W muzeum (zdjęcia)", 330, "K"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "Straż nocna (Rembrandt, obraz)", 332, "K"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki",
     "Tytus malarzem (Henryk Jerzy Chmielewski, fragment)", 333, "L"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki", "Spotkanie", 336, "L"),
    ("Twórca i dzieło", "SZT", "Zapraszamy do świata sztuki",
     "Sprawdź siebie — Z dziennika Ernesta (Jacek Podsiadło)", 339, "W"),
]


def norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[„""\"'«»]", "", s)
    s = re.sub(r"\([^)]*\)", "", s)
    s = re.sub(r"[^\wąćęłńóśźż\s\-—]", " ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def fingerprint(name: str) -> str:
    n = norm(name)
    for token in (
        "listy z podróży z gramatyką w tle",
        "pracujemy ze słownikami",
        "sprawdź siebie",
        "w drodze do domu",
        "warsztat aktora",
        "kto co gdzie i kiedy",
        "po konkursie",
        "z dodatkowymi informacjami i bez nich",
    ):
        if token in n:
            return token
    # literary title heuristic: after last paren removed, take first 6 words
    words = n.split()[:8]
    return " ".join(words)


@dataclass
class Topic:
    order: int
    section: str
    section_name: str
    chapter: str
    name_pl: str
    page: int
    kind: str
    code: str = ""
    review: bool = False

    @property
    def fp(self) -> str:
        return fingerprint(self.name_pl)


def load_old() -> list[Topic]:
    spec = importlib.util.spec_from_loader("gen", importlib.util.spec_from_file_location("gen", GEN).loader)  # type: ignore
    mod = importlib.util.module_from_spec(spec)  # type: ignore
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    mod.build_topics()
    out: list[Topic] = []
    sec_names = {s[0]: s[1] for s in mod.SECTIONS}
    chapters = {
        "KOS": "Dziwny ten świat",
        "PYT": "Odpowiedzi na ważne pytania",
        "ZJA": "W zwykły i niezwykły sposób o zjawiskach",
        "WYZ": "Gdzie stopy nasze",
        "CEL": "Gdzie stopy nasze",
        "ZIE": "Gdzie stopy nasze",
        "WAZ": "Świat ludzkich spraw",
        "DZI": "Świat ludzkich spraw",
        "GWO": "Gdy świat staje na głowie",
        "FIC": "Twórca i dzieło",
        "SZT": "Twórca i dzieło",
    }
    for i, t in enumerate(mod.TOPICS, start=1):
        sec = t["section"]
        out.append(
            Topic(
                order=i,
                section=sec,
                section_name=sec_names[sec],
                chapter=chapters[sec],
                name_pl=t["name_pl"],
                page=t["page"],
                kind=t["kind"],
                code=t["key"],
                review=t["requires_review"],
            )
        )
    return out


def load_new() -> list[Topic]:
    out: list[Topic] = []
    for i, (ch, sec, sec_name, name, page, kind) in enumerate(NEW_TOC, start=1):
        out.append(
            Topic(
                order=i,
                section=sec,
                section_name=sec_name,
                chapter=ch,
                name_pl=name,
                page=page,
                kind=kind,
                code=f"NEW-{i:03d}",
            )
        )
    return out


def main() -> None:
    old = load_old()
    new = load_new()

    print("=" * 72)
    print("POL5 — RAPORT PORÓWNAWCZY (A: generator vs B: nowy spis treści GWO 2016)")
    print("=" * 72)
    print(f"\n1. LICZBA TEMATÓW")
    print(f"   Stara wersja (A): {len(old)}")
    print(f"   Nowa wersja (B):  {len(new)}")
    print(f"   Różnica:          {len(new) - len(old):+d}")

    # Sections
    spec = importlib.util.spec_from_file_location("gen", GEN)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    print("\n2. SEKCJE (kody generatora — identyczne 11 poddziałów)")
    print("   Wszystkie 11 kodów sekcji (KOS…SZT) zachowane.")
    print("   Rozdziały nadrzędne w nowym podręczniku (nazwy z TOC):")
    chapters_new = sorted({t.chapter for t in new})
    chapters_old = sorted({t.chapter for t in old})
    for c in chapters_new:
        mark = "✓" if c in chapters_old or any(c.startswith(x.split()[0]) for x in chapters_old) else "?"
        print(f"     • {c}")

    # Match topics
    old_by_fp: dict[str, list[Topic]] = {}
    new_by_fp: dict[str, list[Topic]] = {}
    for t in old:
        old_by_fp.setdefault(t.fp, []).append(t)
    for t in new:
        new_by_fp.setdefault(t.fp, []).append(t)

    matched_old: set[int] = set()
    matched_new: set[int] = set()
    identical: list[tuple[Topic, Topic]] = []
    renamed: list[tuple[Topic, Topic, list[str]]] = []
    moved: list[tuple[Topic, Topic]] = []
    reordered: list[tuple[Topic, Topic]] = []

    for fp, olds in old_by_fp.items():
        news = new_by_fp.get(fp, [])
        if not news:
            continue
        for o in olds:
            best = min(news, key=lambda n: abs(n.page - o.page))
            matched_old.add(o.order)
            matched_new.add(best.order)
            diffs = []
            if norm(o.name_pl) != norm(best.name_pl):
                diffs.append("name")
            if o.page != best.page:
                diffs.append(f"page ({o.page}→{best.page})")
            if o.section != best.section:
                diffs.append(f"section ({o.section}→{best.section})")
                moved.append((o, best))
            if o.order != best.order:
                reordered.append((o, best))
            if not diffs:
                identical.append((o, best))
            elif "section" not in [d.split()[0] for d in diffs if "section" in d]:
                if diffs:
                    renamed.append((o, best, diffs))

    removed = [t for t in old if t.order not in matched_old]
    added = [t for t in new if t.order not in matched_new]

    # dedupe moved from renamed
    moved_orders = {o.order for o, _ in moved}

    print(f"\n3. KATEGORIE TEMATÓW")
    print(f"   A) Identyczne (dopasowanie semantyczne):     {len(identical)}")
    print(f"   B) Przemianowane / zmiana metadanych:        {len(renamed) + len(moved) + len(reordered)}")
    print(f"   C) Dodane w nowej wersji:                    {len(added)}")
    print(f"   D) Usunięte ze starej wersji:                {len(removed)}")
    print(f"   E) Przeniesione (inna sekcja):               {len(moved)}")
    print(f"   F) Zmieniona kolejność (order):              {len(reordered)}")

    print("\n4. SZCZEGÓŁY — DODANE (C)")
    for t in added:
        print(f"   NEW {t.order:3d} | {t.section} | s.{t.page} | {t.name_pl}")

    print("\n4. SZCZEGÓŁY — USUNIĘTE (D)")
    for t in removed:
        print(f"   OLD {t.order:3d} | {t.code} | {t.section} | s.{t.page} | {t.name_pl}")

    print("\n4. SZCZEGÓŁY — PRZENIESIONE (E)")
    for o, n in moved:
        print(f"   {o.code} order {o.order:3d}→{n.order:3d} | {o.section}→{n.section} | {o.name_pl[:55]}")

    print("\n4. SZCZEGÓŁY — PRZEMIANOWANE / ZMIANA STRONY (B, wybrane)")
    shown = 0
    for o, n, diffs in renamed:
        if o.order in moved_orders:
            continue
        print(f"   {o.code} {o.order:3d}→{n.order:3d} | {', '.join(diffs)}")
        print(f"      OLD: {o.name_pl}")
        print(f"      NEW: {n.name_pl}")
        shown += 1
        if shown >= 25:
            print(f"   ... i {len(renamed) - shown} więcej")
            break

    print("\n5. WERYFIKACJA SPECYFICZNA")
    # Sprawdź siebie
    old_ss = [t for t in old if "sprawdź siebie" in t.name_pl.lower()]
    new_ss = [t for t in new if "sprawdź siebie" in t.name_pl.lower()]
    print(f"   Sprawdź siebie — stara: {len(old_ss)}, nowa: {len(new_ss)}")
    for o in old_ss:
        print(f"     OLD {o.order:3d} s.{o.page} {o.name_pl}")
    for n in new_ss:
        print(f"     NEW {n.order:3d} s.{n.page} {n.name_pl}")

    # Grammar blocks count
    def is_gram(t: Topic) -> bool:
        n = t.name_pl.lower()
        return t.kind in ("G", "O", "S") or "listy z podróży" in n or "pracujemy ze słownikami" in n

    print(f"\n   Bloki G/O/S — stara: {sum(1 for t in old if is_gram(t))}, nowa: {sum(1 for t in new if is_gram(t))}")

    unchanged = len(identical)
    needs_update = len(old) - len(removed) - unchanged
    print("\n6. PODSUMOWANIE")
    print(f"   Bez zmian (identyczne):     {unchanged}")
    print(f"   Wymaga aktualizacji:        {needs_update}")
    print(f"   Nowe tematy do dodania:     {len(added)}")
    print(f"   Tematy do usunięcia:        {len(removed)}")
    print(f"   Netto po aktualizacji:      {len(old) - len(removed) + len(added)} → {len(new)} docelowo")


if __name__ == "__main__":
    main()
