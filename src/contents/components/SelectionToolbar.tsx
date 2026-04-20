import { useEffect, useMemo, useState } from "react"

import { useUiTheme } from "~/shared/ui/theme"
import { uiLayout, uiLayer, uiMotion, uiRadius, uiShadow, uiTypography } from "~/shared/ui/tokens"
import type { BuiltInActionId, CustomActionTemplate, SelectionAnchor } from "~/shared/types"

interface Props {
  visible: boolean
  anchor: SelectionAnchor | null
  customActions: CustomActionTemplate[]
  onBuiltInAction: (action: BuiltInActionId, text: string) => void
  onCustomAction: (template: string, text: string) => void
  onClose: () => void
}

const TRIGGER_SIZE = 40
const PILL_HEIGHT = 32
const PILL_PAD_X = 14
const CHAR_WIDTH = 7.5
const PILL_GAP = 6

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity={0.15}
      />
      <circle cx="18" cy="5" r="1.5" fill={color} fillOpacity={0.5} />
    </svg>
  )
}

function estimateWidth(label: string) {
  return label.length * CHAR_WIDTH + PILL_PAD_X * 2
}

type RingAction =
  | { id: string; label: string; type: "built-in"; actionId: BuiltInActionId }
  | { id: string; label: string; type: "custom"; template: string }

export default function SelectionToolbar({
  visible,
  anchor,
  customActions,
  onBuiltInAction,
  onCustomAction,
  onClose
}: Props) {
  const theme = useUiTheme()
  const [ringOpen, setRingOpen] = useState(false)
  const [ringHovered, setRingHovered] = useState<string | null>(null)
  const [triggerPressed, setTriggerPressed] = useState(false)

  const allActions: RingAction[] = useMemo(() => [
    { id: "built-in-explain", label: "解释", type: "built-in", actionId: "explain" },
    { id: "built-in-translate", label: "翻译", type: "built-in", actionId: "translate" },
    ...customActions.map((a) => ({ id: a.id, label: a.label, type: "custom" as const, template: a.template }))
  ], [customActions])

  const position = useMemo(() => {
    if (!anchor) {
      return { top: 0, left: 0 }
    }

    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const OFFSET_X = 12
    const OFFSET_Y = 12

    const minTop = uiLayout.edgeInset
    const maxTop = Math.max(minTop, viewportHeight - TRIGGER_SIZE - uiLayout.edgeInset)
    const minLeft = uiLayout.edgeInset
    const maxLeft = Math.max(minLeft, viewportWidth - TRIGGER_SIZE - uiLayout.edgeInset)

    let top = anchor.mouseY - TRIGGER_SIZE - OFFSET_Y
    let left = anchor.mouseX + OFFSET_X

    if (left + TRIGGER_SIZE > viewportWidth - uiLayout.edgeInset) {
      left = anchor.mouseX - TRIGGER_SIZE - OFFSET_X
    }

    top = Math.min(Math.max(minTop, top), maxTop)
    left = Math.min(Math.max(minLeft, left), maxLeft)

    return { top, left }
  }, [anchor])

  const pillBarPosition = useMemo(() => {
    const totalWidth = allActions.reduce((sum, a) => sum + estimateWidth(a.label) + PILL_GAP, -PILL_GAP)
    return { width: totalWidth, offsetX: -(totalWidth - TRIGGER_SIZE) / 2 }
  }, [allActions])

  const handleTriggerEnter = () => {
    setRingOpen(true)
    window.getSelection()?.removeAllRanges()
  }

  const handleActionClick = (action: RingAction) => {
    setRingOpen(false)
    setRingHovered(null)
    if (action.type === "built-in") {
      onBuiltInAction(action.actionId, "")
    } else {
      onCustomAction(action.template, "")
    }
  }

  useEffect(() => {
    if (!visible) {
      setRingOpen(false)
      setRingHovered(null)
    }
  }, [visible])

  if (!visible || !anchor) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: uiLayer.overlay,
        pointerEvents: "auto",
        fontFamily: uiTypography.fontFamily
      }}>
      <style>{`
        @keyframes pill-bar-enter {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pill-item-enter {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Trigger button */}
      <div
        role="button"
        tabIndex={0}
        aria-label={ringOpen ? "收起动作菜单" : "展开动作菜单"}
        onMouseEnter={handleTriggerEnter}
        onClick={() => {
          if (ringOpen) {
            setRingOpen(false)
            setRingHovered(null)
          } else {
            setRingOpen(true)
          }
        }}
        onMouseDown={() => setTriggerPressed(true)}
        onMouseUp={() => setTriggerPressed(false)}
        onFocus={handleTriggerEnter}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            if (ringOpen) {
              setRingOpen(false)
              setRingHovered(null)
            } else {
              onClose()
            }
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setRingOpen((prev) => !prev)
          }
        }}
        style={{
          width: TRIGGER_SIZE,
          height: TRIGGER_SIZE,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.brand.primary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "none",
          padding: 0,
          outline: "none",
          boxShadow: uiShadow.lg,
          transform: triggerPressed ? "scale(0.92)" : ringOpen ? "scale(1.08)" : "scale(1)",
          transition: `transform 200ms ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
        }}>
        <SparkleIcon size={20} color={theme.text.inverse} />
      </div>

      {/* Pill bar */}
      {ringOpen && (
        <div
          style={{
            position: "absolute",
            left: pillBarPosition.offsetX,
            top: -(PILL_HEIGHT + 10),
            display: "flex",
            gap: PILL_GAP,
            padding: "6px 8px",
            borderRadius: uiRadius.lg,
            background: theme.bg.glass,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `0.5px solid ${theme.border.hairline}`,
            boxShadow: uiShadow.xl,
            pointerEvents: "auto",
            animation: `pill-bar-enter 250ms ${uiMotion.easingSpring} forwards`
          }}>
          {allActions.map((action, i) => {
            const isHovered = ringHovered === action.id
            return (
              <div
                key={action.id}
                role="button"
                tabIndex={0}
                title={action.label}
                aria-label={action.label}
                onMouseEnter={() => setRingHovered(action.id)}
                onMouseLeave={() => setRingHovered(null)}
                onClick={() => handleActionClick(action)}
                onFocus={() => setRingHovered(action.id)}
                onBlur={() => setRingHovered(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleActionClick(action)
                  }
                }}
                style={{
                  height: PILL_HEIGHT,
                  borderRadius: uiRadius.pill,
                  border: "none",
                  background: isHovered ? theme.accent.primary : "transparent",
                  color: isHovered ? theme.text.inverse : theme.text.primary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: uiTypography.fontSize.sm,
                  fontWeight: uiTypography.fontWeight.medium,
                  fontFamily: uiTypography.fontFamily,
                  whiteSpace: "nowrap",
                  outline: "none",
                  padding: `0 ${PILL_PAD_X}px`,
                  transform: isHovered ? "scale(1.04)" : "scale(1)",
                  transition: `transform 150ms ${uiMotion.easingSpring}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}, color ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
                  animation: `pill-item-enter 200ms ${uiMotion.easingSpring} ${i * 30}ms both`,
                  pointerEvents: "auto"
                }}>
                {action.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
