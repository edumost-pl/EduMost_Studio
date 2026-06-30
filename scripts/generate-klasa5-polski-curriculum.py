#!/usr/bin/env python3
"""Generate seed_klasa5_jezyk_polski.sql — Język polski Klasa 5 (GWO wyd. 4, 2016).

ISBN 978-83-7420-128-5 — 112 topics, display_order 1–112.
"""

from __future__ import annotations

from pathlib import Path

OUTPUT = (
    Path(__file__).resolve().parent.parent
    / "electron/database/seed/seed_klasa5_jezyk_polski.sql"
)

SUBJECT_ID = 2
SUBJECT_CODE = "POL"
SCHOOL_CLASS = 5
TOPIC_COUNT = 112
TEXTBOOK = "GWO Język polski kl. 5, wyd. 4 (2016), ISBN 978-83-7420-128-5"

SECTIONS = [
    ("KOS", "Zachwycający kosmos", "Дивовижний космос",
     "Poddział podręcznika — kosmos i nauka o Wszechświecie.",
     "Підрозділ підручника — космос і наука про Всесвіт.", 1),
    ("PYT", "Odpowiedzi na ważne pytania", "Відповіді на важливі запитання",
     "Poddział podręcznika — początki świata, mitologia, gramatyka.",
     "Підрозділ підручника — початки світу, міфологія, граматика.", 2),
    ("ZJA", "W zwykły i niezwykły sposób o zjawiskach", "Звичайно й незвичайно про явища",
     "Poddział podręcznika — pogoda, zjawiska przyrodnicze.",
     "Підрозділ підручника — погода, природні явища.", 3),
    ("WYZ", "Podjąć wyzwanie", "Прийняти виклик",
     "Poddział „Gdzie stopy nasze” — podróże i odkrywanie.",
     "Підрозділ «Gdzie stopy nasze» — подорожі та відкриття.", 4),
    ("CEL", "W drodze do celu", "У дорозі до мети",
     "Poddział „Gdzie stopy nasze” — tułaczka, mit, cel podróży.",
     "Підрозділ «Gdzie stopy nasze» — мандрівка, міф, мета подорожі.", 5),
    ("ZIE", "Ocalmy Ziemię!", "Врятуємо Землю!",
     "Poddział „Gdzie stopy nasze” — ekologia i środowisko.",
     "Підрозділ «Gdzie stopy nasze» — екологія та довкілля.", 6),
    ("WAZ", "Ważne, ważniejsze, najważniejsze", "Важливе, важливіше, найважливіше",
     "Poddział „Świat ludzkich spraw” — wartości i bajki.",
     "Підрозділ «Świat ludzkich spraw» — цінності та байки.", 7),
    ("DZI", "Dzień jak co dzień", "День як кожен день",
     "Poddział „Świat ludzkich spraw” — codzienność i media.",
     "Підрозділ «Świat ludzkich spraw» — буденність і медіа.", 8),
    ("GWO", "Gdy świat staje na głowie", "Коли світ стає на голову",
     "Rozdział podręcznika — świat cyfrowy i mitologia.",
     "Розділ підручника — цифровий світ і міфологія.", 9),
    ("FIC", "Twórcy światów fikcyjnych", "Творці вигаданих світів",
     "Poddział „Twórca i dzieło” — literatura, teatr, film.",
     "Підрозділ «Twórca i dzieło» — література, театр, кіно.", 10),
    ("SZT", "Zapraszamy do świata sztuki", "Запрошуємо у світ мистецтва",
     "Poddział „Twórca i dzieło” — sztuka, muzeum, architektura.",
     "Підрозділ «Twórca i dzieło» — мистецтво, музей, архітектура.", 11),
]

# Raport walidacyjny — tematy usunięte względem wersji 124-tematowej
REMOVED_TOPICS: list[tuple[str, str]] = [
    ("POL5-PYT-011", "Świat stworzony przez Boga"),
    ("POL5-PYT-012", "Pierwotny stan szczęścia"),
    ("POL5-PYT-013", "Który stwarzasz jagody (Jan Twardowski)"),
    ("POL5-WYZ-038", "W pustyni i w puszczy (Henryk Sienkiewicz, fragment)"),
    ("POL5-WYZ-039", "Mit o Heraklesie (Nikos Chadzinikolau, fragment)"),
    ("POL5-CEL-046", "Listy z podróży z gramatyką w tle — czasowniki dokonane i niedokonane"),
    ("POL5-CEL-050", "Taka droga, co nie ma końca (Joanna Kulmowa)"),
    ("POL5-ZIE-058", "Spotkanie z przyjaciółmi — wykrzyknik i partykuła"),
    ("POL5-WAZ-062", "O modzie — podział wypowiedzeń. Powtórzenie"),
    ("POL5-WAZ-064", "Chłopcy z Placu Broni (Ferenc Molnár, fragment)"),
    ("POL5-WAZ-071", "Pszczoła i szerszeń (Ignacy Krasicki)"),
    ("POL5-WAZ-072", "Syn i ojciec (Ignacy Krasicki)"),
    ("POL5-DZI-076", "O muzyce — współrzędne i podrzędne połączenia wyrazowe"),
    ("POL5-DZI-079", "Znikająca trampolina (Dorota Kassjanowicz)"),
    ("POL5-DZI-080", "Moje zainteresowania — grupa podmiotu i orzeczenia"),
    ("POL5-DZI-082", "W błędnym kole — wykres zdania pojedynczego"),
    ("POL5-DZI-086", "Nasze zainteresowania — przydawka jako określenie rzeczownika"),
    ("POL5-GWO-093", "Ankieta dla korzystających z komputera — okolicznik i dopełnienie"),
    ("POL5-GWO-097", "Katarynka (Bolesław Prus)"),
    ("POL5-GWO-098", "Przypowieść o miłosiernym Samarytaninie"),
    ("POL5-GWO-099", "Zwrócić uwagę innych (plakaty)"),
    ("POL5-FIC-106", "Warsztat aktora — rodzaje głosek (scalony z blokiem wymowy)"),
    ("POL5-FIC-110", "Wywiad z Mariuszem Palejem"),
    ("POL5-SZT-115", "Po drugiej stronie lustra (Lewis Carroll)"),
    ("POL5-SZT-119", "Burmistrz i ogród rzeźb (Piret Raud)"),
    ("POL5-SZT-122", "Architektki Warszawy (Anna Dziewit-Meller)"),
]

