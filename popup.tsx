import { type CSSProperties, useEffect, useRef, useState } from "react"

import { getSettings, saveSettings } from "~/shared/storage"
import { useUiThemeName } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography } from "~/shared/ui/tokens"
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
  const popupHeight = 268
  const themeName = useUiThemeName()
  const theme = uiThemes[themeName]
  const [settings, setSettings] = useState<ExtensionSettings | null>(null)
  const [changing, setChanging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const activeService = settings?.modelServices.find((service) => service.id === settings.activeModelServiceId) ?? null
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

    const onStorageChanged: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (_changes, areaName) => {
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

  const shellStyle: CSSProperties = {
    width: 336,
    height: popupHeight,
    boxSizing: "border-box",
    padding: 10,
    background: themeName === "dark" ? "#161618" : "#eef1f4",
    fontFamily: uiTypography.fontFamily
  }

  const cardStyle: CSSProperties = {
    height: "100%",
    boxSizing: "border-box",
    borderRadius: 18,
    padding: 12,
    background: themeName === "dark" ? "#232326" : "#ffffff",
    border: `1px solid ${themeName === "dark" ? "rgba(255,255,255,0.06)" : "rgba(17,24,39,0.06)"}`,
    boxShadow: themeName === "dark" ? "0 10px 24px rgba(0, 0, 0, 0.28)" : "0 8px 24px rgba(15, 23, 42, 0.08)"
  }

  const toolbarRowStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: 10,
    alignItems: "center"
  }

  const labelStyle: CSSProperties = {
    color: themeName === "dark" ? "#c7c7cc" : "#4b5563",
    fontSize: 13,
    fontWeight: uiTypography.fontWeight.medium,
    whiteSpace: "nowrap"
  }

  const triggerStyle: CSSProperties = {
    width: "100%",
    border: "none",
    borderRadius: 14,
    height: 40,
    padding: "0 36px 0 42px",
    background: themeName === "dark" ? "#2a2b30" : "#f7f8fa",
    color: themeName === "dark" ? "#f3f4f6" : "#111827",
    fontSize: 13,
    fontWeight: uiTypography.fontWeight.medium,
    fontFamily: uiTypography.fontFamily,
    outline: "none",
    boxShadow: menuOpen
      ? `inset 0 0 0 1px ${themeName === "dark" ? "rgba(255,255,255,0.12)" : "rgba(17,24,39,0.12)"}`
      : `inset 0 0 0 1px ${themeName === "dark" ? "rgba(255,255,255,0.07)" : "rgba(17,24,39,0.08)"}`,
    cursor: settings?.modelServices.length ? "pointer" : "default",
    transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
    display: "flex",
    alignItems: "center",
    textAlign: "left"
  }

  const menuStyle: CSSProperties = {
    position: "absolute",
    top: 46,
    left: 0,
    right: 0,
    padding: 6,
    maxHeight: 220,
    overflowY: "auto",
    borderRadius: 14,
    background: themeName === "dark" ? "#24262b" : "#ffffff",
    border: `1px solid ${themeName === "dark" ? "rgba(255,255,255,0.08)" : "rgba(17,24,39,0.08)"}`,
    boxShadow: themeName === "dark" ? "0 18px 38px rgba(0, 0, 0, 0.38)" : "0 16px 36px rgba(15, 23, 42, 0.14)",
    display: "grid",
    gap: 2,
    zIndex: 10
  }

  return (
    <div style={shellStyle}>
      <div style={cardStyle}>
        <div style={toolbarRowStyle}>
          <div style={labelStyle}>模型服务：</div>

          <div ref={menuRef} style={{ position: "relative", minWidth: 0 }}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                left: 12,
                transform: "translateY(-50%)",
                width: 20,
                height: 20,
                borderRadius: 999,
                background: avatarPalette.background,
                color: avatarPalette.color,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: uiTypography.fontWeight.semibold,
                letterSpacing: uiTypography.letterSpacing.tight,
                pointerEvents: "none"
              }}>
              {getServiceInitial(activeService?.name)}
            </div>

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
                opacity: !settings || changing ? 0.65 : 1
              }}>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 8
                }}>
                {activeService?.name || "暂无可用模型服务"}
              </span>
            </button>

            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "50%",
                right: 12,
                transform: "translateY(-50%)",
                color: themeName === "dark" ? "#8e8e93" : "#6b7280",
                pointerEvents: "none",
                fontSize: 11,
                fontWeight: uiTypography.fontWeight.medium,
                transition: `transform ${uiMotion.durationFast} ${uiMotion.easingStandard}`
              }}>
              {menuOpen ? "▴" : "▾"}
            </div>

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
                      style={{
                        display: "grid",
                        gridTemplateColumns: "20px 1fr auto",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        minHeight: 36,
                        padding: "8px 10px",
                        border: "none",
                        borderRadius: 10,
                        background: selected ? (themeName === "dark" ? "rgba(255,255,255,0.08)" : "#f5f7fb") : "transparent",
                        color: themeName === "dark" ? "#f3f4f6" : "#111827",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: uiTypography.fontFamily,
                        transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}`
                      }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          background: palette.background,
                          color: palette.color,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: uiTypography.fontWeight.semibold,
                          letterSpacing: uiTypography.letterSpacing.tight
                        }}>
                        {getServiceInitial(service.name)}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 12,
                          fontWeight: selected ? uiTypography.fontWeight.semibold : uiTypography.fontWeight.medium
                        }}>
                        {service.name || "未命名服务"}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          color: selected ? (themeName === "dark" ? "#e5e7eb" : "#4b5563") : "transparent",
                          fontSize: 12,
                          fontWeight: uiTypography.fontWeight.semibold,
                          lineHeight: 1
                        }}>
                        ✓
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={openOptionsPage}
            aria-label="打开设置"
            style={{
              width: 44,
              height: 44,
              border: "none",
              borderRadius: 12,
              background: themeName === "dark" ? "#2b2b2f" : "#f5f7fa",
              color: theme.text.primary,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              outline: "none",
              boxShadow: `inset 0 0 0 1px ${themeName === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}`,
              transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}>
            <SettingsIcon color={themeName === "dark" ? "#f5f5f7" : "#374151"} />
          </button>
        </div>
      </div>
    </div>
  )
}
