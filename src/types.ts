import type { Tables, Enums, Json } from "./db/database.types"

/**
 * Shared Enums (backed by database enums)
 * Using database-driven enums ensures API types stay aligned with persistence layer.
 */
export type AiRequestStatus = Enums<"ai_request_status_type">
export type CardOrigin = Enums<"card_origin_type">
export type CardStatus = Enums<"card_status_type">
export type EventType = Enums<"event_type">

/**
 * Common helpers
 */
export type Cursor = string
export type Paginated<TItem> = {
  items: TItem[]
  next_cursor: Cursor | null
}

/**
 * Database entity row aliases (typed views over tables)
 */
type AppUserRow = Tables<"app_users">
type CardRow = Tables<"cards">
type AiRequestRow = Tables<"ai_requests">
type GenerationSetRow = Tables<"generation_sets">
type EventRow = Tables<"event_log">

/**
 * Users
 */
export type SupportedLanguage = "pl" | "en"

// Response: GET /api/users/me
export type AppUserProfileDTO = {
  user_id: AppUserRow["user_id"]
  preferred_language: SupportedLanguage
  is_active: AppUserRow["is_active"]
  created_at: AppUserRow["created_at"]
  updated_at: AppUserRow["updated_at"]
}

// Request: PATCH /api/users/me
export type AppUserUpdateCommand = Partial<Pick<AppUserProfileDTO, "preferred_language" | "is_active">>

/**
 * Cards
 */
// Canonical card DTO used across card endpoints
export type CardDTO = {
  card_id: CardRow["card_id"]
  question: CardRow["question"]
  answer: CardRow["answer"]
  origin: CardOrigin
  status: CardStatus
  generation_set_id: CardRow["generation_set_id"]
  source_excerpt: CardRow["source_excerpt"]
  deleted_at: CardRow["deleted_at"]
  created_at: CardRow["created_at"]
  updated_at: CardRow["updated_at"]
}

// Request: POST /api/cards (manual create, batched)
export type ManualCardCreateCommand = {
  question: CardRow["question"]
  answer: CardRow["answer"]
  source_excerpt?: CardRow["source_excerpt"]
}
export type ManualCardCreateBatchCommand = ManualCardCreateCommand[]

// Request: PATCH /api/cards/:cardId
export type CardUpdateCommand = Partial<Pick<ManualCardCreateCommand, "question" | "answer">>

// Response: GET /api/cards
export type CardListSort =
  | "updated_at_desc"
  | "created_at_desc"
  | "question_asc"

export type CardListResponseDTO = Paginated<CardDTO>

/**
 * AI Requests
 */
// Request: POST /api/ai/requests
export type AiRequestCreateCommand = {
  input_text: string
}

// Response (202): POST /api/ai/requests
export type AiRequestEnqueueResponseDTO = {
  ai_request_id: AiRequestRow["ai_request_id"]
  generation_set_id: GenerationSetRow["generation_set_id"]
  status: AiRequestStatus
}

// Response: GET /api/ai/requests/:aiRequestId
export type AiRequestStatusDTO = {
  ai_request_id: AiRequestRow["ai_request_id"]
  status: AiRequestStatus
  error_code: AiRequestRow["error_code"]
  created_at: AiRequestRow["created_at"]
  updated_at: AiRequestRow["updated_at"]
  generation_set_id: GenerationSetRow["generation_set_id"] | null
  proposed_count: number
}

/**
 * Generation Sets
 */
export type GenerationSetListItemDTO = {
  generation_set_id: GenerationSetRow["generation_set_id"]
  input_text: GenerationSetRow["input_text"]
  ai_request_id: GenerationSetRow["ai_request_id"]
  created_at: GenerationSetRow["created_at"]
  updated_at: GenerationSetRow["updated_at"]
  proposed_counts: {
    total: number
    editable: number
  }
}

// Response: GET /api/generation-sets
export type GenerationSetListResponseDTO = Paginated<GenerationSetListItemDTO>

// Card shape in generation set detail (proposed/editable)
export type ProposedCardDTO = {
  card_id: CardRow["card_id"]
  question: CardRow["question"]
  answer: CardRow["answer"]
  status: Extract<CardStatus, "proposed">
  origin: Extract<CardOrigin, "ai" | "ai-edited">
  source_excerpt: CardRow["source_excerpt"]
}

// Response: GET /api/generation-sets/:generationSetId
export type GenerationSetDetailsDTO = {
  generation_set_id: GenerationSetRow["generation_set_id"]
  input_text: GenerationSetRow["input_text"]
  cards: ProposedCardDTO[]
  created_at: GenerationSetRow["created_at"]
  updated_at: GenerationSetRow["updated_at"]
}

// Request: PATCH /api/generation-sets/:generationSetId/cards/:cardId
export type ProposedCardUpdateCommand = Partial<
  Pick<ProposedCardDTO, "question" | "answer" | "source_excerpt">
>

// Response: POST /api/generation-sets/:generationSetId/accept
export type GenerationSetAcceptResponseDTO = {
  accepted_count: number
}

// Response: POST /api/generation-sets/:generationSetId/reject
export type GenerationSetRejectResponseDTO = {
  rejected_count: number
}

// Request: POST /api/generation-sets/:generationSetId/regenerate
export type GenerationSetRegenerateCommand = {
  input_text?: GenerationSetRow["input_text"]
}

/**
 * Events (admin-only)
 */
export type EventDTO = {
  event_id: EventRow["event_id"]
  user_id: EventRow["user_id"]
  event_type: EventType
  event_data: Json
  created_at: EventRow["created_at"]
}

export type EventsListResponseDTO = Paginated<EventDTO>

/**
 * Metrics (admin-only)
 */
export type MetricsOverviewDTO = {
  ai: {
    generated_cards: number
    accepted_cards: number
    acceptance_rate: number
  }
  manual: {
    created_cards: number
  }
  engagement: {
    review_sessions_weekly: number
  }
}

/**
 * Convenience re-exports for consumers
 */
export type {
  AppUserRow,
  CardRow,
  AiRequestRow,
  GenerationSetRow,
  EventRow,
}


