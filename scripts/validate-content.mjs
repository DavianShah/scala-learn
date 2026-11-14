#!/usr/bin/env node
// validate-content: cek skema + semantik stage.json.
// Tidak menyentuh network — murni statik.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const stagesDir = join(repoRoot, "content", "stages")

const errors = []
const warn = []

function err(stage, msg) {
  errors.push(`${stage}: ${msg}`)
}
function warn_(stage, msg) {
  warn.push(`${stage}: ${msg}`)
}

const REQUIRED_STAGE = [
  "id",
  "order",
  "slug",
  "title",
  "week",
  "course",
  "concepts",
  "prerequisites",
  "objectives",
  "lesson",
  "problems",
  "status",
]

const stages = []
const problemIds = new Set()
const stageIds = new Set()

for (const slug of readdirSync(stagesDir).sort()) {
  const p = join(stagesDir, slug, "stage.json")
  let stage
  try {
    stage = JSON.parse(readFileSync(p, "utf8"))
  } catch (e) {
    errors.push(`${slug}: JSON tidak valid — ${e.message}`)
    continue
  }
  const label = stage.id ?? slug

  for (const k of REQUIRED_STAGE) {
    if (!(k in stage)) err(label, `field '${k}' tidak ada`)
  }
  const prefix = String(stage.order).padStart(2, "0")
  if (stage.slug !== slug && slug !== `${prefix}-${stage.slug}`)
    err(label, `slug '${stage.slug}' tidak cocok dengan nama folder '${slug}'`)
  if (stage.status !== "published") warn_(label, `status '${stage.status}' (belum tayang)`)
  if (stageIds.has(stage.id)) err(label, `id '${stage.id}' duplikat`)
  stageIds.add(stage.id)

  if (!Array.isArray(stage.concepts) || stage.concepts.length === 0) err(label, "concepts kosong")
  if (new Set(stage.concepts).size !== stage.concepts.length) err(label, "concepts duplikat")
  if (!Array.isArray(stage.sources) || stage.sources.length === 0)
    err(label, "sources kosong (wajib isi — AGENTS.md aturan 3)")
  if (!stage.summary) warn_(label, "summary belum diisi")
  if (!Array.isArray(stage.objectives) || stage.objectives.length === 0)
    err(label, "objectives kosong")

  for (const pre of stage.prerequisites ?? []) {
    if (!pre.startsWith("stage-")) err(label, `prerequisite '${pre}' bukan id stage`)
  }

  const kinds = (stage.lesson ?? []).map((b) => b.type)
  if (!kinds.includes("text")) err(label, "lesson tidak punya blok text")
  if (!kinds.includes("code")) err(label, "lesson tidak punya blok code")
  if (!kinds.includes("recap")) err(label, "lesson tidak punya blok recap")

  for (const [i, b] of (stage.lesson ?? []).entries()) {
    if (b.type === "code") {
      if (!b.code || !b.code.includes("object Main"))
        err(label, `lesson[${i}] code harus berisi 'object Main'`)
      if (b.runnable === true && b.output === undefined)
        err(label, `lesson[${i}] runnable butuh 'output'`)
    } else if (b.type === "recap") {
      if (!Array.isArray(b.items) || b.items.length !== 3)
        err(label, `lesson[${i}] recap harus tepat 3 item`)
    } else if (b.type === "text" || b.type === "pitfall") {
      if (!b.body) err(label, `lesson[${i}] (${b.type}) body kosong`)
    } else {
      err(label, `lesson[${i}] tipe tak dikenal: ${b.type}`)
    }
  }

  if (stage.problems.length > 3)
    err(label, `jumlah soal ${stage.problems.length} (maks 3)`)
  if (stage.problems.length === 0)
    warn_(label, "coming soon: belum ada soal praktik")

  for (const prob of stage.problems) {
    const plabel = `${label}/${prob.id}`
    for (const k of ["id", "title", "statement", "difficulty", "starter", "solution", "explanation", "hints", "tests"]) {
      if (!(k in prob)) err(plabel, `field '${k}' tidak ada`)
    }
    if (problemIds.has(prob.id)) err(plabel, "id duplikat")
    problemIds.add(prob.id)
    if (!prob.id.startsWith(stage.id + "-")) err(plabel, `id harus diawali '${stage.id}-'`)
    if (![1, 2].includes(prob.difficulty)) err(plabel, `difficulty harus 1 atau 2`)
    if (prob.starter === prob.solution) err(plabel, "starter sama dengan solution")
    if (prob.starter.length < 10) err(plabel, "starter terlalu pendek")
    if (!prob.explanation || prob.explanation.split(/[.!?]/).filter(Boolean).length < 2)
      warn_(plabel, "explanation sebaiknya 2-5 kalimat")
    if (!Array.isArray(prob.hints) || prob.hints.length !== 3)
      err(plabel, `hints harus tepat 3 (ada ${prob.hints?.length})`)
    if (!Array.isArray(prob.tests) || prob.tests.length < 3)
      err(plabel, `tests minimal 3 (ada ${prob.tests?.length})`)
    if (Array.isArray(prob.tests)) {
      if (!prob.tests.some((t) => t.hidden)) err(plabel, "tests tidak punya hidden")
      for (const [i, t] of prob.tests.entries()) {
        if (typeof t.input !== "string") err(plabel, `tests[${i}].input bukan string`)
        if (typeof t.expected !== "string") err(plabel, `tests[${i}].expected bukan string`)
        if (typeof t.hidden !== "boolean") err(plabel, `tests[${i}].hidden bukan boolean`)
      }
    }
  }
  stages.push(stage)
}

// urutan & prasyarat
const orders = stages.map((s) => s.order).sort((a, b) => a - b)
for (let i = 0; i < orders.length; i++) {
  if (orders[i] !== i + 1) warn_(stages.find((s) => s.order === orders[i])?.id ?? "?", `order tidak berurutan (order=${orders[i]})`)
}
for (const s of stages) {
  for (const pre of s.prerequisites ?? []) {
    if (!stageIds.has(pre)) err(s.id, `prerequisite '${pre}' tidak ada`)
  }
}

console.log(`Stage dibaca: ${stages.length}, soal: ${problemIds.size}`)
if (warn.length) {
  console.log(`\nPeringatan (${warn.length}):`)
  warn.forEach((w) => console.log(`  ⚠️  ${w}`))
}
if (errors.length) {
  console.log(`\nError (${errors.length}):`)
  errors.forEach((e) => console.log(`  ❌ ${e}`))
  process.exit(1)
}
console.log("\nValidasi konten lolos.")
