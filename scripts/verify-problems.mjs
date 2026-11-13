#!/usr/bin/env node
// verify-problems: untuk tiap soal, `solution` harus lulus semua test
// dan `starter` harus gagal minimal satu. Diulang 2x (anti-flaky).
// Kode dijalankan di sandbox Judge0 CE (Scala 3.4.2).
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const stagesDir = join(repoRoot, "content", "stages")

const JUDGE0 = "https://ce.judge0.com/submissions?wait=true&base64_encoded=false"
const LANG = 112 // Scala 3.4.2
const CONCURRENCY = 3
const REPEATS = 2

const norm = (s) => s.replace(/\r\n/g, "\n").trim()

async function run(code, stdin) {
  const res = await fetch(JUDGE0, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      language_id: LANG,
      source_code: code,
      stdin,
      cpu_time_limit: 5,
      wall_time_limit: 10,
      memory_limit: 512000,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const d = await res.json()
  return { status: d?.status?.description ?? "Unknown", stdout: d?.stdout ?? "" }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

function loadStages(filter) {
  const stages = []
  for (const slug of readdirSync(stagesDir).sort()) {
    const p = join(stagesDir, slug, "stage.json")
    try {
      const stage = JSON.parse(readFileSync(p, "utf8"))
      if (!filter || stage.id === filter || stage.slug === filter) stages.push(stage)
    } catch (e) {
      console.error(`GAGAL baca ${p}: ${e.message}`)
    }
  }
  return stages
}

async function main() {
  const filter = process.argv.slice(2).find((a) => !a.startsWith("-"))
  const stages = loadStages(filter)
  if (stages.length === 0) {
    console.error("Tidak ada stage cocok.")
    process.exit(1)
  }

  let fail = 0
  for (const stage of stages) {
    for (const problem of stage.problems) {
      const label = `${stage.id}/${problem.id}`
      const solutionRuns = await mapLimit(problem.tests, CONCURRENCY, async (t) => {
        const results = []
        for (let r = 0; r < REPEATS; r++) results.push(await run(problem.solution, t.input))
        return results
      })

      const solutionFails = []
      problem.tests.forEach((t, i) => {
        const runs = solutionRuns[i]
        runs.forEach((r, k) => {
          if (r.status !== "Accepted" || norm(r.stdout) !== norm(t.expected)) {
            solutionFails.push(
              `  test ${i + 1} (ulangan ${k + 1}): status=${r.status} stdout=${JSON.stringify(
                norm(r.stdout),
              )} expected=${JSON.stringify(norm(t.expected))}`,
            )
          }
        })
      })

      const starterRuns = await mapLimit(problem.tests, CONCURRENCY, (t) => run(problem.starter, t.input))
      const starterPasses = problem.tests.filter(
        (t, i) => starterRuns[i].status === "Accepted" && norm(starterRuns[i].stdout) === norm(t.expected),
      ).length
      const starterFails = problem.tests.length - starterPasses

      if (solutionFails.length > 0) {
        fail++
        console.log(`❌ ${label} — solution TIDAK lulus semua test`)
        solutionFails.forEach((f) => console.log(f))
      } else if (starterFails === 0) {
        fail++
        console.log(`⚠️  ${label} — starter justru lulus semua test (soal terlalu mudah)`)
      } else {
        console.log(`✅ ${label} — solution lulus ${problem.tests.length} test, starter gagal ${starterFails}`)
      }
    }
  }

  console.log(fail === 0 ? "\nSemua soal lolos verifikasi." : `\n${fail} soal bermasalah.`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("verify-problems error:", e)
  process.exit(1)
})
