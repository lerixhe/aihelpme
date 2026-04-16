import { useMemo, useState } from "react"

import { useUiTheme } from "~/shared/ui/theme"
import { uiLayout, uiLayer, uiMotion, uiRadius, uiShadow, uiSpace, uiTypography } from "~/shared/ui/tokens"
import type { BuiltInActionId, CustomActionTemplate } from "~/shared/types"

interface Props {
  visible: boolean
  anchor: {
    x: number
    y: number
  } | null
  customActions: CustomActionTemplate[]
  onBuiltInAction: (action: BuiltInActionId) => void
  onCustomAction: (template: string) => void
  onFreeSubmit: (input: string) => void
  onClose: () => void
}

export default function SelectionToolbar({
  visible,
  anchor,
  customActions,
  onBuiltInAction,
  onCustomAction,
  onFreeSubmit,
  onClose
}: Props) {
  const theme = useUiTheme()
  const [freeInput, setFreeInput] = useState("")
  const [focused, setFocused] = useState<"input" | string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const top = useMemo(() => {
    if (!anchor) {
      return 0
    }

    const viewportHeight = window.innerHeight
    const preferredTop = anchor.y - uiLayout.toolbar.yOffset
    const minTop = uiLayout.edgeInset
    const maxTop = Math.max(minTop, viewportHeight - uiLayout.toolbar.yOffset)

    return Math.min(Math.max(minTop, preferredTop), maxTop)
  }, [anchor])

  const left = useMemo(() => {
    if (!anchor) {
      return 0
    }

    const viewportWidth = window.innerWidth
    const preferredLeft = anchor.x - uiLayout.toolbar.preferredXOffset
    const minLeft = uiLayout.edgeInset
    const maxLeft = Math.max(minLeft, viewportWidth - uiLayout.toolbar.widthEstimate)

    return Math.min(Math.max(minLeft, preferredLeft), maxLeft)
  }, [anchor])

  if (!visible || !anchor) {
    return null
  }

  const baseButtonStyle = {
    border: `1px solid ${theme.border.subtle}`,
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.medium,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    color: theme.text.primary,
    background: theme.brand.secondary,
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }

  return (
    <div
      onKeyDownCapture={(event) => {
        if (event.key !== "Escape") {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        onClose()
      }}
      style={{
        position: "fixed",
        top,
        left,
        display: "flex",
        alignItems: "center",
        gap: uiSpace[8],
        flexWrap: "wrap",
        pointerEvents: "auto",
        background: theme.bg.surface,
        color: theme.text.primary,
        borderRadius: uiRadius.lg,
        border: `1px solid ${theme.border.default}`,
        boxShadow: uiShadow.md,
        padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
        fontSize: uiTypography.fontSize.sm,
        fontFamily: uiTypography.fontFamily,
        zIndex: uiLayer.overlay,
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto",
        backdropFilter: "blur(10px)"
      }}>
      <span
        style={{
          fontWeight: uiTypography.fontWeight.semibold,
          padding: `${uiSpace[4]}px ${uiSpace[8]}px`,
          color: theme.text.secondary,
          whiteSpace: "nowrap",
          borderRadius: uiRadius.pill,
          background: theme.bg.surfaceMuted
        }}>
        AI 助手
      </span>

      <button
        style={{
          ...baseButtonStyle,
          background: hovered === "built-in-explain" ? theme.brand.secondaryHover : theme.brand.secondary,
          borderColor: hovered === "built-in-explain" ? theme.border.default : theme.border.subtle,
          boxShadow:
            focused === "built-in-explain" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.border.strong}` : "none"
        }}
        onMouseEnter={() => setHovered("built-in-explain")}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setFocused("built-in-explain")}
        onBlur={() => setFocused(null)}
        onClick={() => onBuiltInAction("explain")}>
        解释
      </button>
      <button
        style={{
          ...baseButtonStyle,
          background: hovered === "built-in-translate" ? theme.brand.secondaryHover : theme.brand.secondary,
          borderColor: hovered === "built-in-translate" ? theme.border.default : theme.border.subtle,
          boxShadow:
            focused === "built-in-translate" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.border.strong}` : "none"
        }}
        onMouseEnter={() => setHovered("built-in-translate")}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setFocused("built-in-translate")}
        onBlur={() => setFocused(null)}
        onClick={() => onBuiltInAction("translate")}>
        翻译
      </button>

      {customActions.map((item) => (
        <button
          key={item.id}
          style={{
            ...baseButtonStyle,
            background: hovered === item.id ? theme.brand.secondaryHover : theme.brand.secondary,
            borderColor: hovered === item.id ? theme.border.default : theme.border.subtle,
            boxShadow: focused === item.id ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.border.strong}` : "none"
          }}
          onMouseEnter={() => setHovered(item.id)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused(item.id)}
          onBlur={() => setFocused(null)}
          onClick={() => onCustomAction(item.template)}>
          {item.label}
        </button>
      ))}

      <input
        value={freeInput}
        onChange={(event) => setFreeInput(event.target.value)}
        onFocus={() => setFocused("input")}
        onBlur={() => setFocused(null)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return
          }

          const value = freeInput.trim()
          if (!value) {
            return
          }

          onFreeSubmit(value)
          setFreeInput("")
        }}
        aria-label="输入自定义需求"
        placeholder="输入需求后回车"
        style={{
          border: `1px solid ${focused === "input" ? theme.border.strong : theme.border.default}`,
          background: theme.bg.surfaceAlt,
          color: theme.text.primary,
          borderRadius: uiRadius.pill,
          padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
          boxShadow: focused === "input" ? `0 0 0 3px ${theme.bg.overlay}` : "none",
          outline: "none",
          minWidth: uiLayout.toolbar.inputMinWidth,
          flex: 1,
          fontSize: uiTypography.fontSize.sm,
          fontFamily: "inherit",
          transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
        }}
      />
    </div>
  )
}
