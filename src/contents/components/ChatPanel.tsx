import { useEffect, useRef, useState } from "react"

import { useUiTheme } from "~/shared/ui/theme"
import { uiLayout, uiLayer, uiMotion, uiRadius, uiShadow, uiSpace, uiTypography } from "~/shared/ui/tokens"
import type { ChatMessage } from "~/shared/types"

interface Props {
  visible: boolean
  messages: ChatMessage[]
  loading: boolean
  onSend: (input: string) => void
  onClose: () => void
}

const INITIAL_POSITION = {
  x: uiLayout.chatPanel.initialX,
  y: uiLayout.chatPanel.initialY
}

export default function ChatPanel({ visible, messages, loading, onSend, onClose }: Props) {
  const theme = useUiTheme()
  const [input, setInput] = useState("")
  const [position, setPosition] = useState<{ x: number; y: number }>(INITIAL_POSITION)
  const [focused, setFocused] = useState<"input" | "send" | "close" | null>(null)
  const [hovered, setHovered] = useState<"send" | "close" | null>(null)
  const dragStateRef = useRef<{
    dragging: boolean
    offsetX: number
    offsetY: number
  }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0
  })

  useEffect(() => {
    if (!visible) {
      return
    }

    const onMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current.dragging) {
        return
      }

      const nextX = Math.max(
        uiLayout.edgeInset,
        Math.min(window.innerWidth - uiLayout.chatPanel.width - uiLayout.edgeInset, event.clientX - dragStateRef.current.offsetX)
      )
      const nextY = Math.max(
        uiLayout.edgeInset,
        Math.min(window.innerHeight - uiLayout.chatPanel.height - uiLayout.edgeInset, event.clientY - dragStateRef.current.offsetY)
      )

      setPosition({
        x: nextX,
        y: nextY
      })
    }

    const onMouseUp = () => {
      dragStateRef.current.dragging = false
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [visible])

  if (!visible) {
    return null
  }

  const sendDisabled = loading || !input.trim()

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: uiLayout.chatPanel.width,
        height: uiLayout.chatPanel.height,
        borderRadius: uiRadius.lg,
        overflow: "hidden",
        background: theme.bg.surface,
        boxShadow: uiShadow.lg,
        border: `1px solid ${theme.border.default}`,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        zIndex: uiLayer.overlay,
        fontFamily: uiTypography.fontFamily,
        transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
      }}>
      <div
        onMouseDown={(event) => {
          dragStateRef.current.dragging = true
          dragStateRef.current.offsetX = event.clientX - position.x
          dragStateRef.current.offsetY = event.clientY - position.y
        }}
        style={{
          cursor: "move",
          background: theme.bg.surfaceAlt,
          color: theme.text.primary,
          padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
          borderBottom: `1px solid ${theme.border.default}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: uiSpace[8],
          userSelect: "none"
        }}>
        <strong style={{ fontSize: uiTypography.fontSize.md, fontWeight: uiTypography.fontWeight.semibold }}>AI Help Me</strong>
        <button
          onClick={onClose}
          onMouseEnter={() => setHovered("close")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused("close")}
          onBlur={() => setFocused(null)}
          aria-label="关闭聊天面板"
          style={{
            border: "none",
            background: hovered === "close" ? theme.bg.page : "transparent",
            color: theme.text.secondary,
            cursor: "pointer",
            width: 28,
            height: 28,
            borderRadius: uiRadius.sm,
            lineHeight: "16px",
            fontSize: uiTypography.fontSize.xl,
            boxShadow: focused === "close" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.border.strong}` : "none"
          }}>
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: uiSpace[12],
          display: "flex",
          flexDirection: "column",
          gap: uiSpace[8],
          background: theme.bg.surfaceAlt
        }}>
        {messages.length === 0 ? (
          <div style={{ color: theme.text.secondary, fontSize: uiTypography.fontSize.md }}>请选择动作或输入问题开始对话。</div>
        ) : null}

        {messages.map((item) => (
          <div
            key={item.id}
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              borderRadius: uiRadius.md,
              lineHeight: 1.5,
              fontSize: uiTypography.fontSize.md,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: item.role === "user" ? theme.brand.primary : theme.bg.surface,
              color: item.role === "user" ? theme.text.inverse : theme.text.primary,
              border: item.role === "user" ? "none" : `1px solid ${theme.border.default}`
            }}>
            {item.content}
          </div>
        ))}

        {loading ? <div style={{ color: theme.text.secondary, fontSize: uiTypography.fontSize.sm }}>AI 正在回答...</div> : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: uiSpace[8],
          padding: uiSpace[12],
          borderTop: `1px solid ${theme.border.default}`,
          background: theme.bg.surface
        }}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onFocus={() => setFocused("input")}
          onBlur={() => setFocused(null)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) {
              return
            }

            event.preventDefault()

            const value = input.trim()
            if (!value || loading) {
              return
            }

            onSend(value)
            setInput("")
          }}
          aria-label="继续提问"
          placeholder="继续提问（Enter 发送，Shift+Enter 换行）"
          style={{
            flex: 1,
            minHeight: 56,
            resize: "none",
            borderRadius: uiRadius.sm,
            border: `1px solid ${focused === "input" ? theme.border.strong : theme.border.default}`,
            background: theme.bg.surface,
            color: theme.text.primary,
            padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
            fontSize: uiTypography.fontSize.md,
            fontFamily: "inherit",
            lineHeight: 1.45,
            outline: "none",
            boxShadow: focused === "input" ? `0 0 0 3px ${theme.bg.overlay}` : "none",
            transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
          }}
        />
        <button
          onClick={() => {
            const value = input.trim()
            if (!value || loading) {
              return
            }

            onSend(value)
            setInput("")
          }}
          onMouseEnter={() => setHovered("send")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setFocused("send")}
          onBlur={() => setFocused(null)}
          disabled={sendDisabled}
          style={{
            width: 84,
            border: "none",
            borderRadius: uiRadius.sm,
            background: sendDisabled
              ? theme.state.disabled
              : hovered === "send"
                ? theme.brand.primaryHover
                : theme.brand.primary,
            color: theme.text.inverse,
            fontWeight: uiTypography.fontWeight.semibold,
            cursor: sendDisabled ? "not-allowed" : "pointer",
            opacity: sendDisabled ? 0.72 : 1,
            boxShadow: focused === "send" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.border.strong}` : "none",
            transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
          }}>
          {loading ? "发送中" : "发送"}
        </button>
      </div>
    </div>
  )
}
