import { useEffect, useMemo, useState, type CSSProperties } from "react"

import { hasTextPlaceholder } from "~/shared/prompt"
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "~/shared/storage"
import type { CustomActionTemplate, ExtensionSettings } from "~/shared/types"

export default function OptionsPage() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>("")

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

  return (
    <main
      style={{
        maxWidth: 860,
        margin: "20px auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        padding: "0 16px",
        color: "#111827"
      }}>
      <h1 style={{ marginBottom: 8 }}>AI Help Me 设置</h1>
      <p style={{ marginTop: 0, color: "#6b7280" }}>配置 OpenAI 兼容接口、翻译语言和自定义动作模板。</p>

      <section style={cardStyle}>
        <label style={fieldStyle}>
          <span>API Base URL</span>
          <input
            value={settings.apiBaseUrl}
            onChange={(event) => {
              setSettings((current) => ({ ...current, apiBaseUrl: event.target.value }))
            }}
            placeholder="https://api.openai.com/v1"
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span>API Key</span>
          <input
            type="password"
            value={settings.apiKey}
            onChange={(event) => {
              setSettings((current) => ({ ...current, apiKey: event.target.value }))
            }}
            placeholder="sk-..."
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span>Model</span>
          <input
            value={settings.model}
            onChange={(event) => {
              setSettings((current) => ({ ...current, model: event.target.value }))
            }}
            placeholder="gpt-4o-mini"
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span>翻译目标语言</span>
          <input
            value={settings.translationLanguage}
            onChange={(event) => {
              setSettings((current) => ({ ...current, translationLanguage: event.target.value }))
            }}
            placeholder="简体中文"
            style={inputStyle}
          />
        </label>
      </section>

      <section style={{ ...cardStyle, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>自定义动作按钮</h2>
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

        <p style={{ marginTop: 0, color: "#6b7280", fontSize: 13 }}>
          模板必须包含 <code>{"{text}"}</code> 占位符，用来注入用户选中的文本。
        </p>

        {settings.customActions.map((item, index) => {
          const invalid = !hasTextPlaceholder(item.template)

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 10,
                marginBottom: 10,
                background: invalid ? "#fff7ed" : "#ffffff"
              }}>
              <div style={{ display: "grid", gridTemplateColumns: "160px 1fr auto", gap: 8 }}>
                <input
                  value={item.label}
                  onChange={(event) => {
                    updateCustomAction(index, { label: event.target.value })
                  }}
                  placeholder="按钮名称"
                  style={inputStyle}
                />
                <input
                  value={item.template}
                  onChange={(event) => {
                    updateCustomAction(index, { template: event.target.value })
                  }}
                  placeholder="模板，必须包含 {text}"
                  style={inputStyle}
                />
                <button
                  onClick={() => {
                    setSettings((current) => ({
                      ...current,
                      customActions: current.customActions.filter((action) => action.id !== item.id)
                    }))
                  }}
                  style={{ ...buttonStyle, background: "#dc2626" }}>
                  删除
                </button>
              </div>
              {invalid ? (
                <div style={{ marginTop: 8, color: "#c2410c", fontSize: 12 }}>模板缺少 {"{text}"} 占位符。</div>
              ) : null}
            </div>
          )
        })}
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
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
            cursor: !canSave || saving ? "not-allowed" : "pointer"
          }}>
          {saving ? "保存中..." : "保存设置"}
        </button>
        {status ? <span style={{ fontSize: 13, color: "#374151" }}>{status}</span> : null}
      </div>
    </main>
  )
}

const cardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#ffffff"
}

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  marginBottom: 10,
  fontSize: 13,
  color: "#374151"
}

const inputStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13,
  outline: "none"
}

const buttonStyle: CSSProperties = {
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer"
}
