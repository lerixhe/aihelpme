import { useCallback, useRef } from "react"

import ChatPanel from "~/contents/components/ChatPanel"
import SelectionToolbar from "~/contents/components/SelectionToolbar"
import { useChatState } from "~/contents/hooks/useChatState"
import { useSelectionDetection } from "~/contents/hooks/useSelectionDetection"
import { useToolbarState } from "~/contents/hooks/useToolbarState"
import { appendPageContext, formatBuiltInPrompt, formatCustomPrompt, formatFreeInputPrompt } from "~/shared/prompt"
import { getSettings } from "~/shared/storage"
import type { BuiltInActionId, SelectionAnchor, SelectionContext } from "~/shared/types"

export const config = {
  matches: ["<all_urls>"]
} as const

function App() {
  const extensionRootRef = useRef<HTMLDivElement | null>(null)

  // Use toolbar state hook
  const {
    toolbarVisible,
    toolbarAnchor,
    selectionContext,
    customActions,
    closeToolbar,
    openToolbar,
    toolbarVisibleRef
  } = useToolbarState()

  // Use chat state hook
  const { messages, requestState, chatVisible, setChatVisible, sendPrompt, stopStreaming } = useChatState()

  // Handle selection change
  const handleSelectionChange = useCallback(
    (context: SelectionContext | null, anchor: SelectionAnchor | null) => {
      if (context && anchor) {
        openToolbar(context, anchor)
      } else {
        closeToolbar()
      }
    },
    [openToolbar, closeToolbar]
  )

  // Use selection detection hook
  useSelectionDetection({
    extensionRootRef,
    onSelectionChange: handleSelectionChange,
    isToolbarVisible: () => toolbarVisibleRef.current
  })

  // Run prompt with selection context
  const runWithSelectionContext = useCallback(
    async (rawPrompt: string) => {
      const context = selectionContext
      if (!context) {
        return
      }

      const finalPrompt = appendPageContext(rawPrompt, context)
      await sendPrompt(finalPrompt)
      closeToolbar()
    },
    [selectionContext, sendPrompt, closeToolbar]
  )

  // Handle built-in action
  const handleBuiltInAction = useCallback(
    async (action: BuiltInActionId, text: string) => {
      if (!selectionContext) {
        return
      }

      const settings = await getSettings()
      const context = { ...selectionContext, text }
      const prompt = formatBuiltInPrompt(action, context, settings.translationLanguage)
      await runWithSelectionContext(prompt)
    },
    [selectionContext, runWithSelectionContext]
  )

  // Handle custom action
  const handleCustomAction = useCallback(
    async (template: string, text: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatCustomPrompt(template, text)
      await runWithSelectionContext(prompt)
    },
    [selectionContext, runWithSelectionContext]
  )

  // Handle free submit
  const handleFreeSubmit = useCallback(
    async (input: string, text: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatFreeInputPrompt(input, text)
      await runWithSelectionContext(prompt)
    },
    [selectionContext, runWithSelectionContext]
  )

  // Handle followup send
  const handleFollowupSend = useCallback(
    async (input: string) => {
      await sendPrompt(input)
    },
    [sendPrompt]
  )

  return (
    <div ref={extensionRootRef} data-ai-help-me-root="true" style={{ pointerEvents: "none" }}>
      <SelectionToolbar
        visible={toolbarVisible}
        anchor={toolbarAnchor}
        selectionText={selectionContext?.text ?? ""}
        customActions={customActions}
        onBuiltInAction={(action, text) => {
          void handleBuiltInAction(action, text)
        }}
        onCustomAction={(template, text) => {
          void handleCustomAction(template, text)
        }}
        onFreeSubmit={(input, text) => {
          void handleFreeSubmit(input, text)
        }}
        onClose={() => {
          closeToolbar()
        }}
      />

      <ChatPanel
        visible={chatVisible}
        messages={messages}
        requestState={requestState.status}
        onStop={stopStreaming}
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
