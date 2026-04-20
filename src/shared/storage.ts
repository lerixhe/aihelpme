import { DEFAULT_SETTINGS } from "~/shared/defaults"
import type { ExtensionSettings, ThemePreference } from "~/shared/types"

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

  const validThemes: ThemePreference[] = ["auto", "light", "dark"]
  const theme = validThemes.includes(saved.theme as ThemePreference) ? (saved.theme as ThemePreference) : DEFAULT_SETTINGS.theme

  const actions = Array.isArray(saved.actions)
    ? validateActions(saved.actions)
    : Array.isArray(saved.customActions)
      ? validateActions(saved.customActions)
      : DEFAULT_SETTINGS.actions

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    theme,
    actions
  }
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
