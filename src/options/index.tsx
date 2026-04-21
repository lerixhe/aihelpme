import { type JSX, useEffect, useMemo, useRef, useState, type CSSProperties } from "react"

import { hasTextPlaceholder } from "~/shared/prompt"
import { DEFAULT_SETTINGS, SECTION_DEFAULTS } from "~/shared/defaults"
import { getSettings, normalizeSettings, saveSettings } from "~/shared/storage"
import { useUiThemeName } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography } from "~/shared/ui/tokens"
import type { ActionTemplate, ExtensionSettings, ThemePreference, ToolbarMode, ApiTestResponse, FetchModelsResponse, ModelParams } from "~/shared/types"
import { MESSAGE_TYPES } from "~/shared/constants"
import { ConfirmDialog } from "~/options/ConfirmDialog"

type Section = "appearance" | "connection" | "actions" | "backup"
type RestorableSection = Exclude<Section, "backup">

function PlusIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13M3 8H13" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4H14M5 4V2H11V4M6 7V12M10 7V12M3 4L4 14H12L13 4" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RefreshIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5M13.5 2.5V6.5H9.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AppearanceIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth={1.3} />
      <path d="M10 2.5C10 2.5 6 6 6 10C6 14 10 17.5 10 17.5" stroke={color} strokeWidth={1.3} />
      <line x1="3" y1="10" x2="17" y2="10" stroke={color} strokeWidth={1.3} />
    </svg>
  )
}

function ConnectionIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 6C4 4.9 4.9 4 6 4H14C15.1 4 16 4.9 16 6V14C16 15.1 15.1 16 14 16H6C4.9 16 4 15.1 4 14V6Z" stroke={color} strokeWidth={1.3} />
      <path d="M7 10H13M10 7V13" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  )
}

function ActionsIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 12.5L8.5 8.5L11.5 11.5L15.5 5.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 5.5H15.5V8.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackupIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3V11" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M7.5 8.5L10 11L12.5 8.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5V14C4 15.1 4.9 16 6 16H14C15.1 16 16 15.1 16 14V13.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

const sections: { key: Section; label: string; icon: typeof AppearanceIcon }[] = [
  { key: "appearance", label: "外观", icon: AppearanceIcon },
  { key: "connection", label: "连接", icon: ConnectionIcon },
  { key: "actions", label: "动作", icon: ActionsIcon },
  { key: "backup", label: "备份与迁移", icon: BackupIcon }
]

