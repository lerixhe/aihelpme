import type { ExtensionSettings, SelectionContext } from "~/shared/types"

export function resolveActionTemplate(
  template: string,
  context: SelectionContext,
  settings: ExtensionSettings
): string {
  return template
    .replaceAll("{text}", context.text)
}

export function formatFreeInputPrompt(input: string, text: string): string {
  return `帮我${input}「${text}」`
}

export function appendPageContext(prompt: string, context: SelectionContext): string {
  return `${prompt}\n\n页面上下文：\n标题：${context.title}\nURL：${context.url}`
}

export function hasTextPlaceholder(template: string): boolean {
  return template.includes("{text}")
}
