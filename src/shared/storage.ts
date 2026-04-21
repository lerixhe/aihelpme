import { DEFAULT_SETTINGS } from "~/shared/defaults"
import type { ExtensionSettings, ModelParams, ThemePreference, ToolbarMode } from "~/shared/types"

export { DEFAULT_SETTINGS }

const SETTINGS_KEY = "ai-help-me:settings"

function validateActions(items: unknown[]): ExtensionSettings["actions"] {
  return items
    .filter((item) => Boolean((item as Record<string, unknown>)?.id) && Boolean((item as Record<string, unknown>)?.label) && Boolean((item as Record<string, unknown>)?.template))
    .map((item) => {
      const record = item as Record<string, unknown>
      return {
        id: String(record.id),
        label: String(record.label),
        template: String(record.template)
      }
    })
}

function validateModelParams(value: unknown): ModelParams {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {}

  return {
    maxTokens: typeof record.maxTokens === "number" && Number.isFinite(record.maxTokens) ? record.maxTokens : DEFAULT_SETTINGS.modelParams.maxTokens,
    temperature: typeof record.temperature === "number" && Number.isFinite(record.temperature) ? record.temperature : DEFAULT_SETTINGS.modelParams.temperature,
    topP: typeof record.topP === "number" && Number.isFinite(record.topP) ? record.topP : DEFAULT_SETTINGS.modelParams.topP,
    presencePenalty:
      typeof record.presencePenalty === "number" && Number.isFinite(record.presencePenalty)
        ? record.presencePenalty
        : DEFAULT_SETTINGS.modelParams.presencePenalty,
    frequencyPenalty:
      typeof record.frequencyPenalty === "number" && Number.isFinite(record.frequencyPenalty)
        ? record.frequencyPenalty
        : DEFAULT_SETTINGS.modelParams.frequencyPenalty
  }
}

export function normalizeSettings(value: unknown): ExtensionSettings {
  const saved = value as Partial<ExtensionSettings> & { customActions?: unknown[] } | undefined

  if (!saved || typeof saved !== "object") {
    return DEFAULT_SETTINGS
  }

  const validThemes: ThemePreference[] = ["auto", "light", "dark"]
  const theme = validThemes.includes(saved.theme as ThemePreference) ? (saved.theme as ThemePreference) : DEFAULT_SETTINGS.theme
  const validToolbarModes: ToolbarMode[] = ["explode", "pill"]
  const toolbarMode = validToolbarModes.includes(saved.toolbarMode as ToolbarMode) ? (saved.toolbarMode as ToolbarMode) : DEFAULT_SETTINGS.toolbarMode

  const actions = Array.isArray(saved.actions)
    ? validateActions(saved.actions)
    : Array.isArray(saved.customActions)
      ? validateActions(saved.customActions)
      : DEFAULT_SETTINGS.actions

  return {
    apiBaseUrl: typeof saved.apiBaseUrl === "string" ? saved.apiBaseUrl : DEFAULT_SETTINGS.apiBaseUrl,
    apiKey: typeof saved.apiKey === "string" ? saved.apiKey : DEFAULT_SETTINGS.apiKey,
    model: typeof saved.model === "string" ? saved.model : DEFAULT_SETTINGS.model,
    theme,
    toolbarMode,
    actions,
    modelParams: validateModelParams(saved.modelParams)
  }
}

export async function getSettings(): Promise<ExtensionSettings> {
  let result: Record<string, unknown>
  try {
    result = await chrome.storage.sync.get(SETTINGS_KEY)
  } catch {
    return DEFAULT_SETTINGS
  }

  const saved = result[SETTINGS_KEY] as Partial<ExtensionSettings> & { customActions?: unknown[] } | undefined

  if (!saved) {
    return DEFAULT_SETTINGS
  }

  return normalizeSettings(saved)
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  try {
    await chrome.storage.sync.set({
      [SETTINGS_KEY]: settings
    })
  } catch {
    // Extension context may have been invalidated
  }
}
