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
  const toolbarVisibleRef = useRef(false)
  const selectionContextRef = useRef<SelectionContext | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    toolbarVisibleRef.current = toolbarVisible
  }, [toolbarVisible])

  useEffect(() => {
    selectionContextRef.current = selectionContext
  }, [selectionContext])

  const closeToolbar = () => {
    setToolbarVisible(false)
    setToolbarAnchor(null)
    setSelectionContext(null)
  }

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
    const extensionRootSelector = "[data-ai-help-me-root='true']"

    const getDeepActiveElement = (root: Document | ShadowRoot = document): Element | null => {
      const activeElement = root.activeElement
      if (!activeElement) {
        return null
      }

      if (activeElement instanceof HTMLElement && activeElement.shadowRoot) {
        return getDeepActiveElement(activeElement.shadowRoot) ?? activeElement
      }

      return activeElement
    }

    const isInsideExtensionRoot = (target: EventTarget | null) => {
      if (target instanceof HTMLElement) {
        return !!target.closest(extensionRootSelector)
      }

      if (target instanceof Node && target.parentElement) {
        return !!target.parentElement.closest(extensionRootSelector)
      }

      return false
    }

    const isInsideExtensionEvent = (event: Event) => {
      const path = typeof event.composedPath === "function" ? event.composedPath() : []
      return path.some((node) => isInsideExtensionRoot(node))
    }

    const isExtensionUiFocused = () => {
      return isInsideExtensionRoot(getDeepActiveElement())
    }

    const hasCapturedPageSelection = () => {
      return !!(toolbarVisibleRef.current && selectionContextRef.current)
    }

    const shouldPreserveToolbar = (target: EventTarget | null) => {
      return hasCapturedPageSelection() && (isInsideExtensionRoot(target) || isExtensionUiFocused())
    }

    const readSelectionText = () => {
      if (isExtensionUiFocused()) {
        return ""
      }

      const snapshot = getSelectionSnapshot(getDeepActiveElement())
      return snapshot?.context.text.trim() ?? ""
    }

    const updateSelection = (event?: Event) => {
      if (rafId != null) {
        window.cancelAnimationFrame(rafId)
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null

        if (isExtensionUiFocused()) {
          return
        }

        const target = event?.target ?? null
        const snapshot = getSelectionSnapshot(target)

        if (!snapshot) {
          if (shouldPreserveToolbar(target)) {
            return
          }

          closeToolbar()
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
          closeToolbar()
          return
        }

        lastAnchorRef.current = anchor
        setSelectionContext(snapshot.context)
        setToolbarAnchor(anchor)
        setToolbarVisible(true)
      })
    }

    const onPointerUp = (event: PointerEvent) => {
      if (isInsideExtensionEvent(event)) {
        return
      }

      updateSelection(event)
    }

    const onSelectionChange = (event: Event) => {
      if (isExtensionUiFocused()) {
        return
      }

      if (!readSelectionText()) {
        if (hasCapturedPageSelection()) {
          return
        }

        closeToolbar()
        return
      }

      updateSelection(event)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInsideExtensionEvent(event)) {
        return
      }

      if (!readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (isInsideExtensionEvent(event)) {
        return
      }

      if (hasCapturedPageSelection() && !readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (isInsideExtensionEvent(event)) {
        return
      }

      if (toolbarVisibleRef.current && !readSelectionText() && !isExtensionUiFocused()) {
        closeToolbar()
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
    closeToolbar()
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
        onClose={() => {
          closeToolbar()
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
