import { useCallback, useRef } from "react"

import SelectionToolbar from "~/contents/components/SelectionToolbar"
import UnifiedPanel from "~/contents/components/UnifiedPanel"
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
  const {
    messages,
    requestState,
    panelOpen,
    setPanelOpen,
    capturedText,
    setCapturedText,
    sendPrompt,
    stopStreaming
  } = useChatState()

  // Handle selection change — suppress while panel is open
  const handleSelectionChange = useCallback(
    (context: SelectionContext | null, anchor: SelectionAnchor | null) => {
      if (panelOpen) {
        return
      }

      if (context && anchor) {
        openToolbar(context, anchor)
      } else {
        closeToolbar()
      }
    },
    [openToolbar, closeToolbar, panelOpen]
  )

  // Use selection detection hook
  useSelectionDetection({
    extensionRootRef,
    onSelectionChange: handleSelectionChange,
    isToolbarVisible: () => toolbarVisibleRef.current
  })

  // Run prompt with selection context
  const runWithSelectionContext = useCallback(
    async (rawPrompt: string, context: SelectionContext) => {
      const finalPrompt = appendPageContext(rawPrompt, context)
      await sendPrompt(finalPrompt)
    },
    [sendPrompt]
  )

  // Open unified panel with selection text and fire action
  const openPanelWithAction = useCallback(
    async (text: string, prompt: string) => {
      setCapturedText(text)
      setPanelOpen(true)
      closeToolbar()

      if (selectionContext) {
        const context = { ...selectionContext, text }
        await runWithSelectionContext(prompt, context)
      }
    },
    [selectionContext, setCapturedText, setPanelOpen, closeToolbar, runWithSelectionContext]
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
      await openPanelWithAction(text, prompt)
    },
    [selectionContext, openPanelWithAction]
  )

  // Handle custom action
  const handleCustomAction = useCallback(
    async (template: string, text: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatCustomPrompt(template, text)
      await openPanelWithAction(text, prompt)
    },
    [selectionContext, openPanelWithAction]
  )

  // Handle free submit from panel captured text
  const handleFreeSubmit = useCallback(
    async (input: string, text: string) => {
      if (!selectionContext) {
        return
      }

      const prompt = formatFreeInputPrompt(input, text)
      await openPanelWithAction(text, prompt)
    },
    [selectionContext, openPanelWithAction]
  )

  // Handle followup send from panel input
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
        onBuiltInAction={(action, text) => {
          void handleBuiltInAction(action, selectionContext?.text ?? text)
        }}
        onCustomAction={(template, text) => {
          void handleCustomAction(template, selectionContext?.text ?? text)
        }}
        onClose={() => {
          closeToolbar()
        }}
      />

      {panelOpen && (
        <UnifiedPanel
          capturedText={capturedText}
          messages={messages}
          requestState={requestState.status}
          customActions={customActions}
          onCapturedTextChange={setCapturedText}
          onBuiltInAction={(action, text) => {
            void handleBuiltInAction(action, text)
          }}
          onCustomAction={(template, text) => {
            void handleCustomAction(template, text)
          }}
          onSend={(input) => {
            void handleFollowupSend(input)
          }}
          onStop={stopStreaming}
          onClose={() => {
            setPanelOpen(false)
            setCapturedText("")
          }}
        />
      )}
    </div>
  )
}

export default function ContentScriptUi() {
  return <App />
}
