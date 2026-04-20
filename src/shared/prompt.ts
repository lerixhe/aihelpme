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

export function buildContextSystemMessage(context: SelectionContext): string {
  const parts: string[] = []

  parts.push("## 页面信息")
  parts.push(`- 标题：${context.title}`)
  parts.push(`- URL：${context.url}`)
  if (context.meta?.description) {
    parts.push(`- 页面描述：${context.meta.description}`)
  }

  parts.push("")
  parts.push("## 用户选区内容")
  parts.push(`> ${context.text}`)

  if (context.surround) {
    parts.push("")
    parts.push("## 所在段落上下文")
    parts.push(context.surround)
  }

  return parts.join("\n")
}

export function hasTextPlaceholder(template: string): boolean {
  return template.includes("{text}")
}
