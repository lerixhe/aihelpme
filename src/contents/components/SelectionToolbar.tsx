import { useMemo, useState, type CSSProperties } from "react"

import type { BuiltInActionId, CustomActionTemplate } from "~/shared/types"

interface Props {
  visible: boolean
  anchor: {
    x: number
    y: number
  } | null
  customActions: CustomActionTemplate[]
  onBuiltInAction: (action: BuiltInActionId) => void
  onCustomAction: (template: string) => void
  onFreeSubmit: (input: string) => void
}

export default function SelectionToolbar({
  visible,
  anchor,
  customActions,
  onBuiltInAction,
  onCustomAction,
  onFreeSubmit
}: Props) {
  const [freeInput, setFreeInput] = useState("")

  const top = useMemo(() => {
    if (!anchor) {
      return 0
    }

    return Math.max(8, anchor.y - 56)
  }, [anchor])

  const left = useMemo(() => {
    if (!anchor) {
      return 0
    }

    return Math.max(8, anchor.x - 160)
  }, [anchor])

  if (!visible || !anchor) {
    return null
  }

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        display: "flex",
        alignItems: "center",
        gap: 8,
        pointerEvents: "auto",
        background: "#111827",
        color: "#ffffff",
        borderRadius: 999,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        padding: "8px 10px",
        fontSize: 12,
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        zIndex: 2147483647,
        maxWidth: "calc(100vw - 16px)",
        overflowX: "auto"
      }}>
      <span
        style={{
          fontWeight: 700,
          padding: "0 4px",
          whiteSpace: "nowrap"
        }}>
        AI Help Me
      </span>

      <button style={buttonStyle} onClick={() => onBuiltInAction("explain")}>
        解释
      </button>
      <button style={buttonStyle} onClick={() => onBuiltInAction("translate")}>
        翻译
      </button>

      {customActions.map((item) => (
        <button key={item.id} style={buttonStyle} onClick={() => onCustomAction(item.template)}>
          {item.label}
        </button>
      ))}

      <input
        value={freeInput}
        onChange={(event) => setFreeInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") {
            return
          }

          const value = freeInput.trim()
          if (!value) {
            return
          }

          onFreeSubmit(value)
          setFreeInput("")
        }}
        placeholder="输入需求后回车"
        style={{
          border: "1px solid rgba(255,255,255,0.3)",
          background: "transparent",
          color: "#ffffff",
          borderRadius: 999,
          padding: "4px 10px",
          outline: "none",
          minWidth: 140,
          fontSize: 12
        }}
      />
    </div>
  )
}

const buttonStyle: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap"
}