# Raport walidacyjny — tematy nowe (order w docelowym spisie)
ADDED_TOPICS: list[tuple[int, str, str]] = [
    (15, "PYT", "Mówiono, że wiatry są boskiego pochodzenia (Jan Parandowski)"),
    (18, "PYT", "Potop (Anna Kamieńska)"),
    (19, "PYT", "Na królewskich tkaninach (arrasy wawelskie)"),
    (58, "WAZ", "Są takie wyspy (Anna Kamieńska, fragment)"),
    (65, "WAZ", "Lew i wdzięczna mysz (Ezop)"),
    (67, "WAZ", "Spotkanie z przyjaciółmi — wypowiedzenia oznajmujące, pytające i rozkazujące"),
    (68, "DZI", "Dom (Anna Kamieńska)"),
    (70, "DZI", "Wyjście do kina — zdanie i równoważnik zdania"),
    (73, "DZI", "Klasa V planuje szkolną wycieczkę — zdanie pojedyncze i zdanie złożone"),
    (88, "GWO", "Szczęśliwy książę (Oscar Wilde)"),
    (98, "FIC", "Magiczne filmy Andrzeja Maleszki"),
    (101, "FIC", "Abby w studio nagrań (Bobbie Pyron)"),
    (104, "SZT", "Przygody Sindbada Żeglarza (Bolesław Leśmian)"),
    (105, "SZT", "Kwiaciarnia i studio florystyczne — słownik języka polskiego i wyrazów obcych"),
]

# Raport walidacyjny — przeniesienia między sekcjami
MOVED_TOPICS: list[tuple[str, str, str, str, int]] = [
    ("POL5-ZJA-022 → POL5-PYT-021", "ZJA", "PYT", "Jaka będzie pogoda?", 70),
    ("POL5-WAZ-073 → POL5-GWO-080", "WAZ", "GWO",
     "Z dodatkowymi informacjami i bez nich — zdanie pojedyncze rozwinięte i nierozwinięte", 251),
    ("POL5-DZI-074 → POL5-GWO-086", "DZI", "GWO", "Przeprowadzka (Tomasz Małkowski)", 266),
    ("POL5-DZI-077 → POL5-ZJA-024", "DZI", "ZJA",
     "Pan Tadeusz (Adam Mickiewicz, fragment) — wcześniejszy fragment w ZJA", 78),
]

