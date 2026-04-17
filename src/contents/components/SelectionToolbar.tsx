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

const TRIGGER_SIZE = 36
const MAX_SLOTS = 8

const SPARKLE_PATHS = [
  "M12 2C12.5523 2 13 2.44772 13 3V4.20051C13 4.61472 13.2632 4.98551 13.6558 5.12582L14.5673 5.45293C15.1189 5.64711 15.3536 6.30719 15.0133 6.77472L14.4048 7.60849C14.1673 7.9349 14.1673 8.37937 14.4048 8.70578L15.0133 9.53955C15.3536 10.0071 15.1189 10.6672 14.5673 10.8613L13.6558 11.1885C13.2632 11.3288 13 11.6996 13 12.1138V13.3143C13 13.7285 12.7368 14.0993 12.3442 14.2396L11.4327 14.5667C10.8811 14.7609 10.6464 15.421 10.9867 15.8885L11.5952 16.7223C11.8327 17.0487 11.8327 17.4932 11.5952 17.8196L10.9867 18.6534C10.6464 19.1209 10.8811 19.781 11.4327 19.9752L12.3442 20.3023C12.7368 20.4426 13 20.8134 13 21.2276V22.4281C13 22.8423 12.7368 23.2131 12.3442 23.3534L11.4327 23.6805C10.8811 23.8747 10.6464 24.5348 10.9867 25.0023L11.5952 25.8361C11.8327 26.1625 11.8327 26.607 11.5952 26.9334L10.9867 27.7672C10.6464 28.2347 10.8811 28.8948 11.4327 29.089L12.3442 29.4161C12.7368 29.5564 13 29.9272 13 30.3414V31",
  "M12 7L13.2 10.8H17L14 13L15.2 16.8L12 14.6L8.8 16.8L10 13L7 10.8H10.8L12 7Z"
]

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {SPARKLE_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={i === 1 ? color : undefined}
          fillOpacity={i === 1 ? 0.15 : undefined}
        />
      ))}
      <circle cx="18" cy="6" r="2.5" fill={color} fillOpacity={0.6} />
    </svg>
  )
}

const RING_BTN_HEIGHT = 32
const RING_BTN_PAD_X = 14
const CHAR_WIDTH = 14
const MIN_RING_GAP = 10
const MIN_RADIUS = 56

function estimateWidth(label: string) {
  return label.length * CHAR_WIDTH + RING_BTN_PAD_X * 2
}

