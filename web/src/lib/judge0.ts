// Client Judge0 CE pubrik (https://ce.judge0.com) — Scala 3.4.2, language_id 112.
// Kode pelajar HANYA jalan di sandbox Judge0, tidak pernah di browser.

export type RunStatus =
  | "ok"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "memory_limit"
  | "internal"
  | "unknown"

export interface RunResult {
  status: RunStatus
  stdout: string
  stderr: string
  compileOutput: string
  timeMs: number
}

const JUDGE0_URL = "https://ce.judge0.com/submissions"
const LANGUAGE_ID = 112 // Scala 3.4.2

const STATUS_MAP: Record<string, RunStatus> = {
  Accepted: "ok",
  "Compilation Error": "compile_error",
  "Runtime Error": "runtime_error",
  "Time Limit Exceeded": "timeout",
  "Memory Limit Exceeded": "memory_limit",
  "Output Limit Exceeded": "memory_limit",
  "Internal Error": "internal",
}

export const LIMITS = {
  cpu_time_limit: 5,
  wall_time_limit: 10,
  memory_limit: 512000, // KB (~500 MB, JVM butuh ruang)
  max_code_bytes: 20 * 1024,
  max_output_bytes: 64 * 1024,
}

export async function runCode(code: string, stdin: string): Promise<RunResult> {
  const t0 = performance.now()
  try {
    const res = await fetch(`${JUDGE0_URL}?wait=true&base64_encoded=false`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: LANGUAGE_ID,
        source_code: code,
        stdin,
        cpu_time_limit: LIMITS.cpu_time_limit,
        wall_time_limit: LIMITS.wall_time_limit,
        memory_limit: LIMITS.memory_limit,
      }),
    })
    const d = await res.json()
    const desc: string = d?.status?.description ?? "Internal Error"
    return {
      status: STATUS_MAP[desc] ?? "unknown",
      stdout: d?.stdout ?? "",
      stderr: d?.stderr ?? "",
      compileOutput: d?.compile_output ?? "",
      timeMs: Math.round(performance.now() - t0),
    }
  } catch (e) {
    return {
      status: "internal",
      stdout: "",
      stderr: e instanceof Error ? e.message : String(e),
      compileOutput: "",
      timeMs: Math.round(performance.now() - t0),
    }
  }
}

export function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, "\n").trim()
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "\n… (dipotong)" : s
}

// JVM modern (JDK 23+) menaruh peringatan ini di stderr + compile_output saat
// Scala 3 memakai `lazy val` (scala.runtime.LazyVals$ -> sun.misc.Unsafe).
// Bukan error, dan TIDAK masuk stdout — perbandingan jawaban tetap akurat.
// Disaring hanya supaya panel output tidak menakut-nakuti pemula.
const JVM_UNSAFE_WARNING =
  /^WARNING: (A terminally deprecated method in sun\.misc\.Unsafe has been called|sun\.misc\.Unsafe::\w+ has been called by .+|Please consider reporting this to the maintainers of class .+|sun\.misc\.Unsafe::\w+ will be removed in a future release)\s*$/

export function filterJvmWarning(text: string): string {
  if (!text) return ""
  return text
    .split("\n")
    .filter((line) => !JVM_UNSAFE_WARNING.test(line.trim()))
    .join("\n")
    .trim()
}
