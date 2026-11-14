import { useEffect, useState } from "react"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%&*+-"
const INTERVAL_MS = 5000
const DURATION = 850

/**
 * Teks yang "terkunci" huruf per huruf (scramble): acak pas halaman dibuka,
 * diam, lalu diacak lagi tiap 5 detik. Hover juga memicu animasi baru.
 */
export function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text)
      return
    }

    let raf = 0
    const start = performance.now()

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      const settled = Math.floor(text.length * p)
      let out = ""
      for (let i = 0; i < text.length; i++) {
        out += i < settled ? text[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setDisplay(out)
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    const id = window.setInterval(() => setNonce((n) => n + 1), INTERVAL_MS)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(id)
    }
  }, [text, nonce])

  return (
    <span
      className={className}
      aria-label={text}
      onMouseEnter={() => setNonce((n) => n + 1)}
    >
      {display}
    </span>
  )
}