# (section, name_pl, name_ua, page, kind, requires_review)
# kind: L=lit, G=gram, O=ort, S=vocab, W=writing, K=culture
RAW: list[tuple[str, str, str, int, str, bool]] = [
    # KOS 1–9
    ("KOS", "Preludium (Jan Lechoń)", "*Preludium* (Jan Lechoń)", 10, "L", False),
    ("KOS", "Tajemnice kosmosu (zdjęcia)", "Tajemnice kosmosu (zdjęcia)", 12, "K", False),
    ("KOS", "Ziemia we Wszechświecie", "Ziemia we Wszechświecie", 14, "K", True),
    ("KOS", "Pierwsze lądowanie na Księżycu. Pisownia wyrazów z ó, rz, ż, ch wymiennym",
     """„Pierwsze lądowanie na Księżycu". Правопис ó, rz, ż, ch взаємозамінних""", 16, "O", False),
    ("KOS", "Noc (Antoni Wic)", "*Noc* (Antoni Wic)", 18, "L", False),
    ("KOS", "Co się zdarzyło rzeźbiarce Katarzynie? Pisownia wyrazów z rz niewymiennym",
     """„Co się zdarzyło rzeźbiarce Katarzynie?". Правопис невзаємозамінного rz""", 20, "O", False),
    ("KOS", "Jerzy i tajny klucz do Wszechświata (Lucy i Stephen Hawking, fragment)",
     "*Jerzy i tajny klucz do Wszechświata* (Lucy i Stephen Hawking, fragment)", 23, "L", False),
    ("KOS", "Przypowieść o maku (Czesław Miłosz)", "*Przypowieść o maku* (Czesław Miłosz)", 27, "L", False),
    ("KOS", "Kiedy niebo spada na głowę (René Goscinny, Albert Uderzo, fragment)",
     "*Kiedy niebo spada na głowę* (René Goscinny, Albert Uderzo, fragment)", 29, "L", False),
    # PYT 10–21
    ("PYT", "Początek świata (Wojciech Rzehak)", "*Początek świata* (Wojciech Rzehak)", 32, "L", False),
    ("PYT", "Prometeusz (Wanda Markowska)", "*Prometeusz* (Wanda Markowska)", 35, "L", False),
    ("PYT", "Demeter i Kora (Wanda Markowska)", "*Demeter i Kora* (Wanda Markowska)", 39, "L", False),
    ("PYT", "Królestwo morza (Jan Parandowski)", "*Królestwo morza* (Jan Parandowski)", 44, "L", False),
    ("PYT", "Listy z podróży z gramatyką w tle — rzeczownik. Podział rzeczowników",
     """„Listy z podróży z gramatyką w tle". Частини мови — іменник. Поділ іменників""", 48, "G", False),
    ("PYT", "Mówiono, że wiatry są boskiego pochodzenia (Jan Parandowski)",
     "*Mówiono, że wiatry są boskiego pochodzenia* (Jan Parandowski)", 51, "L", False),
    ("PYT", "Pracujemy ze słownikami — wyrazy bliskoznaczne",
     """„Pracujemy ze słownikami". Словник синонімів""", 54, "S", False),
    ("PYT", "Helios i Faeton (Jan Parandowski)", "*Helios i Faeton* (Jan Parandowski)", 56, "L", False),
    ("PYT", "Potop (Anna Kamieńska)", "*Potop* (Anna Kamieńska)", 58, "L", False),
    ("PYT", "Na królewskich tkaninach (arrasy wawelskie)",
     "Na królewskich tkaninach (arrasy wawelskie)", 65, "K", False),
    ("PYT", "Listy z podróży z gramatyką w tle — odmiana rzeczowników. Pisownia nie z rzeczownikami",
     """„Listy z podróży z gramatyką w tle". Відміна іменників. Правопис nie з іменниками""", 66, "G", False),
    ("PYT", "Jaka będzie pogoda?", "Jaka będzie pogoda?", 70, "W", True),
    # ZJA 22–32
    ("ZJA", "Dwa wiatry (Julian Tuwim)", "*Dwa wiatry* (Julian Tuwim)", 72, "L", False),
    ("ZJA", "Listy z podróży z gramatyką w tle — przymiotnik",
     """„Listy z podróży z gramatyką w tle". Частини мови — прикметник""", 75, "G", False),
    ("ZJA", "Pan Tadeusz (Adam Mickiewicz, fragment)", "*Pan Tadeusz* (Adam Mickiewicz, fragment)", 78, "L", False),
    ("ZJA", "Dwa słońca (Józef Ratajczak)", "*Dwa słońca* (Józef Ratajczak)", 80, "L", False),
    ("ZJA", "Słoneczniki (Vincent van Gogh, obraz)", "*Słoneczniki* (Vincent van Gogh, obraz)", 82, "K", False),
    ("ZJA", "Deszczyk (Julian Tuwim)", "*Deszczyk* (Julian Tuwim)", 84, "L", False),
    ("ZJA", "Listy z podróży z gramatyką w tle — stopniowanie przymiotników. Pisownia nie z przymiotnikami",
     """„Listy z podróży z gramatyką w tle". Ступені прикметників. Правопис nie з прикметниками""", 87, "G", False),
    ("ZJA", "Podniebna kanonada (Marcin Szczygielski)", "*Podniebna kanonada* (Marcin Szczygielski)", 90, "L", False),
    ("ZJA", "Dlaczego jabłka nie spadają na boki? Pisownia ó, u, ż, rz, ch, h w zakończeniach wyrazów",
     """„Dlaczego jabłka nie spadają na boki?". Правопис ó, u, ż, rz, ch, h у кінцівках слів""", 94, "O", False),
    ("ZJA", "Pan Tadeusz (Adam Mickiewicz, fragment)", "*Pan Tadeusz* (Adam Mickiewicz, fragment)", 95, "L", False),
    ("ZJA", "Sprawdź siebie — Parasol (Józef Ratajczak)", "Sprawdź siebie — *Parasol* (Józef Ratajczak)", 97, "W", False),
    # WYZ 33–41
    ("WYZ", "Kronika olsztyńska (Konstanty Ildefons Gałczyński, fragment)",
     "*Kronika olsztyńska* (Konstanty Ildefons Gałczyński, fragment)", 102, "L", False),
    ("WYZ", "Listy z podróży z gramatyką w tle — liczebnik. Pisownia nie z liczebnikami",
     """„Listy z podróży z gramatyką w tle". Частини мови — числівник. Правопис nie з числівниками""", 104, "G", False),
    ("WYZ", "Początek wielkiej przygody (Juliusz Verne)", "*Początek wielkiej przygody* (Juliusz Verne)", 108, "L", False),
    ("WYZ", "Pracujemy ze słownikami — poprawna polszczyzna",
     """„Pracujemy ze słownikami". Словник правильної польської мови""", 110, "S", False),
    ("WYZ", "Próba odwagi (Paweł Beręsewicz)", "*Próba odwagi* (Paweł Beręsewicz)", 112, "L", False),
    ("WYZ", "Listy z podróży z gramatyką w tle — czasownik. Pisownia nie z czasownikami",
     """„Listy z podróży z gramatyką w tle". Частини мови — дієслово. Правопис nie з дієсловами""", 117, "G", False),
    ("WYZ", "Razem na bieguny (Marek Kamiński, fragment)", "*Razem na bieguny* (Marek Kamiński, fragment)", 120, "L", False),
    ("WYZ", "Podróże (Zofia Beszczyńska)", "*Podróże* (Zofia Beszczyńska)", 125, "L", False),
    ("WYZ", "Listy z podróży z gramatyką w tle — tryby czasownika. Pisownia -bym, -byś, -by",
     """„Listy z podróży z gramatyką w tle". Способи дієслова. Правопис -bym, -byś, -by""", 127, "G", False),
    # CEL 42–47
    ("CEL", "Słońce – gorąca gwiazda (Ludmiła Marjańska)", "*Słońce – gorąca gwiazda* (Ludmiła Marjańska)", 130, "L", False),
    ("CEL", "Bajka o biednym chłopcu, który znalazł skarb (C.W. Ceram, fragment)",
     "*Bajka o biednym chłopcu, który znalazł skarb* (C.W. Ceram, fragment)", 133, "L", False),
    ("CEL", "Tułaczka Odyseusza (Jan Parandowski)", "*Tułaczka Odyseusza* (Jan Parandowski)", 138, "L", False),
    ("CEL", "Listy z podróży z gramatyką w tle — przysłówek",
     """„Listy z podróży z gramatyką w tle". Частини мови — прислівник""", 148, "G", False),
    ("CEL", "Skarb Troi (Olaf Fritsche, fragment)", "*Skarb Troi* (Olaf Fritsche, fragment)", 150, "L", False),
    ("CEL", "Prezentujemy ofertę biura podróży", "Prezentujemy ofertę biura podróży", 156, "W", False),
    # ZIE 48–55
    ("ZIE", "Chrońmy nasze środowisko!", "Chrońmy nasze środowisko!", 157, "W", False),
    ("ZIE", "Listy z podróży z gramatyką w tle — zaimek",
     """„Listy z podróży z gramatyką w tle". Частини мови — займенник""", 160, "G", False),
    ("ZIE", "Zieleń (Kazimierz Śladewski)", "*Zieleń* (Kazimierz Śladewski)", 163, "L", False),
    ("ZIE", "Piszemy list oficjalny", "Piszemy list oficjalny", 165, "W", False),
    ("ZIE", "Listy z podróży z gramatyką w tle — odmiana zaimków",
     """„Listy z podróży z gramatyką w tle". Відміна займенників""", 167, "G", False),
    ("ZIE", "To nasza Ziemia (plakat)", "To nasza Ziemia (plakat)", 169, "K", True),
    ("ZIE", "W drodze do domu — przyimek. Wyrażenie przyimkowe",
     """„W drodze do domu". Частини мови — прийменник. Прийменниковий зворот""", 171, "G", False),
    ("ZIE", "Sprawdź siebie — Kosmiczne wakacje (Renata Opala, fragment)",
     "Sprawdź siebie — *Kosmiczne wakacje* (Renata Opala, fragment)", 174, "W", False),
    # WAZ 56–67
    ("WAZ", "Loteria (Olga Tokarczuk)", "*Loteria* (Olga Tokarczuk)", 180, "L", False),
    ("WAZ", "Pieniądze szczęścia nie dają (Tadeusz Baranowski, fragment)",
     "*Pieniądze szczęścia nie dają* (Tadeusz Baranowski, fragment)", 185, "L", False),
    ("WAZ", "Są takie wyspy (Anna Kamieńska, fragment)",
     "*Są takie wyspy* (Anna Kamieńska, fragment)", 192, "L", False),
    ("WAZ", "Czucie niewinne (Leopold Staff)", "*Czucie niewinne* (Leopold Staff)", 195, "L", False),
    ("WAZ", "Bajka (Henryk Sienkiewicz)", "*Bajka* (Henryk Sienkiewicz)", 197, "L", False),
    ("WAZ", "Król Salomon i więźniowie — pisownia rz, ż, ch, h",
     """„Król Salomon i więźniowie". Правопис rz, ż, ch, h""", 200, "O", False),
    ("WAZ", "Ballada o szczęściu (s. Magdalena Nazaretanka)",
     "*Ballada o szczęściu* (s. Magdalena Nazaretanka)", 202, "L", True),
    ("WAZ", "Kruk i lis (Ignacy Krasicki)", "*Kruk i lis* (Ignacy Krasicki)", 204, "L", False),
    ("WAZ", "Lis i kozieł (Adam Mickiewicz)", "*Lis i kozieł* (Adam Mickiewicz)", 205, "L", False),
    ("WAZ", "Lew i wdzięczna mysz (Ezop)", "*Lew i wdzięczna mysz* (Ezop)", 206, "L", False),
    ("WAZ", "Trzcina i oliwka (Ezop)", "*Trzcina i oliwka* (Ezop)", 206, "L", False),
    ("WAZ", "Spotkanie z przyjaciółmi — wypowiedzenia oznajmujące, pytające i rozkazujące",
     """„Spotkanie z przyjaciółmi". Висловлювання оціювальні, питальні й наказові""", 208, "G", False),
    # DZI 68–76
    ("DZI", "Dom (Anna Kamieńska)", "*Dom* (Anna Kamieńska)", 211, "L", False),
    ("DZI", "Kołysanka dla Okruszka (Osiecka, Krajewski)",
     "*Kołysanka dla Okruszka* (Osiecka, Krajewski)", 216, "L", False),
    ("DZI", "Wyjście do kina — zdanie i równoważnik zdania",
     """„Wyjście do kina". Речення й рівнозначник речення""", 217, "G", False),
    ("DZI", "Kupść (Radomiła Birkenmajer-Walczy)", "*Kupść* (Radomiła Birkenmajer-Walczy)", 219, "L", False),
    ("DZI", "Dieta cud, w domu głód (Krystyna Drzewiecka)", "*Dieta cud, w domu głód* (Krystyna Drzewiecka)", 226, "L", False),
    ("DZI", "Klasa V planuje szkolną wycieczkę — zdanie pojedyncze i zdanie złożone",
     """„Klasa V planuje szkolną wycieczkę". Речення просте й зложене""", 228, "G", False),
    ("DZI", "Zadanie domowe (Jacek Dubois)", "*Zadanie domowe* (Jacek Dubois)", 232, "L", False),
    ("DZI", "Informacje, wiadomości, relacje… (zdjęcia)", "Informacje, wiadomości, relacje… (zdjęcia)", 235, "K", False),
    ("DZI", "Syzyf (Jan Parandowski)", "*Syzyf* (Jan Parandowski)", 236, "L", False),
    # GWO 77–91
    ("GWO", "Puszka Pandory (Wanda Markowska)", "*Puszka Pandory* (Wanda Markowska)", 240, "L", False),
    ("GWO", "Za niebieskimi drzwiami (Marcin Szczygielski, fragment)",
     "*Za niebieskimi drzwiami* (Marcin Szczygielski, fragment)", 243, "L", False),
    ("GWO", "Juniper Berry (M.P. Kozłowski)", "*Juniper Berry* (M.P. Kozłowski)", 247, "L", True),
    ("GWO", "Z dodatkowymi informacjami i bez nich — zdanie pojedyncze rozwinięte i nierozwinięte",
     """„Z dodatkowymi informacjami i bez nich". Розширене й нерозширене просте речення""", 251, "G", False),
    ("GWO", "To nie było… (Małgorzata Strękowska-Zaremba)", "*To nie było…* (Małgorzata Strękowska-Zaremba)", 253, "L", False),
    ("GWO", "W komputerowym świecie (Dorota Suwalska)", "*W komputerowym świecie* (Dorota Suwalska)", 255, "L", False),
    ("GWO", "Uzależnieni od komputera (Anna Jasińska)", "*Uzależnieni od komputera* (Anna Jasińska)", 257, "L", False),
    ("GWO", "Dom Dziecka (Ewa Lipska)", "*Dom Dziecka* (Ewa Lipska)", 259, "L", False),
    ("GWO", "O diabełku, który odważył się śmiać (Mieczysław Maliński, fragment)",
     "*O diabełku, który odważył się śmiać* (Mieczysław Maliński, fragment)", 261, "L", False),
    ("GWO", "Przeprowadzka (Tomasz Małkowski)", "*Przeprowadzka* (Tomasz Małkowski)", 266, "L", False),
    ("GWO", "Pan Wredzik (Grzegorz Kasdepke)", "*Pan Wredzik* (Grzegorz Kasdepke)", 272, "L", False),
    ("GWO", "Szczęśliwy książę (Oscar Wilde)", "*Szczęśliwy książę* (Oscar Wilde)", 275, "L", False),
    ("GWO", "Rzeźba boskiego buntownika (rzeźby)", "Rzeźba boskiego buntownika (rzeźby)", 277, "K", True),
    ("GWO", "W świecie greckich mitów", "W świecie greckich mitów", 279, "L", True),
    ("GWO", "Sprawdź siebie — Mit o Dedalu", "Sprawdź siebie — Mit o Dedalu", 281, "W", False),
    # FIC 92–102
    ("FIC", "Pudełko zwane wyobraźnią (Zbigniew Herbert)", "*Pudełko zwane wyobraźnią* (Zbigniew Herbert)", 287, "L", False),
    ("FIC", "Proces przeciwko pociągowi (Gianni Rodari)", "*Proces przeciwko pociągowi* (Gianni Rodari)", 289, "L", False),
    ("FIC", "Piszemy scenariusz przedstawienia (zdjęcia)", "Piszemy scenariusz przedstawienia (zdjęcia)", 292, "K", False),
    ("FIC", "Warsztat aktora — poprawna i staranna wymowa wyrazów. Akcent",
     """„Warsztat aktora". Правильна й охайна вимова слів. Наголос""", 294, "G", False),
    ("FIC", "W teatrze (plansza)", "W teatrze (plansza)", 300, "K", True),
    ("FIC", "Jak powstaje film? (Krzysztof Kornacki)", "*Jak powstaje film?* (Krzysztof Kornacki)", 303, "K", False),
    ("FIC", "Magiczne filmy Andrzeja Maleszki", "Magiczne filmy Andrzeja Maleszki", 306, "L", False),
    ("FIC", "Nokturn (Izabella Klebańska)", "*Nokturn* (Izabella Klebańska)", 312, "L", False),
    ("FIC", "Wariacje (Izabella Klebańska)", "*Wariacje* (Izabella Klebańska)", 312, "L", True),
    ("FIC", "Abby w studio nagrań (Bobbie Pyron)", "*Abby w studio nagrań* (Bobbie Pyron)", 314, "L", False),
    ("FIC", "Kto? Co? Gdzie i kiedy? — piszemy ogłoszenie",
     """„Kto? Co? Gdzie i kiedy?". Piszemy ogłoszenie""", 318, "W", False),
    # SZT 103–112
    ("SZT", "Sztuka przeżywania", "Sztuka przeżywania", 320, "K", True),
    ("SZT", "Przygody Sindbada Żeglarza (Bolesław Leśmian)",
     "*Przygody Sindbada Żeglarza* (Bolesław Leśmian)", 321, "L", False),
    ("SZT", "Kwiaciarnia i studio florystyczne — słownik języka polskiego i wyrazów obcych",
     """„Kwiaciarnia i studio florystyczne". Словник польської мови та словник іншомовних слів""", 322, "S", False),
    ("SZT", "Geniusz muzyczny (Anna Czerwińska-Rydel)", "*Geniusz muzyczny* (Anna Czerwińska-Rydel)", 325, "L", False),
    ("SZT", "Po konkursie — cytat", """„Po konkursie". Cytat""", 328, "W", False),
    ("SZT", "W muzeum (zdjęcia)", "W muzeum (zdjęcia)", 330, "K", True),
    ("SZT", "Straż nocna (Rembrandt, obraz)", "*Straż nocna* (Rembrandt, obraz)", 332, "K", False),
    ("SZT", "Tytus malarzem (Henryk Jerzy Chmielewski, fragment)",
     "*Tytus malarzem* (Henryk Jerzy Chmielewski, fragment)", 333, "L", False),
    ("SZT", "Spotkanie", "Spotkanie", 336, "L", True),
    ("SZT", "Sprawdź siebie — Z dziennika Ernesta (Jacek Podsiadło)",
     "Sprawdź siebie — *Z dziennika Ernesta* (Jacek Podsiadło)", 339, "W", False),
]

