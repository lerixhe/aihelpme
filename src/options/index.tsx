import { useEffect, useMemo, useState, type CSSProperties } from "react"

import { hasTextPlaceholder } from "~/shared/prompt"
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "~/shared/storage"
import { useUiThemeName } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiThemes, uiTypography } from "~/shared/ui/tokens"
import type { CustomActionTemplate, ExtensionSettings, ThemePreference } from "~/shared/types"

export default function OptionsPage() {
  const themeName = useUiThemeName()
  const theme = uiThemes[themeName]
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    void getSettings().then((loaded) => {
      setSettings(loaded)
    })
  }, [])

  const hasInvalidCustomTemplate = useMemo(() => {
    return settings.customActions.some((item) => !hasTextPlaceholder(item.template))
  }, [settings.customActions])

  const canSave =
    Boolean(settings.apiBaseUrl.trim()) &&
    Boolean(settings.model.trim()) &&
    Boolean(settings.translationLanguage.trim()) &&
    !hasInvalidCustomTemplate

  const updateCustomAction = (index: number, patch: Partial<CustomActionTemplate>) => {
    setSettings((current) => ({
      ...current,
      customActions: current.customActions.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              ...patch
            }
          : item
      )
    }))
  }

  const cardStyle: CSSProperties = {
    border: `1px solid ${theme.border.default}`,
    borderRadius: uiRadius.lg,
    padding: uiSpace[16],
    background: theme.bg.surface,
    boxShadow: uiShadow.sm
  }

  const fieldStyle: CSSProperties = {
    display: "grid",
    gap: 6,
    marginBottom: uiSpace[12],
    fontSize: uiTypography.fontSize.md,
    color: theme.text.secondary
  }

  const createInputStyle = (fieldName: string): CSSProperties => ({
    border: `1px solid ${focusedField === fieldName ? theme.border.strong : theme.border.default}`,
    borderRadius: uiRadius.sm,
    padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
    fontSize: uiTypography.fontSize.md,
    fontFamily: uiTypography.fontFamily,
    outline: "none",
    color: theme.text.primary,
    background: theme.bg.surfaceAlt,
    boxShadow: focusedField === fieldName ? `0 0 0 3px ${theme.bg.overlay}` : "none",
    transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  })

  const buttonStyle: CSSProperties = {
    border: "none",
    borderRadius: uiRadius.sm,
    padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
    background: theme.brand.primary,
    color: theme.text.inverse,
    fontWeight: uiTypography.fontWeight.semibold,
    cursor: "pointer",
    transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}`
  }

  return (
    <main
      style={{
        maxWidth: 860,
        margin: "0 auto",
        fontFamily: uiTypography.fontFamily,
        padding: "32px 16px 40px",
        color: theme.text.primary,
        background: theme.bg.page,
        minHeight: "100vh"
      }}>
      <section
        style={{
          ...cardStyle,
          marginBottom: uiSpace[16],
          background: theme.bg.surfaceAlt,
          borderColor: theme.border.subtle
        }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: `${uiSpace[4]}px ${uiSpace[8]}px`,
            borderRadius: uiRadius.pill,
            background: theme.bg.surfaceMuted,
            color: theme.text.secondary,
            fontSize: uiTypography.fontSize.sm,
            marginBottom: uiSpace[12]
          }}>
          设置台
        </div>
        <h1 style={{ margin: `0 0 ${uiSpace[8]}px`, fontSize: 30 }}>AI Help Me 设置台</h1>
        <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.lg, lineHeight: 1.6 }}>
          配置 OpenAI 兼容接口、翻译语言和自定义动作模板，保持扩展交互简单、清晰、易读。
        </p>
      </section>

      <section style={{ ...cardStyle, marginBottom: uiSpace[16] }}>
        <div style={{ marginBottom: uiSpace[12] }}>
          <h2 style={{ margin: `0 0 ${uiSpace[4]}px`, fontSize: 18, fontWeight: uiTypography.fontWeight.semibold }}>主题卡</h2>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>选择界面配色方案，切换即时生效。</p>
        </div>
        <div style={{ display: "flex", gap: uiSpace[8] }}>
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
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: uiSpace[6],
                  padding: `${uiSpace[12]}px ${uiSpace[8]}px`,
                  border: `2px solid ${isSelected ? theme.border.strong : theme.border.default}`,
                  borderRadius: uiRadius.md,
                  background: isSelected ? theme.brand.primary : theme.bg.surfaceAlt,
                  color: isSelected ? theme.text.inverse : theme.text.primary,
                  cursor: "pointer",
                  fontSize: uiTypography.fontSize.sm,
                  fontWeight: isSelected ? uiTypography.fontWeight.semibold : uiTypography.fontWeight.regular,
                  fontFamily: uiTypography.fontFamily,
                  outline: "none",
                  transition: `all ${uiMotion.durationFast} ${uiMotion.easingStandard}`
                }}>
                <div
                  style={{
                    width: 40,
                    height: 28,
                    borderRadius: uiRadius.sm,
                    border: `1px solid ${isSelected ? theme.text.inverse : theme.border.default}`,
                    background: value === "light" || (value === "auto" && themeName === "light") ? "#F0FDFA" : "#0F172A",
                    position: "relative",
                    overflow: "hidden"
                  }}>
                  {value === "auto" ? (
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "50%",
                      height: "100%",
                      background: "#F0FDFA",
                      borderRight: `1px solid ${isSelected ? theme.text.inverse : theme.border.default}`
                    }} />
                  ) : null}
                </div>
                {labels[value]}
              </button>
            )
          })}
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ marginBottom: uiSpace[16] }}>
          <h2 style={{ margin: `0 0 ${uiSpace[4]}px`, fontSize: 18, fontWeight: uiTypography.fontWeight.semibold }}>连接卡</h2>
          <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>完成模型接口与翻译语言设置。</p>
        </div>
        <label style={fieldStyle}>
          <span>API Base URL</span>
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
        </label>

        <label style={fieldStyle}>
          <span>API Key</span>
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
        </label>

        <label style={fieldStyle}>
          <span>Model</span>
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
        </label>

        <label style={{ ...fieldStyle, marginBottom: 0 }}>
          <span>翻译目标语言</span>
          <input
            value={settings.translationLanguage}
            onFocus={() => setFocusedField("translationLanguage")}
            onBlur={() => setFocusedField(null)}
            onChange={(event) => {
              setSettings((current) => ({ ...current, translationLanguage: event.target.value }))
            }}
            placeholder="简体中文"
            style={createInputStyle("translationLanguage")}
          />
        </label>
      </section>

      <section style={{ ...cardStyle, marginTop: uiSpace[16] }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: uiSpace[12] }}>
          <div>
            <h2 style={{ margin: `0 0 ${uiSpace[4]}px`, fontSize: 18, fontWeight: uiTypography.fontWeight.semibold }}>动作卡</h2>
            <p style={{ margin: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>让常用指令直接出现在选区面板中。</p>
          </div>
          <button
            onClick={() => {
              setSettings((current) => ({
                ...current,
                customActions: [
                  ...current.customActions,
                  {
                    id: `custom-${Date.now()}`,
                    label: "新动作",
                    template: "帮我处理以下内容「{text}」"
                  }
                ]
              }))
            }}
            style={buttonStyle}>
            新增动作
          </button>
        </div>

        <p style={{ marginTop: 0, color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>
          模板必须包含 <code>{"{text}"}</code> 占位符，用来注入用户选中的文本。
        </p>

        {settings.customActions.map((item, index) => {
          const invalid = !hasTextPlaceholder(item.template)
          const rowBg = invalid ? theme.state.warningBg : theme.bg.surface

          return (
            <div
              key={item.id}
              style={{
                border: `1px solid ${invalid ? theme.state.warning : theme.border.default}`,
                borderRadius: uiRadius.md,
                padding: uiSpace[12],
                marginBottom: uiSpace[12],
                background: rowBg,
                boxShadow: invalid ? "none" : uiShadow.sm
              }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", gap: uiSpace[8], alignItems: "start" }}>
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
                      customActions: current.customActions.filter((action) => action.id !== item.id)
                    }))
                  }}
                  style={{ ...buttonStyle, background: theme.state.error }}>
                  删除
                </button>
              </div>
              {invalid ? (
                <div style={{ marginTop: uiSpace[8], color: theme.state.warning, fontSize: uiTypography.fontSize.sm }}>
                  模板缺少 {"{text}"} 占位符。
                </div>
              ) : null}
            </div>
          )
        })}
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: uiSpace[12], marginTop: uiSpace[16] }}>
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
              model: settings.model.trim(),
              translationLanguage: settings.translationLanguage.trim()
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
          style={{
            ...buttonStyle,
            opacity: !canSave || saving ? 0.55 : 1,
            cursor: !canSave || saving ? "not-allowed" : "pointer",
            background: !canSave || saving ? theme.state.disabled : theme.brand.primary,
            transition: `all ${uiMotion.durationFast} ${uiMotion.easingStandard}`
          }}>
          {saving ? "保存中..." : "保存设置"}
        </button>
        {status ? (
          <span style={{ fontSize: uiTypography.fontSize.md, color: status.includes("失败") ? theme.state.error : theme.text.secondary, lineHeight: 1.5 }}>
            {status}
          </span>
        ) : null}
      </div>
    </main>
  )
}