function getRingPositions(labels: string[]) {
  const n = labels.length
  if (n === 0) return []
  if (n === 1) return [{ x: 0, y: -MIN_RADIUS }]

  const widths = labels.map(estimateWidth)
  const maxW = Math.max(...widths)

  const angleSpan = Math.min(Math.PI, Math.PI * 0.55 * n)
  const startAngle = -Math.PI / 2 - angleSpan / 2

  let radius = MIN_RADIUS
  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const gap = (2 * Math.PI) / n
      const chordHalf = Math.max(widths[i], widths[j]) / 2 + MIN_RING_GAP
      const r = chordHalf / Math.sin(gap / 2)
      radius = Math.max(radius, r)
    }
  }

  return labels.map((_, i) => {
    const angle = startAngle + (angleSpan / Math.max(1, n - 1)) * i
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  })
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

  const allActions: RingAction[] = useMemo(() => [
    { id: "built-in-explain", label: "解释", type: "built-in", actionId: "explain" },
    { id: "built-in-translate", label: "翻译", type: "built-in", actionId: "translate" },
    ...customActions.map((a) => ({ id: a.id, label: a.label, type: "custom" as const, template: a.template }))
  ], [customActions])

  const ringPositions = useMemo(() => getRingPositions(allActions.map((a) => a.label)), [allActions])

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

  const handleTriggerEnter = () => {
    setRingOpen(true)
    window.getSelection()?.removeAllRanges()
  }

  const handleRingActionHover = (action: RingAction) => {
    setRingOpen(false)
    setRingHovered(null)
    if (action.type === "built-in") {
      onBuiltInAction(action.actionId, "")
    } else {
      onCustomAction(action.template, "")
    }
  }

  // Reset ring state when toolbar is dismissed
  useEffect(() => {
    if (!visible) {
      setRingOpen(false)
      setRingHovered(null)
    }
  }, [visible])

  if (!visible || !anchor) {
    return null
  }

  const ringButtonStyle = (action: RingAction, pos: { x: number; y: number }): React.CSSProperties => {
    const isHovered = ringHovered === action.id
    return {
      position: "absolute",
      height: RING_BTN_HEIGHT,
      borderRadius: uiRadius.pill,
      border: `1.5px solid ${isHovered ? theme.border.default : theme.border.subtle}`,
      background: isHovered ? theme.brand.secondaryHover : theme.bg.surface,
      color: isHovered ? theme.brand.primary : theme.text.primary,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: uiTypography.fontSize.sm,
      fontWeight: uiTypography.fontWeight.semibold,
      fontFamily: uiTypography.fontFamily,
      whiteSpace: "nowrap",
      outline: "none",
      padding: `0 ${RING_BTN_PAD_X}px`,
      boxShadow: isHovered ? uiShadow.md : uiShadow.sm,
      zIndex: uiLayer.overlay,
      left: pos.x,
      top: pos.y,
      transform: `translate(-50%, -50%) scale(${isHovered ? 1.08 : 1})`,
      transition: `transform 250ms ${uiMotion.easingSpring}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}, border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, color ${uiMotion.durationFast} ${uiMotion.easingStandard}`
    }
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
        @keyframes ai-help-me-glow {
          0%, 100% {
            box-shadow: 0 0 8px ${theme.brand.primary}40, 0 2px 8px rgba(0,0,0,0.08);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 20px ${theme.brand.primary}60, 0 2px 12px rgba(0,0,0,0.12);
            transform: scale(1.05);
          }
        }
        @keyframes ring-item-enter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <div
        role="button"
        tabIndex={0}
        aria-label={ringOpen ? "收起环形菜单" : "展开环形菜单"}
        onMouseEnter={handleTriggerEnter}
        onClick={() => {
          if (ringOpen) {
            setRingOpen(false)
            setRingHovered(null)
          } else {
            setRingOpen(true)
          }
        }}
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
          background: `linear-gradient(135deg, ${theme.brand.primary}, ${theme.brand.primaryHover})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "none",
          padding: 0,
          outline: "none",
          animation: ringOpen ? "none" : "ai-help-me-glow 2s ease-in-out infinite",
          transition: `transform ${uiMotion.durationNormal} ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationNormal} ${uiMotion.easingStandard}`,
          transform: ringOpen ? "scale(1.15) rotate(15deg)" : undefined
        }}>
        <SparkleIcon size={18} color={theme.text.inverse} />
      </div>

      {ringOpen && (
        <div
          style={{
            position: "absolute",
            left: TRIGGER_SIZE / 2,
            top: TRIGGER_SIZE / 2,
            width: 0,
            height: 0,
            pointerEvents: "none"
          }}>
          {allActions.map((action, i) => {
            const pos = ringPositions[i]
            return (
              <div
                key={action.id}
                role="button"
                tabIndex={0}
                title={action.label}
                aria-label={action.label}
                onMouseEnter={() => {
                  setRingHovered(action.id)
                  handleRingActionHover(action)
                }}
                onMouseLeave={() => setRingHovered(null)}
                onFocus={() => setRingHovered(action.id)}
                onBlur={() => setRingHovered(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleRingActionHover(action)
                  }
                }}
                style={{
                  ...ringButtonStyle(action, pos),
                  animation: `ring-item-enter 250ms ${uiMotion.easingStandard} ${i * 50}ms both`,
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
