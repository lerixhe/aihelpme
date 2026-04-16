import { useEffect, useState } from "react"

import { type UiThemeName, uiThemes } from "~/shared/ui/tokens"

function getPreferredThemeName(): UiThemeName {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function useUiThemeName(): UiThemeName {
  const [themeName, setThemeName] = useState<UiThemeName>(() => getPreferredThemeName())

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const onThemeChange = () => {
      setThemeName(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", onThemeChange)

    return () => {
      mediaQuery.removeEventListener("change", onThemeChange)
    }
  }, [])

  return themeName
}

export function useUiTheme() {
  const themeName = useUiThemeName()
  return uiThemes[themeName]
}
