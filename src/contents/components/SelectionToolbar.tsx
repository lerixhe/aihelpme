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
}

export default function SelectionToolbar({
  visible,
  anchor,
  customActions,
  onBuiltInAction,
  onCustomAction,
  onFreeSubmit
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
    border: "none",
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[4]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.semibold,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    color: theme.text.inverse,
    background: theme.brand.primary,
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        display: "flex",
        alignItems: "center",
        gap: uiSpace[8],
        pointerEvents: "auto",
        background: theme.bg.surface,
        color: theme.text.primary,
        borderRadius: uiRadius.pill,
        border: `1px solid ${theme.border.default}`,
        boxShadow: uiShadow.md,
        padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
        fontSize: uiTypography.fontSize.sm,
        fontFamily: uiTypography.fontFamily,
        zIndex: uiLayer.overlay,
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto"
      }}>
      <span
        style={{
          fontWeight: uiTypography.fontWeight.bold,
          padding: `0 ${uiSpace[4]}px`,
          color: theme.text.secondary,
          whiteSpace: "nowrap"
        }}>
        AI Help Me
      </span>

      <button
        style={{
          ...baseButtonStyle,
          background: hovered === "built-in-explain" ? theme.brand.primaryHover : theme.brand.primary,
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
          background: hovered === "built-in-translate" ? theme.brand.primaryHover : theme.brand.primary,
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
            background: hovered === item.id ? theme.brand.primaryHover : theme.brand.primary,
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
          padding: `${uiSpace[4]}px ${uiSpace[12]}px`,
          boxShadow: focused === "input" ? `0 0 0 3px ${theme.bg.overlay}` : "none",
          outline: "none",
          minWidth: uiLayout.toolbar.inputMinWidth,
          fontSize: uiTypography.fontSize.sm,
          fontFamily: "inherit",
          transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
        }}
      />
    </div>
  )
}
