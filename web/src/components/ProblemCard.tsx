import { useState } from "react"
import type { Problem, TestCase } from "../lib/types"
import { LIMITS, normalizeOutput, runCode, truncate } from "../lib/judge0"
import type { RunResult, RunStatus } from "../lib/judge0"
import { Markdown } from "./Markdown"

interface TestOutcome {
  test: TestCase
  ok: boolean
  actual: string
  status: RunStatus
  timeMs: number
}

interface Props {
  problem: Problem
  solved: boolean
  hintLevel: number
  savedCode: string
  onSolved: (id: string) => void
  onHint: (id: string, level: number) => void
  onCodeChange: (id: string, code: string) => void
}

const STATUS_UI: Record<RunStatus, { label: string; cls: string }> = {
  ok: { label: "Accepted", cls: "st-ok" },
  compile_error: { label: "Compilation Error", cls: "st-err" },
  runtime_error: { label: "Runtime Error", cls: "st-err" },
  timeout: { label: "Time Limit Exceeded", cls: "st-err" },
  memory_limit: { label: "Memory Limit Exceeded", cls: "st-err" },
  internal: { label: "Runner error", cls: "st-err" },
  unknown: { label: "Status tak dikenal", cls: "st-err" },
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length)
  let cursor = 0
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

export function ProblemCard(props: Props) {
  const { problem } = props
  const [code, setCode] = useState(props.savedCode || problem.starter)
  const [input, setInput] = useState(() => firstVisibleInput(problem))
  const [output, setOutput] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<TestOutcome[] | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [justSolved, setJustSolved] = useState(false)

  function updateCode(next: string) {
    setCode(next)
    props.onCodeChange(problem.id, next)
  }

  async function run(): Promise<void> {
    setRunning(true)
    setOutput(null)
    setJustSolved(false)
    const r = await runCode(code, input)
    setOutput(r)
    setRunning(false)
  }

  async function check(): Promise<void> {
    setChecking(true)
    setResults(null)
    setJustSolved(false)
    const outcomes = await mapLimit(problem.tests, 3, async (t) => {
      const r = await runCode(code, t.input)
      return {
        test: t,
        ok: r.status === "ok" && normalizeOutput(r.stdout) === normalizeOutput(t.expected),
        actual: r.stdout,
        status: r.status,
        timeMs: r.timeMs,
      }
    })
    setResults(outcomes)
    setChecking(false)
    if (outcomes.length > 0 && outcomes.every((o) => o.ok)) {
      props.onSolved(problem.id)
      setJustSolved(true)
    }
  }

  const passed = results?.filter((r) => r.ok).length ?? 0
  const solvedNow = props.solved || justSolved

  return (
    <section className="problem" id={problem.id}>
      <header className="problem-head">
        <h3>
          {solvedNow ? "✅ " : ""}
          {problem.title}
        </h3>
        <span className={`diff d${problem.difficulty}`}>
          {problem.difficulty === 1 ? "mudah" : "menantang"}
        </span>
      </header>

      <Markdown source={problem.statement} />

      <label className="field-label" htmlFor={`${problem.id}-input`}>
        Input (stdin)
      </label>
      <textarea
        id={`${problem.id}-input`}
        className="stdin"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={2}
        spellCheck={false}
      />

      <label className="field-label" htmlFor={`${problem.id}-code`}>
        Kode
      </label>
      <textarea
        id={`${problem.id}-code`}
        className="code"
        value={code}
        onChange={(e) => updateCode(e.target.value)}
        rows={Math.min(28, code.split("\n").length + 2)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
      />

      <div className="actions">
        <button onClick={run} disabled={running || checking}>
          {running ? "Menjalankan…" : "▶ Run"}
        </button>
        <button className="primary" onClick={check} disabled={running || checking}>
          {checking ? "Memeriksa…" : "✔ Cek jawaban"}
        </button>
        <span className="hint-group">
          {problem.hints.map((h, i) =>
            props.hintLevel > i ? null : (
              <button
                key={i}
                className="ghost"
                onClick={() => props.onHint(problem.id, i + 1)}
                title={h}
              >
                Petunjuk {i + 1}
              </button>
            ),
          )}
        </span>
      </div>

      {props.hintLevel > 0 && (
        <div className="hints">
          {problem.hints.slice(0, props.hintLevel).map((h, i) => (
            <p key={i}>
              <strong>Petunjuk {i + 1}.</strong> {h}
            </p>
          ))}
        </div>
      )}

      {output && <OutputPanel result={output} />}
      {results && (
        <div className="results">
          <p className={passed === results.length ? "res-ok" : "res-bad"}>
            {passed}/{results.length} test lulus
          </p>
          <ul>
            {results.map((r, i) => (
              <li key={i} className={r.ok ? "res-ok" : "res-bad"}>
                <span>
                  Test {i + 1}
                  {r.test.hidden ? " (tersembunyi)" : ""} — {STATUS_UI[r.status].label} (
                  {r.timeMs} ms)
                </span>
                {!r.ok && !r.test.hidden && (
                  <pre>
                    input: {JSON.stringify(r.test.input)}
                    {"\n"}expected: {JSON.stringify(r.test.expected)}
                    {"\n"}actual: {JSON.stringify(r.actual)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {justSolved && <p className="banner-ok">Lulus semua test! Progress tersimpan. 🎉</p>}
      {solvedNow && !justSolved && <p className="banner-ok">Soal ini sudah lu selesaikan.</p>}

      <div className="solution">
        {!showSolution ? (
          <button className="ghost" onClick={() => setShowSolution(true)}>
            {solvedNow ? "Lihat solusi" : "Menyerah — lihat solusi"}
          </button>
        ) : (
          <>
            <div className="field-label">Solusi referensi</div>
            <pre className="solution-code">{problem.solution}</pre>
            <p>
              <strong>Penjelasan.</strong> {problem.explanation}
            </p>
          </>
        )}
      </div>
    </section>
  )
}

function firstVisibleInput(problem: Problem): string {
  const visible = problem.tests.find((t) => !t.hidden)
  return visible ? visible.input : ""
}

function OutputPanel({ result }: { result: RunResult }) {
  const ui = STATUS_UI[result.status]
  return (
    <div className="output">
      <div className="output-head">
        <span className={`badge ${ui.cls}`}>{ui.label}</span>
        <span className="muted">{result.timeMs} ms</span>
      </div>
      {result.compileOutput && (
        <>
          <div className="field-label">Compile output</div>
          <pre className="err-text">{truncate(result.compileOutput, LIMITS.max_output_bytes)}</pre>
        </>
      )}
      {result.stdout && (
        <>
          <div className="field-label">stdout</div>
          <pre>{truncate(result.stdout, LIMITS.max_output_bytes)}</pre>
        </>
      )}
      {result.stderr && (
        <>
          <div className="field-label">stderr</div>
          <pre className="err-text">{truncate(result.stderr, LIMITS.max_output_bytes)}</pre>
        </>
      )}
    </div>
  )
}
