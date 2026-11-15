import { useId, type ReactNode } from "react"

// Cincin progres SVG: nilai/total, label di tengah. Dipakai sidebar + rail.
export function ProgressRing({
  value,
  total,
  size = 64,
  stroke = 7,
  children,
}: {
  value: number
  total: number
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const gradId = useId()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(1, value / total) : 0
  return (
    <span className="ring" style={{ width: size, height: size }} role="img"
      aria-label={`${value} dari ${total} selesai`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0284c7" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-track"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-fill"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="ring-label">{children}</span>
    </span>
  )
}
