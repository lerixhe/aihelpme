import { useEffect, useRef, useState } from "react"

import { useUiTheme } from "~/shared/ui/theme"
import { uiMotion, uiRadius, uiShadow, uiSpace, uiTypography, uiLayer } from "~/shared/ui/tokens"
import type { ChatMessage } from "~/shared/types"

interface Props {
  capturedText: string
  messages: ChatMessage[]
  requestState: "idle" | "streaming" | "cancelled" | "failed"
  onCapturedTextChange: (text: string) => void
  onSend: (input: string) => void
  onStop: () => void
  onClose: () => void
}

const SPARKLE_PATHS = [
  "M12 2C12.5523 2 13 2.44772 13 3V4.20051C13 4.61472 13.2632 4.98551 13.6558 5.12582L14.5673 5.45293C15.1189 5.64711 15.3536 6.30719 15.0133 6.77472L14.4048 7.60849C14.1673 7.9349 14.1673 8.37937 14.4048 8.70578L15.0133 9.53955C15.3536 10.0071 15.1189 10.6672 14.5673 10.8613L13.6558 11.1885C13.2632 11.3288 13 11.6996 13 12.1138V13.3143C13 13.7285 12.7368 14.0993 12.3442 14.2396L11.4327 14.5667C10.8811 14.7609 10.6464 15.421 10.9867 15.8885L11.5952 16.7223C11.8327 17.0487 11.8327 17.4932 11.5952 17.8196L10.9867 18.6534C10.6464 19.1209 10.8811 19.781 11.4327 19.9752L12.3442 20.3023C12.7368 20.4426 13 20.8134 13 21.2276V22.4281C13 22.8423 12.7368 23.2131 12.3442 23.3534L11.4327 23.6805C10.8811 23.8747 10.6464 24.5348 10.9867 25.0023L11.5952 25.8361C11.8327 26.1625 11.8327 26.607 11.5952 26.9334L10.9867 27.7672C10.6464 28.2347 10.8811 28.8948 11.4327 29.089L12.3442 29.4161C12.7368 29.5564 13 29.9272 13 30.3414V31",
  "M12 7L13.2 10.8H17L14 13L15.2 16.8L12 14.6L8.8 16.8L10 13L7 10.8H10.8L12 7Z"
]

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {SPARKLE_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={i === 1 ? color : undefined}
          fillOpacity={i === 1 ? 0.15 : undefined}
        />
      ))}
      <circle cx="18" cy="6" r="2.5" fill={color} fillOpacity={0.6} />
    </svg>
  )
}

interface ThinkingTheme {
  text: { secondary: string; primary: string }
  bg: { surfaceMuted: string; surface: string }
  border: { subtle: string }
  brand: { primary: string }
}

