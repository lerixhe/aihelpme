import { useEffect, useMemo, useRef, useState } from "react"

import { useUiTheme } from "~/shared/ui/theme"
import { uiLayout, uiLayer, uiMotion, uiRadius, uiShadow, uiSpace, uiTypography } from "~/shared/ui/tokens"
import type { BuiltInActionId, CustomActionTemplate, SelectionAnchor } from "~/shared/types"

interface Props {
  visible: boolean
  anchor: SelectionAnchor | null
  selectionText: string
  customActions: CustomActionTemplate[]
  onBuiltInAction: (action: BuiltInActionId, text: string) => void
  onCustomAction: (template: string, text: string) => void
  onFreeSubmit: (input: string, text: string) => void
  onClose: () => void
}

const TRIGGER_SIZE = 36
const RING_RADIUS = 52
const MAX_SLOTS = 8
const ANGLE_START = -45
const ANGLE_STEP = 45

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

function SendIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 8L14 2L8 14L7 9L2 8Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  )
}

type RingAction =
  | { id: string; label: string; type: "built-in"; actionId: BuiltInActionId }
  | { id: string; label: string; type: "custom"; template: string }

function getRingPosition(slotIndex: number) {
  const angle = (ANGLE_START + slotIndex * ANGLE_STEP) * (Math.PI / 180)
  return {
    x: Math.cos(angle) * RING_RADIUS,
    y: Math.sin(angle) * RING_RADIUS
  }
}

