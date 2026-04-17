import { useCallback, useEffect, useRef } from "react"

import { getSelectionSnapshot } from "~/shared/selection"
import type { SelectionAnchor, SelectionContext } from "~/shared/types"

import {
  hasSelectionInsideExtensionUi,
  isExtensionUiFocused,
  isInsideExtensionEvent
} from "~/contents/utils/domUtils"

interface UseSelectionDetectionOptions {
  extensionRootRef: React.RefObject<HTMLElement | null>
  onSelectionChange: (context: SelectionContext | null, anchor: SelectionAnchor | null) => void
  hasCapturedPageSelection: () => boolean
  shouldPreserveToolbar: (target: EventTarget | null) => boolean
}

/**
 * Hook for detecting text selection on the page
 */
export function useSelectionDetection({
  extensionRootRef,
  onSelectionChange,
  hasCapturedPageSelection,
  shouldPreserveToolbar
}: UseSelectionDetectionOptions) {
  const rafIdRef = useRef<number | null>(null)
  const lastAnchorRef = useRef<SelectionAnchor | null>(null)
  const extensionInteractionRef = useRef(false)

  const readSelectionText = useCallback(() => {
    if (isExtensionUiFocused(extensionRootRef.current) || hasSelectionInsideExtensionUi(extensionRootRef.current)) {
      return ""
    }

    const snapshot = getSelectionSnapshot(null)
    return snapshot?.context.text.trim() ?? ""
  }, [extensionRootRef])

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

        const target = event?.target ?? null
        const snapshot = getSelectionSnapshot(target)

        if (!snapshot) {
          if (shouldPreserveToolbar(target)) {
            return
          }

          onSelectionChange(null, null)
          return
        }

        let anchor = snapshot.anchor

        if (!anchor && event instanceof MouseEvent) {
          anchor = {
            x: event.clientX,
            y: event.clientY,
            rectRight: event.clientX
          }
        }

        if (!anchor && lastAnchorRef.current) {
          anchor = lastAnchorRef.current
        }

        if (!anchor) {
          onSelectionChange(null, null)
          return
        }

        lastAnchorRef.current = anchor
        onSelectionChange(snapshot.context, anchor)
      })
    },
    [extensionRootRef, onSelectionChange, shouldPreserveToolbar]
  )

  useEffect(() => {
    const onPointerUp = (event: PointerEvent) => {
      if (isInsideExtensionEvent(event, extensionRootRef.current)) {
        return
      }

      updateSelection(event)
    }

    const handleSelectionChangeEvent = (event: Event) => {
      if (extensionInteractionRef.current) {
        return
      }

      if (isExtensionUiFocused(extensionRootRef.current) || hasSelectionInsideExtensionUi(extensionRootRef.current)) {
        return
      }

      if (!readSelectionText()) {
        if (hasCapturedPageSelection()) {
          return
        }

        onSelectionChange(null, null)
        return
      }

      updateSelection(event)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInsideExtensionEvent(event, extensionRootRef.current)) {
        return
      }

      if (!readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onFocusIn = (event: FocusEvent) => {
      if (isInsideExtensionEvent(event, extensionRootRef.current)) {
        return
      }

      if (hasCapturedPageSelection() && !readSelectionText()) {
        return
      }

      updateSelection(event)
    }

    const onDocumentMouseDown = (event: MouseEvent) => {
      if (isInsideExtensionEvent(event, extensionRootRef.current)) {
        extensionInteractionRef.current = true
        return
      }

      extensionInteractionRef.current = false
    }

    document.addEventListener("pointerup", onPointerUp, true)
    document.addEventListener("selectionchange", handleSelectionChangeEvent, true)
    document.addEventListener("keyup", onKeyUp, true)
    document.addEventListener("focusin", onFocusIn, true)
    document.addEventListener("mousedown", onDocumentMouseDown, true)

    return () => {
      if (rafIdRef.current != null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }

      document.removeEventListener("pointerup", onPointerUp, true)
      document.removeEventListener("selectionchange", handleSelectionChangeEvent, true)
      document.removeEventListener("keyup", onKeyUp, true)
      document.removeEventListener("focusin", onFocusIn, true)
      document.removeEventListener("mousedown", onDocumentMouseDown, true)
    }
  }, [extensionRootRef, updateSelection, readSelectionText, hasCapturedPageSelection, onSelectionChange])

  return {
    extensionInteractionRef
  }
}
