import { stages as allStages } from "../lib/content"
import type { Progress } from "../lib/progress"
import { Icon } from "./Icon"

export function Practice({ progress }: { progress: Progress }) {
  // Halaman ini khusus soal asli praktikum (prak-8/9/10). Soal tahap lain
  // tetap ada di dalam stage masing-masing (tab Latihan > Praktik coding).
  const stages = allStages.filter(
    (s) => s.status === "published" && s.id.startsWith("prak-")
  )

  return (
    <section>
      <div className="stage-head">
        <div className="stage-kicker">
          <Icon name="code" size={12} />
          <span>Latihan soal praktikum</span>
        </div>
        <h1>Semua Soal Praktikum</h1>
        <p className="lead">
          Kumpulan soal asli praktikum. Pilih satu, kerjakan, lalu jalankan —
          semua tes dinilai otomatis.
        </p>
      </div>

      <div className="practice-list">
        {stages.map((s) => (
          <div className="practice-stage" key={s.id}>
            <header className="practice-stage-head">
              <span className="week-badge">Minggu {s.week}</span>
              <a className="practice-stage-link" href={`#${s.id}`}>
                {s.title}
                <Icon name="arrow-right" size={13} />
              </a>
              <span className="practice-count">
                {s.problems.length === 0 ? "coming soon" : `${s.problems.length} soal`}
              </span>
            </header>
            <div className="practice-items">
              {s.problems.map((p) => {
                const done = Boolean(progress.solved[p.id])
                return (
                  <a className={`practice-item${done ? " done" : ""}`} href={`#${s.id}`} key={p.id}>
                    <span className={`practice-item-check${done ? " done" : ""}`}>
                      {done ? <Icon name="check" size={11} /> : null}
                    </span>
                    <span className="practice-item-title">{p.title}</span>
                    <span className={`difficulty diff-${p.difficulty}`}>
                      {p.difficulty === 1 ? "Dasar" : "Lanjut"}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        ))}

        <div className="practice-stage">
          <header className="practice-stage-head">
            <span className="week-badge">Minggu 12</span>
            <span className="practice-stage-link">Coming Soon</span>
            <span className="practice-count">coming soon</span>
          </header>
          <div className="soon-box">
            <span className="soon-bars" aria-hidden="true">
              <i /><i /><i /><i />
            </span>
            <span>Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  )
}
