# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu
10xCards to webowa aplikacja wspierająca intensywnie uczące się osoby w szybkim tworzeniu i utrzymaniu fiszek edukacyjnych. Produkt łączy automatyczne generowanie kart z tekstu przy pomocy AI, ręczną edycję oraz integrację z gotowym algorytmem powtórek. MVP zakłada pojedynczą listę fiszek na użytkownika, prosty system kont (email i hasło) oraz podstawowy interfejs webowy bez dodatkowych kanałów dystrybucji. Wdrożenie koncentruje się na dostarczeniu stabilnego przepływu pracy od generowania treści, przez weryfikację i akceptację kart, po ich wykorzystanie w sesjach powtórek.

## 2. Problem użytkownika
Docelowi użytkownicy (studenci, specjaliści, osoby uczące się samodzielnie) wiedzą, że fiszki i powtórki rozłożone w czasie są skuteczne, ale rezygnują, ponieważ ręczne tworzenie i utrzymanie dużej bazy kart jest czasochłonne i zniechęcające. Brak narzędzia, które pozwalałoby szybko przekształcić źródłowy tekst w gotowe fiszki, powoduje, że użytkownicy pozostają przy mniej efektywnych metodach nauki lub całkowicie porzucają regularne powtórki. Dodatkowo pojedyncze błędy w kartach trudno poprawić bez zagłębienia się w każdą kartę, co obniża zaufanie do procesu.

## 3. Wymagania funkcjonalne
1. Konta i dostęp
1.1 Formularz rejestracji przyjmuje adres email i hasło, weryfikuje format, wyświetla błędy walidacji i tworzy konto po spełnieniu warunków.
1.2 Formularz logowania weryfikuje poświadczenia, tworzy sesję i przekierowuje do listy fiszek po sukcesie.
1.3 Użytkownik może wylogować się z poziomu interfejsu, a zasoby po wylogowaniu stają się niedostępne bez ponownej autoryzacji.

2. Zarządzanie fiszkami
2.1 Widok listy fiszek prezentuje wszystkie zaakceptowane karty użytkownika w formie tabeli lub listy z możliwością wyszukiwania tekstowego po pytaniu.
2.2 Użytkownik może ręcznie dodać nową fiszkę, podając pytanie (≤200 znaków) i odpowiedź (≤500 znaków), a aplikacja waliduje limity przed zapisem.
2.3 Użytkownik może edytować istniejącą fiszkę, zapisując zmiany po walidacji limitów znaków.
2.4 Użytkownik może usunąć fiszkę, po potwierdzeniu operacji karta znika z listy i nie jest prezentowana w sesjach powtórek.

3. Generowanie AI
3.1 Użytkownik może wkleić tekst źródłowy w języku polskim do 10 000 znaków w dedykowanym polu.
3.2 Wysłanie tekstu uruchamia żądanie do usługi AI, które tworzy zestaw fiszek bez pośredniego formatowania.
3.3 Interfejs pokazuje stan sukcesu lub niepowodzenia.
3.4 Po zakończeniu generowania użytkownik otrzymuje pełny zestaw fiszek z pytaniami i odpowiedziami mieszczącymi się w limitach znaków.
3.5 Użytkownik może ponowić generowanie z tym samym lub zmodyfikowanym tekstem, co nadpisuje bieżący zestaw proponowanych kart przed akceptacją.

4. Akceptacja i zapis zestawu
4.1 Użytkownik musi zaakceptować lub odrzucić cały wygenerowany zestaw jednocześnie.
4.2 Użytkownik ma możliwość ręcznej edycji każdej fiszki lub też usuwania pojedynczych fiszek z wygenerowanej listy.
4.4 Akceptacja zapisuje wszystkie fiszki w koncie użytkownika, aktualizuje metryki i umożliwia dalszą edycję poszczególnych kart.
4.5 Odrzucenie usuwa zestaw z pamięci roboczej bez tworzenia kart.

5. Powtórki
5.1 Użytkownik może uruchomić sesję powtórek korzystającą z zewnętrznej biblioteki spaced repetition zasilanej zaakceptowanymi fiszkami.
5.2 Po każdej odpowiedzi biblioteka aktualizuje harmonogram w pamięci, a aplikacja zapisuje jedynie minimalne dane potrzebne do kontynuacji sesji (bez pełnej historii powtórek).
5.3 W przypadku niedostępności biblioteki aplikacja informuje użytkownika o przerwie w działaniu i zachowuje fiszki bez utraty danych.

