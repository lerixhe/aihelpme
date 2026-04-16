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
      page: "#f0fdfa",
      surface: "#ffffff",
      surfaceAlt: "#f8fffd",
      surfaceMuted: "#ecfdf5",
      overlay: "rgba(13, 148, 136, 0.16)"
    },
    text: {
      primary: "#134e4a",
      secondary: "#4b706b",
      inverse: "#f8fffe"
    },
    border: {
      default: "#b7ece3",
      strong: "#0d9488",
      subtle: "#dff7f2"
    },
    brand: {
      primary: "#0d9488",
      primaryHover: "#0f766e",
      primaryActive: "#115e59",
      secondary: "#e6fffb",
      secondaryHover: "#cffaf1"
    },
    state: {
      error: "#dc2626",
      errorBg: "#fef2f2",
      warning: "#b45309",
      warningBg: "#fffbeb",
      success: "#15803d",
      successBg: "#f0fdf4",
      disabled: "#94a3b8"
    }
  },
  dark: {
    bg: {
      page: "#071513",
      surface: "#0f1f1d",
      surfaceAlt: "#132826",
      surfaceMuted: "#173330",
      overlay: "rgba(15, 118, 110, 0.28)"
    },
    text: {
      primary: "#dcfdf7",
      secondary: "#94c9c1",
      inverse: "#06201d"
    },
    border: {
      default: "#28544e",
      strong: "#2dd4bf",
      subtle: "#183430"
    },
    brand: {
      primary: "#14b8a6",
      primaryHover: "#2dd4bf",
      primaryActive: "#0d9488",
      secondary: "#173330",
      secondaryHover: "#1b3f3a"
    },
    state: {
      error: "#f87171",
      errorBg: "#3b171b",
      warning: "#fbbf24",
      warningBg: "#3b2f11",
      success: "#4ade80",
      successBg: "#112b1b",
      disabled: "#64748b"
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
  8: 8,
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
  sm: "0 6px 18px rgba(8, 47, 73, 0.08)",
  md: "0 18px 40px rgba(8, 47, 73, 0.14)",
  lg: "0 24px 60px rgba(8, 47, 73, 0.2)"
} as const

export const uiMotion = {
  durationFast: "150ms",
  durationNormal: "220ms",
  easingStandard: "cubic-bezier(0.2, 0, 0, 1)"
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
