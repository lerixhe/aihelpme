import type { ActionTemplate, ExtensionSettings, ModelParams } from "~/shared/types"

export const DEFAULT_ACTIONS: ActionTemplate[] = [
  {
    id: "explain",
    label: "解释",
    template: "帮我解释选中内容「{text}」"
  },
  {
    id: "translate",
    label: "翻译",
    template: "请将以下内容翻译为简体中文：\n{text}"
  }
]

export const DEFAULT_MODEL_PARAMS: ModelParams = {
  maxTokens: 1024,
  temperature: 0.3,
  topP: 0.9,
  presencePenalty: 0,
  frequencyPenalty: 0
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  theme: "auto",
  toolbarMode: "explode",
  actions: DEFAULT_ACTIONS,
  modelParams: DEFAULT_MODEL_PARAMS
}

type SectionKey = "appearance" | "connection" | "actions"

export const SECTION_DEFAULTS: Record<SectionKey, Partial<ExtensionSettings>> = {
  appearance: {
    theme: DEFAULT_SETTINGS.theme,
    toolbarMode: DEFAULT_SETTINGS.toolbarMode
  },
  connection: {
    apiBaseUrl: DEFAULT_SETTINGS.apiBaseUrl,
    apiKey: DEFAULT_SETTINGS.apiKey,
    model: DEFAULT_SETTINGS.model,
    modelParams: DEFAULT_MODEL_PARAMS
  },
  actions: {
    actions: DEFAULT_SETTINGS.actions
  }
}
