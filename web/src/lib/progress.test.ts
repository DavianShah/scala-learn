import { beforeEach, describe, expect, it } from "vitest"
import { loadProgress, saveProgress } from "./progress"

function stubStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  const store = {
    getItem: (k: string) => (data.has(k) ? (data.get(k) as string) : null),
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
  } as unknown as Storage
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = store
  return data
}

describe("progress storage", () => {
  beforeEach(() => stubStorage())

  it("simpan lalu baca kembali, termasuk jawaban kuis dan riwayat sesi", () => {
    saveProgress({
      solved: { a: true },
      openedHints: { a: 1 },
      code: { a: "x" },
      quiz: { "stage-1": { q1: 2 } },
      quizSessions: { "stage-1": [{ score: 80, correct: 8, total: 10, seconds: 95, at: 1 }] },
    })
    expect(loadProgress()).toEqual({
      solved: { a: true },
      openedHints: { a: 1 },
      code: { a: "x" },
      quiz: { "stage-1": { q1: 2 } },
      quizSessions: { "stage-1": [{ score: 80, correct: 8, total: 10, seconds: 95, at: 1 }] },
    })
  })

  it("data rusak -> struktur kosong", () => {
    stubStorage({ "pemroq-progress-v1": "{bukan json" })
    expect(loadProgress()).toEqual({
      solved: {},
      openedHints: {},
      code: {},
      quiz: {},
      quizSessions: {},
    })
  })

  it("progress lama tanpa field quiz/quizSessions diisi default", () => {
    stubStorage({ "pemroq-progress-v1": JSON.stringify({ solved: { b: true } }) })
    expect(loadProgress()).toEqual({
      solved: { b: true },
      openedHints: {},
      code: {},
      quiz: {},
      quizSessions: {},
    })
  })

  it("data lama pemrok-progress-v1 dimigrasi ke pemroq-progress-v1", () => {
    const data = stubStorage({ "pemrok-progress-v1": JSON.stringify({ solved: { c: true } }) })
    expect(loadProgress()).toEqual({
      solved: { c: true },
      openedHints: {},
      code: {},
      quiz: {},
      quizSessions: {},
    })
    expect(data.has("pemroq-progress-v1")).toBe(true)
    expect(data.has("pemrok-progress-v1")).toBe(false)
  })
})
