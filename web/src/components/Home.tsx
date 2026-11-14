import { useMemo } from "react"
import { stages } from "../lib/content"
import type { Progress } from "../lib/progress"
import { Icon } from "./Icon"
import { ScrambleText } from "./ScrambleText"
import { LogoMark } from "./Logo"

const WEEK_ACCENTS = ["week-accent-0", "week-accent-1", "week-accent-2", "week-accent-3"]

function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`
  const h = Math.floor(minutes / 60)
  return `${h} jam ${minutes % 60} mnt`
}

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
  const first = stages[0]

  return (
    <>
      <section className="hero">
        <div className="hero-logo">
          <LogoMark size={64} />
        </div>
        <h1>
          Belajar Matkul Pemrog <ScrambleText text="Scala" className="grad scramble" />
        </h1>
        <p>
          Semua materi Kuliah &amp; Praktikum di ambil langsung dari Materi &amp;
          Soal asli mata kuliah Pemrograman.
        </p>
        <div className="hero-cta">
          <a className="btn btn-primary" href={first ? `#${first.id}` : "#/"}>
            <Icon name="play" size={15} />
            Mulai belajar
          </a>
          <a className="btn" href="#/latihan">
            <Icon name="code" size={15} />
            Latihan soal
          </a>
          <a className="btn btn-ghost" href="#/playground">
            <Icon name="terminal" size={15} />
            Playground
          </a>
        </div>
      </section>

      <section className="progress" aria-label="Progres belajarmu">
        <div className="progress-top">
          <div>
            Progres keseluruhan: <strong>{solved} / {totalProblems}</strong> soal praktik
          </div>
          <span>{totalStages} materi</span>
        </div>
        <div
          className="bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalProblems}
          aria-valuenow={solved}
          aria-label="Soal praktik terselesaikan"
        >
          <div
            className="bar-fill"
            style={{ width: totalProblems ? `${(solved / totalProblems) * 100}%` : "0%" }}
          />
        </div>
      </section>

      {weeks.map(([week, list], idx) => {
        const problems = list.reduce((n, s) => n + s.problems.length, 0)
        const minutes = list.reduce((n, s) => n + (s.estimatedMinutes ?? 0), 0)
        return (
          <section className={`week-group ${WEEK_ACCENTS[idx % WEEK_ACCENTS.length]}`} key={week}>
            <details className="week" open={idx === 0}>
              <summary>
                <span className="week-badge">Minggu {week}</span>
                <span className="week-title">
                  {list.length} materi · {problems} soal
                </span>
                <span className="week-meta">
                  <span>± {fmtDuration(minutes)}</span>
                  <Icon name="chevron-down" size={14} className="week-caret" />
                </span>
              </summary>
              <div className="stage-grid">
                {list.map((s) => {
                  const done = s.problems.length > 0 && s.problems.every((p) => progress.solved[p.id])
                  const partially = s.problems.length > 0 && s.problems.some((p) => progress.solved[p.id])
                  return (
                    <a className={`stage-card${done ? " is-done" : ""}`} href={`#${s.id}`} key={s.id}>
                      <span className="stage-topline">
                        {done ? (
                          <span className="stage-badge done">
                            <Icon name="check" size={12} />
                            Selesai
                          </span>
                        ) : partially ? (
                          <span className="stage-badge partial">Berjalan</span>
                        ) : s.problems.length === 0 ? (
                          <span className="stage-badge soon">Coming soon</span>
                        ) : null}
                      </span>
                      <h3>{s.title}</h3>
                      <p>{s.summary}</p>
                    </a>
                  )
                })}
              </div>
            </details>
          </section>
        )
      })}
    </>
  )
}
