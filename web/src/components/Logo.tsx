// Logo Pemrok: tiga balok bertumpuk dalam kotak membulat.
// Sengaja simetris dan tidak miring. Lihat DESIGN.md.

export function LogoMark({ size = 32 }: { size?: number }) {
  const raw = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  const gid = `pemrok-g-${raw.replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22c55e" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
      <rect x="16" y="17" width="32" height="6.8" rx="3.4" fill="#ffffff" />
      <rect x="16" y="28.6" width="22" height="6.8" rx="3.4" fill="#ffffff" opacity="0.88" />
      <rect x="16" y="40.2" width="28" height="6.8" rx="3.4" fill="#ffffff" opacity="0.72" />
    </svg>
  )
}
