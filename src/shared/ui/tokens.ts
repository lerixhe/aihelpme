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
  accent: {
    primary: string
    primaryHover: string
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
      page: "#F0FDFA",
      surface: "#FFFFFF",
      surfaceAlt: "#F0FDFA",
      surfaceMuted: "#E8F1F4",
      overlay: "rgba(0, 0, 0, 0.08)"
    },
    text: {
      primary: "#134E4A",
      secondary: "#5F9EA0",
      inverse: "#FFFFFF"
    },
    border: {
      default: "#99F6E4",
      strong: "#134E4A",
      subtle: "#E8F1F4"
    },
    brand: {
      primary: "#0D9488",
      primaryHover: "#0F766E",
      primaryActive: "#115E59",
      secondary: "#E8F1F4",
      secondaryHover: "#D1FAE5"
    },
    accent: {
      primary: "#EA580C",
      primaryHover: "#C2410C"
    },
    state: {
      error: "#DC2626",
      errorBg: "#FEF2F2",
      warning: "#B45309",
      warningBg: "#FFFBEB",
      success: "#16A34A",
      successBg: "#F0FDF4",
      disabled: "#9CA3AF"
    }
  },
  dark: {
    bg: {
      page: "#0F172A",
      surface: "#1E293B",
      surfaceAlt: "#0F172A",
      surfaceMuted: "#334155",
      overlay: "rgba(255, 255, 255, 0.12)"
    },
    text: {
      primary: "#F0FDFA",
      secondary: "#94A3B8",
      inverse: "#0F172A"
    },
    border: {
      default: "#334155",
      strong: "#F0FDFA",
      subtle: "#1E293B"
    },
    brand: {
      primary: "#2DD4BF",
      primaryHover: "#14B8A6",
      primaryActive: "#0D9488",
      secondary: "#334155",
      secondaryHover: "#475569"
    },
    accent: {
      primary: "#FB923C",
      primaryHover: "#F97316"
    },
    state: {
      error: "#F87171",
      errorBg: "#2A0A0A",
      warning: "#FBBF24",
      warningBg: "#2A1F0A",
      success: "#4ADE80",
      successBg: "#0A2A12",
      disabled: "#64748B"
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
  lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
  glow: "0 0 20px rgba(13, 148, 136, 0.3)",
  glowStrong: "0 0 30px rgba(13, 148, 136, 0.5)"
} as const

export const uiMotion = {
  durationFast: "150ms",
  durationNormal: "220ms",
  durationExpanded: "300ms",
  durationSlow: "400ms",
  easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  easingSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easingEnter: "cubic-bezier(0, 0, 0.2, 1)",
  easingExit: "cubic-bezier(0.4, 0, 1, 1)"
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