6. Metryki i audyt
6.1 System rejestruje liczbę wygenerowanych zestawów, liczbę zaakceptowanych fiszek oraz liczbę fiszek stworzonych ręcznie.
6.2 Wskaźnik akceptacji AI jest obliczany jako stosunek zaakceptowanych fiszek do wszystkich wygenerowanych fiszek.
6.3 Dane metryczne są dostępne dla właściciela produktu w formie raportu na stronie www.

7. UX i dostępność
7.1 Interfejs jest zoptymalizowany pod desktop, zapewnia czytelne instrukcje limitów znaków i statusów generowania.
7.2 Brak dedykowanego onboardingu, ale każde kluczowe działanie posiada krótką podpowiedź kontekstową.
7.3 W przypadku błędów (AI, sieć) aplikacja wyświetla jednoznaczne komunikaty i umożliwia ponowienie akcji.

## 4. Granice produktu
1. Brak własnego, zaawansowanego algorytmu powtórek; aplikacja polega na zewnętrznej bibliotece.
2. Brak importu materiałów z plików (PDF, DOCX, obrazy) ani integracji z innymi platformami edukacyjnymi.
3. Brak współdzielenia zestawów między użytkownikami oraz funkcji społecznościowych.
4. Brak aplikacji mobilnych i natywnych powiadomień; skupienie na wersji webowej desktopowej.
5. Brak wersjonowania fiszek, śledzenia historii zmian oraz zautomatyzowanych mechanizmów zgłaszania błędów merytorycznych.
6. Jedna lista fiszek na użytkownika; brak tagów, kategorii, folderów czy wielu talii.
7. Brak planu awaryjnego dla awarii biblioteki powtórek poza komunikatem o niedostępności.

## 5. Historyjki użytkowników
ID: US-001
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę utworzyć konto, aby móc zapisywać moje fiszki i powroty.
Kryteria akceptacji:
- Podanie poprawnego email i hasła (min. 8 znaków) tworzy konto i loguje użytkownika.
- Błędny format email zwraca komunikat walidacyjny bez tworzenia konta.
- Próba rejestracji z zajętym adresem email wyświetla komunikat o duplikacie.

ID: US-002
Tytuł: Logowanie
Opis: Jako zarejestrowany użytkownik chcę się zalogować, aby uzyskać dostęp do moich fiszek.
Kryteria akceptacji:
- Poprawne poświadczenia przenoszą użytkownika do listy fiszek.
- Niepoprawne poświadczenia zwracają komunikat o błędzie bez tworzenia sesji.
- Sesja pozostaje aktywna do manualnego wylogowania lub 24 godzin braku aktywności.

ID: US-003
Tytuł: Wylogowanie
Opis: Jako zalogowany użytkownik chcę móc zakończyć sesję, aby zabezpieczyć moje dane.
Kryteria akceptacji:
- Wybranie opcji wylogowania kończy sesję i przenosi do ekranu logowania.
- Po wylogowaniu próba wejścia na chronione adresy przekierowuje do logowania.

ID: US-004
Tytuł: Generowanie fiszek przez AI
Opis: Jako użytkownik chcę wkleić tekst i otrzymać zaproponowane fiszki, aby szybko przygotować materiał do nauki.
Kryteria akceptacji:
- Pole tekstowe przyjmuje do 10 000 znaków i odrzuca dłuższe wejście z komunikatem.
- W czasie generowania wyświetlany jest stan ładowania i blokada ponownego wysłania.
- Wynik zawiera pytania do 200 znaków i odpowiedzi do 500 znaków.

ID: US-005
Tytuł: Obsługa błędu generowania
Opis: Jako użytkownik chcę otrzymać informację o niepowodzeniu generowania, aby zdecydować o ponowieniu próby.
Kryteria akceptacji:
- W przypadku błędu AI lub sieci aplikacja wyświetla komunikat z możliwością ponownego uruchomienia.
- Nieudane generowanie nie zapisuje żadnych fiszek w koncie użytkownika.
- Ponowne uruchomienie generowania wykorzystuje ostatnio wpisany tekst.

ID: US-006
Tytuł: Przegląd wygenerowanych fiszek
Opis: Jako użytkownik chcę przejrzeć propozycje fiszek przed akceptacją, aby ocenić ich jakość.
Kryteria akceptacji:
- Lista proponowanych fiszek pokazuje każdą kartę w układzie pytanie-odpowiedź.
- Użytkownik może przewinąć przez wszystkie pozycje przed podjęciem decyzji.
- Widok zawiera informację o liczbie fiszek w zestawie.