export default function SelectionToolbar({
  visible,
  anchor,
  selectionText,
  customActions,
  onBuiltInAction,
  onCustomAction,
  onFreeSubmit,
  onClose
}: Props) {
  const theme = useUiTheme()
  const [expanded, setExpanded] = useState(false)
  const [capturedText, setCapturedText] = useState("")
  const [freeInput, setFreeInput] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [ringOpen, setRingOpen] = useState(false)
  const [ringHovered, setRingHovered] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const ringCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Default: upper-right of mouse cursor
    let top = anchor.mouseY - TRIGGER_SIZE - OFFSET_Y
    let left = anchor.mouseX + OFFSET_X

    // Flip to upper-left if overflowing right edge
    if (left + TRIGGER_SIZE > viewportWidth - uiLayout.edgeInset) {
      left = anchor.mouseX - TRIGGER_SIZE - OFFSET_X
    }

    // Clamp to viewport bounds
    top = Math.min(Math.max(minTop, top), maxTop)
    left = Math.min(Math.max(minLeft, left), maxLeft)

    return { top, left }
  }, [anchor])

  const handleTriggerEnter = () => {
    setRingOpen(true)
    window.getSelection()?.removeAllRanges()
  }

  const scheduleRingClose = () => {
    if (ringCloseTimer.current) {
      clearTimeout(ringCloseTimer.current)
    }
    ringCloseTimer.current = setTimeout(() => {
      setRingOpen(false)
      setRingHovered(null)
    }, 300)
  }

  const cancelRingClose = () => {
    if (ringCloseTimer.current) {
      clearTimeout(ringCloseTimer.current)
      ringCloseTimer.current = null
    }
  }

  const handleRingActionHover = (action: RingAction) => {
    setRingOpen(false)
    setRingHovered(null)
    setExpanded(true)
    if (action.type === "built-in") {
      onBuiltInAction(action.actionId, currentText)
    } else {
      onCustomAction(action.template, currentText)
    }
  }

  const currentText = capturedText

  // Reset captured text and collapsed state when toolbar reopens
  useEffect(() => {
    if (visible && selectionText) {
      setCapturedText(selectionText)
    }
    if (!visible) {
      setExpanded(false)
      setRingOpen(false)
      setRingHovered(null)
      setFreeInput("")
    }
  }, [visible, selectionText])

  // Close ring when panel opens
  useEffect(() => {
    if (expanded) {
      setRingOpen(false)
      setRingHovered(null)
    }
  }, [expanded])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (ringCloseTimer.current) {
        clearTimeout(ringCloseTimer.current)
      }
    }
  }, [])

  if (!visible || !anchor) {
    return null
  }

  const actionButtonStyle = (id: string): React.CSSProperties => ({
    border: `1px solid ${hovered === id ? theme.border.default : theme.border.subtle}`,
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[4]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.medium,
    cursor: "pointer",
    whiteSpace: "nowrap",
    color: theme.text.primary,
    background: hovered === id ? theme.brand.secondaryHover : theme.brand.secondary,
    outline: "none",
    boxShadow:
      focused === id ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  })

  const ringButtonStyle = (action: RingAction, pos: { x: number; y: number }): React.CSSProperties => {
    const isHovered = ringHovered === action.id
    return {
      position: "absolute",
      width: TRIGGER_SIZE,
      height: TRIGGER_SIZE,
      borderRadius: "50%",
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
      outline: "none",
      padding: 0,
      boxShadow: isHovered ? uiShadow.md : uiShadow.sm,
      zIndex: uiLayer.overlay,
      left: pos.x,
      top: pos.y,
      transform: `translate(-50%, -50%) scale(${isHovered ? 1.2 : 1})`,
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
        aria-label={ringOpen ? "收起环形菜单" : "展开选区面板"}
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={scheduleRingClose}
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
          animation: (expanded || ringOpen) ? "none" : "ai-help-me-glow 2s ease-in-out infinite",
          transition: `transform ${uiMotion.durationNormal} ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationNormal} ${uiMotion.easingStandard}`,
          transform: ringOpen ? "scale(1.15) rotate(15deg)" : expanded ? "scale(1.1)" : undefined
        }}>
        <SparkleIcon size={18} color={theme.text.inverse} />
      </div>

      {ringOpen && !expanded && (
        <div
          onMouseEnter={cancelRingClose}
          onMouseLeave={scheduleRingClose}
          style={{
            position: "absolute",
            left: TRIGGER_SIZE / 2,
            top: TRIGGER_SIZE / 2,
            width: 0,
            height: 0,
            pointerEvents: "none"
          }}>
          {allActions.map((action, i) => {
            const pos = getRingPosition(i)
            return (
              <div
                key={action.id}
                role="button"
                tabIndex={0}
                title={action.label}
                aria-label={action.label}
                onMouseEnter={() => {
                  cancelRingClose()
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
                {action.label.slice(0, 2)}
              </div>
            )
          })}
        </div>
      )}

      {expanded && (
        <div
          ref={containerRef}
          onKeyDownCapture={(event) => {
            if (event.key !== "Escape") {
              return
            }

            event.preventDefault()
            event.stopPropagation()
            setExpanded(false)
          }}
          style={{
            position: "absolute",
            top: TRIGGER_SIZE + 4,
            left: 0,
            minWidth: 340,
            maxWidth: "min(460px, calc(100vw - 24px))",
            background: theme.bg.surface,
            color: theme.text.primary,
            borderRadius: uiRadius.lg,
            border: `1px solid ${theme.border.default}`,
            boxShadow: uiShadow.lg,
            overflow: "hidden",
            backdropFilter: "blur(16px)",
            transformOrigin: "0 0",
            animation: `toolbar-enter 0.35s ${uiMotion.easingSpring} forwards`
          }}>
          <style>{`
            @keyframes toolbar-enter {
              from {
                opacity: 0;
                transform: scale(0.9) translateY(8px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>

          <div
            style={{
              height: 3,
              background: theme.brand.primary,
              borderRadius: `${uiRadius.lg}px ${uiRadius.lg}px 0 0`
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              borderBottom: `1px solid ${theme.border.subtle}`
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: uiSpace[8] }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${theme.brand.primary}, ${theme.brand.primaryHover})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                <SparkleIcon size={14} color={theme.text.inverse} />
              </div>
              <span
                style={{
                  fontWeight: uiTypography.fontWeight.bold,
                  fontSize: uiTypography.fontSize.md,
                  letterSpacing: "-0.01em",
                  color: theme.brand.primary
                }}>
                AI Help Me
              </span>
            </div>
            <button
              onClick={() => {
                setExpanded(false)
              }}
              aria-label="收起选区面板"
              style={{
                border: "none",
                background: "transparent",
                color: theme.text.secondary,
                cursor: "pointer",
                width: 24,
                height: 24,
                borderRadius: uiRadius.sm,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                lineHeight: 1,
                padding: 0,
                outline: "none",
                transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}`
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = theme.bg.surfaceMuted
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent"
              }}>
              ×
            </button>
          </div>

          <div
            style={{
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`
            }}>
            <textarea
              value={capturedText}
              onChange={(event) => setCapturedText(event.target.value)}
              onFocus={() => setFocused("captured")}
              onBlur={() => setFocused(null)}
              rows={3}
              aria-label="选区面板已捕获的文本"
              placeholder="选中文本将显示在这里..."
              style={{
                width: "100%",
                resize: "vertical",
                border: `1px solid ${focused === "captured" ? theme.brand.primary : theme.border.default}`,
                background: theme.bg.surfaceAlt,
                color: theme.text.primary,
                borderRadius: uiRadius.md,
                padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                boxShadow: focused === "captured" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
                outline: "none",
                fontSize: uiTypography.fontSize.sm,
                fontFamily: "inherit",
                lineHeight: 1.5,
                transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
                boxSizing: "border-box"
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: uiSpace[8],
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              flexWrap: "wrap"
            }}>
            <button
              style={actionButtonStyle("built-in-explain")}
              onMouseEnter={() => setHovered("built-in-explain")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setFocused("built-in-explain")}
              onBlur={() => setFocused(null)}
              onClick={() => onBuiltInAction("explain", currentText)}>
              解释
            </button>
            <button
              style={actionButtonStyle("built-in-translate")}
              onMouseEnter={() => setHovered("built-in-translate")}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setFocused("built-in-translate")}
              onBlur={() => setFocused(null)}
              onClick={() => onBuiltInAction("translate", currentText)}>
              翻译
            </button>
            {customActions.map((item) => (
              <button
                key={item.id}
                style={actionButtonStyle(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setFocused(item.id)}
                onBlur={() => setFocused(null)}
                onClick={() => onCustomAction(item.template, currentText)}>
                {item.label}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: uiSpace[8],
              padding: `0 ${uiSpace[12]}px ${uiSpace[12]}px`
            }}>
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

                onFreeSubmit(value, currentText)
                setFreeInput("")
              }}
              aria-label="在选区面板中输入自定义需求"
              placeholder="输入需求后回车"
              style={{
                flex: 1,
                border: `1px solid ${focused === "input" ? theme.brand.primary : theme.border.default}`,
                background: theme.bg.surfaceAlt,
                color: theme.text.primary,
                borderRadius: uiRadius.pill,
                padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                boxShadow: focused === "input" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
                outline: "none",
                minWidth: 140,
                fontSize: uiTypography.fontSize.sm,
                fontFamily: "inherit",
                transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
              }}
            />
            <button
              onClick={() => {
                const value = freeInput.trim()
                if (!value) {
                  return
                }

                onFreeSubmit(value, currentText)
                setFreeInput("")
              }}
              disabled={!freeInput.trim()}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: freeInput.trim()
                  ? `linear-gradient(135deg, ${theme.brand.primary}, ${theme.brand.primaryHover})`
                  : theme.bg.surfaceMuted,
                color: freeInput.trim() ? theme.text.inverse : theme.text.secondary,
                cursor: freeInput.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
                outline: "none",
                opacity: freeInput.trim() ? 1 : 0.5,
                transition: `all ${uiMotion.durationFast} ${uiMotion.easingStandard}`
              }}
              aria-label="发送">
              <SendIcon color={freeInput.trim() ? theme.text.inverse : theme.text.secondary} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
