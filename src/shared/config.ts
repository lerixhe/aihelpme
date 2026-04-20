import type { ActionTemplate, ExtensionSettings } from "~/shared/types"

export const DEFAULT_ACTIONS: ActionTemplate[] = [
  {
    id: "explain",
    label: "解释",
    template: "帮我解释选中内容「{text}」"
  },
  {
    id: "translate",
    label: "翻译",
    template: "请将以下内容翻译为{translationLanguage}：\n{text}"
  },
  {
    id: "typo-check",
    label: "找错别字",
    template: "帮我从选中内容找出错别字「{text}」"
  }
]

export const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-4o-mini",
  translationLanguage: "简体中文",
  theme: "auto",
  actions: DEFAULT_ACTIONS
}
