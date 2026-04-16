import { useEffect, useRef, useState } from "react"

import type { ChatMessage } from "~/shared/types"

interface Props {
  visible: boolean
  messages: ChatMessage[]
  loading: boolean
  onSend: (input: string) => void
  onClose: () => void
}

const INITIAL_POSITION = {
  x: 24,
  y: 24
}

export default function ChatPanel({ visible, messages, loading, onSend, onClose }: Props) {
  const [input, setInput] = useState("")
  const [position, setPosition] = useState(INITIAL_POSITION)
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

      const nextX = Math.max(8, Math.min(window.innerWidth - 408, event.clientX - dragStateRef.current.offsetX))
      const nextY = Math.max(8, Math.min(window.innerHeight - 308, event.clientY - dragStateRef.current.offsetY))

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

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        width: 400,
        height: 300,
        borderRadius: 12,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        zIndex: 2147483647,
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
      }}>
      <div
        onMouseDown={(event) => {
          dragStateRef.current.dragging = true
          dragStateRef.current.offsetX = event.clientX - position.x
          dragStateRef.current.offsetY = event.clientY - position.y
        }}
        style={{
          cursor: "move",
          background: "#111827",
          color: "#ffffff",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          userSelect: "none"
        }}>
        <strong style={{ fontSize: 13 }}>AI Help Me</strong>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: "16px"
          }}>
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "#f9fafb"
        }}>
        {messages.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>请选择动作或输入问题开始对话。</div>
        ) : null}

        {messages.map((item) => (
          <div
            key={item.id}
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "8px 10px",
              borderRadius: 10,
              lineHeight: 1.45,
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: item.role === "user" ? "#2563eb" : "#ffffff",
              color: item.role === "user" ? "#ffffff" : "#111827",
              border: item.role === "user" ? "none" : "1px solid #e5e7eb"
            }}>
            {item.content}
          </div>
        ))}

        {loading ? <div style={{ color: "#6b7280", fontSize: 12 }}>AI 正在回答...</div> : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 10,
          borderTop: "1px solid #e5e7eb",
          background: "#ffffff"
        }}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
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
          placeholder="继续提问（Enter 发送，Shift+Enter 换行）"
          style={{
            flex: 1,
            minHeight: 56,
            resize: "none",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none"
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
          style={{
            width: 72,
            border: "none",
            borderRadius: 8,
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: 600,
            cursor: "pointer"
          }}>
          发送
        </button>
      </div>
    </div>
  )
}