function ThinkingBlock({
  reasoning,
  isStreaming,
  theme
}: {
  reasoning: string
  isStreaming: boolean
  theme: ThinkingTheme
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.border.subtle}`,
        fontSize: uiTypography.fontSize.sm
      }}>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: uiSpace[6],
          width: "100%",
          padding: `${uiSpace[6]}px ${uiSpace[12]}px`,
          border: "none",
          background: "transparent",
          color: theme.text.secondary,
          cursor: "pointer",
          fontFamily: uiTypography.fontFamily,
          fontSize: uiTypography.fontSize.sm,
          fontWeight: uiTypography.fontWeight.medium,
          textAlign: "left"
        }}>
        <span
          style={{
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: `transform ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
            fontSize: 10
          }}>
          ▶
        </span>
        {isStreaming ? "思考中…" : "思考过程"}
        {isStreaming ? (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: theme.brand.primary,
              animation: "thinking-pulse 1s ease-in-out infinite",
              display: "inline-block"
            }}
          />
        ) : null}
      </button>
      {expanded ? (
        <div
          style={{
            padding: `0 ${uiSpace[12]}px ${uiSpace[8]}px`,
            color: theme.text.secondary,
            lineHeight: 1.5,
            fontSize: uiTypography.fontSize.sm,
            borderLeft: `2px solid ${theme.brand.primary}`,
            marginLeft: uiSpace[12],
            marginRight: uiSpace[4],
            marginBottom: uiSpace[4],
            opacity: 0.85
          }}>
          {reasoning}
        </div>
      ) : null}
      <style>{`
        @keyframes thinking-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function UnifiedPanel({
  capturedText,
  messages,
  requestState,
  onCapturedTextChange,
  onSend,
  onStop,
  onClose
}: Props) {
  const theme = useUiTheme()
  const [input, setInput] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const isStreaming = requestState === "streaming"
  const sendDisabled = isStreaming || !input.trim()
  const hasCapturedText = capturedText.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages, requestState])

  const sendButtonShadow = focused === "send" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none"

  return (
    <div
      onKeyDownCapture={(event) => {
        if (event.key !== "Escape") {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        onClose()
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: uiLayer.overlay,
        pointerEvents: "auto",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: uiTypography.fontFamily,
        animation: "unified-overlay-enter 0.25s ease-out forwards"
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}>
      <style>{`
        @keyframes unified-overlay-enter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes unified-panel-enter {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes message-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        [data-messages-scroll]::-webkit-scrollbar {
          width: 6px;
        }
        [data-messages-scroll]::-webkit-scrollbar-track {
          background: transparent;
        }
        [data-messages-scroll]::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.15);
          border-radius: 3px;
        }
        [data-messages-scroll]::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.25);
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div
        onClick={(event) => {
          event.stopPropagation()
        }}
        onWheel={(event) => {
          // Prevent wheel events from leaking to the host page
          event.stopPropagation()
        }}
        style={{
          width: 680,
          maxWidth: "calc(100vw - 32px)",
          height: "min(70vh, calc(100vh - 32px))",
          display: "flex",
          flexDirection: "column",
          background: theme.bg.surface,
          borderRadius: uiRadius.lg,
          boxShadow: uiShadow.lg,
          overflow: "hidden",
          animation: `unified-panel-enter 0.3s ${uiMotion.easingSpring} forwards`
        }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
            borderBottom: `1px solid ${theme.border.subtle}`,
            flexShrink: 0
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: uiSpace[8] }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.brand.primary}, ${theme.brand.primaryHover})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
              <SparkleIcon size={14} color={theme.text.inverse} />
            </div>
            <span
              style={{
                fontWeight: uiTypography.fontWeight.bold,
                fontSize: uiTypography.fontSize.md,
                letterSpacing: "-0.01em",
                color: theme.brand.primary
              }}>
              AI Help Me
            </span>
          </div>
          <button
            onClick={onClose}
            onFocus={() => setFocused("close")}
            onBlur={() => setFocused(null)}
            aria-label="关闭对话面板"
            style={{
              border: "none",
              background: "transparent",
              color: theme.text.secondary,
              cursor: "pointer",
              width: 24,
              height: 24,
              borderRadius: uiRadius.sm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
              outline: "none",
              boxShadow: focused === "close" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
              transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = theme.bg.surfaceMuted
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "transparent"
            }}>
            ×
          </button>
        </div>

        {/* Captured text section */}
        {hasCapturedText && (
          <div
            style={{
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              borderBottom: `1px solid ${theme.border.subtle}`,
              flexShrink: 0
            }}>
            <textarea
              value={capturedText}
              onChange={(event) => onCapturedTextChange(event.target.value)}
              onFocus={() => setFocused("captured")}
              onBlur={() => setFocused(null)}
              rows={3}
              aria-label="已捕获的选区文本"
              placeholder="选中文本将显示在这里..."
              style={{
                width: "100%",
                resize: "vertical",
                border: `1px solid ${focused === "captured" ? theme.brand.primary : theme.border.default}`,
                background: theme.bg.surfaceAlt,
                color: theme.text.primary,
                borderRadius: uiRadius.md,
                padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                boxShadow: focused === "captured" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
                outline: "none",
                fontSize: uiTypography.fontSize.md,
                fontFamily: "inherit",
                lineHeight: 1.5,
                transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
                boxSizing: "border-box"
              }}
            />
          </div>
        )}



        {/* Messages area */}
        <div
          ref={messagesContainerRef}
          data-messages-scroll
          style={{
            flex: 1,
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: uiSpace[12],
            display: "block",
            background: theme.bg.surfaceAlt,
            minHeight: 0
          }}>
          {messages.length === 0 ? (
            <div
              style={{
                color: theme.text.secondary,
                fontSize: uiTypography.fontSize.md,
                border: `1px dashed ${theme.border.default}`,
                borderRadius: uiRadius.md,
                background: theme.bg.surface,
                padding: uiSpace[16]
              }}>
              {hasCapturedText
                ? "选中文本已捕获，点击动作按钮开始对话。"
                : "请选择动作，或直接输入一个问题开始对话。"}
            </div>
          ) : null}

          {messages.map((item) => (
            <div
              key={item.id}
              style={{
                display: "block",
                marginLeft: item.role === "user" ? "auto" : undefined,
                maxWidth: "85%",
                marginBottom: uiSpace[12],
                borderRadius: uiRadius.md,
                lineHeight: 1.5,
                fontSize: uiTypography.fontSize.md,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: item.role === "user" ? theme.brand.primary : theme.bg.surface,
                color: item.role === "user" ? theme.text.inverse : theme.text.primary,
                border: item.role === "user" ? "none" : `1px solid ${theme.border.default}`,
                boxShadow: item.role === "user" ? "none" : uiShadow.sm,
                animation: `message-enter 0.3s ${uiMotion.easingEnter} forwards`,
                overflow: "hidden"
              }}>
              {item.role === "assistant" && item.reasoning_content ? (
                <ThinkingBlock
                  reasoning={item.reasoning_content}
                  isStreaming={isStreaming && !item.content}
                  theme={theme}
                />
              ) : null}
              {item.content ? (
                <div
                  style={{
                    padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                    overflowWrap: "break-word",
                    wordBreak: "break-word"
                  }}>
                  {item.content}
                </div>
              ) : null}
            </div>
          ))}

          {isStreaming ? (
            <div
              style={{
                color: theme.text.secondary,
                fontSize: uiTypography.fontSize.sm,
                padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                borderRadius: uiRadius.md,
                background: theme.bg.surface,
                border: `1px solid ${theme.border.default}`
              }}>
              AI 正在生成中…
            </div>
          ) : null}
        </div>

        {/* Input area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: uiSpace[8],
            padding: uiSpace[12],
            borderTop: `1px solid ${theme.border.default}`,
            background: theme.bg.surface,
            flexShrink: 0
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
              if (!value || isStreaming) {
                return
              }

              onSend(value)
              setInput("")
            }}
            aria-label="在对话面板中继续提问"
            placeholder="继续提问（Enter 发送，Shift+Enter 换行）"
            style={{
              flex: 1,
              minHeight: 56,
              resize: "none",
              borderRadius: uiRadius.sm,
              border: `1px solid ${focused === "input" ? theme.brand.primary : theme.border.default}`,
              background: theme.bg.surfaceAlt,
              color: theme.text.primary,
              padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
              fontSize: uiTypography.fontSize.md,
              fontFamily: "inherit",
              lineHeight: 1.45,
              outline: "none",
              boxShadow: focused === "input" ? `0 0 0 2px ${theme.bg.surface}, 0 0 0 4px ${theme.brand.primary}` : "none",
              transition: `border-color ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}
          />
          <button
            onClick={() => {
              if (isStreaming) {
                onStop()
                return
              }

              const value = input.trim()
              if (!value) {
                return
              }

              onSend(value)
              setInput("")
            }}
            onMouseEnter={() => setHovered("send")}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused("send")}
            onBlur={() => setFocused(null)}
            disabled={sendDisabled && !isStreaming}
            style={{
              width: 96,
              border: "none",
              borderRadius: uiRadius.sm,
              background: isStreaming
                ? hovered === "send"
                  ? theme.bg.page
                  : theme.bg.surfaceMuted
                : sendDisabled
                  ? theme.state.disabled
                  : hovered === "send"
                    ? theme.brand.primaryHover
                    : theme.brand.primary,
              color: theme.text.inverse,
              fontWeight: uiTypography.fontWeight.semibold,
              cursor: isStreaming ? "pointer" : sendDisabled ? "not-allowed" : "pointer",
              opacity: sendDisabled && !isStreaming ? 0.72 : 1,
              boxShadow: sendButtonShadow,
              transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}>
            {isStreaming ? "停止" : "发送"}
          </button>
        </div>
      </div>
    </div>
  )
}