export default function OptionsPage() {
  const themeName = useUiThemeName()
  const theme = uiThemes[themeName]
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [pressedBtn, setPressedBtn] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<Section>("appearance")
  const [loaded, setLoaded] = useState(false)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [confirmRestoreSection, setConfirmRestoreSection] = useState<RestorableSection | null>(null)
  const [backupStatus, setBackupStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [pendingImportSettings, setPendingImportSettings] = useState<ExtensionSettings | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    void getSettings().then((loaded) => {
      setSettings(loaded)
    })
    void chrome.storage.local.get("optionsActiveSection").then((result) => {
      const saved = result.optionsActiveSection as Section | undefined
      if (saved && ["appearance", "connection", "actions", "backup"].includes(saved)) {
        setActiveSection(saved)
      }
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (loaded) {
      void chrome.storage.local.set({ optionsActiveSection: activeSection })
    }
  }, [activeSection, loaded])

  useEffect(() => {
    document.documentElement.style.margin = "0"
    document.documentElement.style.padding = "0"
    document.documentElement.style.height = "100%"
    document.body.style.margin = "0"
    document.body.style.padding = "0"
    document.body.style.height = "100%"
  }, [])

  const hasInvalidCustomTemplate = useMemo(() => {
    return settings.actions.some((item) => !hasTextPlaceholder(item.template))
  }, [settings.actions])

  const canSave =
    Boolean(settings.apiBaseUrl.trim()) &&
    Boolean(settings.model.trim()) &&
    !hasInvalidCustomTemplate

  const updateCustomAction = (index: number, patch: Partial<ActionTemplate>) => {
    setSettings((current) => ({
      ...current,
      actions: current.actions.map((item, itemIndex) =>
        itemIndex === index
          ? {
            ...item,
            ...patch
          }
          : item
      )
    }))
  }

  const restoreSection = (section: RestorableSection) => {
    const defaults = SECTION_DEFAULTS[section]
    setSettings((prev) => ({ ...prev, ...defaults }))
    if (section === "appearance") {
      void saveSettings({ ...settings, ...defaults })
    }
    setConfirmRestoreSection(null)
  }

  const handleTestConnection = () => {
    const trimmedUrl = settings.apiBaseUrl.trim()
    const trimmedKey = settings.apiKey.trim()
    const trimmedModel = settings.model.trim()

    if (!trimmedUrl || !trimmedKey || !trimmedModel) {
      setTestResult({ success: false, message: "请填写 API Base URL、API Key 和 Model 后再测试。" })
      return
    }

    setTesting(true)
    setTestResult(null)

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.API_TEST_REQUEST,
        payload: {
          apiBaseUrl: trimmedUrl,
          apiKey: trimmedKey,
          model: trimmedModel
        }
      },
      (response: ApiTestResponse | undefined) => {
        setTesting(false)
        if (chrome.runtime.lastError) {
          setTestResult({ success: false, message: `扩展通信失败：${chrome.runtime.lastError.message}` })
          return
        }
        if (!response) {
          setTestResult({ success: false, message: "后台未返回响应。" })
          return
        }
        const latencyInfo = response.latencyMs != null ? ` (${response.latencyMs}ms)` : ""
        if (response.success) {
          setTestResult({ success: true, message: `连接成功${latencyInfo}` })
        } else {
          setTestResult({ success: false, message: response.error ?? "测试失败" })
        }
      }
    )
  }

  const handleFetchModels = () => {
    const trimmedUrl = settings.apiBaseUrl.trim()
    if (!trimmedUrl) {
      setFetchError("请先填写 API Base URL")
      return
    }

    setFetchingModels(true)
    setFetchError(null)
    setModels([])

    chrome.runtime.sendMessage(
      {
        type: MESSAGE_TYPES.FETCH_MODELS_REQUEST,
        payload: {
          apiBaseUrl: trimmedUrl,
          apiKey: settings.apiKey.trim()
        }
      },
      (response: FetchModelsResponse | undefined) => {
        setFetchingModels(false)
        if (chrome.runtime.lastError) {
          setFetchError(`通信失败：${chrome.runtime.lastError.message}`)
          return
        }
        if (!response) {
          setFetchError("后台未返回响应。")
          return
        }
        if (response.success && response.models && response.models.length > 0) {
          setModels(response.models)
          setFetchError(null)
          if (!settings.model.trim() || !response.models.includes(settings.model.trim())) {
            setSettings((current) => ({ ...current, model: response.models![0] }))
          }
        } else {
          setFetchError(response.error ?? "未找到可用模型")
        }
      }
    )
  }

  const handleExportSettings = () => {
    const payload = {
      app: "ai-help-me",
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: normalizeSettings(settings)
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `ai-help-me-settings-${date}.json`
    link.click()
    URL.revokeObjectURL(url)

    setBackupStatus({ success: true, message: "配置已导出为 JSON 文件。" })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    try {
      const content = await file.text()
      const parsed = JSON.parse(content) as ExtensionSettings | { settings?: unknown }
      const imported = normalizeSettings("settings" in parsed ? parsed.settings : parsed)

      setPendingImportSettings(imported)
      setBackupStatus(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "无法解析文件"
      setBackupStatus({ success: false, message: `导入失败：${message}` })
    }
  }

  const confirmImportSettings = () => {
    if (!pendingImportSettings) {
      return
    }

    setSettings(pendingImportSettings)
    setSaving(true)
    setStatus("")
    setBackupStatus(null)

    void saveSettings({
      ...pendingImportSettings,
      apiBaseUrl: pendingImportSettings.apiBaseUrl.trim(),
      apiKey: pendingImportSettings.apiKey.trim(),
      model: pendingImportSettings.model.trim()
    })
      .then(() => {
        setBackupStatus({ success: true, message: "配置已导入并保存。" })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "未知错误"
        setBackupStatus({ success: false, message: `导入保存失败：${message}` })
      })
      .finally(() => {
        setSaving(false)
        setPendingImportSettings(null)
      })
  }

  // --- Shared styles ---

  const cardStyle: CSSProperties = {
    borderRadius: uiRadius.lg,
    padding: `${uiSpace[20]}px ${uiSpace[24]}px`,
    background: theme.bg.surface,
    boxShadow: uiShadow.sm,
    border: `0.5px solid ${theme.border.hairline}`
  }

  const fieldLabelStyle: CSSProperties = {
    fontSize: uiTypography.fontSize.sm,
    fontWeight: uiTypography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: uiSpace[6],
    letterSpacing: uiTypography.letterSpacing.normal
  }

  const createInputStyle = (fieldName: string): CSSProperties => ({
    border: "none",
    borderRadius: uiRadius.sm,
    padding: `${uiSpace[10]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    outline: "none",
    color: theme.text.primary,
    background: theme.bg.surfaceMuted,
    boxShadow: focusedField === fieldName ? `0 0 0 3px ${theme.accent.primary}33` : "none",
    transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
    width: "100%",
    boxSizing: "border-box"
  })

  const primaryBtnStyle: CSSProperties = {
    border: "none",
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[8]}px ${uiSpace[16]}px`,
    background: theme.accent.primary,
    color: theme.text.inverse,
    fontWeight: uiTypography.fontWeight.semibold,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    cursor: "pointer",
    outline: "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }

  const secondaryBtnStyle: CSSProperties = {
    border: `1px solid ${theme.border.default}`,
    borderRadius: uiRadius.pill,
    padding: `${uiSpace[6]}px ${uiSpace[12]}px`,
    background: "transparent",
    color: theme.text.primary,
    fontWeight: uiTypography.fontWeight.medium,
    fontSize: uiTypography.fontSize.sm,
    fontFamily: uiTypography.fontFamily,
    cursor: "pointer",
    outline: "none",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}`
  }

  // --- Section renderers ---

  const renderAppearance = () => (
    <section style={{ ...cardStyle, marginBottom: uiSpace[16] }}>
      <h2
        style={{
          margin: `0 0 ${uiSpace[4]}px`,
          fontSize: uiTypography.fontSize.lg,
          fontWeight: uiTypography.fontWeight.semibold,
          letterSpacing: uiTypography.letterSpacing.tight
        }}>
        主题配色
      </h2>
      <p
        style={{
          margin: `0 0 ${uiSpace[16]}px`,
          color: theme.text.secondary,
          fontSize: uiTypography.fontSize.md
        }}>
        选择浅色、深色或跟随系统主题
      </p>

      <div
        style={{
          display: "inline-flex",
          background: theme.bg.surfaceMuted,
          borderRadius: uiRadius.sm,
          padding: 3,
          gap: 2
        }}>
        {(["auto", "light", "dark"] as ThemePreference[]).map((value) => {
          const isSelected = settings.theme === value
          const labels: Record<ThemePreference, string> = { auto: "跟随系统", light: "浅色", dark: "深色" }

          return (
            <button
              key={value}
              onClick={() => {
                setSettings((current) => ({ ...current, theme: value }))
                void saveSettings({ ...settings, theme: value })
              }}
              style={{
                padding: `${uiSpace[6]}px ${uiSpace[16]}px`,
                border: "none",
                borderRadius: uiRadius.sm - 1,
                background: isSelected ? theme.bg.surface : "transparent",
                color: isSelected ? theme.text.primary : theme.text.secondary,
                cursor: "pointer",
                fontSize: uiTypography.fontSize.sm,
                fontWeight: isSelected ? uiTypography.fontWeight.semibold : uiTypography.fontWeight.regular,
                fontFamily: uiTypography.fontFamily,
                outline: "none",
                boxShadow: isSelected ? uiShadow.sm : "none",
                transition: `all ${uiMotion.durationFast} ${uiMotion.easingStandard}`
              }}>
              {labels[value]}
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: uiSpace[20] }}>
        <div
          style={{
            borderTop: `0.5px solid ${theme.border.hairline}`,
            paddingTop: uiSpace[20],
            marginBottom: uiSpace[20]
          }}>
          <h2
            style={{
              margin: `0 0 ${uiSpace[4]}px`,
              fontSize: uiTypography.fontSize.lg,
              fontWeight: uiTypography.fontWeight.semibold,
              letterSpacing: uiTypography.letterSpacing.tight
            }}>
            工具栏样式
          </h2>
          <p
            style={{
              margin: `0 0 ${uiSpace[16]}px`,
              color: theme.text.secondary,
              fontSize: uiTypography.fontSize.md
            }}>
            选择触发按钮展开后的动作菜单样式
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: uiSpace[12]
            }}>
            {(
              [
                { value: "explode", label: "环形按钮排列", description: "灵动展开，趣味反馈" },
                { value: "pill", label: "胶囊工具栏", description: "经典设计，沉稳直观" }
              ] satisfies { value: ToolbarMode; label: string; description: string }[]
            ).map((option) => {
              const isSelected = settings.toolbarMode === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSettings((current) => ({ ...current, toolbarMode: option.value }))
                    void saveSettings({ ...settings, toolbarMode: option.value })
                  }}
                  style={{
                    border: `1px solid ${isSelected ? theme.accent.primary : theme.border.default}`,
                    borderRadius: uiRadius.md,
                    background: isSelected ? theme.bg.surfaceAlt : theme.bg.surface,
                    padding: uiSpace[14],
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: isSelected ? `0 0 0 3px ${theme.accent.primary}22` : "none",
                    transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}, background ${uiMotion.durationFast} ${uiMotion.easingStandard}`
                  }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: uiSpace[8]
                    }}>
                    <span
                      style={{
                        color: theme.text.primary,
                        fontSize: uiTypography.fontSize.md,
                        fontWeight: uiTypography.fontWeight.semibold,
                        fontFamily: uiTypography.fontFamily
                      }}>
                      {option.label}
                    </span>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: isSelected ? theme.accent.primary : theme.border.default,
                        flexShrink: 0
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: theme.text.secondary,
                      fontSize: uiTypography.fontSize.sm,
                      lineHeight: 1.6,
                      fontFamily: uiTypography.fontFamily
                    }}>
                    {option.description}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setConfirmRestoreSection("appearance")}
          onMouseDown={() => setPressedBtn("restore-appearance")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          style={{
            ...secondaryBtnStyle,
            color: theme.state.error,
            borderColor: theme.state.error,
            opacity: 0.8,
            transform: pressedBtn === "restore-appearance" ? "scale(0.96)" : "scale(1)"
          }}>
          恢复默认
        </button>
      </div>
    </section>
  )

  const renderConnection = () => (
    <section style={{ ...cardStyle, marginBottom: uiSpace[16] }}>
      <h2
        style={{
          margin: `0 0 ${uiSpace[4]}px`,
          fontSize: uiTypography.fontSize.lg,
          fontWeight: uiTypography.fontWeight.semibold,
          letterSpacing: uiTypography.letterSpacing.tight
        }}>
        API配置
      </h2>
      <p
        style={{
          margin: `0 0 ${uiSpace[20]}px`,
          color: theme.text.secondary,
          fontSize: uiTypography.fontSize.md
        }}>
        配置模型接口
      </p>

      <div style={{ marginBottom: uiSpace[16] }}>
        <div style={fieldLabelStyle}>API Base URL</div>
        <input
          value={settings.apiBaseUrl}
          onFocus={() => setFocusedField("apiBaseUrl")}
          onBlur={() => setFocusedField(null)}
          onChange={(event) => {
            setSettings((current) => ({ ...current, apiBaseUrl: event.target.value }))
          }}
          placeholder="https://api.openai.com/v1"
          style={createInputStyle("apiBaseUrl")}
        />
      </div>

      <div style={{ marginBottom: uiSpace[16] }}>
        <div style={fieldLabelStyle}>API Key</div>
        <input
          type="password"
          value={settings.apiKey}
          onFocus={() => setFocusedField("apiKey")}
          onBlur={() => setFocusedField(null)}
          onChange={(event) => {
            setSettings((current) => ({ ...current, apiKey: event.target.value }))
          }}
          placeholder="sk-..."
          style={createInputStyle("apiKey")}
        />
      </div>

      <div style={{ marginBottom: uiSpace[16] }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: uiSpace[6] }}>
          <div style={fieldLabelStyle}>Model</div>
          <button
            type="button"
            onClick={handleFetchModels}
            disabled={fetchingModels}
            style={{
              ...secondaryBtnStyle,
              display: "flex",
              alignItems: "center",
              gap: uiSpace[4],
              opacity: fetchingModels ? 0.5 : 1,
              cursor: fetchingModels ? "not-allowed" : "pointer"
            }}>
            <RefreshIcon size={14} color={theme.text.primary} />
            {fetchingModels ? "获取中..." : "获取模型"}
          </button>
        </div>
        {models.length > 0 ? (
          <div style={{ display: "flex", gap: uiSpace[8] }}>
            <select
              value={settings.model}
              onChange={(event) => {
                setSettings((current) => ({ ...current, model: event.target.value }))
              }}
              style={{ ...createInputStyle("model"), flex: 1, cursor: "pointer" }}>
              {models.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setModels([])}
              style={secondaryBtnStyle}>
              手动输入
            </button>
          </div>
        ) : (
          <input
            value={settings.model}
            onFocus={() => setFocusedField("model")}
            onBlur={() => setFocusedField(null)}
            onChange={(event) => {
              setSettings((current) => ({ ...current, model: event.target.value }))
            }}
            placeholder="gpt-4o-mini"
            style={createInputStyle("model")}
          />
        )}
        {fetchError ? (
          <div
            style={{
              marginTop: uiSpace[8],
              fontSize: uiTypography.fontSize.sm,
              color: theme.state.error,
              background: theme.state.errorBg,
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              borderRadius: uiRadius.sm
            }}>
            {fetchError}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: uiSpace[10], marginBottom: uiSpace[16] }}>
        <button
          disabled={testing}
          onClick={handleTestConnection}
          onMouseDown={() => setPressedBtn("test")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          style={{
            ...primaryBtnStyle,
            display: "flex",
            alignItems: "center",
            gap: uiSpace[6],
            opacity: testing ? 0.6 : 1,
            cursor: testing ? "not-allowed" : "pointer",
            background: testing ? theme.state.disabled : theme.accent.primary,
            transform: pressedBtn === "test" ? "scale(0.96)" : "scale(1)"
          }}>
          {testing ? "测试中..." : "测试连接"}
        </button>
        {testResult ? (
          <span
            style={{
              fontSize: uiTypography.fontSize.sm,
              color: testResult.success ? theme.state.success : theme.state.error,
              background: testResult.success ? theme.state.successBg : theme.state.errorBg,
              padding: `${uiSpace[6]}px ${uiSpace[10]}px`,
              borderRadius: uiRadius.pill,
              fontWeight: uiTypography.fontWeight.medium,
              lineHeight: 1.5
            }}>
            {testResult.message}
          </span>
        ) : null}
      </div>

      <div style={{ borderTop: `0.5px solid ${theme.border.hairline}`, paddingTop: uiSpace[20], marginTop: uiSpace[4] }}>
        <h3
          style={{
            margin: `0 0 ${uiSpace[4]}px`,
            fontSize: uiTypography.fontSize.md,
            fontWeight: uiTypography.fontWeight.semibold,
            letterSpacing: uiTypography.letterSpacing.tight
          }}>
          模型参数
        </h3>
        <p
          style={{
            margin: `0 0 ${uiSpace[16]}px`,
            color: theme.text.secondary,
            fontSize: uiTypography.fontSize.sm
          }}>
          适用于解释、翻译等文本处理场景的采样参数
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: `${uiSpace[12]}px ${uiSpace[16]}px`
          }}>
          {(
            [
              { key: "maxTokens" as const, label: "Max Tokens", placeholder: "1024", min: 1, max: 128000, step: 1, desc: "最大输出 token 数" },
              { key: "temperature" as const, label: "Temperature", placeholder: "0.3", min: 0, max: 2, step: 0.1, desc: "采样温度，越低越确定" },
              { key: "topP" as const, label: "Top P", placeholder: "0.9", min: 0, max: 1, step: 0.05, desc: "核采样概率阈值" },
              { key: "presencePenalty" as const, label: "Presence Penalty", placeholder: "0", min: -2, max: 2, step: 0.1, desc: "存在惩罚" },
              { key: "frequencyPenalty" as const, label: "Frequency Penalty", placeholder: "0", min: -2, max: 2, step: 0.1, desc: "频率惩罚" }
            ]
          ).map((param) => (
            <div key={param.key}>
              <div style={{ ...fieldLabelStyle, marginBottom: uiSpace[4] }}>{param.label}</div>
              <div style={{ fontSize: uiTypography.fontSize.xs, color: theme.text.secondary, marginBottom: uiSpace[6] }}>
                {param.desc}
              </div>
              <input
                type="number"
                value={settings.modelParams[param.key]}
                min={param.min}
                max={param.max}
                step={param.step}
                onFocus={() => setFocusedField(`modelParams-${param.key}`)}
                onBlur={() => setFocusedField(null)}
                onChange={(event) => {
                  const raw = event.target.value
                  const value = raw === "" ? DEFAULT_SETTINGS.modelParams[param.key] : Number(raw)
                  setSettings((current) => ({
                    ...current,
                    modelParams: { ...current.modelParams, [param.key]: value }
                  }))
                }}
                placeholder={param.placeholder}
                style={createInputStyle(`modelParams-${param.key}`)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: uiSpace[20] }}>
        <button
          onClick={() => setConfirmRestoreSection("connection")}
          onMouseDown={() => setPressedBtn("restore-connection")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          style={{
            ...secondaryBtnStyle,
            color: theme.state.error,
            borderColor: theme.state.error,
            opacity: 0.8,
            transform: pressedBtn === "restore-connection" ? "scale(0.96)" : "scale(1)"
          }}>
          恢复默认
        </button>
      </div>
    </section>
  )

  const renderActions = () => (
    <section style={{ ...cardStyle }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: uiSpace[16] }}>
        <div>
          <h2
            style={{
              margin: `0 0 ${uiSpace[4]}px`,
              fontSize: uiTypography.fontSize.lg,
              fontWeight: uiTypography.fontWeight.semibold,
              letterSpacing: uiTypography.letterSpacing.tight
            }}>
            指令模板
          </h2>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>
            自定义选区操作指令
          </p>
        </div>
        <button
          onClick={() => {
            setSettings((current) => ({
              ...current,
              actions: [
                ...current.actions,
                {
                  id: `custom-${Date.now()}`,
                  label: "新动作",
                  template: "帮我处理以下内容「{text}」"
                }
              ]
            }))
          }}
          onMouseDown={() => setPressedBtn("add-action")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          style={{
            ...primaryBtnStyle,
            display: "flex",
            alignItems: "center",
            gap: uiSpace[4],
            transform: pressedBtn === "add-action" ? "scale(0.96)" : "scale(1)"
          }}>
          <PlusIcon size={14} color={theme.text.inverse} />
          新增动作
        </button>
      </div>

      <p style={{ marginTop: 0, marginBottom: uiSpace[12], color: theme.text.secondary, fontSize: uiTypography.fontSize.sm }}>
        模板必须包含 <code style={{ background: theme.bg.surfaceMuted, padding: "2px 6px", borderRadius: 4, fontSize: uiTypography.fontSize.xs }}>{"{text}"}</code> 占位符，用来注入用户选中的文本。
      </p>

      {settings.actions.map((item, index) => {
        const invalid = !hasTextPlaceholder(item.template)

        return (
          <div
            key={item.id}
            style={{
              border: `1px solid ${invalid ? theme.state.warning : theme.border.hairline}`,
              borderRadius: uiRadius.md,
              padding: uiSpace[14],
              marginBottom: uiSpace[10],
              background: invalid ? theme.state.warningBg : theme.bg.surface,
              boxShadow: invalid ? "none" : uiShadow.sm,
              transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: uiSpace[8], alignItems: "start" }}>
              <input
                value={item.label}
                onFocus={() => setFocusedField(`${item.id}-label`)}
                onBlur={() => setFocusedField(null)}
                onChange={(event) => {
                  updateCustomAction(index, { label: event.target.value })
                }}
                placeholder="按钮名称"
                style={createInputStyle(`${item.id}-label`)}
              />
              <input
                value={item.template}
                onFocus={() => setFocusedField(`${item.id}-template`)}
                onBlur={() => setFocusedField(null)}
                onChange={(event) => {
                  updateCustomAction(index, { template: event.target.value })
                }}
                placeholder="模板，必须包含 {text}"
                style={createInputStyle(`${item.id}-template`)}
              />
              <button
                onClick={() => {
                  setSettings((current) => ({
                    ...current,
                    actions: current.actions.filter((action) => action.id !== item.id)
                  }))
                }}
                onMouseDown={() => setPressedBtn(`delete-${item.id}`)}
                onMouseUp={() => setPressedBtn(null)}
                aria-label="删除动作"
                style={{
                  width: 36,
                  height: 36,
                  border: "none",
                  borderRadius: uiRadius.sm,
                  background: "transparent",
                  color: theme.state.error,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: "none",
                  transform: pressedBtn === `delete-${item.id}` ? "scale(0.9)" : "scale(1)",
                  transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}`
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = theme.state.errorBg
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent"
                  setPressedBtn(null)
                }}>
                <TrashIcon size={16} color={theme.state.error} />
              </button>
            </div>
            {invalid ? (
              <div style={{ marginTop: uiSpace[8], color: theme.state.warning, fontSize: uiTypography.fontSize.sm, fontWeight: uiTypography.fontWeight.medium }}>
                模板缺少 {"{text}"} 占位符。
              </div>
            ) : null}
          </div>
        )
      })}

      {settings.actions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: `${uiSpace[24]}px ${uiSpace[16]}px`,
            color: theme.text.secondary,
            fontSize: uiTypography.fontSize.md,
            border: `1px dashed ${theme.border.default}`,
            borderRadius: uiRadius.md
          }}>
          还没有动作，点击上方「新增动作」开始创建。
        </div>
      ) : null}

      <div style={{ marginTop: uiSpace[20] }}>
        <button
          onClick={() => setConfirmRestoreSection("actions")}
          onMouseDown={() => setPressedBtn("restore-actions")}
          onMouseUp={() => setPressedBtn(null)}
          onMouseLeave={() => setPressedBtn(null)}
          style={{
            ...secondaryBtnStyle,
            color: theme.state.error,
            borderColor: theme.state.error,
            opacity: 0.8,
            transform: pressedBtn === "restore-actions" ? "scale(0.96)" : "scale(1)"
          }}>
          恢复默认
        </button>
      </div>
    </section>
  )

  const renderBackup = () => (
    <section style={{ ...cardStyle }}>
      <div style={{ marginBottom: uiSpace[20] }}>
        <h2
          style={{
            margin: `0 0 ${uiSpace[4]}px`,
            fontSize: uiTypography.fontSize.lg,
            fontWeight: uiTypography.fontWeight.semibold,
            letterSpacing: uiTypography.letterSpacing.tight
          }}>
          配置数据
        </h2>
        <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>
          导入与导出配置
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: uiSpace[16],
          marginBottom: uiSpace[16]
        }}>
        <div
          style={{
            border: `1px solid ${theme.border.hairline}`,
            borderRadius: uiRadius.md,
            padding: uiSpace[16],
            background: theme.bg.surfaceMuted
          }}>
          <h3
            style={{
              margin: `0 0 ${uiSpace[6]}px`,
              fontSize: uiTypography.fontSize.md,
              fontWeight: uiTypography.fontWeight.semibold
            }}>
            导出配置
          </h3>
          <p style={{ margin: `0 0 ${uiSpace[14]}px`, color: theme.text.secondary, fontSize: uiTypography.fontSize.sm, lineHeight: 1.6 }}>
            导出 API 配置、主题、动作模板和模型参数，便于迁移或备份。
          </p>
          <button
            type="button"
            onClick={handleExportSettings}
            onMouseDown={() => setPressedBtn("export-settings")}
            onMouseUp={() => setPressedBtn(null)}
            onMouseLeave={() => setPressedBtn(null)}
            style={{
              ...primaryBtnStyle,
              transform: pressedBtn === "export-settings" ? "scale(0.96)" : "scale(1)"
            }}>
            导出 JSON
          </button>
        </div>

        <div
          style={{
            border: `1px solid ${theme.border.hairline}`,
            borderRadius: uiRadius.md,
            padding: uiSpace[16],
            background: theme.bg.surfaceMuted
          }}>
          <h3
            style={{
              margin: `0 0 ${uiSpace[6]}px`,
              fontSize: uiTypography.fontSize.md,
              fontWeight: uiTypography.fontWeight.semibold
            }}>
            导入配置
          </h3>
          <p style={{ margin: `0 0 ${uiSpace[14]}px`, color: theme.text.secondary, fontSize: uiTypography.fontSize.sm, lineHeight: 1.6 }}>
            从已导出的 JSON 文件恢复设置。导入后会覆盖当前配置。
          </p>
          <button
            type="button"
            onClick={handleImportClick}
            onMouseDown={() => setPressedBtn("import-settings")}
            onMouseUp={() => setPressedBtn(null)}
            onMouseLeave={() => setPressedBtn(null)}
            style={{
              ...secondaryBtnStyle,
              transform: pressedBtn === "import-settings" ? "scale(0.96)" : "scale(1)"
            }}>
            选择备份文件
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={(event) => void handleImportFile(event)} style={{ display: "none" }} />
        </div>
      </div>

      <div
        style={{
          fontSize: uiTypography.fontSize.sm,
          color: theme.text.secondary,
          lineHeight: 1.7,
          padding: `${uiSpace[12]}px ${uiSpace[14]}px`,
          background: theme.bg.surfaceAlt,
          borderRadius: uiRadius.md,
          border: `1px solid ${theme.border.hairline}`
        }}>
        导入时会自动校验并补齐缺失字段，不兼容字段会回退到默认值。
      </div>

      {backupStatus ? (
        <div
          style={{
            marginTop: uiSpace[16],
            fontSize: uiTypography.fontSize.sm,
            color: backupStatus.success ? theme.state.success : theme.state.error,
            background: backupStatus.success ? theme.state.successBg : theme.state.errorBg,
            padding: `${uiSpace[10]}px ${uiSpace[12]}px`,
            borderRadius: uiRadius.md,
            lineHeight: 1.6
          }}>
          {backupStatus.message}
        </div>
      ) : null}
    </section>
  )

  const sectionContent: Record<Section, () => JSX.Element> = {
    appearance: renderAppearance,
    connection: renderConnection,
    actions: renderActions,
    backup: renderBackup
  }

  const sidebarWidth = 240

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: uiTypography.fontFamily,
        color: theme.text.primary,
        background: theme.bg.page,
        overflow: "hidden"
      }}>
      {/* Sidebar */}
      <nav
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          height: "100%",
          background: theme.bg.surface,
          borderRight: `0.5px solid ${theme.border.hairline}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
        {/* Sidebar header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: uiSpace[10],
            padding: `${uiSpace[20]}px ${uiSpace[16]}px ${uiSpace[12]}px`
          }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: uiRadius.sm,
              background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.brand.primary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: uiShadow.md,
              flexShrink: 0
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z"
                stroke={theme.text.inverse}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={theme.text.inverse}
                fillOpacity={0.2}
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: uiTypography.fontSize.xl,
              fontWeight: uiTypography.fontWeight.bold,
              letterSpacing: uiTypography.letterSpacing.tight
            }}>
            设置
          </span>
        </div>

        {/* Nav items */}
        <div style={{ padding: `${uiSpace[4]}px ${uiSpace[8]}px`, flex: 1 }}>
          {sections.map((section) => {
            const isActive = activeSection === section.key
            const isHovered = hoveredNav === section.key
            const Icon = section.icon

            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                onMouseEnter={() => setHoveredNav(section.key)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: uiSpace[8],
                  width: "100%",
                  padding: `${uiSpace[6]}px ${uiSpace[10]}px`,
                  marginBottom: 1,
                  border: "none",
                  borderRadius: uiRadius.sm,
                  background: isActive ? theme.bg.surfaceMuted : isHovered ? theme.bg.surfaceAlt : "transparent",
                  color: isActive ? theme.text.primary : theme.text.secondary,
                  cursor: "pointer",
                  fontFamily: uiTypography.fontFamily,
                  fontSize: uiTypography.fontSize.md,
                  fontWeight: isActive ? uiTypography.fontWeight.semibold : uiTypography.fontWeight.regular,
                  outline: "none",
                  textAlign: "left",
                  transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, color ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
                  position: "relative"
                }}>
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 2,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 16,
                      borderRadius: 1.5,
                      background: theme.accent.primary
                    }}
                  />
                )}
                <Icon size={18} color={isActive ? theme.accent.primary : theme.text.secondary} />
                {section.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
        <div
          style={{
            maxWidth: 800,
            width: "100%",
            margin: "0 auto",
            padding: `${uiSpace[32]}px ${uiSpace[32]}px ${uiSpace[20]}px`,
            boxSizing: "border-box",
            flex: 1
          }}>
          {/* Section header */}
          <div style={{ marginBottom: uiSpace[24] }}>
            <h1
              style={{
                margin: 0,
                fontSize: uiTypography.fontSize.title,
                fontWeight: uiTypography.fontWeight.bold,
                letterSpacing: uiTypography.letterSpacing.tight
              }}>
              {sections.find((s) => s.key === activeSection)?.label}
            </h1>
          </div>

          {/* Section content */}
          {sectionContent[activeSection]()}

          {confirmRestoreSection ? (
            <ConfirmDialog
              title="恢复默认设置"
              message={`确定将「${sections.find((s) => s.key === confirmRestoreSection)?.label}」页面的所有设置恢复为默认值吗？此操作不可撤销。`}
              confirmLabel="恢复默认"
              onConfirm={() => restoreSection(confirmRestoreSection)}
              onCancel={() => setConfirmRestoreSection(null)}
              themeName={themeName}
            />
          ) : null}

          {pendingImportSettings ? (
            <ConfirmDialog
              title="导入配置"
              message="确定导入这份备份并覆盖当前所有设置吗？当前未保存的修改也会被替换。"
              confirmLabel="导入并覆盖"
              onConfirm={confirmImportSettings}
              onCancel={() => setPendingImportSettings(null)}
              themeName={themeName}
            />
          ) : null}

          {activeSection !== "backup" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: uiSpace[12],
                marginTop: uiSpace[20],
                paddingTop: uiSpace[16],
                paddingBottom: uiSpace[32]
              }}>
              <button
                disabled={!canSave || saving}
                onClick={() => {
                  if (!canSave) {
                    setStatus("请先修正设置项后再保存。")
                    return
                  }

                  setSaving(true)
                  setStatus("")

                  void saveSettings({
                    ...settings,
                    apiBaseUrl: settings.apiBaseUrl.trim(),
                    apiKey: settings.apiKey.trim(),
                    model: settings.model.trim()
                  })
                    .then(() => {
                      setStatus("保存成功")
                    })
                    .catch((error: unknown) => {
                      const message = error instanceof Error ? error.message : "未知错误"
                      setStatus(`保存失败：${message}`)
                    })
                    .finally(() => {
                      setSaving(false)
                    })
                }}
                onMouseDown={() => setPressedBtn("save")}
                onMouseUp={() => setPressedBtn(null)}
                onMouseLeave={() => setPressedBtn(null)}
                style={{
                  ...primaryBtnStyle,
                  padding: `${uiSpace[10]}px ${uiSpace[24]}px`,
                  fontSize: uiTypography.fontSize.lg,
                  opacity: !canSave || saving ? 0.5 : 1,
                  cursor: !canSave || saving ? "not-allowed" : "pointer",
                  background: !canSave || saving ? theme.state.disabled : theme.accent.primary,
                  transform: pressedBtn === "save" ? "scale(0.96)" : "scale(1)"
                }}>
                {saving ? "保存中..." : "保存设置"}
              </button>
              {status ? (
                <span
                  style={{
                    fontSize: uiTypography.fontSize.sm,
                    color: status.includes("失败") || status.includes("修正") ? theme.state.error : theme.state.success,
                    fontWeight: uiTypography.fontWeight.medium,
                    lineHeight: 1.5
                  }}>
                  {status}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
