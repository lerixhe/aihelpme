import { type CSSProperties, useEffect } from "react"
import type { UiThemeName } from "~/shared/ui/tokens"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography, uiLayer } from "~/shared/ui/tokens"

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  themeName: UiThemeName
}

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, themeName }: ConfirmDialogProps) {
  const theme = uiThemes[themeName]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: uiLayer.overlay,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.bg.overlay,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    animation: `fadeIn ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }

  const cardStyle: CSSProperties = {
    maxWidth: 400,
    width: "calc(100% - 48px)",
    padding: `${uiSpace[28]}px`,
    borderRadius: uiRadius.lg,
    background: theme.bg.surface,
    boxShadow: uiShadow.xl,
    border: `0.5px solid ${theme.border.hairline}`,
    animation: `slideUp ${uiMotion.durationNormal} ${uiMotion.easingSpring}`
  }

  const cancelBtnStyle: CSSProperties = {
    border: `1px solid ${theme.border.default}`,
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[8]}px ${uiSpace[20]}px`,
    background: "transparent",
    color: theme.text.primary,
    fontWeight: uiTypography.fontWeight.medium,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    cursor: "pointer",
    outline: "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}`
  }

  const confirmBtnStyle: CSSProperties = {
    border: "none",
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[8]}px ${uiSpace[20]}px`,
    background: theme.state.error,
    color: "#FFFFFF",
    fontWeight: uiTypography.fontWeight.semibold,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    cursor: "pointer",
    outline: "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}`
  }

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            margin: 0,
            fontSize: uiTypography.fontSize.xxl,
            fontWeight: uiTypography.fontWeight.bold,
            letterSpacing: uiTypography.letterSpacing.tight,
            color: theme.text.primary
          }}>
          {title}
        </h2>
        <p
          style={{
            margin: `${uiSpace[8]}px 0 0`,
            fontSize: uiTypography.fontSize.md,
            color: theme.text.secondary,
            lineHeight: 1.55
          }}>
          {message}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: uiSpace[12],
            marginTop: uiSpace[24]
          }}>
          <button style={cancelBtnStyle} onClick={onCancel}>
            取消
          </button>
          <button style={confirmBtnStyle} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
    </div>
  )
}
