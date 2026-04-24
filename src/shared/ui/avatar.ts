export function getServiceInitial(name: string | undefined) {
  const trimmed = name?.trim() ?? ""
  if (!trimmed) {
    return "?"
  }
  return trimmed[0]!.toLocaleUpperCase()
}

export function hashString(value: string) {
  let hash = 0
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return hash
}

export function getAvatarPalette(name: string | undefined, dark: boolean) {
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
