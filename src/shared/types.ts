export type BuiltInActionId = "explain" | "translate"

export type ThemePreference = "auto" | "light" | "dark"

export interface CustomActionTemplate {
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
  customActions: CustomActionTemplate[]
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
