import { useEffect, useMemo, useState } from "react"

import ExplodedActionMenu from "~/contents/components/ExplodedActionMenu"
import PillActionMenu from "~/contents/components/PillActionMenu"
import { useUiTheme } from "~/shared/ui/theme"
import { uiLayout, uiLayer, uiMotion, uiShadow, uiTypography } from "~/shared/ui/tokens"
import type { ActionTemplate, SelectionAnchor, ToolbarMode } from "~/shared/types"

interface Props {
  visible: boolean
  anchor: SelectionAnchor | null
  actions: ActionTemplate[]
  toolbarMode: ToolbarMode
  onAction: (template: string, text: string) => void
  onClose: () => void
}

const TRIGGER_SIZE = 40

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

type RingAction = { id: string; label: string; template: string }

export default function SelectionToolbar({
  visible,
  anchor,
  actions,
  toolbarMode,
  onAction,
  onClose
}: Props) {
  const theme = useUiTheme()
  const [ringOpen, setRingOpen] = useState(false)
  const [ringHovered, setRingHovered] = useState<string | null>(null)
  const [triggerPressed, setTriggerPressed] = useState(false)

  const allActions: RingAction[] = useMemo(() =>
    actions.map((a) => ({ id: a.id, label: a.label, template: a.template }))
  , [actions])

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

  const handleActionClick = (action: RingAction) => {
    setRingOpen(false)
    setRingHovered(null)
    onAction(action.template, "")
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

      {ringOpen && (
        toolbarMode === "pill" ? (
          <PillActionMenu
            actions={actions}
            hoveredActionId={ringHovered}
            onHoverChange={setRingHovered}
            onActionClick={handleActionClick}
            theme={theme}
            triggerSize={TRIGGER_SIZE}
          />
        ) : (
          <ExplodedActionMenu
            actions={actions}
            hoveredActionId={ringHovered}
            onHoverChange={setRingHovered}
            onActionClick={handleActionClick}
            theme={theme}
            triggerSize={TRIGGER_SIZE}
          />
        )
      )}
    </div>
  )
}
