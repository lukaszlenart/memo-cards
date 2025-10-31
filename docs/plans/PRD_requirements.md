Zakres MVP: aplikacja web, jedna lista fiszek na użytkownika; generowanie AI z jednego promptu oraz ręczne tworzenie, edycja, usuwanie fiszek.
Wejście: tekst w języku polskim, do 10 000 znaków, bez dodatkowego formatowania; brak tagów czy kategorii.
Fiszki: każda zawiera pytanie (≤200 znaków) i odpowiedź (≤500 znaków); użytkownik akceptuje cały wygenerowany zestaw naraz.
Kontrola jakości: jedynym mechanizmem korekty jest ręczna edycja lub ponowna generacja; brak wersjonowania, brak zgłaszania błędów.
Metryki: liczba wygenerowanych fiszek, liczba zaakceptowanych fiszek, wskaźnik akceptacji (przycisk „zaakceptuj”).
Powtórki: integracja przez gotową bibliotekę open-source, bez przechowywania harmonogramu ani historii powtórek.
Konta: logowanie email + hasło, bez ról, bez wymagań skalowalności na MVP.
UX: brak onboardingu, brak priorytetu responsywności mobilnej.
Ryzyka: brak planu awaryjnego przy problemach z biblioteką powtórek, brak dodatkowych zabezpieczeń jakościowych.
Organizacja pracy: projekt rozwijany samodzielnie, bez formalnego harmonogramu, z prostymi listami zadań.