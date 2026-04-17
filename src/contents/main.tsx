import { useCallback, useRef } from "react"

import ChatPanel from "~/contents/components/ChatPanel"
import SelectionToolbar from "~/contents/components/SelectionToolbar"
import { useChatState } from "~/contents/hooks/useChatState"
import { useSelectionDetection } from "~/contents/hooks/useSelectionDetection"
import { useToolbarState } from "~/contents/hooks/useToolbarState"
import { isExtensionUiFocused, isInsideExtensionRoot } from "~/contents/utils/domUtils"
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
    hasCapturedPageSelection
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

  // Check if toolbar should be preserved
  const shouldPreserveToolbar = useCallback(
    (target: EventTarget | null) => {
      const isInside = isInsideExtensionRoot(target, extensionRootRef.current)
      const isFocused = isExtensionUiFocused(extensionRootRef.current)
      return hasCapturedPageSelection() && (isInside || isFocused)
    },
    [hasCapturedPageSelection]
  )

  // Use selection detection hook
  const { extensionInteractionRef } = useSelectionDetection({
    extensionRootRef,
    onSelectionChange: handleSelectionChange,
    hasCapturedPageSelection,
    shouldPreserveToolbar
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
    async (action: BuiltInActionId) => {
      if (!selectionContext) {
        return
      }

      const settings = await getSettings()
      const prompt = formatBuiltInPrompt(action, selectionContext, settings.translationLanguage)
      await runWithSelectionContext(prompt)
    },
    [selectionContext, runWithSelectionContext]
  )

  // Handle custom action
  const handleCustomAction = useCallback(
    async (template: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatCustomPrompt(template, selectionContext.text)
      await runWithSelectionContext(prompt)
    },
    [selectionContext, runWithSelectionContext]
  )

  // Handle free submit
  const handleFreeSubmit = useCallback(
    async (input: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatFreeInputPrompt(input, selectionContext.text)
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
