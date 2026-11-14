// Progress pelajar di localStorage.
// Kunci id stage/soal tidak pernah berubah setelah tayang.

const KEY = "pemroq-progress-v1"
const LEGACY_KEY = "pemrok-progress-v1"

export interface QuizSessionRecord {
  score: number
  correct: number
  total: number
  seconds: number
  at: number
}

export interface Progress {
  solved: Record<string, boolean>
  openedHints: Record<string, number>
  code: Record<string, string>
  quiz: Record<string, Record<string, number>>
  quizSessions: Record<string, QuizSessionRecord[]>
}

const EMPTY: Progress = {
  solved: {},
  openedHints: {},
  code: {},
  quiz: {},
  quizSessions: {},
}

function readRaw(): string | null {
  const fresh = localStorage.getItem(KEY)
  if (fresh !== null) return fresh
  const legacy = localStorage.getItem(LEGACY_KEY)
  if (legacy !== null) {
    try {
      localStorage.setItem(KEY, legacy)
      localStorage.removeItem(LEGACY_KEY)
    } catch {
      /* localStorage penuh / dinonaktifkan */
    }
    return legacy
  }
  return null
}

export function loadProgress(): Progress {
  try {
    const raw = readRaw()
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      solved: parsed.solved ?? {},
      openedHints: parsed.openedHints ?? {},
      code: parsed.code ?? {},
      quiz: parsed.quiz ?? {},
      quizSessions: parsed.quizSessions ?? {},
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // localStorage penuh / dinonaktifkan, abaikan, progress tak tersimpan
  }
}
