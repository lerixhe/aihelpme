export type BuiltInActionId = "explain" | "translate"

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

export interface AskAiRequest {
  type: "AI_HELP_ME_ASK"
  payload: {
    messages: ChatMessage[]
  }
}

export interface AskAiResponse {
  ok: boolean
  data?: {
    content: string
  }
  error?: string
}
