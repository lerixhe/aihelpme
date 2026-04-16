import type { SelectionContext } from "~/shared/types"

export interface SelectionAnchor {
  x: number
  y: number
}

export function getSelectionContext(): SelectionContext | null {
  const selection = window.getSelection()
  if (!selection) {
    return null
  }

  const text = selection.toString().trim()
  if (!text) {
    return null
  }

  return {
    text,
    title: document.title || "",
    url: window.location.href
  }
}

export function getSelectionAnchor(): SelectionAnchor | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)
  const rects = range.getClientRects()
  const rect = rects.length > 0 ? rects[rects.length - 1] : range.getBoundingClientRect()

  if (!rect) {
    return null
  }

  if (rect.width === 0 && rect.height === 0 && rect.left === 0 && rect.top === 0) {
    return null
  }

  return {
    x: rect.left + Math.max(rect.width / 2, 0),
    y: rect.top
  }
}
