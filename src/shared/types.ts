export type ThemePreference = "auto" | "light" | "dark"

export interface ActionTemplate {
  id: string
  label: string
  template: string
}

export interface ExtensionSettings {
  apiBaseUrl: string
  apiKey: string
  model: string
  translationLanguage: string
  theme: ThemePreference
  actions: ActionTemplate[]
}

export interface SelectionContext {
  text: string
  title: string
  url: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  reasoning_content?: string
}

export interface ChatStreamStartRequest {
  type: "AI_HELP_ME_CHAT_STREAM_START"
  payload: {
    messages: ChatMessage[]
  }
}

export interface ChatStreamCancelRequest {
  type: "AI_HELP_ME_CHAT_STREAM_CANCEL"
}

export interface ChatStreamStartedEvent {
  type: "started"
}

export interface ChatStreamChunkEvent {
  type: "chunk"
  content: string
  reasoning_content?: string
}

export interface ChatStreamCompletedEvent {
  type: "completed"
}

export interface ChatStreamCancelledEvent {
  type: "cancelled"
}

export interface ChatStreamFailedEvent {
  type: "failed"
  error: string
}

export type ChatStreamRequest = ChatStreamStartRequest | ChatStreamCancelRequest

export type ChatStreamEvent =
  | ChatStreamStartedEvent
  | ChatStreamChunkEvent
  | ChatStreamCompletedEvent
  | ChatStreamCancelledEvent
  | ChatStreamFailedEvent

// Selection types
export interface SelectionAnchor {
  x: number
  y: number
  rectRight: number
  mouseX: number
  mouseY: number
}

export interface SelectionSnapshot {
  context: SelectionContext
  anchor: SelectionAnchor | null
}

// Chat request state types
export type ChatRequestStatus = "idle" | "streaming" | "cancelled" | "failed"

export type ChatRequestState =
  | { status: "idle" }
  | { status: "streaming"; assistantMessageId: string }
  | { status: "cancelled"; assistantMessageId: string }
  | { status: "failed"; assistantMessageId: string; error: string }

// Stream handler options
export interface StreamChatOptions {
  onEvent: (event: ChatStreamEvent) => void
  signal?: AbortSignal
}

// API test connection types
export interface ApiTestRequest {
  type: "AI_HELP_ME_API_TEST_REQUEST"
  payload: {
    apiBaseUrl: string
    apiKey: string
    model: string
  }
}

export interface ApiTestResponse {
  success: boolean
  error?: string
  latencyMs?: number
}

// Fetch models types
export interface FetchModelsRequest {
  type: "AI_HELP_ME_FETCH_MODELS_REQUEST"
  payload: {
    apiBaseUrl: string
    apiKey: string
  }
}

export interface FetchModelsResponse {
  success: boolean
  models?: string[]
  error?: string
}
