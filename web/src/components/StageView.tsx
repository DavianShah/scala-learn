import { useState } from "react"
import type { Stage } from "../lib/types"
import { filterJvmWarning, normalizeOutput, runCode, truncate } from "../lib/judge0"
import type { Progress } from "../lib/progress"
import { playSound } from "../lib/sound"
import { Icon } from "./Icon"
import { Markdown } from "./Markdown"
import { ProblemCard } from "./ProblemCard"
import { QuizCard } from "./QuizCard"

const MAX_OUT = 4000

type Tab = "materi" | "latihan"
type Practice = "coding" | "teori"

function LessonCode({ code, output }: { code: string; output?: string }) {
  const [runOut, setRunOut] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleRun = async () => {
    setBusy(true)
    const res = await runCode(code, "")
    const raw = res.stdout || filterJvmWarning(res.compileOutput)
    setRunOut(normalizeOutput(raw) || "(tidak ada output)")
    setBusy(false)
  }

  const handleCopy = async () => {
    const ok = await navigator.clipboard.writeText(code).catch(() => false)
    setCopied(Boolean(ok))
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="lesson-code">
      <div className="code-head">
        <span className="code-label">
          <Icon name="code" size={13} />
          Scala 3
        </span>
        <span className="code-actions">
          <button className="icon-btn" onClick={handleCopy} type="button" title="Salin kode">
            <Icon name={copied ? "check" : "copy"} size={14} />
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleRun}
            type="button"
            disabled={busy}
          >
            <Icon name={busy ? "spinner" : "play"} size={14} className={busy ? "spin" : ""} />
            {busy ? "Jalankan" : "Jalankan"}
          </button>
        </span>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {runOut !== null ? (
        <div className="output" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="code-head">
            <span className="code-label">
              <Icon name="terminal" size={13} />
              Output
            </span>
          </div>
          <pre>
            <code>{truncate(runOut, MAX_OUT)}</code>
          </pre>
        </div>
      ) : null}
      {output && runOut === null ? (
        <div className="output output-ok" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="code-head">
            <span className="code-label">
              <Icon name="circle-check" size={13} />
              Output yang diharapkan
            </span>
          </div>
          <pre>
            <code>{output}</code>
          </pre>
        </div>
      ) : null}
    </div>
  )
}

export interface Props {
  stage: Stage
  progress: Progress
  onProgress: (p: Progress) => void
}

export function StageView({ stage, progress, onProgress }: Props) {
  const [tab, setTab] = useState<Tab>("materi")
  const [practice, setPractice] = useState<Practice>("coding")

  return (
    <section>
      <a className="back" href="#/">
        <Icon name="arrow-left" size={15} />
        Semua stage
      </a>

      <div className="stage-head">
        <div className="stage-week">Stage {stage.order} · minggu {stage.week}</div>
        <h1>{stage.title}</h1>
        <p>{stage.course}</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Bagian stage">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "materi"}
          className={"tab" + (tab === "materi" ? " active" : "")}
          onClick={() => {
            setTab("materi")
          }}
        >
          <Icon name="book" size={15} />
          Materi
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "latihan"}
          className={"tab" + (tab === "latihan" ? " active" : "")}
          onClick={() => {
            setTab("latihan")
          }}
        >
          <Icon name="code" size={15} />
          Latihan
        </button>
      </div>

      {tab === "materi" ? (
        <div className="lesson">
          <div className="objectives">
            <div className="objectives-title">
              <Icon name="flag" size={14} />
              Kamu akan bisa
            </div>
            {stage.objectives.map((o) => (
              <div className="objective" key={o}>
                <Icon name="check" size={13} />
                <span>{o}</span>
              </div>
            ))}
          </div>

          {stage.lesson.map((block, i) => {
            if (block.type === "text") {
              return (
                <div className="lesson-text md" key={i}>
                  <Markdown source={block.body} />
                </div>
              )
            }
            if (block.type === "code") {
              return <LessonCode key={i} code={block.code} output={block.output} />
            }
            if (block.type === "pitfall") {
              return (
                <div className="pitfall" key={i}>
                  <Icon name="exclamation-circle" size={18} />
                  <div className="pitfall-body">
                    <div className="pitfall-title">Hati-hati</div>
                    <Markdown source={block.body} />
                  </div>
                </div>
              )
            }
            return (
              <div className="recap" key={i}>
                <div className="recap-title">Rekap sebelum lanjut</div>
                {block.items.map((item) => (
                  <div className="recap-item" key={item}>
                    <Icon name="check" size={13} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )
          })}

          <button
            type="button"
            className="next-cta"
            onClick={() => {
              setTab("latihan")
            }}
          >
            Sudah baca materi? Lanjut ke latihan
            <Icon name="arrow-right" size={16} />
          </button>
        </div>
      ) : (
        <div>
          <div className="subtabs" role="tablist" aria-label="Jenis latihan">
            <button
              type="button"
              role="tab"
              aria-selected={practice === "coding"}
              className={"subtab" + (practice === "coding" ? " active" : "")}
              onClick={() => {
                setPractice("coding")
              }}
            >
              <Icon name="code" size={14} />
              Praktik coding
            </button>
            {stage.quiz.length > 0 ? (
              <button
                type="button"
                role="tab"
                aria-selected={practice === "teori"}
                className={"subtab" + (practice === "teori" ? " active" : "")}
                onClick={() => {
                  setPractice("teori")
                }}
              >
                <Icon name="question-circle" size={14} />
                Kuis teori
              </button>
            ) : null}
          </div>

          {practice === "coding" ? (
            stage.problems.length === 0 ? (
              <div className="soon-box">
                <span className="soon-bars" aria-hidden="true">
                  <i /><i /><i /><i />
                </span>
                <span>Praktikum Coming Soon</span>
              </div>
            ) : (
              <div>
                <h2 className="section-label">Soal latihan</h2>
                {stage.problems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  solved={Boolean(progress.solved[problem.id])}
                  initialCode={progress.code[problem.id] ?? problem.starter}
                  onCodeChange={(code) =>
                    onProgress({ ...progress, code: { ...progress.code, [problem.id]: code } })
                  }
                  onSolved={() => {
                    const nextSolved = { ...progress.solved, [problem.id]: true }
                    onProgress({ ...progress, solved: nextSolved })
                    // Bunyi "selesai" hanya saat semua soal coding stage ini tuntas.
                    if (stage.problems.every((p) => nextSolved[p.id])) playSound("cheer")
                  }}
                />
              ))}
              </div>
            )
          ) : (
            <div className="panel">
              <QuizCard
                stageId={stage.id}
                questions={stage.quiz}
                progress={progress}
                onProgress={onProgress}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
