import { useState } from "react"
import type { Stage } from "../lib/types"
import { getStage, nextStageId, prevStageId } from "../lib/content"
import { filterJvmWarning, normalizeOutput, runCode, truncate } from "../lib/judge0"
import type { Progress } from "../lib/progress"
import { playSound } from "../lib/sound"
import { Icon } from "./Icon"
import { Markdown } from "./Markdown"
import { ProblemCard } from "./ProblemCard"
import { QuizCard } from "./QuizCard"
import { ProgressRing } from "./ProgressRing"

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

  const prevStage = prevStageId(stage.id) ? getStage(prevStageId(stage.id)!) : undefined
  const nextStage = nextStageId(stage.id) ? getStage(nextStageId(stage.id)!) : undefined
  const solvedCount = stage.problems.filter((p) => progress.solved[p.id]).length

  return (
    <section className="stage-page">
      <div className="stage-nav">
        <a className="back" href="#/">
          <Icon name="arrow-left" size={15} />
          Semua stage
        </a>
        <span className="stage-nav-links">
          {prevStage ? (
            <a href={`#${prevStage.id}`}>
              <Icon name="arrow-left" size={13} />
              {prevStage.title}
            </a>
          ) : (
            <span />
          )}
          {nextStage ? (
            <a href={`#${nextStage.id}`}>
              {nextStage.title}
              <Icon name="arrow-right" size={13} />
            </a>
          ) : null}
        </span>
      </div>

      <header className="stage-hero">
        <div className="stage-hero-main">
          <span className="stage-kicker">
            Stage {stage.order} · Minggu {stage.week}
          </span>
          <h1>{stage.title}</h1>
          <p>{stage.course}</p>
          <div className="stage-hero-meta">
            <span>{stage.problems.length} soal praktik</span>
            <span>{stage.quiz.length} soal kuis</span>
            <span>± {stage.estimatedMinutes} menit</span>
          </div>
        </div>
        <div className="stage-hero-side">
          <ProgressRing value={solvedCount} total={stage.problems.length} size={76}>
            {solvedCount}/{stage.problems.length}
          </ProgressRing>
          <span>soal selesai</span>
        </div>
      </header>

      <div className="mode-switch" role="tablist" aria-label="Bagian stage">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "materi"}
          className={"mode" + (tab === "materi" ? " active" : "")}
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
          className={"mode" + (tab === "latihan" ? " active" : "")}
          onClick={() => {
            setTab("latihan")
          }}
        >
          <Icon name="code" size={15} />
          Latihan
          <span className="mode-count">
            {solvedCount}/{stage.problems.length}
          </span>
        </button>
      </div>

      {tab === "materi" ? (
        <div className="lesson-layout">
          <div className="lesson-main">
            <div className="lesson">
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
            </div>

            <div className="next-card">
              <div className="next-card-text">
                <strong>Sudah baca materi?</strong>
                <span>Lanjut ke latihan dan tulis kodemu sendiri.</span>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setTab("latihan")
                }}
              >
                Lanjut ke latihan
                <Icon name="arrow-right" size={16} />
              </button>
            </div>
          </div>

          <aside className="lesson-rail" aria-label="Tujuan dan ringkasan stage">
            <div className="rail-card">
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
            <div className="rail-card">
              <div className="rail-card-title">Di stage ini</div>
              <div className="rail-rows">
                <span>
                  Soal praktik <strong>{stage.problems.length}</strong>
                </span>
                <span>
                  Soal kuis teori <strong>{stage.quiz.length}</strong>
                </span>
                <span>
                  Estimasi <strong>± {stage.estimatedMinutes} menit</strong>
                </span>
              </div>
            </div>
          </aside>
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

      {nextStage ? (
        <a className="next-stage-card" href={`#${nextStage.id}`}>
          <span className="next-stage-label">Stage berikutnya</span>
          <strong>{nextStage.title}</strong>
          <Icon name="arrow-right" size={16} />
        </a>
      ) : null}
    </section>
  )
}
