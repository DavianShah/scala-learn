import { useState } from "react"
import type { LessonBlock, Stage } from "../lib/types"
import { LIMITS, filterJvmWarning, runCode, truncate } from "../lib/judge0"
import type { RunResult } from "../lib/judge0"
import type { Progress } from "../lib/progress"
import { Markdown } from "./Markdown"
import { ProblemCard } from "./ProblemCard"

interface Props {
  stage: Stage
  progress: Progress
  onSolved: (id: string) => void
  onHint: (id: string, level: number) => void
  onCodeChange: (id: string, code: string) => void
}

export function StageView({ stage, progress, onSolved, onHint, onCodeChange }: Props) {
  return (
    <div className="stage">
      <header className="stage-head">
        <div className="muted">
          Stage {stage.order} · Minggu {stage.week} · {stage.course}
        </div>
        <h2>{stage.title}</h2>
        <div className="chips">
          {stage.concepts.map((c) => (
            <span key={c} className="chip">
              {c}
            </span>
          ))}
        </div>
        <p className="field-label">Tujuan belajarmu</p>
        <ol className="objectives">
          {stage.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ol>
      </header>

      <div className="lesson">
        {stage.lesson.map((b, i) => (
          <LessonBlockView key={i} block={b} />
        ))}
      </div>

      <h2 className="problems-title">Soal</h2>
      {stage.problems.map((p) => (
        <ProblemCard
          key={p.id}
          problem={p}
          solved={Boolean(progress.solved[p.id])}
          hintLevel={progress.openedHints[p.id] ?? 0}
          savedCode={progress.code[p.id] ?? ""}
          onSolved={onSolved}
          onHint={onHint}
          onCodeChange={onCodeChange}
        />
      ))}
    </div>
  )
}

function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "text":
      return <Markdown source={block.body} />
    case "code":
      return <CodeBlock code={block.code} runnable={block.runnable} output={block.output} />
    case "pitfall":
      return (
        <div className="pitfall">
          <strong>Kesalahan umum.</strong>
          <Markdown source={block.body} />
        </div>
      )
    case "recap":
      return (
        <div className="recap">
          <strong>Ringkasan.</strong>
          <ul>
            {block.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      )
  }
}

function CodeBlock({
  code,
  runnable,
  output,
}: {
  code: string
  runnable: boolean
  output?: string
}) {
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)

  async function run(): Promise<void> {
    setRunning(true)
    setResult(await runCode(code, ""))
    setRunning(false)
  }

  return (
    <div className="codeblock">
      <pre className="code-show">{code}</pre>
      {runnable && (
        <div className="codeblock-actions">
          <button className="ghost" onClick={run} disabled={running}>
            {running ? "Menjalankan…" : "▶ Jalankan contoh"}
          </button>
          {result && (
            <span className={`badge ${result.status === "ok" ? "st-ok" : "st-err"}`}>
              {result.status === "ok" ? "Accepted" : "Error"} · {result.timeMs} ms
            </span>
          )}
        </div>
      )}
      {output !== undefined && <pre className="expected">Output: {output}</pre>}
      {result && result.stdout && <pre>{truncate(result.stdout, LIMITS.max_output_bytes)}</pre>}
      {result && filterJvmWarning(result.compileOutput) && (
        <pre className="err-text">
          {truncate(filterJvmWarning(result.compileOutput), LIMITS.max_output_bytes)}
        </pre>
      )}
      {result && filterJvmWarning(result.stderr) && (
        <pre className="err-text">
          {truncate(filterJvmWarning(result.stderr), LIMITS.max_output_bytes)}
        </pre>
      )}
    </div>
  )
}
