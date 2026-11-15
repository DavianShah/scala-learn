import { stages as allStages, WEEK_COLORS } from "../lib/content"
import type { Progress } from "../lib/progress"
import { Icon } from "./Icon"

export function Practice({ progress }: { progress: Progress }) {
  // Halaman ini khusus soal asli praktikum (prak-8/9/10). Soal tahap lain
  // tetap ada di dalam stage masing-masing (tab Latihan > Praktik coding).
  const prakStages = allStages.filter(
    (s) => s.status === "published" && s.id.startsWith("prak-"),
  )
  const totalProblems = prakStages.reduce((n, s) => n + s.problems.length, 0)
  const solved = prakStages.reduce(
    (n, s) => n + s.problems.filter((p) => progress.solved[p.id]).length,
    0,
  )

  const getStatus = (stage: (typeof prakStages)[number]) => {
    if (stage.problems.length === 0) return "soon"
    if (stage.problems.every((p) => progress.solved[p.id])) return "done"
    return "open"
  }

  return (
    <section className="practice-page">
      <header className="page-head">
        <h1>Latihan Praktikum</h1>
        <p>
          Kumpulan soal asli praktikum. Pilih satu, kerjakan, lalu jalankan.
          Semua tes dinilai otomatis.
        </p>
      </header>

      <div className="practice-strip">
        <span>
          Total soal prak <strong>{totalProblems}</strong>
        </span>
        <span>
          Selesai <strong>{solved}</strong>
        </span>
        <span>
          Minggu <strong>{prakStages.length} minggu</strong>
        </span>
      </div>

      <div className="practice-grid">
        {prakStages.map((s, i) => {
          const color = WEEK_COLORS[i % WEEK_COLORS.length]
          const status = getStatus(s)
          return (
            <article className={`practice-card week-color-${color}`} key={s.id}>
              <header className="practice-card-head">
                <span>Minggu {s.week}</span>
                {status === "done" ? (
                  <span className="node-tag done">
                    <Icon name="check" size={11} />
                    Selesai
                  </span>
                ) : status === "soon" ? (
                  <span className="node-tag soon">Segera</span>
                ) : null}
              </header>
              <div className="practice-card-body">
                <h2>
                  <a href={`#${s.id}`}>{s.title}</a>
                </h2>
                <p>{s.summary}</p>
                <div className="practice-rows">
                  {s.problems.length === 0 ? (
                    <div className="practice-soon">Soal belum tersedia.</div>
                  ) : (
                    s.problems.map((p) => (
                      <a className="practice-row" key={p.id} href={`#${s.id}`}>
                        {progress.solved[p.id] ? (
                          <Icon name="check" size={13} />
                        ) : (
                          <Icon name="code" size={13} />
                        )}
                        <span>{p.title}</span>
                        <span className={`difficulty diff-${p.difficulty}`}>
                          {p.difficulty === 1 ? "Dasar" : "Lanjut"}
                        </span>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </article>
          )
        })}

        <article className="practice-card practice-card-soon">
          <header className="practice-card-head">
            <span>Minggu 12</span>
            <span className="node-tag soon">Segera</span>
          </header>
          <div className="practice-card-body">
            <h2>Coming Soon</h2>
            <p>Soal praktikum minggu ke-12 belum tersedia.</p>
            <div className="soon-box">
              <span className="soon-bars" aria-hidden="true">
                <i /><i /><i /><i />
              </span>
              <span>Coming Soon</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
