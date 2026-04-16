import type {
  ChatStreamCancelRequest,
  ChatStreamEvent,
  ChatStreamRequest,
  ChatStreamStartRequest,
  ChatMessage
} from "~/shared/types"
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

function getStreamChunkContent(chunk: unknown): string {
  if (!chunk || typeof chunk !== "object") {
    return ""
  }

  const choices = "choices" in chunk ? chunk.choices : undefined
  if (!Array.isArray(choices) || choices.length === 0) {
    return ""
  }

  const delta = choices[0] && typeof choices[0] === "object" && "delta" in choices[0] ? choices[0].delta : undefined

  if (!delta || typeof delta !== "object") {
    return ""
  }

  const content = "content" in delta ? delta.content : undefined
  return normalizeAssistantContent(content)
}

async function streamOpenAiCompatible(
  messages: ChatMessage[],
  signal: AbortSignal,
  onEvent: (event: ChatStreamEvent) => void
): Promise<void> {
  const settings = await getSettings()

  if (!settings.apiKey.trim()) {
    onEvent({
      type: "failed",
      error: "请先在设置页填写 API Key。"
    })
    return
  }

  onEvent({ type: "started" })

  const endpoint = `${normalizeBaseUrl(settings.apiBaseUrl)}/chat/completions`
  const response = await fetch(endpoint, {
    signal,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      stream: true,
      messages: messages.map((item) => ({
        role: item.role,
        content: item.content
      }))
    })
  })

  if (!response.ok) {
    const rawError = await response.text()
    onEvent({
      type: "failed",
      error: `AI 服务返回错误 (${response.status})：${rawError || "未知错误"}`
    })
    return
  }

  if (!response.body) {
    onEvent({
      type: "failed",
      error: "AI 服务未返回可读取的流。"
    })
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let hasContent = false

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

    const events = buffer.split("\n\n")
    buffer = events.pop() || ""

    for (const event of events) {
      const lines = event
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("data:"))

      for (const line of lines) {
        const data = line.slice(5).trim()

        if (!data) {
          continue
        }

        if (data === "[DONE]") {
          if (!hasContent) {
            onEvent({
              type: "failed",
              error: "AI 未返回有效内容。"
            })
            return
          }

          onEvent({ type: "completed" })
          return
        }

        let parsed: unknown

        try {
          parsed = JSON.parse(data)
        } catch {
          continue
        }

        const content = getStreamChunkContent(parsed)
        if (!content) {
          continue
        }

        hasContent = true
        onEvent({
          type: "chunk",
          content
        })
      }
    }

    if (done) {
      break
    }
  }

  if (!hasContent) {
    onEvent({
      type: "failed",
      error: "AI 未返回有效内容。"
    })
    return
  }

  onEvent({ type: "completed" })
}

export function setupBackgroundMessageHandler(): void {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== "AI_HELP_ME_STREAM") {
      return
    }

    let abortController: AbortController | null = null

    port.onDisconnect.addListener(() => {
      abortController?.abort()
    })

    port.onMessage.addListener((request: ChatStreamRequest) => {
      if (request?.type === "AI_HELP_ME_CHAT_STREAM_CANCEL") {
        abortController?.abort()
        return
      }

      if (request?.type !== "AI_HELP_ME_CHAT_STREAM_START") {
        return
      }

      abortController?.abort()
      abortController = new AbortController()

      void streamOpenAiCompatible(request.payload.messages, abortController.signal, (event) => {
        try {
          port.postMessage(event)
        } catch {
          return
        }
      }).catch((error: unknown) => {
        if (abortController?.signal.aborted && error instanceof DOMException && error.name === "AbortError") {
          try {
            port.postMessage({ type: "cancelled" } satisfies ChatStreamEvent)
          } catch {
            return
          }

          return
        }

        const message = error instanceof Error ? error.message : "未知错误"

        try {
          port.postMessage({
            type: "failed",
            error: `请求失败：${message}`
          } satisfies ChatStreamEvent)
        } catch {
          return
        }
      })
    })
  })
}

setupBackgroundMessageHandler()
