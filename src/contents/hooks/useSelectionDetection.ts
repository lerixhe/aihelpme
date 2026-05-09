import { useCallback, useEffect, useRef } from "react"

import { getSelectionSnapshot } from "~/shared/selection"
import type { SelectionAnchor, SelectionContext } from "~/shared/types"

import {
  hasSelectionInsideExtensionUi,
  isExtensionUiFocused,
  isInsideExtensionEvent,
  isPdfViewer
} from "~/contents/utils/domUtils"

interface UseSelectionDetectionOptions {
  extensionRootRef: React.RefObject<HTMLElement | null>
  onSelectionChange: (context: SelectionContext | null, anchor: SelectionAnchor | null) => void
  isToolbarVisible: () => boolean
}

/**
 * Hook for detecting text selection on the page
 */
export function useSelectionDetection({
  extensionRootRef,
  onSelectionChange,
  isToolbarVisible
}: UseSelectionDetectionOptions) {
  const rafIdRef = useRef<number | null>(null)
  const lastAnchorRef = useRef<SelectionAnchor | null>(null)
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const updateSelection = useCallback(
    (event?: Event) => {
      if (rafIdRef.current != null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null

        if (isExtensionUiFocused(extensionRootRef.current)) {
          return
        }

        if (hasSelectionInsideExtensionUi(extensionRootRef.current)) {
          return
        }

        // Capture mouse position from the triggering event
        if (event instanceof MouseEvent) {
          lastMouseRef.current = { x: event.clientX, y: event.clientY }
        }
        const mouse = lastMouseRef.current

        const target = event?.target ?? null
        const snapshot = getSelectionSnapshot(target)

        if (!snapshot) {
          onSelectionChange(null, null)
          return
        }

        let anchor = snapshot.anchor

        if (!anchor && event instanceof MouseEvent) {
          anchor = {
            x: event.clientX,
            y: event.clientY,
            rectRight: event.clientX,
            mouseX: event.clientX,
            mouseY: event.clientY
          }
        }

        if (!anchor && lastAnchorRef.current) {
          anchor = lastAnchorRef.current
        }

        if (!anchor) {
          onSelectionChange(null, null)
          return
        }

        // Stamp mouse position onto the anchor
        anchor = { ...anchor, mouseX: mouse.x, mouseY: mouse.y }

        lastAnchorRef.current = anchor
        onSelectionChange(snapshot.context, anchor)
      })
    },
    [extensionRootRef, onSelectionChange]
  )

  useEffect(() => {
    console.log("[AI Help Me] Selection detection hook mounted")
    const isPdf = isPdfViewer()
    console.log("[AI Help Me] Is PDF viewer:", isPdf)

    const isInsideExtension = (event: Event) =>
      isInsideExtensionEvent(event, extensionRootRef.current)

    const readSelectionText = () => {
      if (isExtensionUiFocused(extensionRootRef.current) || hasSelectionInsideExtensionUi(extensionRootRef.current)) {
        return ""
      }
      const snapshot = getSelectionSnapshot(null)
      return snapshot?.context.text.trim() ?? ""
    }

    const onPointerUp = (event: PointerEvent) => {
      if (isInsideExtension(event)) {
        return
      }

      updateSelection(event)
    }

    const handleSelectionChangeEvent = (event: Event) => {
      // When toolbar is visible, ignore all selection changes — the editor is the source of truth
      if (isToolbarVisible()) {
        return
      }

      if (isExtensionUiFocused(extensionRootRef.current) || hasSelectionInsideExtensionUi(extensionRootRef.current)) {
        return
      }

      if (!readSelectionText()) {
        onSelectionChange(null, null)
        return
      }

      updateSelection(event)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInsideExtension(event)) {
        return
      }

      if (!readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (isInsideExtension(event)) {
        return
      }

      updateSelection(event)
    }

    // Unified click-outside: any pointerdown outside the extension UI closes everything
    const onDocumentPointerDown = (event: PointerEvent) => {
      if (isInsideExtension(event)) {
        return
      }

      // Click outside extension UI → close toolbar
      onSelectionChange(null, null)
    }

    document.addEventListener("pointerup", onPointerUp, true)
    document.addEventListener("selectionchange", handleSelectionChangeEvent, true)
    document.addEventListener("keyup", onKeyUp, true)
    document.addEventListener("focusin", onFocusIn, true)
    document.addEventListener("pointerdown", onDocumentPointerDown, true)

    // PDF-specific: show floating button to read clipboard
    let pdfBtn: HTMLElement | null = null
    if (isPdf) {
      console.log("[AI Help Me] PDF detected - showing clipboard button")

      pdfBtn = document.createElement("div")
      pdfBtn.id = "ai-help-me-pdf-btn"
      pdfBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`
      pdfBtn.title = "复制文本后点击此处"
      pdfBtn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        width: 44px;
        height: 44px;
        background: #3B82F6;
        color: white;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        pointer-events: auto;
        transition: transform 0.15s, background 0.15s;
      `
      pdfBtn.onmouseenter = () => {
        if (pdfBtn) {
          pdfBtn.style.background = "#2563EB"
          pdfBtn.style.transform = "scale(1.05)"
        }
      }
      pdfBtn.onmouseleave = () => {
        if (pdfBtn) {
          pdfBtn.style.background = "#3B82F6"
          pdfBtn.style.transform = "scale(1)"
        }
      }

      document.body.appendChild(pdfBtn)

      pdfBtn.addEventListener("click", async () => {
        console.log("[AI Help Me] PDF button clicked")
        try {
          const text = await navigator.clipboard.readText()
          console.log("[AI Help Me] Clipboard:", text?.substring(0, 50))
          if (text?.trim()) {
            const context = {
              text: text.trim(),
              title: document.title || "",
              url: window.location.href
            }
            const anchor: SelectionAnchor = {
              x: window.innerWidth - 100,
              y: window.innerHeight - 100,
              rectRight: window.innerWidth - 100,
              mouseX: window.innerWidth - 100,
              mouseY: window.innerHeight - 100
            }
            onSelectionChange(context, anchor)
          }
        } catch (err) {
          console.log("[AI Help Me] Clipboard error:", err)
        }
      })
    }

    return () => {
      if (rafIdRef.current != null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }

      document.removeEventListener("pointerup", onPointerUp, true)
      document.removeEventListener("selectionchange", handleSelectionChangeEvent, true)
      document.removeEventListener("keyup", onKeyUp, true)
      document.removeEventListener("focusin", onFocusIn, true)
      document.removeEventListener("pointerdown", onDocumentPointerDown, true)

      // Remove PDF button if exists
      if (pdfBtn) {
        pdfBtn.remove()
      }
    }
  }, [extensionRootRef, updateSelection, isToolbarVisible, onSelectionChange])

  return {}
}
