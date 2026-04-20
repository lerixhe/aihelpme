export type UiThemeName = "light" | "dark"

export interface UiTheme {
  bg: {
    page: string
    surface: string
    surfaceAlt: string
    surfaceMuted: string
    overlay: string
    glass: string
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
    hairline: string
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
      page: "#F5F5F7",
      surface: "#FFFFFF",
      surfaceAlt: "#F5F5F7",
      surfaceMuted: "#E8E8ED",
      overlay: "rgba(0, 0, 0, 0.4)",
      glass: "rgba(255, 255, 255, 0.72)"
    },
    text: {
      primary: "#1D1D1F",
      secondary: "#6E6E73",
      inverse: "#FFFFFF"
    },
    border: {
      default: "#D2D2D7",
      strong: "#1D1D1F",
      subtle: "#E5E5EA",
      hairline: "rgba(0, 0, 0, 0.08)"
    },
    brand: {
      primary: "#0D9488",
      primaryHover: "#0F766E",
      primaryActive: "#115E59",
      secondary: "#E0F5F0",
      secondaryHover: "#CCEBEB"
    },
    accent: {
      primary: "#007AFF",
      primaryHover: "#0066D6",
      primaryActive: "#0055B3"
    },
    state: {
      error: "#FF3B30",
      errorBg: "#FFF2F2",
      warning: "#FF9500",
      warningBg: "#FFF8F0",
      success: "#34C759",
      successBg: "#F0FFF4",
      disabled: "#AEAEB2"
    }
  },
  dark: {
    bg: {
      page: "#000000",
      surface: "#1C1C1E",
      surfaceAlt: "#000000",
      surfaceMuted: "#2C2C2E",
      overlay: "rgba(0, 0, 0, 0.6)",
      glass: "rgba(28, 28, 30, 0.72)"
    },
    text: {
      primary: "#F5F5F7",
      secondary: "#98989D",
      inverse: "#000000"
    },
    border: {
      default: "#38383A",
      strong: "#F5F5F7",
      subtle: "#1C1C1E",
      hairline: "rgba(255, 255, 255, 0.08)"
    },
    brand: {
      primary: "#2DD4BF",
      primaryHover: "#14B8A6",
      primaryActive: "#0D9488",
      secondary: "#1A3A35",
      secondaryHover: "#1F4A44"
    },
    accent: {
      primary: "#0A84FF",
      primaryHover: "#409CFF",
      primaryActive: "#0066D6"
    },
    state: {
      error: "#FF453A",
      errorBg: "#2A0A0A",
      warning: "#FF9F0A",
      warningBg: "#2A1F0A",
      success: "#30D158",
      successBg: "#0A2A12",
      disabled: "#636366"
    }
  }
}

export const uiTypography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, sans-serif',
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 28
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.02em"
  }
} as const

export const uiSpace = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  20: 20,
  24: 24,
  28: 28,
  32: 32
} as const

export const uiRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999
} as const

export const uiShadow = {
  sm: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
} as const

export const uiMotion = {
  durationFast: "150ms",
  durationNormal: "220ms",
  durationExpanded: "300ms",
  durationSlow: "350ms",
  easingStandard: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
  easingSpring: "cubic-bezier(0.34, 1.56, 0.64, 1.0)",
  easingDecelerate: "cubic-bezier(0, 0, 0.2, 1)",
  easingAccelerate: "cubic-bezier(0.4, 0, 1, 1)"
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
