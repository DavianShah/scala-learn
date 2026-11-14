// Ikon dari font Nerd Font subset (public/fonts/icons.woff2).
// Satu glyph = satu ikon. Bukan emoji, bukan SVG berantakan. Lihat DESIGN.md.

export type IconName =
  | "play"
  | "check"
  | "xmark"
  | "lightbulb"
  | "heart"
  | "fire"
  | "bolt"
  | "lock"
  | "cog"
  | "copy"
  | "eye"
  | "download"
  | "upload"
  | "trash"
  | "arrow-right"
  | "arrow-left"
  | "chevron-right"
  | "chevron-down"
  | "trophy"
  | "book"
  | "code"
  | "circle"
  | "circle-blank"
  | "circle-check"
  | "circle-xmark"
  | "star"
  | "graduation-cap"
  | "terminal"
  | "question-circle"
  | "info-circle"
  | "exclamation-circle"
  | "flag"
  | "list"
  | "redo"
  | "keyboard"
  | "spinner"

// Peta glyph Font Awesome di font subset. Kode titik kode desimal.
const GLYPHS: Record<IconName, string> = {
  play: "\uf04b",
  check: "\uf00c",
  xmark: "\uf00d",
  lightbulb: "\uf0eb",
  heart: "\uf004",
  fire: "\uf06d",
  bolt: "\uf0e7",
  lock: "\uf023",
  cog: "\uf013",
  copy: "\uf0c5",
  eye: "\uf06e",
  download: "\uf019",
  upload: "\uf093",
  trash: "\uf1f8",
  "arrow-right": "\uf061",
  "arrow-left": "\uf060",
  "chevron-right": "\uf054",
  "chevron-down": "\uf078",
  trophy: "\uf091",
  book: "\uf02d",
  code: "\uf121",
  circle: "\uf111",
  "circle-blank": "\uf10c",
  "circle-check": "\uf058",
  "circle-xmark": "\uf057",
  star: "\uf005",
  "graduation-cap": "\uf19d",
  terminal: "\uf120",
  "question-circle": "\uf059",
  "info-circle": "\uf05a",
  "exclamation-circle": "\uf06a",
  flag: "\uf024",
  list: "\uf03a",
  redo: "\uf01e",
  keyboard: "\uf11c",
  spinner: "\uf110",
}

export function Icon({
  name,
  size = 16,
  className = "",
  label,
}: {
  name: IconName
  size?: number
  className?: string
  label?: string
}) {
  return (
    <span
      className={`icon${className ? ` ${className}` : ""}`}
      style={{ fontSize: `${size}px` }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {GLYPHS[name]}
    </span>
  )
}
