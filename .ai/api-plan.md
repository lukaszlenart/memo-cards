# REST API Plan

## 1. Resources

- Auth/Session (Supabase Auth; no table)
- `app_users` → User profile and preferences
- `ai_requests` → AI generation job tracking
- `generation_sets` → A single input text and its proposed cards
- `cards` → Individual flashcards (manual or AI-originated)
- `event_log` → Audit and product metrics events
- Metrics (aggregations over tables; admin-only)
- Review Sessions (ephemeral session orchestration over accepted `cards`)

## 2. Endpoints

Conventions:
- All endpoints are under `/api/*` (Astro API routes in `src/pages/api`).
- Auth via Supabase: session cookie/JWT; user identified as `auth.uid()`.
- Responses use JSON; errors follow `{ error: { code, message, details? } }`.
- Timestamps return ISO-8601 (UTC).
- Pagination: cursor-based where noted with `limit`, `cursor` (opaque). If not stated, default `limit=20`, max `limit=100`.
- Sorting default follows available indexes; additional sorts may be supported with reduced performance.

### 2.2 Users (`app_users`)

- GET `/api/users/me`
  - Description: Get profile for current user.
  - Response 200:
    ```json
    {
      "user_id": "uuid",
      "preferred_language": "pl",
      "is_active": true,
      "created_at": "2025-11-07T12:00:00Z",
      "updated_at": "2025-11-07T12:00:00Z"
    }
    ```
  - Errors: 401 unauthorized.

- PATCH `/api/users/me`
  - Description: Update profile (limited fields).
  - Request JSON (all optional):
    ```json
    { "preferred_language": "pl", "is_active": true }
    ```
  - Response 200: same as GET.
  - Errors: 400 validation_error (language must be "pl" or "en").

### 2.3 Cards (`cards`)

- GET `/api/cards`
  - Description: List accepted cards for current user with search/filter/sort.
  - Query:
    - `q` (string, optional): full-text (trigram index on `question`).
    - `status` (enum, optional): defaults to `accepted` in list view.
    - `limit` (int ≤100), `cursor` (opaque), `sort` (one of: `updated_at_desc` [default, indexed], `created_at_desc`, `question_asc`).
  - Response 200:
    ```json
    {
      "items": [{
        "card_id": "uuid",
        "question": "string",
        "answer": "string",
        "origin": "manual",
        "status": "accepted",
        "generation_set_id": "uuid|null",
        "source_excerpt": "string|null",
        "deleted_at": null,
        "created_at": "2025-11-07T12:00:00Z",
        "updated_at": "2025-11-07T12:00:00Z"
      }],
      "next_cursor": "opaque|null"
    }
    ```
  - Errors: 401 unauthorized.

- POST `/api/cards`
  - Description: Create one or more manual cards in a single (batch) request.
  - Request JSON (array, required):
    ```json
    {
      "question": "≤200 chars",
      "answer": "≤500 chars",
      "source_excerpt": "string|null"
    }
    ```
  - Response 201: card object.
  - Errors: 400 validation_error (lengths), 409 conflict_if_duplicate_policy (optional future), 401 unauthorized.

- GET `/api/cards/:cardId`
  - Description: Get card (must belong to user). Proposed/rejected visible only if owner; accepted visible to owner.
  - Response 200: card object.
  - Errors: 404 not_found.

- PATCH `/api/cards/:cardId`
  - Description: Update card question/answer/status; manual or accepted cards editable per PRD; proposed cards typically edited via generation set endpoints.
  - Request JSON (any subset):
    ```json
    { "question": "≤200", "answer": "≤500" }
    ```
  - Response 200: updated card object.
  - Errors: 400 validation_error, 409 invalid_status_transition, 403 forbidden if not owner.

- DELETE `/api/cards/:cardId`
  - Description: Soft-delete a card: sets `status="deleted"` and `deletedAt` timestamp.
  - Response 204.
  - Errors: 404 not_found.


### 2.4 AI Requests (`ai_requests`)

- POST `/api/ai/requests`
  - Description: Submit text to generate proposed cards. Creates `ai_requests` (status `queued`) and determines/creates or reuses a `generation_set` based on `(user_id, input_hash)` uniqueness. On reuse, it overwrites existing proposed cards for that set.
  - Request JSON:
    ```json
    { "input_text": "≤10000 chars" }
    ```
  - Response 202:
    ```json
    {
      "ai_request_id": "uuid",
      "generation_set_id": "uuid",
      "status": "queued"
    }
    ```
  - Errors: 400 validation_error (length), 429 rate_limited, 401 unauthorized.

