## API Endpoint Implementation Plan: POST /api/ai/requests

### 1. Przegląd punktu końcowego

- Cel: Przyjęcie tekstu wejściowego do wygenerowania propozycji fiszek przez AI. Tworzy rekord `ai_requests` o statusie `queued` i identyfikuje/zapewnia unikalny `generation_set` na bazie `(user_id, input_hash)`. Na odpowiedzi zwracany jest identyfikator żądania i powiązanego zestawu generacji do późniejszego podglądu/postępu.
- Lokalizacja: `src/pages/api/ai/requests.ts`
- Render: `export const prerender = false`
- Autoryzacja: Supabase Auth (sesja z ciasteczka) + RLS na tabelach

### 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/api/ai/requests`
- Nagłówki:
  - `Content-Type: application/json`
  - Autoryzacja via sesja Supabase (cookie); brak Bearer na froncie (serwer odczytuje z cookies)
- Parametry:
  - Wymagane:
    - `input_text: string` (≤ 10000 znaków)
  - Opcjonalne: brak
- Body (JSON): zgodne z `AiRequestCreateCommand`
  - `{ "input_text": "..." }`

### 3. Wykorzystywane typy

- Z `src/types.ts`:
  - `AiRequestCreateCommand` (request)
  - `AiRequestEnqueueResponseDTO` (response 202)
  - `AiRequestStatus` (enum)
  - `GenerationSetRow` (alias) – dla ID i pól powiązanych
  - `CardStatus`, `CardOrigin` – pośrednio w logice czyszczenia proposed kart

### 4. Szczegóły odpowiedzi

- 202 Accepted (sukces asynchroniczny):
  - Body: `AiRequestEnqueueResponseDTO`
    - `{ "ai_request_id": "uuid", "generation_set_id": "uuid", "status": "queued" }`
- Błędy:
  - 400 validation_error – nieprawidłowe dane wejściowe (np. puste, >10000 znaków)
  - 401 unauthorized – brak sesji użytkownika
  - 429 rate_limited – przekroczony limit (aplikacyjny)
  - 500 internal_error – błąd serwera/DB

### 5. Przepływ danych

1) Autoryzacja
   - API route korzysta z `context.locals.supabase` (typ z `src/db/supabase.client.ts`) do identyfikacji użytkownika (auth.uid()).
   - Jeśli brak zalogowanego użytkownika → 401.

2) Walidacja wejścia (Zod)
   - Zdefiniuj `AiRequestCreateSchema` zgodną z `AiRequestCreateCommand`:
     - `input_text: string`, wymagana, `min(1)`, `max(10000)`.
   - W razie błędu walidacji → 400.

3) Normalizacja i hasz wejścia
   - Normalizuj `input_text`: trim, kompresja białych znaków (np. wielo-spacje → jedna spacja), normalizacja unicode (NFC), lowercasing opcjonalnie – decyzja: uwzględnić różnice semantyczne? Rekomendacja: nie zmieniać wielkości, jedynie whitespace i unicode.
   - Wylicz `sha256` z tekstu; przechowuj jako `bytea` (Buffer) dla kolumny `input_hash`.

4) Ustalenie/utworzenie `generation_set`
   - Unikalność: `(user_id, input_hash)` (DB constraint).
   - Strategia:
     - Spróbuj pobrać istniejący `generation_set` dla `(user_id, input_hash)`.
     - Jeśli istnieje:
       - Powiąż nowe `ai_request` z tym zestawem (wstawiając `ai_requests` i aktualizując `generation_sets.ai_request_id` → nowy request).
       - Wyczyść poprzednie propozycje dla zestawu:
         - Implementacyjnie: zaktualizuj `cards` gdzie `generation_set_id = set` i `status = 'proposed'` → soft remove (np. `status='rejected'`) lub twarde delete (zgodnie ze spec rozdział 2.5/2.4). Rekomendacja: ustaw `status='rejected'` dla ścieżki audytu.
     - Jeśli nie istnieje:
       - Utwórz nowy `generation_set` z `input_text`, `input_hash`, opcjonalnie z referencją do nowo utworzonego `ai_request`.
   - Ważne: Operacje wykonywać tak, aby odporne były na warunki wyścigu:
     - Preferuj wykorzystanie unikalności w DB oraz „upsert” na `generation_sets` po `(user_id, input_hash)`; w ścieżce konfliktu – pobierz istniejący rekord i kontynuuj.

5) Utworzenie `ai_requests`
   - Wstaw `ai_requests`:
     - `user_id = auth.uid()`
     - `request_payload = { inputText }` (pełny tekst, rozważ redakcję przy długich payloadach)
     - `status = 'queued'`
   - Jeśli zestaw był nowy: zaktualizuj `generation_sets.ai_request_id` do utworzonego `ai_request_id`.

6) Zdarzenia (`event_log`)
   - Zapisz `ai_generation_requested` z `event_data`: `{ generation_set_id, ai_request_id }`.
   - Dalsze zdarzenia (`ai_generation_succeeded/failed`, `cards_proposed`) będą emitowane przez procesor w tle.

7) Odpowiedź
   - 202 Accepted z `{ ai_request_id, generation_set_id, status: 'queued' }`.

8) Przetwarzanie w tle (poza zakresem endpointu, ale wpływa na kontrakt)
   - Osobny worker/FaaS monitoruje `ai_requests` ze statusem `queued`, wywołuje OpenRouter, zapisuje `cards (proposed)` i aktualizuje status + zdarzenia.

