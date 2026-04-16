export type UiThemeName = "light" | "dark"

export interface UiTheme {
  bg: {
    page: string
    surface: string
    surfaceAlt: string
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
  }
  brand: {
    primary: string
    primaryHover: string
    primaryActive: string
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
      page: "#f3f5f9",
      surface: "#ffffff",
      surfaceAlt: "#f8fafc",
      overlay: "rgba(15, 23, 42, 0.45)"
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      inverse: "#f8fafc"
    },
    border: {
      default: "#dbe1ea",
      strong: "#93a4bc"
    },
    brand: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      primaryActive: "#1e40af"
    },
    state: {
      error: "#dc2626",
      errorBg: "#fff1f2",
      warning: "#b45309",
      warningBg: "#fffbeb",
      success: "#15803d",
      successBg: "#f0fdf4",
      disabled: "#94a3b8"
    }
  },
  dark: {
    bg: {
      page: "#0b1220",
      surface: "#111827",
      surfaceAlt: "#1f2937",
      overlay: "rgba(2, 6, 23, 0.72)"
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#94a3b8",
      inverse: "#eff6ff"
    },
    border: {
      default: "#334155",
      strong: "#475569"
    },
    brand: {
      primary: "#3b82f6",
      primaryHover: "#60a5fa",
      primaryActive: "#2563eb"
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
  fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  fontSize: {
    sm: 12,
    md: 13,
    lg: 14,
    xl: 16
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
  20: 20
} as const

export const uiRadius = {
  sm: 8,
  md: 10,
  lg: 12,
  pill: 999
} as const

export const uiShadow = {
  sm: "0 4px 12px rgba(15, 23, 42, 0.12)",
  md: "0 10px 30px rgba(15, 23, 42, 0.18)",
  lg: "0 22px 48px rgba(15, 23, 42, 0.26)"
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
    widthEstimate: 328,
    inputMinWidth: 160
  },
  chatPanel: {
    width: 400,
    height: 300,
    initialX: 24,
    initialY: 24
  }
} as const
