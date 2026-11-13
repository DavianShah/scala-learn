#!/usr/bin/env node
// verify-lesson-code: jalankan semua blok `runnable: true` di materi dan
// cocokkan dengan `output`. Kode dijalankan di sandbox Judge0 CE.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = fileURLToPath(new URL("..", import.meta.url))
const stagesDir = join(repoRoot, "content", "stages")

const JUDGE0 = "https://ce.judge0.com/submissions?wait=true&base64_encoded=false"
const LANG = 112

const norm = (s) => s.replace(/\r\n/g, "\n").trim()

async function run(code) {
  const res = await fetch(JUDGE0, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      language_id: LANG,
      source_code: code,
      stdin: "",
      cpu_time_limit: 5,
      wall_time_limit: 10,
      memory_limit: 512000,
    }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const d = await res.json()
  return { status: d?.status?.description ?? "Unknown", stdout: d?.stdout ?? "", stderr: d?.stderr ?? "" }
}

async function main() {
  const blocks = []
  for (const slug of readdirSync(stagesDir).sort()) {
    const stage = JSON.parse(readFileSync(join(stagesDir, slug, "stage.json"), "utf8"))
    stage.lesson.forEach((b, i) => {
      if (b.type === "code" && b.runnable === true) blocks.push({ stage: stage.id, i, ...b })
    })
  }
  if (blocks.length === 0) {
    console.log("Tidak ada blok runnable.")
    return
  }

  let fail = 0
  for (const b of blocks) {
    try {
      const r = await run(b.code)
      const ok = r.status === "Accepted" && norm(r.stdout) === norm(b.output ?? "")
      if (ok) {
        console.log(`✅ ${b.stage} lesson[${b.i}]`)
      } else {
        fail++
        console.log(`❌ ${b.stage} lesson[${b.i}] — status=${r.status}`)
        console.log(`   stdout:   ${JSON.stringify(norm(r.stdout))}`)
        console.log(`   expected: ${JSON.stringify(norm(b.output ?? ""))}`)
        if (r.stderr) console.log(`   stderr:   ${r.stderr.slice(0, 300)}`)
      }
    } catch (e) {
      fail++
      console.log(`❌ ${b.stage} lesson[${b.i}] — ${e.message}`)
    }
  }
  console.log(fail === 0 ? `\nSemua ${blocks.length} contoh lolos.` : `\n${fail}/${blocks.length} contoh gagal.`)
  process.exit(fail === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error("verify-lesson-code error:", e)
  process.exit(1)
})