### 6. Względy bezpieczeństwa

- Uwierzytelnienie:
  - Wymagana aktywna sesja Supabase; endpoint chroniony middleware dla `/api/*`.
- Autoryzacja:
  - RLS zapewnia zakres do `auth.uid()` na wszystkich tabelach.
- Walidacja:
  - Zod + dodatkowe ograniczenia DB (CHECK, długości) → obrona w głąb.
- CSRF:
  - SameSite cookies; dla SPA można dodatkowo oczekiwać `X-CSRF-Token` (opcjonalnie).
- PII/logi:
  - Ogranicz logowanie pełnych `input_text` w eventach/logach serwera (trzymaj je w DB w `request_payload`, a logach serwera używaj skrótów/hash).

### 7. Obsługa błędów

- 400 validation_error:
  - Niepoprawny lub za długi `input_text`.
- 401 unauthorized:
  - Brak sesji; `context.locals.supabase.auth.getUser()` zwraca brak użytkownika.
- 429 rate_limited:
  - Osiągnięty limit na użytkownika/czas.
- 500 internal_error:
  - Błędy DB (poza walidacją), problemy z serializacją, nieprzewidziane wyjątki.
- Mapowanie błędów:
  - Zwracaj `{ error: { code, message, details? } }` zgodnie z konwencją ze specyfikacji.
- Rejestrowanie:
  - Log wewnętrzny (server-side) z `ai_request_id`/`generation_set_id` i trace-id.
  - Dodatkowo, jeśli dotyczy – `event_log` dla awarii na etapie procesora (nie w tym endpointzie).

### 8. Rozważania dotyczące wydajności

- Indeksy i ograniczenia:
  - Wspierają wyszukiwanie i unikalność: `(user_id, input_hash)`.
- Minimalizacja round-tripów:
  - Pobieranie/Upsert `generation_sets` + wstawienie `ai_requests` w uporządkowanej sekwencji.
- Rozmiar payloadu:
  - Odrzucaj >10000 znaków wcześnie.
  - Nie duplikuj `input_text` w zbyt wielu logach.
- Idempotencja:
  - Idempotentność wobec tego samego `input_text` jest osiągana poprzez reuse `generation_set` – ale zawsze tworzymy nowe `ai_request` (śledzenie historii żądań).

### 9. Kroki implementacji

1) Schemat walidacji
   - Utwórz `src/lib/validation/aiRequests.schema.ts`:
     - Eksport `AiRequestCreateSchema` (Zod) oraz helper `parseAiRequestCreate`.

2) Funkcje pomocnicze
   - `src/lib/utils/text.ts`: `normalizeForHash(input: string): string` (trim, whitespace, NFC).
   - `src/lib/utils/hash.ts`: `sha256ToBuffer(input: string): Uint8Array | Buffer`.

3) Serwisy
   - `src/lib/services/generationSets.service.ts`:
     - `findOrCreateGenerationSetForUser(supabase, userId, input_text, input_hash)`.
     - `clearProposedCardsForSet(supabase, generation_set_id)` (ustawia `status='rejected'` lub delete).
     - Wewnątrz używać typów z `src/db/supabase.client.ts` i DTO z `src/types.ts`.
   - `src/lib/services/aiRequests.service.ts`:
     - `createAiRequestQueued(supabase, userId, request_payload, generation_set_id?)` → `{ ai_request_id }`.
     - `linkAiRequestToGenerationSet(supabase, generation_set_id, ai_request_id)`.
   - `src/lib/services/events.service.ts`:
     - `appendEvent(supabase, userId, event_type, event_data)`.

4) Endpoint
   - `src/pages/api/ai/requests.ts`:
     - `export const prerender = false`.
     - `export async function POST(context) { ... }`.
     - Użyj `context.locals.supabase` (typ: `SupabaseClient` z `src/db/supabase.client.ts`).
     - Kroki:
       1. Autoryzacja: pobierz userId lub 401.
       2. Walidacja body via `AiRequestCreateSchema`.
       3. Normalizacja + hash.
       4. `findOrCreateGenerationSetForUser` z inputem i hashem.
       5. `clearProposedCardsForSet` jeśli set istniał wcześniej.
       6. `createAiRequestQueued` (status `queued`), zapisz payload.
       7. `linkAiRequestToGenerationSet` (jeśli nowy set).
       8. `appendEvent(..., "ai_generation_requested", { ai_request_id, generation_set_id })`.
       9. Zwróć 202 z `AiRequestEnqueueResponseDTO`.
     - Błędy mapuj do 400/401/429/500 zgodnie z rozdziałem „Obsługa błędów".

5) Middleware
   - Upewnij się, że `src/middleware/index.ts` egzekwuje auth dla `/api/*` (z wyłączeniami jeśli są).

6) Observability
   - Dodaj lekkie logi serwerowe (debug/info) z identyfikatorami i mierz czas operacji.

### 10. Konwencje implementacyjne i zgodność

- Stack: Astro 5, TypeScript 5, Supabase, Zod.
- Reguły:
  - Używaj `context.locals.supabase`, nie importuj globalnego klienta.
  - Walidacja Zod w API.
  - Logika w serwisach pod `src/lib/services/`.
  - `export const prerender = false` w route.
  - Zwracaj JSON zgodny z typami z `src/types.ts`.


