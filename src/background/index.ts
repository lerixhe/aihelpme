import type { AskAiRequest, AskAiResponse, ChatMessage } from "~/shared/types"
import { getSettings } from "~/shared/storage"

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "")
}

function normalizeAssistantContent(content: unknown): string {
  if (typeof content === "string") {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part
        }

        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text
        }

        return ""
      })
      .join("")
      .trim()
  }

  return ""
}

async function callOpenAiCompatible(messages: ChatMessage[]): Promise<AskAiResponse> {
  const settings = await getSettings()

  if (!settings.apiKey.trim()) {
    return {
      ok: false,
      error: "请先在设置页填写 API Key。"
    }
  }

  const endpoint = `${normalizeBaseUrl(settings.apiBaseUrl)}/chat/completions`

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: messages.map((item) => ({
        role: item.role,
        content: item.content
      }))
    })
  })

  if (!response.ok) {
    const rawError = await response.text()
    return {
      ok: false,
      error: `AI 服务返回错误 (${response.status})：${rawError || "未知错误"}`
    }
  }

  const data = await response.json()
  const content = normalizeAssistantContent(data?.choices?.[0]?.message?.content)

  if (!content) {
    return {
      ok: false,
      error: "AI 未返回有效内容。"
    }
  }

  return {
    ok: true,
    data: {
      content
    }
  }
}

export function setupBackgroundMessageHandler(): void {
  chrome.runtime.onMessage.addListener((request: AskAiRequest, _sender, sendResponse) => {
    if (request?.type !== "AI_HELP_ME_ASK") {
      return
    }

    void callOpenAiCompatible(request.payload.messages)
      .then((result) => {
        sendResponse(result)
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "未知错误"
        sendResponse({
          ok: false,
          error: `请求失败：${message}`
        } satisfies AskAiResponse)
      })

    return true
  })
}

setupBackgroundMessageHandler()
