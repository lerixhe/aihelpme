import { useCallback, useRef } from "react"

import SelectionToolbar from "~/contents/components/SelectionToolbar"
import UnifiedPanel from "~/contents/components/UnifiedPanel"
import { useChatState } from "~/contents/hooks/useChatState"
import { useSelectionDetection } from "~/contents/hooks/useSelectionDetection"
import { useToolbarState } from "~/contents/hooks/useToolbarState"
import { resolveActionTemplate, formatFreeInputPrompt } from "~/shared/prompt"
import { getSettings } from "~/shared/storage"
import type { SelectionAnchor, SelectionContext } from "~/shared/types"

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
    actions,
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
    setContext,
    sendPrompt,
    stopStreaming,
    resetMessages
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
    async (rawPrompt: string, ctx: SelectionContext) => {
      await sendPrompt(rawPrompt, ctx)
    },
    [sendPrompt]
  )

  // Open unified panel with selection text and fire action
  const openPanelWithAction = useCallback(
    async (text: string, prompt: string) => {
      setCapturedText(text)
      setPanelOpen(true)
      closeToolbar()
      resetMessages()

      if (selectionContext) {
        const ctx = { ...selectionContext, text }
        setContext(ctx)
        await runWithSelectionContext(prompt, ctx)
      }
    },
    [selectionContext, setCapturedText, setPanelOpen, closeToolbar, setContext, runWithSelectionContext, resetMessages]
  )

  // Handle action
  const handleAction = useCallback(
    async (template: string, text: string) => {
      if (!selectionContext) {
        return
      }

      const settings = await getSettings()
      const context = { ...selectionContext, text }
      const prompt = resolveActionTemplate(template, context, settings)
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
        actions={actions}
        onAction={(template, text) => {
          void handleAction(template, selectionContext?.text ?? text)
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
          onCapturedTextChange={setCapturedText}
          onSend={(input) => {
            void handleFollowupSend(input)
          }}
          onStop={stopStreaming}
          onClose={() => {
            setPanelOpen(false)
            setCapturedText("")
            setContext(null)
          }}
        />
      )}
    </div>
  )
}

export default function ContentScriptUi() {
  return <App />
}
