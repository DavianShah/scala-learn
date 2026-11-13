// Progress pelajar di localStorage.
// Kunci id stage/soal tidak pernah berubah setelah tayang.

const KEY = "scala-learn-progress-v1"

export interface Progress {
  solved: Record<string, boolean>
  openedHints: Record<string, number>
  code: Record<string, string>
}

const EMPTY: Progress = { solved: {}, openedHints: {}, code: {} }

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<Progress>
    return {
      solved: parsed.solved ?? {},
      openedHints: parsed.openedHints ?? {},
      code: parsed.code ?? {},
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // localStorage penuh / dinonaktifkan — abaikan, progress tak tersimpan
  }
}

export function resetProgress(): Progress {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* abaikan */
  }
  return { ...EMPTY }
}

export function exportProgress(p: Progress): string {
  return JSON.stringify(p, null, 2)
}

export function importProgress(json: string): Progress | null {
  try {
    const parsed = JSON.parse(json) as Partial<Progress>
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null
    return {
      solved: parsed.solved ?? {},
      openedHints: parsed.openedHints ?? {},
      code: parsed.code ?? {},
    }
  } catch {
    return null
  }
}
