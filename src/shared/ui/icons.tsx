interface IconProps {
  size: number
}

export function BrandIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="prismIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <clipPath id="prismClip">
          <rect width="32" height="32" rx="8" />
        </clipPath>
      </defs>
      <g clipPath="url(#prismClip)">
        <rect width="32" height="32" fill="url(#prismIconGrad)" />
        <polygon points="16,5 24,16 16,14" fill="#93C5FD" />
        <polygon points="16,5 16,14 8,16" fill="#DBEAFE" />
        <polygon points="16,14 24,16 21,26 16,22" fill="#2563EB" />
        <polygon points="16,14 16,22 11,26 8,16" fill="#3B82F6" />
      </g>
    </svg>
  )
}
