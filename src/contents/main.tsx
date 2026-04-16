import { useEffect, useRef, useState } from "react"

import ChatPanel from "~/contents/components/ChatPanel"
import SelectionToolbar from "~/contents/components/SelectionToolbar"
import { askAi } from "~/shared/messaging"
import { appendPageContext, formatBuiltInPrompt, formatCustomPrompt, formatFreeInputPrompt } from "~/shared/prompt"
import { getSelectionSnapshot } from "~/shared/selection"
import { getSettings } from "~/shared/storage"
import type { BuiltInActionId, ChatMessage, SelectionContext } from "~/shared/types"

export const config = {
  matches: ["<all_urls>"]
} as const

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content
  }
}

function App() {
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarAnchor, setToolbarAnchor] = useState<{ x: number; y: number } | null>(null)
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null)
  const [chatVisible, setChatVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [customActions, setCustomActions] = useState<{ id: string; label: string; template: string }[]>([])

  const messagesRef = useRef<ChatMessage[]>([])
  const lastAnchorRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    void getSettings().then((settings) => {
      setCustomActions(settings.customActions)
    })

    const onStorageChanged: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (_changes, areaName) => {
      if (areaName !== "sync") {
        return
      }

      void getSettings().then((settings) => {
        setCustomActions(settings.customActions)
      })
    }

    chrome.storage.onChanged.addListener(onStorageChanged)
    return () => chrome.storage.onChanged.removeListener(onStorageChanged)
  }, [])

  useEffect(() => {
    let rafId: number | null = null

    const readSelectionText = () => {
      const snapshot = getSelectionSnapshot(document.activeElement)
      return snapshot?.context.text.trim() ?? ""
    }

    const updateSelection = (event?: Event) => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null

        const target = event?.target ?? null
        const snapshot = getSelectionSnapshot(target)

        if (!snapshot) {
          setToolbarVisible(false)
          return
        }

        let anchor = snapshot.anchor

        if (!anchor && event instanceof MouseEvent) {
          anchor = {
            x: event.clientX,
            y: event.clientY
          }
        }

        if (!anchor && lastAnchorRef.current) {
          anchor = lastAnchorRef.current
        }

        if (!anchor) {
          setToolbarVisible(false)
          return
        }

        lastAnchorRef.current = anchor
        setSelectionContext(snapshot.context)
        setToolbarAnchor(anchor)
        setToolbarVisible(true)
      })
    }

    const isInsideExtensionRoot = (target: EventTarget | null) => {
      return target instanceof HTMLElement && !!target.closest("[data-ai-help-me-root='true']")
    }

    const onPointerUp = (event: PointerEvent) => {
      if (isInsideExtensionRoot(event.target)) {
        return
      }

      updateSelection(event)
    }

    const onSelectionChange = (event: Event) => {
      if (!readSelectionText()) {
        setToolbarVisible(false)
        return
      }

      updateSelection(event)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInsideExtensionRoot(event.target)) {
        return
      }

      if (!readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (isInsideExtensionRoot(event.target)) {
        return
      }

      updateSelection(event)
    }

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (isInsideExtensionRoot(event.target)) {
        return
      }

      if (!readSelectionText()) {
        setToolbarVisible(false)
      }
    }

    document.addEventListener("pointerup", onPointerUp, true)
    document.addEventListener("selectionchange", onSelectionChange, true)
    document.addEventListener("keyup", onKeyUp, true)
    document.addEventListener("focusin", onFocusIn, true)
    document.addEventListener("mousedown", onDocumentMouseDown, true)

    return () => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId)
      }

      document.removeEventListener("pointerup", onPointerUp, true)
      document.removeEventListener("selectionchange", onSelectionChange, true)
      document.removeEventListener("keyup", onKeyUp, true)
      document.removeEventListener("focusin", onFocusIn, true)
      document.removeEventListener("mousedown", onDocumentMouseDown, true)
    }
  }, [])

  const sendPrompt = async (prompt: string) => {
    const userMessage = createMessage("user", prompt)
    const nextMessages = [...messagesRef.current, userMessage]

    messagesRef.current = nextMessages
    setMessages(nextMessages)
    setChatVisible(true)
    setLoading(true)

    try {
      const response = await askAi(nextMessages)

      if (!response.ok) {
        const errorMessage = createMessage("assistant", response.error || "请求失败")
        const afterError = [...messagesRef.current, errorMessage]
        messagesRef.current = afterError
        setMessages(afterError)
        return
      }

      const assistantMessage = createMessage("assistant", response.data?.content || "")
      const afterSuccess = [...messagesRef.current, assistantMessage]
      messagesRef.current = afterSuccess
      setMessages(afterSuccess)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "未知错误"
      const fallbackMessage = createMessage("assistant", `请求失败：${message}`)
      const afterFailure = [...messagesRef.current, fallbackMessage]
      messagesRef.current = afterFailure
      setMessages(afterFailure)
    } finally {
      setLoading(false)
    }
  }

  const runWithSelectionContext = async (rawPrompt: string) => {
    const context = selectionContext
    if (!context) {
      return
    }

    const finalPrompt = appendPageContext(rawPrompt, context)
    await sendPrompt(finalPrompt)
    setToolbarVisible(false)
  }

  const handleBuiltInAction = async (action: BuiltInActionId) => {
    if (!selectionContext) {
      return
    }

    const settings = await getSettings()
    const prompt = formatBuiltInPrompt(action, selectionContext, settings.translationLanguage)
    await runWithSelectionContext(prompt)
  }

  const handleCustomAction = async (template: string) => {
    if (!selectionContext) {
      return
    }

    const prompt = formatCustomPrompt(template, selectionContext.text)
    await runWithSelectionContext(prompt)
  }

  const handleFreeSubmit = async (input: string) => {
    if (!selectionContext) {
      return
    }

    const prompt = formatFreeInputPrompt(input, selectionContext.text)
    await runWithSelectionContext(prompt)
  }

  const handleFollowupSend = async (input: string) => {
    await sendPrompt(input)
  }

  return (
    <div data-ai-help-me-root="true" style={{ pointerEvents: "none" }}>
      <SelectionToolbar
        visible={toolbarVisible}
        anchor={toolbarAnchor}
        customActions={customActions}
        onBuiltInAction={(action) => {
          void handleBuiltInAction(action)
        }}
        onCustomAction={(template) => {
          void handleCustomAction(template)
        }}
        onFreeSubmit={(input) => {
          void handleFreeSubmit(input)
        }}
      />

      <ChatPanel
        visible={chatVisible}
        messages={messages}
        loading={loading}
        onSend={(input) => {
          void handleFollowupSend(input)
        }}
        onClose={() => {
          setChatVisible(false)
        }}
      />
    </div>
  )
}

export default function ContentScriptUi() {
  return <App />
}