SECTION_BY_CODE = {s[0]: s for s in SECTIONS}
TOPICS: list[dict] = []
TOPIC_BY_KEY: dict[str, dict] = {}


def topic_code(section: str, order: int) -> str:
    return f"{SUBJECT_CODE}{SCHOOL_CLASS}-{section}-{order:03d}"


def lesson_type_for(kind: str, name_pl: str) -> str:
    if name_pl.startswith("Sprawdź siebie"):
        return "Review"
    if kind in ("G", "O"):
        return "New Knowledge"
    if kind == "W":
        return "Practice"
    if kind == "S":
        return "New Knowledge"
    return "New Knowledge"


def stage_for(order: int, kind: str, name_pl: str) -> str:
    if name_pl.startswith("Sprawdź siebie"):
        return "Practiced"
    if order == 1:
        return "Introduced"
    if order <= 40:
        return "Developed"
    if order <= 90:
        return "Practiced"
    return "Mastered"


def build_topics() -> None:
    TOPICS.clear()
    TOPIC_BY_KEY.clear()
    if len(RAW) != TOPIC_COUNT:
        raise ValueError(f"Expected {TOPIC_COUNT} topics, got {len(RAW)}")
    for order, (section, name_pl, name_ua, page, kind, review) in enumerate(RAW, start=1):
        sec = SECTION_BY_CODE[section]
        key = topic_code(section, order)
        pp = f"POL5.{order:03d}"
        t = {
            "section": section,
            "section_name_pl": sec[1],
            "key": key,
            "name_pl": name_pl,
            "name_ua": name_ua,
            "page": page,
            "kind": kind,
            "requires_review": review,
            "pp_code": pp,
            "pp_pl": f"Realizacja tematu podręcznika klasy 5: „{name_pl}” (s. {page}).",
            "stage": stage_for(order, kind, name_pl),
            "lesson_type": lesson_type_for(kind, name_pl),
            "prereq_keys": [],
            "next_keys": [],
            "related_keys": [],
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
    review_note = " [REQUIRES_REVIEW]" if t["requires_review"] else ""

    desc_pl = (
        f"Poddział „{dzial}” — Język polski kl. 5. Temat „{pl}” (s. {t['page']})"
        f"{review_note}. Kategoria: {t['kind']}."
    )
    desc_ua = (
        f"Підрозділ «{SECTION_BY_CODE[t['section']][2]}» — Польська мова, 5 клас. "
        f"Тема «{ua}» (s. {t['page']}){review_note}. Категорія: {t['kind']}."
    )
    prereq_pl = (
        f"• {TOPIC_BY_KEY[k]['name_pl']}" for k in t["prereq_keys"]
    )
    prereq_ua = (
        f"• {TOPIC_BY_KEY[k]['name_ua']}" for k in t["prereq_keys"]
    )
    return {
        "description_pl": desc_pl,
        "description_ua": desc_ua,
        "prerequisites_pl": "\n".join(prereq_pl) if t["prereq_keys"] else "• Wiedza z klasy 4 w zakresie języka polskiego",
        "prerequisites_ua": "\n".join(prereq_ua) if t["prereq_keys"] else "• Знання з 4 класу з польської мови",
        "outcomes_pl": (
            f"• Uczeń zna treść i cel tematu „{pl}”.\n"
            f"• Uczeń wykonuje zadania z podręcznika (s. {t['page']}).\n"
            f"• Kod programu: {t['pp_code']}."
        ),
        "outcomes_ua": (
            f"• Учень знає зміст і мету теми «{ua}».\n"
            f"• Учень виконує завдання з підручника (s. {t['page']}).\n"
            f"• Код програми: {t['pp_code']}."
        ),
        "terminology_pl": f"{t['pp_code']}; {t['section']}; s.{t['page']}",
        "terminology_ua": f"{t['pp_code']}; {t['section']}; s.{t['page']}",
        "methodology_pl": "Metodyka polska (II etap): czytanie → analiza → ćwiczenia. Praca indywidualna i w parach.",
        "methodology_ua": "Польська методика (II етап): читання → аналіз → вправи. Індивідуальна та парна робота.",
        "notes_pl": f"Podręcznik JP kl. 5, s. {t['page']}. Dział: {dzial}. Kolejność: {t['key'].split('-')[-1]}.",
        "notes_ua": f"Підручник JP 5 клас, s. {t['page']}. Розділ: {SECTION_BY_CODE[t['section']][2]}.",
    }


def lesson_for(t: dict, num: int) -> str:
    c = topic_content(t)
    code = f"POL5-L{num:03d}"
    pl, ua = t["name_pl"], t["name_ua"]
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
  {sql_str(code)}, {SUBJECT_ID}, {SCHOOL_CLASS}, {sql_str(t['lesson_type'])}, 45,
  {sql_str(pl)}, {sql_str(ua)},
  {sql_str(f'Uczeń realizuje temat „{pl}” (s. {t["page"]}).')},
  {sql_str(f'Учень реалізує тему «{ua}» (s. {t["page"]}).')},
  {sql_str(c['outcomes_pl'])}, {sql_str(c['outcomes_ua'])},
  {sql_str(c['terminology_pl'])}, {sql_str(c['terminology_ua'])},
  {sql_str(f'I. WPROWADZENIE (10 min)\\nTemat: {pl}.\\n\\nII. GŁÓWNA CZĘŚĆ (25 min)\\nPraca z podręcznikiem, s. {t["page"]}.\\n\\nIII. ĆWICZENIA (10 min)\\nZadania utrwalające.\\n\\nIV. PODSUMOWANIE (5 min)\\nRefleksja.')},
  {sql_str(f'I. ВСТУП (10 хв)\\nТема: {ua}.\\n\\nII. ОСНОВНА ЧАСТИНА (25 хв)\\nРобота з підручником, s. {t["page"]}.\\n\\nIII. ВПРАВИ (10 хв)\\nЗакріплювальні завдання.\\n\\nIV. ПІДСУМОК (5 хв)\\nРефлексія.')},
  {sql_str(f'Zadania domowe — s. {t["page"]} w podręczniku.')},
  {sql_str(f'Домашнє завдання — s. {t["page"]} у підручнику.')},
  {sql_str('Obserwacja, praca pisemna, samoocena.')},
  {sql_str('Спостереження, письмова робота, самооцінка.')},
  'EduMost', '1.0', 'Draft', 1
);"""


def generate_sql() -> str:
    build_topics()
    lines = [
        "-- EduMost Studio: Język polski Klasa 5 — pełny spis treści podręcznika",
        f"-- Generated by scripts/generate-klasa5-polski-curriculum.py",
        f"-- {TEXTBOOK}",
        f"-- Subject: POL (id={SUBJECT_ID}), {TOPIC_COUNT} topics, display_order 1–{TOPIC_COUNT}",
        "",
        "BEGIN TRANSACTION;",
        "",
    ]

    lines.append("-- Sections (11 poddziałów podręcznika)")
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
SELECT t.id, {SCHOOL_CLASS}, {sql_str(t['stage'])}, {sql_str(t['pp_code'])},
  {sql_str(t['pp_pl'])}, {sql_str(c['notes_pl'])}, {sql_str(c['notes_ua'])}, {order_idx}, 1
FROM Topics t WHERE t.code = {sql_str(t['key'])}
  AND NOT EXISTS (SELECT 1 FROM Curriculum c WHERE c.topic_id = t.id AND c.school_class = {SCHOOL_CLASS});""")

    lines.append("\n-- TopicRelations (PREREQUISITE + NEXT chain)")
    for t in TOPICS:
        for rt, keys in [("PREREQUISITE", t["prereq_keys"]), ("NEXT", t["next_keys"])]:
            for j, rk in enumerate(keys):
                desc_pl = {"PREREQUISITE": "Wymagane wcześniejsze opanowanie (kolejność podręcznika).",
                           "NEXT": "Następny temat wg spisu treści podręcznika."}[rt]
                desc_ua = {"PREREQUISITE": "Потрібне попереднє опанування (порядок підручника).",
                           "NEXT": "Наступна тема згідно зі змістом підручника."}[rt]
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
        lesson_links.append((f"POL5-L{i:03d}", t["key"]))

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
    """Sprawdź spójność kodów POL5-SEC-NNN."""
    errors: list[str] = []
    build_topics()
    orders = [int(t["key"].split("-")[-1]) for t in TOPICS]
    if orders != list(range(1, TOPIC_COUNT + 1)):
        errors.append(f"display_order nieciągły: {orders[:5]}…{orders[-5:]}")
    if len(orders) != len(set(orders)):
        errors.append("duplikaty display_order w kodach")
    for i, t in enumerate(TOPICS, start=1):
        expected = topic_code(t["section"], i)
        if t["key"] != expected:
            errors.append(f"order {i}: oczekiwano {expected}, jest {t['key']}")
    pages = [t["page"] for t in TOPICS]
    if pages != sorted(pages):
        errors.append("numery stron nie są niemalejące w całym spisie")
    return errors


