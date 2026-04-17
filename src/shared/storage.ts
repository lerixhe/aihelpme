import type { ExtensionSettings, ThemePreference } from "~/shared/types"

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  translationLanguage: "简体中文",
  theme: "auto",
  customActions: [
    {
      id: "typo-check",
      label: "找错别字",
      template: "帮我从选中内容找出错别字「{text}」"
    }
  ]
}

const SETTINGS_KEY = "ai-help-me:settings"

export async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.sync.get(SETTINGS_KEY)
  const saved = result[SETTINGS_KEY] as Partial<ExtensionSettings> | undefined

  if (!saved) {
    return DEFAULT_SETTINGS
  }

  const validThemes: ThemePreference[] = ["auto", "light", "dark"]
  const theme = validThemes.includes(saved.theme as ThemePreference) ? (saved.theme as ThemePreference) : DEFAULT_SETTINGS.theme

  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    theme,
    customActions: Array.isArray(saved.customActions)
      ? saved.customActions
          .filter((item) => Boolean(item?.id) && Boolean(item?.label) && Boolean(item?.template))
          .map((item) => ({
            id: String(item.id),
            label: String(item.label),
            template: String(item.template)
          }))
      : DEFAULT_SETTINGS.customActions
  }
}

export async function saveSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.sync.set({
    [SETTINGS_KEY]: settings
  })
}
