import type { Stage } from "./types"

// Baca semua content/stages/*/stage.json saat build.
// Root repo satu level di atas web/.
const modules = import.meta.glob<Stage>("../../../content/stages/*/stage.json", {
  eager: true,
  import: "default",
})

export const stages: Stage[] = Object.values(modules)
  .filter((s) => s.status === "published")
  .sort((a, b) => a.order - b.order)

export function getStage(id: string): Stage | undefined {
  return stages.find((s) => s.id === id)
}

export function nextStageId(id: string): string | null {
  const i = stages.findIndex((s) => s.id === id)
  return i >= 0 && i < stages.length - 1 ? stages[i + 1].id : null
}
