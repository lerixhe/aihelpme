import type { BuiltInActionId, SelectionContext } from "~/shared/types"

export function formatBuiltInPrompt(
  action: BuiltInActionId,
  context: SelectionContext,
  translationLanguage: string
): string {
  if (action === "explain") {
    return `帮我解释选中内容「${context.text}」`
  }

  return `请将以下内容翻译为${translationLanguage}：\n${context.text}`
}

export function formatCustomPrompt(template: string, text: string): string {
  return template.replaceAll("{text}", text)
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
