import { useMemo } from "react"
import { stages, WEEK_COLORS } from "../lib/content"
import type { Progress } from "../lib/progress"
import { Icon } from "./Icon"
import { ScrambleText } from "./ScrambleText"
import { ProgressRing } from "./ProgressRing"

export function Home({ progress }: { progress: Progress }) {
  const weeks = useMemo(() => {
    const map = new Map<number, typeof stages>()
    for (const s of stages) {
      const list = map.get(s.week) ?? []
      list.push(s)
      map.set(s.week, list)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [])

  const totalStages = stages.length
  const solved = Object.values(progress.solved).filter(Boolean).length
  const totalProblems = stages.reduce((n, s) => n + s.problems.length, 0)
  const doneStages = stages.filter(
    (s) => s.problems.length > 0 && s.problems.every((p) => progress.solved[p.id]),
  ).length
  const pct = totalProblems ? Math.round((solved / totalProblems) * 100) : 0

  const quizRecords = Object.values(progress.quizSessions).flat()
  const quizPoints = quizRecords.reduce((n, r) => n + r.score, 0)
  const quizBest = quizRecords.length > 0 ? Math.max(...quizRecords.map((r) => r.score)) : 0

  const next =
    stages.find((s) => s.problems.some((p) => !progress.solved[p.id])) ?? stages[0]

  return (
    <>
      <section className="hero-band">
        <div className="dot-matrix" aria-hidden="true" />
        <div className="hero-copy">
          <span className="eyebrow">Pemrograman · Scala 3 · UAS</span>
          <h1>
            Belajar <ScrambleText text="Scala" className="grad scramble" />
            <br />
            selangkah demi selangkah.
          </h1>
          <p>
            Semua materi Kuliah &amp; Praktikum diambil langsung dari Materi &amp; Soal asli
            mata kuliah Pemrograman. Baca, tulis kode, jalankan, lolos.
          </p>
          <div className="hero-cta">
            <a className="btn btn-primary btn-shine" href={next ? `#${next.id}` : "#/"}>
              <Icon name="play" size={15} />
              {solved > 0 ? "Lanjutkan belajar" : "Mulai belajar"}
            </a>
            <a className="btn btn-ghost" href="#/playground">
              <Icon name="terminal" size={15} />
              Coba Playground
            </a>
          </div>
          <div className="hero-stats">
            <span>
              <strong>{totalStages}</strong> materi
            </span>
            <span>
              <strong>{totalProblems}</strong> soal praktik
            </span>
            <span>
              <strong>{quizPoints}</strong> poin kuis
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="code-window">
            <div className="code-window-bar">
              <i />
              <i />
              <i />
              <span>Main.scala</span>
            </div>
            <pre>
              <code>{`val skor = List(70, 85, 60, 90)
val lolos = skor.filter(_ >= 75)
println(lolos.mkString(", "))`}</code>
            </pre>
            <div className="code-window-out">70, 85, 90</div>
          </div>
          <span className="float-chip chip-a">
            <Icon name="check" size={12} />
            Soal lolos
          </span>
          <span className="float-chip chip-b">
            <Icon name="trophy" size={12} />
            +10 poin
          </span>
        </div>
      </section>

      <div className="home-layout">
        <div className="path-wrap">
          <div className="path-head">
            <h2>Jalur belajar</h2>
            <span>
              {solved} / {totalProblems} soal selesai
            </span>
          </div>

          {weeks.map(([week, list], wi) => {
            const color = WEEK_COLORS[wi % WEEK_COLORS.length]
            const wProblems = list.reduce((n, s) => n + s.problems.length, 0)
            const wSolved = list.reduce(
              (n, s) => n + s.problems.filter((p) => progress.solved[p.id]).length,
              0,
            )
            const wPct = wProblems ? Math.round((wSolved / wProblems) * 100) : 0
            return (
              <section className={`chapter week-color-${color}`} key={week}>
                <header className="chapter-head">
                  <span className="chapter-pill">Minggu {week}</span>
                  <span className="chapter-meta">
                    {list.length} materi · {wProblems} soal
                  </span>
                  <span
                    className="chapter-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={wPct}
                    aria-label={`Progres minggu ${week}`}
                  >
                    <span style={{ width: `${wPct}%` }} />
                  </span>
                </header>
                <ol className="path">
                  {list.map((s) => {
                    const done =
                      s.problems.length > 0 &&
                      s.problems.every((p) => progress.solved[p.id])
                    const partial =
                      s.problems.length > 0 &&
                      s.problems.some((p) => progress.solved[p.id])
                    const isNext = next !== undefined && s.id === next.id
                    const state = done
                      ? "done"
                      : s.problems.length === 0
                        ? "soon"
                        : isNext
                          ? "current"
                          : partial
                            ? "partial"
                            : "todo"
                    return (
                      <li className={`path-node ${state}`} key={s.id}>
                        <a className="node-link" href={`#${s.id}`}>
                          <span className="node-dot" aria-hidden="true">
                            {done ? (
                              <Icon name="check" size={18} />
                            ) : (
                              <span className="node-num">{s.order}</span>
                            )}
                          </span>
                          <span className="node-card">
                            <span className="node-top">
                              <span
                                className={`stage-notch ${s.id.startsWith("prak-") ? "prak" : "materi"}`}
                              >
                                {s.id.startsWith("prak-") ? "Praktikum" : "Materi"}
                              </span>
                              <span className="node-count">
                                {s.problems.length === 0
                                  ? "Belum ada soal"
                                  : `${s.problems.length} soal`}
                              </span>
                              {state === "current" ? (
                                <span className="node-tag">Lanjutkan</span>
                              ) : null}
                              {state === "soon" ? (
                                <span className="node-tag soon">Segera</span>
                              ) : null}
                              {done ? (
                                <span className="node-tag done">
                                  <Icon name="check" size={11} />
                                  Selesai
                                </span>
                              ) : null}
                            </span>
                            <span className="node-title">{s.title}</span>
                            <span className="node-desc">{s.summary}</span>
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )
          })}
        </div>

        <aside className="rail" aria-label="Ringkasan progres">
          <div className="rail-card">
            <h3>Progresmu</h3>
            <div className="rail-ring">
              <ProgressRing value={solved} total={totalProblems} size={88}>
                {pct}%
              </ProgressRing>
              <p>
                <strong>{solved}</strong> dari {totalProblems} soal praktik selesai
              </p>
            </div>
            <div className="rail-rows">
              <span>
                Materi tuntas <strong>{doneStages} / {totalStages}</strong>
              </span>
              <span>
                Soal tersisa <strong>{totalProblems - solved}</strong>
              </span>
            </div>
          </div>
          <div className="rail-card">
            <h3>Kuis teori</h3>
            <div className="rail-rows">
              <span>
                Poin terkumpul <strong>{quizPoints}</strong>
              </span>
              <span>
                Skor terbaik <strong>{quizBest}</strong>
              </span>
              <span>
                Sesi dimainkan <strong>{quizRecords.length}</strong>
              </span>
            </div>
          </div>
          <div className="rail-card rail-links">
            <a href="#/playground">
              <Icon name="terminal" size={15} />
              <span>
                <strong>Playground</strong>
                <small>Coba kode Scala bebas</small>
              </span>
              <Icon name="arrow-right" size={14} />
            </a>
            <a href="#/latihan">
              <Icon name="code" size={15} />
              <span>
                <strong>Latihan Praktikum</strong>
                <small>Semua soal praktikum asli</small>
              </span>
              <Icon name="arrow-right" size={14} />
            </a>
          </div>
        </aside>
      </div>
    </>
  )
}
