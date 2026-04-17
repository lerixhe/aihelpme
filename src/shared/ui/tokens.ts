export type UiThemeName = "light" | "dark"

export interface UiTheme {
  bg: {
    page: string
    surface: string
    surfaceAlt: string
    surfaceMuted: string
    overlay: string
  }
  text: {
    primary: string
    secondary: string
    inverse: string
  }
  border: {
    default: string
    strong: string
    subtle: string
  }
  brand: {
    primary: string
    primaryHover: string
    primaryActive: string
    secondary: string
    secondaryHover: string
  }
  state: {
    error: string
    errorBg: string
    warning: string
    warningBg: string
    success: string
    successBg: string
    disabled: string
  }
}

export const uiThemes: Record<UiThemeName, UiTheme> = {
  light: {
    bg: {
      page: "#ffffff",
      surface: "#ffffff",
      surfaceAlt: "#fafafa",
      surfaceMuted: "#f5f5f5",
      overlay: "rgba(0, 0, 0, 0.08)"
    },
    text: {
      primary: "#0a0a0a",
      secondary: "#737373",
      inverse: "#ffffff"
    },
    border: {
      default: "#e5e5e5",
      strong: "#0a0a0a",
      subtle: "#f0f0f0"
    },
    brand: {
      primary: "#0a0a0a",
      primaryHover: "#262626",
      primaryActive: "#404040",
      secondary: "#f5f5f5",
      secondaryHover: "#e5e5e5"
    },
    state: {
      error: "#dc2626",
      errorBg: "#fef2f2",
      warning: "#b45309",
      warningBg: "#fffbeb",
      success: "#16a34a",
      successBg: "#f0fdf4",
      disabled: "#a3a3a3"
    }
  },
  dark: {
    bg: {
      page: "#000000",
      surface: "#0a0a0a",
      surfaceAlt: "#171717",
      surfaceMuted: "#262626",
      overlay: "rgba(255, 255, 255, 0.12)"
    },
    text: {
      primary: "#fafafa",
      secondary: "#a3a3a3",
      inverse: "#0a0a0a"
    },
    border: {
      default: "#262626",
      strong: "#fafafa",
      subtle: "#1a1a1a"
    },
    brand: {
      primary: "#fafafa",
      primaryHover: "#e5e5e5",
      primaryActive: "#d4d4d4",
      secondary: "#262626",
      secondaryHover: "#333333"
    },
    state: {
      error: "#f87171",
      errorBg: "#2a0a0a",
      warning: "#fbbf24",
      warningBg: "#2a1f0a",
      success: "#4ade80",
      successBg: "#0a2a12",
      disabled: "#525252"
    }
  }
}

export const uiTypography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  }
} as const

export const uiSpace = {
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  20: 20,
  24: 24
} as const

export const uiRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999
} as const

export const uiShadow = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 4px 12px rgba(0, 0, 0, 0.08)",
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)"
} as const

export const uiMotion = {
  durationFast: "150ms",
  durationNormal: "220ms",
  durationExpanded: "300ms",
  easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  easingSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
} as const

export const uiLayer = {
  overlay: 2147483647
} as const

export const uiLayout = {
  edgeInset: 8,
  toolbar: {
    yOffset: 56,
    preferredXOffset: 160,
    widthEstimate: 420,
    inputMinWidth: 160
  },
  chatPanel: {
    width: 420,
    height: 360,
    initialX: 24,
    initialY: 24
  }
} as const