- GET `/api/ai/requests/:aiRequestId`
  - Description: Poll request status and summary.
  - Response 200:
    ```json
    {
      "ai_request_id": "uuid",
      "status": "queued|processing|succeeded|failed",
      "error_code": "string|null",
      "created_at": "2025-11-07T12:00:00Z",
      "updated_at": "2025-11-07T12:00:00Z",
      "generation_set_id": "uuid|null",
      "proposed_count": 24
    }
    ```
  - Errors: 404 not_found, 403 forbidden.

### 2.5 Generation Sets (`generation_sets`)

- GET `/api/generation-sets`
  - Description: List user's generation sets (most recent first).
  - Query: `limit`, `cursor` (sorted by created_at desc; indexed).
  - Response 200:
    ```json
    {
      "items": [{
        "generation_set_id": "uuid",
        "input_text": "string",
        "ai_request_id": "uuid|null",
        "created_at": "2025-11-07T12:00:00Z",
        "updated_at": "2025-11-07T12:00:00Z",
        "proposed_counts": { "total": 24, "editable": 24 }
      }],
      "next_cursor": null
    }
    ```

- GET `/api/generation-sets/:generationSetId`
  - Description: Get set details with proposed cards (status `proposed`), editable before acceptance.
  - Response 200:
    ```json
    {
      "generation_set_id": "uuid",
      "input_text": "string",
      "cards": [{
        "card_id": "uuid",
        "question": "string≤200",
        "answer": "string≤500",
        "status": "proposed",
        "origin": "ai|ai-edited",
        "source_excerpt": "string|null"
      }],
      "created_at": "2025-11-07T12:00:00Z",
      "updated_at": "2025-11-07T12:00:00Z"
    }
    ```
  - Errors: 404 not_found.

- PATCH `/api/generation-sets/:generationSetId/cards/:cardId`
  - Description: Edit a proposed card (question/answer/source_excerpt). Sets `origin="ai-edited"` when content changes.
  - Request JSON:
    ```json
    { "question": "≤200", "answer": "≤500", "source_excerpt": "string|null" }
    ```
  - Response 200: updated card.
  - Errors: 409 not_proposed (only proposed cards editable), 400 validation_error.

- DELETE `/api/generation-sets/:generationSetId/cards/:cardId`
  - Description: Remove a single proposed card from the set (logical remove; mark `status="rejected"` or delete row).
  - Response 204.

- POST `/api/generation-sets/:generationSetId/accept`
  - Description: Accept entire set; transitions all remaining `proposed` cards in the set to `accepted` and makes them available in list and reviews. Emits metrics and audit events.
  - Response 200:
    ```json
    { "accepted_count": 20 }
    ```
  - Errors: 409 nothing_to_accept.

- POST `/api/generation-sets/:generationSetId/reject`
  - Description: Reject and discard the current proposed set. Marks proposed cards as `rejected` and emits audit events. Optionally hard-deletes proposed cards (implementation choice).
  - Response 200:
    ```json
    { "rejected_count": 24 }
    ```

- POST `/api/generation-sets/:generationSetId/regenerate`
  - Description: Regenerate with same (or edited) `input_text`. Creates a new `ai_requests` entry and overwrites proposed cards for the unique `(user_id, input_hash)` set.
  - Request JSON (optional if reusing same text):
    ```json
    { "input_text": "≤10000 chars" }
    ```
  - Response 202: same as create AI request (with `ai_request_id`, `generation_set_id`, `status`).

### 2.7 Events (`event_log`)

- GET `/api/events`
  - Description: Admin-only list of events for metrics/audit.
  - Query: `user_id?`, `type?`, `limit`, `cursor`, `from?`, `to?`.
  - Response 200:
    ```json
    { "items": [{ "event_id": 1, "user_id": "uuid", "event_type": "cards_accepted", "event_data": {}, "created_at": "..." }], "next_cursor": null }
    ```
  - Errors: 403 forbidden (non-admin).

- POST `/api/events` (internal)
  - Description: Internal service endpoint to append events (if needed). Normally events are written server-side without exposing this endpoint.
  - Response 201/204.

### 2.8 Metrics (aggregations; admin-only)

- GET `/api/metrics/overview`
  - Description: Product owner dashboard metrics per PRD.
  - Query: `from`, `to`, `tz?`.
  - Response 200:
    ```json
    {
      "ai": {
        "generated_cards": 1200,
        "accepted_cards": 930,
        "acceptance_rate": 0.775
      },
      "manual": {
        "created_cards": 120
      },
      "engagement": {
        "review_sessions_weekly": 84
      }
    }
    ```
  - Errors: 403 forbidden.

