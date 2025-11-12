1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### Typy wyliczeniowe
- `CREATE TYPE card_origin_type AS ENUM ('manual', 'ai', 'ai-edited');`
- `CREATE TYPE card_status_type AS ENUM ('proposed', 'accepted', 'rejected', 'deleted');`
- `CREATE TYPE ai_request_status_type AS ENUM ('queued', 'processing', 'succeeded', 'failed');`
- `CREATE TYPE event_type AS ENUM ('ai_generation_requested', 'ai_generation_succeeded', 'ai_generation_failed', 'cards_proposed', 'cards_accepted', 'cards_rejected', 'card_created_manual', 'card_deleted', 'review_session_started', 'review_session_finished');`

### `app_users`
- `user_id uuid` PK; FK → `auth.users(id)` ON DELETE CASCADE.
- `preferred_language text` NOT NULL DEFAULT `'pl'` z CHECK `preferred_language IN ('pl', 'en')`.
- `is_active boolean` NOT NULL DEFAULT `true`.
- `created_at timestamptz` NOT NULL DEFAULT `now()`.
- `updated_at timestamptz` NOT NULL DEFAULT `now()`.

### `ai_requests`
- `ai_request_id uuid` PK DEFAULT `gen_random_uuid()`.
- `user_id uuid` NOT NULL FK → `app_users(user_id)` ON DELETE CASCADE.
- `request_payload jsonb` NOT NULL.
- `response_payload jsonb` NULL.
- `status ai_request_status_type` NOT NULL DEFAULT `'queued'`.
- `error_code text` NULL.
- `created_at timestamptz` NOT NULL DEFAULT `now()`.
- `updated_at timestamptz` NOT NULL DEFAULT `now()`.

### `generation_sets`
- `generation_set_id uuid` PK DEFAULT `gen_random_uuid()`.
- `user_id uuid` NOT NULL FK → `app_users(user_id)` ON DELETE CASCADE.
- `ai_request_id uuid` FK → `ai_requests(ai_request_id)` ON DELETE SET NULL.
- `input_text text` NOT NULL z CHECK `char_length(input_text) <= 10000`.
- `input_hash bytea` NOT NULL.
- `created_at timestamptz` NOT NULL DEFAULT `now()`.
- `updated_at timestamptz` NOT NULL DEFAULT `now()`.
- UNIQUE (`user_id`, `input_hash`).

### `cards`
- `card_id uuid` PK DEFAULT `gen_random_uuid()`.
- `user_id uuid` NOT NULL FK → `app_users(user_id)` ON DELETE CASCADE.
- `generation_set_id uuid` FK → `generation_sets(generation_set_id)` ON DELETE SET NULL.
- `question text` NOT NULL z CHECK `char_length(question) <= 200`.
- `answer text` NOT NULL z CHECK `char_length(answer) <= 500`.
- `origin card_origin_type` NOT NULL DEFAULT `'manual'`.
- `status card_status_type` NOT NULL DEFAULT `'proposed'`.
- `source_excerpt text` NULL.
- `deleted_at timestamptz` NULL.
- `created_at timestamptz` NOT NULL DEFAULT `now()`.
- `updated_at timestamptz` NOT NULL DEFAULT `now()`.
- CHECK `((origin = 'manual' AND generation_set_id IS NULL) OR (origin <> 'manual' AND generation_set_id IS NOT NULL))`.
- CHECK `((status = 'deleted' AND deleted_at IS NOT NULL) OR (status <> 'deleted' AND deleted_at IS NULL))`.

### `event_log`
- `event_id bigserial` PK.
- `user_id uuid` NOT NULL FK → `app_users(user_id)` ON DELETE CASCADE.
- `event_type event_type` NOT NULL.
- `event_data jsonb` NOT NULL DEFAULT `'{}'::jsonb`.
- `created_at timestamptz` NOT NULL DEFAULT `now()`.

2. Relacje między tabelami
- `auth.users (1)` ⇄ `(1) app_users`: relacja 1:1 (metadane użytkownika).
- `app_users (1)` ⇄ `(N) cards`: użytkownik posiada wiele fiszek.
- `app_users (1)` ⇄ `(N) generation_sets`: użytkownik posiada wiele zestawów generacji.
- `app_users (1)` ⇄ `(N) ai_requests`: użytkownik posiada wiele żądań AI.
- `app_users (1)` ⇄ `(N) event_log`: użytkownik generuje wiele zdarzeń.
- `generation_sets (1)` ⇄ `(N) cards`: zestaw generacji tworzy wiele fiszek; dla `origin = 'manual'` FK pozostaje `NULL`.
- `ai_requests (1)` ⇄ `(0..1) generation_sets`: pojedyncze żądanie AI może utworzyć maksymalnie jeden zestaw; zestaw może powstać również ręcznie (FK nullable).

3. Indeksy
- Wymagane rozszerzenia: `CREATE EXTENSION IF NOT EXISTS pgcrypto;` (UUID), `CREATE EXTENSION IF NOT EXISTS pg_trgm;` (wyszukiwanie tekstowe).
- `cards`: `CREATE INDEX idx_cards_question_trgm ON cards USING gin (question gin_trgm_ops);`.
- `cards`: `CREATE INDEX idx_cards_user_status_updated ON cards (user_id, status, updated_at DESC);`.
- `generation_sets`: `CREATE INDEX idx_generation_sets_user_created ON generation_sets (user_id, created_at DESC);`.
- `ai_requests`: `CREATE INDEX idx_ai_requests_user_created ON ai_requests (user_id, created_at DESC);`.
- `event_log`: `CREATE INDEX idx_event_log_user_created ON event_log (user_id, created_at DESC);`.

4. Zasady PostgreSQL (RLS)
- `ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;` oraz `FORCE ROW LEVEL SECURITY`.
  - Polityka właściciela: `CREATE POLICY app_users_owner_policy ON app_users FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`.
  - Polityka admin: `CREATE POLICY app_users_admin_policy ON app_users FOR ALL TO admin USING (true) WITH CHECK (true);`.
- `ALTER TABLE cards ENABLE ROW LEVEL SECURITY;` oraz `FORCE ROW LEVEL SECURITY`.
  - Właściciel: `CREATE POLICY cards_owner_policy ON cards FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`.
  - Admin: `CREATE POLICY cards_admin_policy ON cards FOR ALL TO admin USING (true) WITH CHECK (true);`.
- `ALTER TABLE generation_sets ENABLE ROW LEVEL SECURITY;` oraz `FORCE ROW LEVEL SECURITY`.
  - Właściciel: `CREATE POLICY generation_sets_owner_policy ON generation_sets FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`.
  - Admin: `CREATE POLICY generation_sets_admin_policy ON generation_sets FOR ALL TO admin USING (true) WITH CHECK (true);`.
- `ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;` oraz `FORCE ROW LEVEL SECURITY`.
  - Właściciel: `CREATE POLICY ai_requests_owner_policy ON ai_requests FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`.
  - Admin: `CREATE POLICY ai_requests_admin_policy ON ai_requests FOR ALL TO admin USING (true) WITH CHECK (true);`.
- `ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;` oraz `FORCE ROW LEVEL SECURITY`.
  - Właściciel: `CREATE POLICY event_log_owner_policy ON event_log FOR SELECT USING (user_id = auth.uid());`.
  - Admin: `CREATE POLICY event_log_admin_policy ON event_log FOR ALL TO admin USING (true) WITH CHECK (true);`.

