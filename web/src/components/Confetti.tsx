import { useEffect, useRef, useState } from "react"

const COLORS = ["#0ea5e9", "#38bdf8", "#f59e0b", "#818cf8", "#22d3ee"]

interface Piece {
  id: number
  left: number
  delay: number
  color: string
}

// Ledakan konfeti ringan saat sebuah soal lolos semua tes.
export function Confetti({ burstKey }: { burstKey: number }) {
  const [pieces, setPieces] = useState<Piece[]>([])
  const counter = useRef(0)

  useEffect(() => {
    if (!burstKey) return
    const batch = Array.from({ length: 36 }, () => {
      counter.current += 1
      return {
        id: counter.current,
        left: Math.random() * 100,
        delay: Math.random() * 140,
        color: COLORS[counter.current % COLORS.length],
      }
    })
    setPieces(batch)
    const timer = setTimeout(() => setPieces([]), 1150)
    return () => clearTimeout(timer)
  }, [burstKey])

  if (pieces.length === 0) return null

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
