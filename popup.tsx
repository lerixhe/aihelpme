import { type CSSProperties, useEffect, useRef, useState } from "react"

import { getSettings, saveSettings } from "~/shared/storage"
import { useUiThemeName } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography } from "~/shared/ui/tokens"
import { createCardStyle, createFocusRing } from "~/shared/ui/styles"
import type { ExtensionSettings } from "~/shared/types"

function SettingsIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon({ color, expanded }: { color: string; expanded: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: `transform ${uiMotion.durationFast} ${uiMotion.easingStandard}`
      }}>
      <path d="M3 4.5L6 7.5L9 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7L6 10L11 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function getServiceInitial(name: string | undefined) {
  const trimmed = name?.trim() ?? ""
  if (!trimmed) {
    return "?"
  }
  return trimmed[0]!.toLocaleUpperCase()
}

function hashString(value: string) {
  let hash = 0
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

function getAvatarPalette(name: string | undefined, dark: boolean) {
  const seed = name?.trim() || "service"
  const hue = hashString(seed) % 360
  return dark
    ? {
      background: `hsl(${hue} 48% 30%)`,
      color: "#f8fafc"
    }
    : {
      background: `hsl(${hue} 78% 94%)`,
      color: `hsl(${hue} 48% 32%)`
    }
}

export default function Popup() {
  const baseHeight = 230
  const themeName = useUiThemeName()
  const theme = uiThemes[themeName]
  const [settings, setSettings] = useState<ExtensionSettings | null>(null)
  const [changing, setChanging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pressedBtn, setPressedBtn] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeService =
    settings?.modelServices.find((service) => service.id === settings.activeModelServiceId) ?? null
  const avatarPalette = getAvatarPalette(activeService?.name, themeName === "dark")

  useEffect(() => {
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.documentElement.style.height = `${baseHeight}px`
    document.documentElement.style.overflow = "visible"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.minWidth = "320px"
    document.body.style.height = `${baseHeight}px`
    document.body.style.overflow = "visible"
    document.body.style.background = theme.bg.page
  }, [baseHeight, theme.bg.page])

  useEffect(() => {
    void getSettings().then(setSettings)

    const onStorageChanged: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      _changes,
      areaName
    ) => {
      if (areaName !== "sync") {
        return
      }
      void getSettings().then(setSettings)
    }

    try {
      chrome.storage.onChanged.addListener(onStorageChanged)
    } catch {
      // Extension context may have been invalidated
    }

    return () => {
      try {
        chrome.storage.onChanged.removeListener(onStorageChanged)
      } catch {
        // Extension context may have been invalidated
      }
    }
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [])

  const handleServiceChange = async (serviceId: string) => {
    if (!settings || serviceId === settings.activeModelServiceId) {
      return
    }
    const nextSettings = { ...settings, activeModelServiceId: serviceId }
    setSettings(nextSettings)
    setChanging(true)
    setMenuOpen(false)
    await saveSettings(nextSettings)
    setChanging(false)
  }

  const openOptionsPage = () => {
    void chrome.runtime.openOptionsPage()
    window.close()
  }

  // --- Styles following DESIGN.MD ---

  const shellStyle: CSSProperties = {
    width: 336,
    height: baseHeight,
    boxSizing: "border-box",
    padding: uiSpace[12],
    background: theme.bg.page,
    fontFamily: uiTypography.fontFamily,
    display: "flex",
    flexDirection: "column"
  }

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: uiSpace[12],
    borderBottom: `1px solid ${theme.border.hairline}`,
    marginBottom: uiSpace[12]
  }

  const titleStyle: CSSProperties = {
    fontSize: uiTypography.fontSize.lg,
    fontWeight: uiTypography.fontWeight.semibold,
    color: theme.text.primary,
    letterSpacing: uiTypography.letterSpacing.tight,
    margin: 0
  }

  const settingsBtnStyle: CSSProperties = {
    width: 36,
    height: 36,
    border: `1px solid ${theme.border.subtle}`,
    borderRadius: uiRadius.md,
    background: theme.bg.surfaceMuted,
    color: theme.text.secondary,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    outline: "none",
    boxShadow: "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
    flexShrink: 0
  }

  const fieldLabelStyle: CSSProperties = {
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: uiSpace[6],
    letterSpacing: uiTypography.letterSpacing.normal
  }

  const triggerStyle: CSSProperties = {
    width: "100%",
    border: `1px solid ${menuOpen ? theme.accent.primary : theme.border.subtle}`,
    borderRadius: uiRadius.md,
    height: 44,
    padding: `0 ${uiSpace[12]}px 0 40px`,
    background: theme.bg.surfaceMuted,
    color: theme.text.primary,
    fontSize: uiTypography.fontSize.md,
    fontWeight: uiTypography.fontWeight.medium,
    fontFamily: uiTypography.fontFamily,
    outline: "none",
    boxShadow: menuOpen ? createFocusRing(theme.accent.primary) : "none",
    cursor: settings?.modelServices.length ? "pointer" : "default",
    transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    position: "relative" as const
  }

  const menuStyle: CSSProperties = {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    padding: uiSpace[4],
    maxHeight: 42 * 2 + 8,
    overflowY: "auto",
    borderRadius: uiRadius.md,
    background: theme.bg.surface,
    border: `1px solid ${theme.border.default}`,
    boxShadow: uiShadow.lg,
    display: "grid",
    gap: 2,
    zIndex: 100,
    marginTop: uiSpace[4]
  }

  const menuItemStyle = (serviceId: string, selected: boolean): CSSProperties => {
    const isHovered = hoveredItem === serviceId
    return {
      display: "grid",
      gridTemplateColumns: "24px 1fr auto",
      alignItems: "center",
      gap: uiSpace[8],
      width: "100%",
      minHeight: 40,
      padding: `${uiSpace[8]}px ${uiSpace[10]}px`,
      border: "none",
      borderRadius: uiRadius.sm,
      background: selected ? theme.bg.surfaceMuted : isHovered ? theme.bg.surfaceAlt : "transparent",
      color: theme.text.primary,
      cursor: "pointer",
      textAlign: "left" as const,
      fontFamily: uiTypography.fontFamily,
      fontSize: uiTypography.fontSize.md,
      fontWeight: selected ? uiTypography.fontWeight.semibold : uiTypography.fontWeight.regular,
      transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}`
    }
  }

  const avatarStyle = (palette: { background: string; color: string }, size: number = 24): CSSProperties => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: palette.background,
    color: palette.color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: size >= 24 ? 11 : 10,
    fontWeight: uiTypography.fontWeight.semibold,
    letterSpacing: uiTypography.letterSpacing.tight,
    flexShrink: 0
  })

  return (
    <div style={shellStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>AI Help Me</h1>
        <button
          type="button"
          onClick={openOptionsPage}
          aria-label="打开设置"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.bg.surface
            e.currentTarget.style.borderColor = theme.border.default
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.bg.surfaceMuted
            e.currentTarget.style.borderColor = theme.border.subtle
          }}
          style={settingsBtnStyle}>
          <SettingsIcon color={theme.text.primary} />
        </button>
      </div>

      {/* Service Selector */}
      <div style={{ marginBottom: uiSpace[12] }}>
        <div style={fieldLabelStyle}>当前模型服务</div>

        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              if (!settings || settings.modelServices.length === 0 || changing) {
                return
              }
              setMenuOpen((open) => !open)
            }}
            disabled={!settings || settings.modelServices.length === 0 || changing}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            style={{
              ...triggerStyle,
              opacity: !settings || changing ? 0.6 : 1
            }}>
            {/* Avatar */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: uiSpace[10],
                transform: "translateY(-50%)",
                ...avatarStyle(avatarPalette, 24),
                pointerEvents: "none"
              }}>
              {getServiceInitial(activeService?.name)}
            </div>

            {/* Service Name */}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1
              }}>
              {activeService?.name || "暂无可用模型服务"}
            </span>

            {/* Chevron */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: uiSpace[10],
                transform: "translateY(-50%)",
                pointerEvents: "none"
              }}>
              <ChevronIcon color={theme.text.secondary} expanded={menuOpen} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && settings?.modelServices.length ? (
            <div role="listbox" style={menuStyle}>
              {settings.modelServices.map((service) => {
                const palette = getAvatarPalette(service.name, themeName === "dark")
                const selected = service.id === settings.activeModelServiceId

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      void handleServiceChange(service.id)
                    }}
                    onMouseEnter={() => setHoveredItem(service.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={menuItemStyle(service.id, selected)}>
                    <span aria-hidden="true" style={avatarStyle(palette, 24)}>
                      {getServiceInitial(service.name)}
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                      {service.name || "未命名服务"}
                    </span>
                    {selected ? (
                      <span
                        aria-hidden="true"
                        style={{
                          display: "flex",
                          alignItems: "center"
                        }}>
                        <CheckIcon color={theme.accent.primary} />
                      </span>
                    ) : (
                      <span style={{ width: 14, height: 14 }} />
                    )}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: uiSpace[10],
          borderTop: `1px solid ${theme.border.hairline}`
        }}>
        <span
          style={{
            fontSize: uiTypography.fontSize.xs,
            color: theme.text.secondary
          }}>
          v{chrome.runtime.getManifest().version}
        </span>
        <button
          type="button"
          onClick={openOptionsPage}
          onMouseDown={() => setPressedBtn("open-settings")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.bg.surfaceAlt
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            setPressedBtn(null)
          }}
          style={{
            border: "none",
            borderRadius: uiRadius.pill,
            padding: `${uiSpace[4]}px ${uiSpace[10]}px`,
            background: "transparent",
            color: theme.accent.primary,
            fontSize: uiTypography.fontSize.sm,
            fontWeight: uiTypography.fontWeight.semibold,
            fontFamily: uiTypography.fontFamily,
            cursor: "pointer",
            outline: "none",
            transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}`,
            transform: pressedBtn === "open-settings" ? "scale(0.96)" : "scale(1)"
          }}>
          设置 →
        </button>
      </div>
    </div>
  )
}
