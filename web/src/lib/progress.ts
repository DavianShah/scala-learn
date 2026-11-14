// Progress pelajar di localStorage.
// Kunci id stage/soal tidak pernah berubah setelah tayang.

const KEY = "pemrok-progress-v1"

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

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
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
