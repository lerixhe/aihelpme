import type { CSSProperties } from "react"

import type { UiTheme } from "~/shared/ui/tokens"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiTypography } from "~/shared/ui/tokens"

const TRANSPARENT_RING = "33"

export function createFocusRing(color: string) {
  return `0 0 0 3px ${color}${TRANSPARENT_RING}`
}

export function createCardStyle(theme: UiTheme): CSSProperties {
  return {
    borderRadius: uiRadius.lg,
    padding: `${uiSpace[20]}px ${uiSpace[24]}px`,
    background: theme.bg.surface,
    boxShadow: uiShadow.md,
    border: `1px solid ${theme.border.hairline}`
  }
}

export function createInputStyle(theme: UiTheme, focused: boolean): CSSProperties {
  return {
    border: `1px solid ${focused ? theme.accent.primary : theme.border.subtle}`,
    borderRadius: uiRadius.md,
    padding: `${uiSpace[10]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    outline: "none",
    color: theme.text.primary,
    background: theme.bg.surfaceMuted,
    boxShadow: focused ? createFocusRing(theme.accent.primary) : "none",
    transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
    width: "100%",
    boxSizing: "border-box"
  }
}

export function createButtonStyle(
  theme: UiTheme,
  variant: "primary" | "secondary" | "danger",
  options?: {
    disabled?: boolean
    pressed?: boolean
    focused?: boolean
    compact?: boolean
  }
): CSSProperties {
  const disabled = options?.disabled ?? false
  const pressed = options?.pressed ?? false
  const focused = options?.focused ?? false
  const compact = options?.compact ?? false

  const palette = {
    primary: {
      background: disabled ? theme.state.disabled : theme.accent.primary,
      color: theme.text.inverse,
      border: "none"
    },
    secondary: {
      background: theme.bg.surface,
      color: theme.text.primary,
      border: `1px solid ${theme.border.default}`
    },
    danger: {
      background: disabled ? theme.state.disabled : theme.state.error,
      color: theme.text.inverse,
      border: "none"
    }
  }[variant]

  return {
    border: palette.border,
    borderRadius: uiRadius.pill,
    padding: compact ? `${uiSpace[6]}px ${uiSpace[12]}px` : `${uiSpace[8]}px ${uiSpace[16]}px`,
    background: palette.background,
    color: palette.color,
    fontWeight: variant === "secondary" ? uiTypography.fontWeight.medium : uiTypography.fontWeight.semibold,
    fontSize: compact ? uiTypography.fontSize.sm : uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none",
    opacity: disabled ? 0.5 : 1,
    transform: pressed ? "scale(0.96)" : "scale(1)",
    boxShadow: focused ? createFocusRing(theme.accent.primary) : "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, color ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }
}

export function createStatusMessageStyle(
  theme: UiTheme,
  tone: "success" | "error" | "info"
): CSSProperties {
  const palette =
    tone === "success"
      ? { color: theme.state.success, background: theme.state.successBg, border: theme.state.success }
      : tone === "error"
        ? { color: theme.state.error, background: theme.state.errorBg, border: theme.state.error }
        : { color: theme.text.secondary, background: theme.bg.surfaceAlt, border: theme.border.default }

  return {
    fontSize: uiTypography.fontSize.sm,
    color: palette.color,
    background: palette.background,
    padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
    borderRadius: uiRadius.md,
    lineHeight: 1.6,
    border: `1px solid ${palette.border}22`
  }
}

export function createFieldLabelStyle(theme: UiTheme): CSSProperties {
  return {
    display: "block",
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: uiSpace[6],
    letterSpacing: uiTypography.letterSpacing.normal
  }
}

export function createOverlayStyle(theme: UiTheme): CSSProperties {
  return {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.bg.overlay,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)"
  }
}