## 3. Authentication and Authorization

- Mechanism: Supabase Auth with HTTP-only session cookies/JWT. Endpoints use server-side Supabase client to extract `auth.uid()`.
- RLS: Enabled for all data tables; queries are automatically scoped to `auth.uid()`.
- Roles: Default user and `admin` (as per RLS policies). Admin-only endpoints: events list, metrics.
- Middleware: Astro middleware (`src/middleware/index.ts`) enforces auth on `/api/*` except `/api/auth/*` and public metrics if desired.
- CSRF: State-changing endpoints require same-site cookies; additionally accept `X-CSRF-Token` for SPA patterns if needed.
- Input validation: All request bodies validated server-side against constraints (see Validation section). Reject early with 400.

## 4. Validation and Business Logic

### 4.1 Validation by Resource

- Users (`app_users`)
  - `preferred_language` ∈ {"pl","en"}
  - `is_active` boolean.

- AI Requests (`ai_requests`)
  - `input_text`: required, `char_length(input_text) ≤ 10000`.
  - On create: `status="queued"`. Only owner can read.

- Generation Sets (`generation_sets`)
  - Unique per `(user_id, input_hash)`; hash computed server-side from normalized `input_text`.
  - `input_text` required; ≤ 10000 chars.
  - Accept: transitions all `proposed` cards → `accepted`, set `origin` preserved.
  - Reject: transitions all `proposed` cards → `rejected` (or delete); must not affect already accepted cards.

- Cards (`cards`)
  - `question`: required, `char_length ≤ 200`.
  - `answer`: required, `char_length ≤ 500`.
  - `origin`: one of {"manual","ai","ai-edited"}.
  - `status`: one of {"proposed","accepted","rejected","deleted"}.
  - Invariants:
    - If `origin="manual"` then `generation_set_id` is null.
    - If `origin!="manual"` then `generation_set_id` is not null.
    - If `status="deleted"` then `deleted_at` is not null; else `deleted_at` is null.
  - Deleting: soft-delete sets `status="deleted"` + `deleted_at=now()`.
  - Editing proposed cards: allowed only via generation set card edit endpoint; changing content sets `origin="ai-edited"`.

- Events (`event_log`)
  - `event_type` ∈ {
    "ai_generation_requested","ai_generation_succeeded","ai_generation_failed",
    "cards_proposed","cards_accepted","cards_rejected",
    "card_created_manual","card_deleted",
    "review_session_started","review_session_finished"
  }.

### 4.2 Business Logic Flows

- Signup
  - Create Supabase user (email/password).
  - Insert `app_users` row with `user_id = auth.uid()`, default `preferred_language`.

- AI Generation
  - Create `ai_requests (queued)` and emit `event_log: ai_generation_requested`.
  - Compute `input_hash`; upsert/find `generation_sets` by `(user_id, input_hash)`:
    - If exists: clear/replace its `proposed` cards.
    - Else: create new `generation_set` linked to `ai_request`.
  - Call OpenRouter; on success: create proposed `cards` with `origin="ai"` and `status="proposed"`, emit `cards_proposed` and `ai_generation_succeeded`. On failure: set `ai_requests.status="failed"` and emit `ai_generation_failed` with `error_code`.

- Review of Proposed Cards
  - Users can edit or delete individual proposed cards in a set.
  - Accepting: set all remaining proposed to `accepted`, emit `cards_accepted`.
  - Rejecting: mark proposed as `rejected` (or delete) and emit `cards_rejected`.

- Manual Card CRUD
  - Create/Update/Delete with validations; emit `card_created_manual` and `card_deleted` accordingly.

- Metrics
  - Aggregate counts over `cards` and `ai_requests` and `event_log`. Admin-only.

### 4.3 Errors and Status Codes

- 200 OK, 201 Created, 202 Accepted, 204 No Content
- 400 validation_error
- 401 unauthorized
- 403 forbidden (RLS/role)
- 404 not_found
- 409 conflict / invalid_status_transition / nothing_to_accept
- 422 unprocessable (semantic validation)
- 429 rate_limited
- 500 internal_error

### 4.4 Pagination, Filtering, Sorting

- Cursor format: base64-encoded `{ "k": "<sortKeyValue>", "id": "<uuid>" }` to ensure stable pagination.
- `GET /api/cards`:
  - Indexed path: filter by `status`, sort by `updated_at desc`; search by `q` uses `pg_trgm` GIN on `question`.
- `GET /api/generation-sets`:
  - Sort by `created_at desc` (indexed).

