// Efek suara antarmuka. File pendek di public/sounds.
// Browser menahan audio sampai ada interaksi user, jadi panggilan pertama
// bisa saja tak bersuara. Itu normal, bukan bug.

export type SoundName = "solve" | "wrong" | "cheer"

const FILES: Record<SoundName, string> = {
  solve: "/sounds/solve.mp3",
  wrong: "/sounds/wrong.mp3",
  cheer: "/sounds/cheer.mp3",
}

const cache = new Map<SoundName, HTMLAudioElement>()

export function playSound(name: SoundName): void {
  try {
    // Hentikan suara lain supaya tak ada tumpang tindih / bunyi "random".
    for (const [key, el] of cache) {
      if (key !== name) {
        el.pause()
        el.currentTime = 0
      }
    }
    let el = cache.get(name)
    if (!el) {
      el = new Audio(FILES[name])
      el.preload = "auto"
      cache.set(name, el)
    }
    el.currentTime = 0
    void el.play().catch(() => {
      /* autoplay ditolak browser: abaikan */
    })
  } catch {
    /* Audio tak tersedia: abaikan */
  }
}