def final_report() -> None:
    build_topics()
    errors = validate_codes()
    first, last = TOPICS[0], TOPICS[-1]
    by_section: dict[str, int] = {}
    for t in TOPICS:
        by_section[t["section"]] = by_section.get(t["section"], 0) + 1

    print("=" * 72)
    print("POL5 — RAPORT KOŃCOWY GENERATORA (GWO wyd. 4, 2016)")
    print("=" * 72)
    print(f"\nPodręcznik: {TEXTBOOK}")
    print(f"\n## Statystyki\n")
    print(f"| Metryka | Wartość |")
    print(f"|---------|---------|")
    print(f"| Liczba sekcji | **{len(SECTIONS)}** |")
    print(f"| Liczba tematów | **{len(TOPICS)}** |")
    print(f"| display_order | **1–{len(TOPICS)}** (ciągły) |")
    print(f"| Tematy REQUIRES_REVIEW | {sum(1 for t in TOPICS if t['requires_review'])} |")

    print(f"\n## Pierwszy temat\n")
    print(f"- **Kod:** {first['key']}")
    print(f"- **Sekcja:** {first['section']} — {first['section_name_pl']}")
    print(f"- **Strona:** {first['page']}")
    print(f"- **Nazwa:** {first['name_pl']}")

    print(f"\n## Ostatni temat\n")
    print(f"- **Kod:** {last['key']}")
    print(f"- **Sekcja:** {last['section']} — {last['section_name_pl']}")
    print(f"- **Strona:** {last['page']}")
    print(f"- **Nazwa:** {last['name_pl']}")

    print(f"\n## Tematy per sekcja\n")
    print("| Sekcja | Liczba |")
    print("|--------|-------:|")
    for code, pl, *_ in SECTIONS:
        print(f"| {code} — {pl} | {by_section.get(code, 0)} |")

    print(f"\n## Nowe tematy ({len(ADDED_TOPICS)})\n")
    for order, sec, name in ADDED_TOPICS:
        key = topic_code(sec, order)
        print(f"- **{key}** (order {order}, s. {TOPICS[order - 1]['page']}): {name}")

    print(f"\n## Usunięte tematy ({len(REMOVED_TOPICS)})\n")
    for old_code, name in REMOVED_TOPICS:
        print(f"- `{old_code}`: {name}")

    print(f"\n## Przeniesione między sekcjami ({len(MOVED_TOPICS)})\n")
    for mapping, old_sec, new_sec, name, page in MOVED_TOPICS:
        print(f"- **{mapping}**: {old_sec} → {new_sec} | s. {page} | {name}")

    print(f"\n## Walidacja kodów\n")
    if errors:
        print("**BŁĘDY:**")
        for e in errors:
            print(f"- {e}")
    else:
        print("✓ Wszystkie kody POL5-SEC-NNN zgodne z display_order 1–112")
        print("✓ Numery stron rosną monotonicznie w spisie")
        print(f"✓ Przykłady: {first['key']}, POL5-PYT-021, POL5-GWO-080, {last['key']}")

    print(f"\n## Uwagi\n")
    print("- Pan Tadeusz występuje **2× w ZJA** (s. 78 i s. 95) — zgodnie ze spisem GWO")
    print("- Duplikat z DZI usunięty; wcześniejszy fragment przeniesiony do POL5-ZJA-024")
    print("- Warsztat aktora: jeden scalony blok (POL5-FIC-095)")
    print("- SQL/seed **nie wygenerowany** — oczekuje na akceptację raportu")
    print("\n" + "=" * 72)


def write_seed() -> Path:
    sql = generate_sql()
    OUTPUT.write_text(sql, encoding="utf-8")
    return OUTPUT


def main() -> None:
    import sys
    if "--write" in sys.argv:
        path = write_seed()
        print(f"Zapisano: {path}")
        print(f"Rozmiar: {path.stat().st_size:,} bajtów")
        return
    final_report()


if __name__ == "__main__":
    main()
