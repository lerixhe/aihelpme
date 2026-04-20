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

function SparkleIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5L12 2Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity={0.15}
      />
      <circle cx="18" cy="5" r="1.5" fill={color} fillOpacity={0.5} />
    </svg>
  )
}

function ChevronIcon({ expanded, color }: { expanded: boolean; color: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      style={{
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: `transform ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
        flexShrink: 0
      }}>
      <path
        d="M3.5 1.5L7 5L3.5 8.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12M12 4L4 12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
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
  const autoExpandedRef = useRef(false)

  useEffect(() => {
    if (isStreaming && !autoExpandedRef.current) {
      autoExpandedRef.current = true
      setExpanded(true)
    }
  }, [isStreaming])

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
          padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
          border: "none",
          background: "transparent",
          color: theme.text.secondary,
          cursor: "pointer",
          fontFamily: uiTypography.fontFamily,
          fontSize: uiTypography.fontSize.sm,
          fontWeight: uiTypography.fontWeight.medium,
          textAlign: "left"
        }}>
        <ChevronIcon expanded={expanded} color={theme.text.secondary} />
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
            lineHeight: 1.55,
            fontSize: uiTypography.fontSize.sm,
            borderLeft: `2px solid ${theme.brand.primary}`,
            marginLeft: uiSpace[12],
            marginRight: uiSpace[4],
            marginBottom: uiSpace[4],
            opacity: 0.85,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
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
  const [closePressed, setClosePressed] = useState(false)
  const [sendPressed, setSendPressed] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)

  const isStreaming = requestState === "streaming"
  const sendDisabled = isStreaming || !input.trim()
  const hasCapturedText = capturedText.length > 0

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [messages, requestState])

  const focusRing = (state: string | null, target: string) =>
    focused === target ? `0 0 0 3px ${theme.accent.primary}33` : "none"

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
        background: theme.bg.overlay,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: uiTypography.fontFamily,
        animation: `unified-overlay-enter 250ms ${uiMotion.easingDecelerate} forwards`
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
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
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
          background-color: rgba(0, 0, 0, 0.12);
          border-radius: 3px;
        }
        [data-messages-scroll]::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Panel */}
      <div
        onClick={(event) => {
          event.stopPropagation()
        }}
        onWheel={(event) => {
          event.stopPropagation()
        }}
        style={{
          width: 680,
          maxWidth: "calc(100vw - 32px)",
          height: "min(70vh, calc(100vh - 32px))",
          display: "flex",
          flexDirection: "column",
          background: theme.bg.surface,
          borderRadius: uiRadius.xl,
          border: `0.5px solid ${theme.border.hairline}`,
          boxShadow: uiShadow.xl,
          overflow: "hidden",
          animation: `unified-panel-enter 350ms ${uiMotion.easingSpring} forwards`
        }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${uiSpace[12]}px ${uiSpace[16]}px`,
            borderBottom: `0.5px solid ${theme.border.hairline}`,
            flexShrink: 0
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: uiSpace[10] }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.brand.primary})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
              <SparkleIcon size={16} color={theme.text.inverse} />
            </div>
            <span
              style={{
                fontWeight: uiTypography.fontWeight.semibold,
                fontSize: uiTypography.fontSize.xxl,
                letterSpacing: uiTypography.letterSpacing.tight,
                color: theme.text.primary
              }}>
              AI Help Me
            </span>
          </div>
          <button
            onClick={onClose}
            onMouseDown={() => setClosePressed(true)}
            onMouseUp={() => setClosePressed(false)}
            onFocus={() => setFocused("close")}
            onBlur={() => setFocused(null)}
            aria-label="关闭对话面板"
            style={{
              border: "none",
              background: hovered === "close" ? theme.bg.surfaceMuted : "transparent",
              color: theme.text.secondary,
              cursor: "pointer",
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              outline: "none",
              transform: closePressed ? "scale(0.9)" : "scale(1)",
              boxShadow: focused === "close" ? `0 0 0 3px ${theme.accent.primary}33` : "none",
              transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
            }}
            onMouseEnter={() => setHovered("close")}
            onMouseLeave={() => {
              setHovered(null)
              setClosePressed(false)
            }}>
            <CloseIcon size={14} color={theme.text.secondary} />
          </button>
        </div>

        {/* Captured text section */}
        {hasCapturedText && (
          <div
            style={{
              padding: `${uiSpace[10]}px ${uiSpace[16]}px`,
              borderBottom: `0.5px solid ${theme.border.hairline}`,
              flexShrink: 0
            }}>
            <div
              style={{
                fontSize: uiTypography.fontSize.xs,
                fontWeight: uiTypography.fontWeight.medium,
                color: theme.text.secondary,
                marginBottom: uiSpace[6],
                letterSpacing: uiTypography.letterSpacing.wide,
                textTransform: "uppercase"
              }}>
              选中文本
            </div>
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
                border: "none",
                background: theme.bg.surfaceMuted,
                color: theme.text.primary,
                borderRadius: uiRadius.sm,
                padding: `${uiSpace[8]}px ${uiSpace[12]}px`,
                boxShadow: focusRing(focused, "captured"),
                outline: "none",
                fontSize: uiTypography.fontSize.md,
                fontFamily: "inherit",
                lineHeight: 1.55,
                transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
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
            padding: uiSpace[16],
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
                padding: `${uiSpace[16]}px ${uiSpace[20]}px`,
                textAlign: "center",
                lineHeight: 1.55
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
                lineHeight: 1.55,
                fontSize: uiTypography.fontSize.md,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                background: item.role === "user" ? theme.accent.primary : theme.bg.surface,
                color: item.role === "user" ? theme.text.inverse : theme.text.primary,
                border: item.role === "user" ? "none" : `0.5px solid ${theme.border.hairline}`,
                boxShadow: item.role === "user" ? uiShadow.sm : uiShadow.sm,
                animation: `message-enter 300ms ${uiMotion.easingDecelerate} forwards`,
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
                    padding: `${uiSpace[10]}px ${uiSpace[14]}px`,
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
                padding: `${uiSpace[8]}px ${uiSpace[14]}px`,
                borderRadius: uiRadius.md,
                background: theme.bg.surface,
                border: `0.5px solid ${theme.border.hairline}`,
                display: "flex",
                alignItems: "center",
                gap: uiSpace[8]
              }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: theme.accent.primary,
                  animation: "thinking-pulse 1s ease-in-out infinite",
                  display: "inline-block"
                }}
              />
              AI 正在生成中…
            </div>
          ) : null}
        </div>

        {/* Input area */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: uiSpace[10],
            padding: `${uiSpace[12]}px ${uiSpace[16]}px`,
            borderTop: `0.5px solid ${theme.border.hairline}`,
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
              borderRadius: uiRadius.md,
              border: "none",
              background: theme.bg.surfaceMuted,
              color: theme.text.primary,
              padding: `${uiSpace[10]}px ${uiSpace[14]}px`,
              fontSize: uiTypography.fontSize.md,
              fontFamily: "inherit",
              lineHeight: 1.5,
              outline: "none",
              boxShadow: focusRing(focused, "input"),
              transition: `box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`
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
            onMouseLeave={() => {
              setHovered(null)
              setSendPressed(false)
            }}
            onMouseDown={() => setSendPressed(true)}
            onMouseUp={() => setSendPressed(false)}
            onFocus={() => setFocused("send")}
            onBlur={() => setFocused(null)}
            disabled={sendDisabled && !isStreaming}
            style={{
              height: 36,
              minWidth: 72,
              alignSelf: "flex-end",
              border: "none",
              borderRadius: uiRadius.pill,
              background: isStreaming
                ? theme.bg.surfaceMuted
                : sendDisabled
                  ? theme.state.disabled
                  : hovered === "send"
                    ? theme.accent.primaryHover
                    : theme.accent.primary,
              color: isStreaming ? theme.text.primary : theme.text.inverse,
              fontWeight: uiTypography.fontWeight.semibold,
              fontSize: uiTypography.fontSize.md,
              fontFamily: uiTypography.fontFamily,
              cursor: isStreaming ? "pointer" : sendDisabled ? "not-allowed" : "pointer",
              opacity: sendDisabled && !isStreaming ? 0.5 : 1,
              transform: sendPressed ? "scale(0.95)" : "scale(1)",
              boxShadow: focused === "send" ? `0 0 0 3px ${theme.accent.primary}33` : "none",
              transition: `background ${uiMotion.durationFast} ${uiMotion.easingStandard}, opacity ${uiMotion.durationFast} ${uiMotion.easingStandard}, transform 150ms ${uiMotion.easingSpring}, box-shadow ${uiMotion.durationFast} ${uiMotion.easingStandard}`,
              padding: `0 ${uiSpace[16]}px`
            }}>
            {isStreaming ? "停止" : "发送"}
          </button>
        </div>
      </div>
    </div>
  )
}