ID: US-007
Tytuł: Akceptacja zestawu AI
Opis: Jako użytkownik chcę zapisać cały wygenerowany zestaw, aby korzystać z niego w powtórkach.
Kryteria akceptacji:
- Zatwierdzenie zapisuje wszystkie fiszki w profilu i udostępnia je w widoku listy.
- Po akceptacji metryki generowania aktualizują liczbę zaakceptowanych fiszek.
- Po akceptacji użytkownik otrzymuje potwierdzenie sukcesu.

ID: US-008
Tytuł: Ponowna generacja zestawu
Opis: Jako użytkownik chcę wygenerować nowy zestaw na podstawie tego samego tekstu, gdy nie jestem zadowolony z wyników.
Kryteria akceptacji:
- Wybór opcji ponownej generacji tworzy nowe propozycje i zastępuje poprzednie przed akceptacją.
- System zachowuje wprowadzone źródło tekstu do edycji przed ponownym wysłaniem.
- Akceptacja dostępna jest tylko dla aktualnie wyświetlanego zestawu.

ID: US-009
Tytuł: Ręczne dodawanie fiszki
Opis: Jako użytkownik chcę samodzielnie utworzyć fiszkę, aby poprawić lub uzupełnić zestaw.
Kryteria akceptacji:
- Formularz wymaga wypełnienia pól pytanie i odpowiedź oraz waliduje limity znaków.
- Po zapisaniu nowa fiszka pojawia się na liście bez przeładowania strony.
- W przypadku błędów walidacji formularz podpowiada, które pola wymagają korekty.

ID: US-010
Tytuł: Edycja fiszki
Opis: Jako użytkownik chcę edytować istniejącą fiszkę, aby poprawić treść.
Kryteria akceptacji:
- Edycja otwiera formularz z aktualną treścią pytania i odpowiedzi.
- Zapis zmian aktualizuje fiszkę i zachowuje limity znaków.
- Anulowanie edycji nie zmienia zapisanej wersji karty.

ID: US-011
Tytuł: Usuwanie fiszki
Opis: Jako użytkownik chcę usunąć fiszkę, która jest błędna lub zbędna.
Kryteria akceptacji:
- Wybranie opcji usunięcia wymaga potwierdzenia działania.
- Po potwierdzeniu fiszka znika z listy i nie pojawia się w sesjach powtórek.
- Operacja jest nieodwracalna i zostaje zakomunikowana użytkownikowi.

ID: US-012
Tytuł: Przegląd listy fiszek
Opis: Jako użytkownik chcę przejrzeć wszystkie moje fiszki, aby planować naukę.
Kryteria akceptacji:
- Widok listy prezentuje wszystkie zaakceptowane fiszki z paginacją lub przewijaniem.
- Użytkownik może filtrować listę prostym wyszukiwaniem tekstowym po pytaniu.
- Lista odświeża się po każdej operacji dodania, edycji lub usunięcia.

ID: US-013
Tytuł: Sesja powtórek
Opis: Jako użytkownik chcę uruchomić sesję powtórek, aby ćwiczyć wiedzę zgodnie z algorytmem spaced repetition.
Kryteria akceptacji:
- Uruchomienie sesji ładuje fiszki zaakceptowane w koncie użytkownika.
- Po udzieleniu odpowiedzi biblioteka algorytmu zwraca kolejną fiszkę lub kończy sesję.
- W przypadku błędu biblioteki użytkownik otrzymuje komunikat z informacją o konieczności spróbowania później.

ID: US-014
Tytuł: Rejestrowanie metryk
Opis: Jako właściciel produktu chcę gromadzić metryki generowania fiszek, aby ocenić skuteczność AI.
Kryteria akceptacji:
- Zapis metryk obejmuje liczbę wygenerowanych i zaakceptowanych fiszek oraz fiszek dodanych ręcznie.
- Dane metryczne dostępne są przez stronę www.

## 6. Metryki sukcesu
1. Wskaźnik akceptacji fiszek generowanych przez AI minimum 75 procent w ujęciu miesięcznym.
2. Co najmniej 75 procent wszystkich nowych fiszek tworzonych przy użyciu funkcji generowania AI.
3. Całkowita liczba fiszek wygenerowanych przez AI i zaakceptowanych przez użytkowników w danym okresie raportowym.
4. Średnia liczba fiszek dodanych ręcznie na użytkownika miesiąc do miesiąca (monitorowanie jakości automatu).
5. Liczba aktywnych sesji powtórek uruchomionych w danym tygodniu jako wskaźnik wykorzystania.

