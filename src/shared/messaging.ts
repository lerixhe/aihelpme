import type {
  ChatStreamCancelRequest,
  ChatStreamEvent,
  ChatStreamRequest,
  ChatStreamStartRequest,
  ChatMessage
} from "~/shared/types"

interface StreamChatOptions {
  onEvent: (event: ChatStreamEvent) => void
  signal?: AbortSignal
}

function isTerminalEvent(event: ChatStreamEvent): boolean {
  return event.type === "completed" || event.type === "cancelled" || event.type === "failed"
}

export async function streamChat(messages: ChatMessage[], options: StreamChatOptions): Promise<void> {
  const request: ChatStreamStartRequest = {
    type: "AI_HELP_ME_CHAT_STREAM_START",
    payload: {
      messages
    }
  }

  await new Promise<void>((resolve, reject) => {
    const port = chrome.runtime.connect({ name: "AI_HELP_ME_STREAM" })
    let settled = false

    const cleanup = () => {
      port.onMessage.removeListener(handleMessage)
      port.onDisconnect.removeListener(handleDisconnect)
      options.signal?.removeEventListener("abort", handleAbort)
    }

    const settle = (callback: () => void) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      callback()
    }

    const handleMessage = (message: ChatStreamEvent) => {
      options.onEvent(message)

      if (!isTerminalEvent(message)) {
        return
      }

      settle(() => {
        port.disconnect()
        resolve()
      })
    }

    const handleDisconnect = () => {
      if (settled) {
        return
      }

      settle(() => {
        const runtimeError = chrome.runtime.lastError?.message
        reject(new Error(runtimeError || "流式连接已断开"))
      })
    }

    const handleAbort = () => {
      const cancelRequest: ChatStreamCancelRequest = {
        type: "AI_HELP_ME_CHAT_STREAM_CANCEL"
      }

      try {
        port.postMessage(cancelRequest)
      } catch {
        settle(resolve)
      }
    }

    port.onMessage.addListener(handleMessage)
    port.onDisconnect.addListener(handleDisconnect)
    options.signal?.addEventListener("abort", handleAbort, { once: true })

    if (options.signal?.aborted) {
      handleAbort()
      return
    }

    port.postMessage(request satisfies ChatStreamRequest)
  })
}
