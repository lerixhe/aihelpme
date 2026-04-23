import { type CSSProperties, useEffect, useRef, useState } from "react"

import { getSettings, saveSettings } from "~/shared/storage"
import { useUiThemeName } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography } from "~/shared/ui/tokens"
import { createCardStyle, createFocusRing } from "~/shared/ui/styles"
import type { ExtensionSettings } from "~/shared/types"

function SettingsIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.7 1.9C7.2 0.7 8.8 0.7 9.3 1.9L9.6 2.7C9.8 3.1 10.2 3.4 10.6 3.5L11.5 3.7C12.8 4 13.3 5.5 12.5 6.4L11.9 7.1C11.6 7.4 11.5 7.9 11.6 8.3L11.8 9.2C12.1 10.5 10.8 11.5 9.7 10.9L8.9 10.4C8.5 10.2 8 10.2 7.6 10.4L6.8 10.9C5.7 11.5 4.4 10.5 4.7 9.2L4.9 8.3C5 7.9 4.9 7.4 4.6 7.1L4 6.4C3.2 5.5 3.7 4 5 3.7L5.9 3.5C6.3 3.4 6.7 3.1 6.9 2.7L6.7 1.9Z"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.8" r="1.7" stroke={color} strokeWidth="1.2" />
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
  const popupHeight = 280
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
    document.documentElement.style.height = `${popupHeight}px`
    document.documentElement.style.overflow = "hidden"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.minWidth = "320px"
    document.body.style.height = `${popupHeight}px`
    document.body.style.overflow = "hidden"
    document.body.style.background = theme.bg.page
  }, [popupHeight, theme.bg.page])

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
    height: popupHeight,
    boxSizing: "border-box",
    padding: uiSpace[12],
    background: theme.bg.page,
    fontFamily: uiTypography.fontFamily
  }

  const cardStyle: CSSProperties = {
    ...createCardStyle(theme),
    height: "100%",
    display: "flex",
    flexDirection: "column"
  }

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: uiSpace[12],
    borderBottom: `1px solid ${theme.border.hairline}`,
    marginBottom: uiSpace[16]
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
    top: 50,
    left: 0,
    right: 0,
    padding: uiSpace[4],
    maxHeight: 200,
    overflowY: "auto",
    borderRadius: uiRadius.md,
    background: theme.bg.surface,
    border: `1px solid ${theme.border.default}`,
    boxShadow: uiShadow.lg,
    display: "grid",
    gap: 2,
    zIndex: 10
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

  const statusStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: uiSpace[6],
    marginTop: uiSpace[16],
    padding: `${uiSpace[10]}px ${uiSpace[12]}px`,
    borderRadius: uiRadius.md,
    background: theme.bg.surfaceAlt,
    border: `1px solid ${theme.border.hairline}`
  }

  const statusIndicatorStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: activeService ? theme.state.success : theme.state.warning,
    flexShrink: 0
  }

  const statusTextStyle: CSSProperties = {
    fontSize: uiTypography.fontSize.sm,
    color: theme.text.secondary,
    fontWeight: uiTypography.fontWeight.medium
  }

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
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
        <div style={{ flex: 1 }}>
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

          {/* Status Bar */}
          <div style={statusStyle}>
            <div style={statusIndicatorStyle} />
            <span style={statusTextStyle}>
              {settings?.modelServices.length
                ? `${settings.modelServices.length} 个服务已配置`
                : "未配置模型服务"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: uiSpace[12],
            borderTop: `1px solid ${theme.border.hairline}`
          }}>
          <span
            style={{
              fontSize: uiTypography.fontSize.xs,
              color: theme.text.secondary
            }}>
            选中文本即可触发 AI 功能
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
    </div>
  )
}
