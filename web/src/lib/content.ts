import type { QuizQuestion, Stage } from "./types"

// Baca semua content/stages/*/stage.json, quiz.json, dan quiz-bank.json saat build.
// Root repo satu level di atas web/.
const stageModules = import.meta.glob<Stage>("../../../content/stages/*/stage.json", {
  eager: true,
  import: "default",
})

const quizModules = import.meta.glob<{
  stage: string
  questions: QuizQuestion[]
}>("../../../content/stages/*/quiz.json", { eager: true, import: "default" })

const bankModules = import.meta.glob<{
  stage: string
  questions: QuizQuestion[]
}>("../../../content/stages/*/quiz-bank.json", { eager: true, import: "default" })

function byStage(mods: Record<string, unknown>): Record<string, QuizQuestion[]> {
  const out: Record<string, QuizQuestion[]> = {}
  for (const mod of Object.values(mods)) {
    if (mod && typeof mod === "object" && Array.isArray((mod as { questions?: unknown }).questions)) {
      const m = mod as { stage: string; questions: QuizQuestion[] }
      if (m.stage && m.questions.length > 0) out[m.stage] = m.questions
    }
  }
  return out
}

const quizzes = byStage(quizModules as Record<string, unknown>)
const banks = byStage(bankModules as Record<string, unknown>)

function mergeQuestions(base: QuizQuestion[], extra: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set(base.map((q) => q.id))
  const merged = [...base]
  for (const q of extra) {
    if (!seen.has(q.id)) {
      merged.push(q)
      seen.add(q.id)
    }
  }
  return merged
}

export const stages: Stage[] = Object.values(stageModules)
  .filter((s) => s.status === "published")
  .sort((a, b) => a.order - b.order)
  .map((s) => ({
    ...s,
    quiz: mergeQuestions(quizzes[s.id] ?? [], banks[s.id] ?? []),
  }))

export function getStage(id: string): Stage | undefined {
  return stages.find((s) => s.id === id)
}

export function nextStageId(id: string): string | null {
  const i = stages.findIndex((s) => s.id === id)
  return i >= 0 && i < stages.length - 1 ? stages[i + 1].id : null
}
