import { useCallback, useEffect, useState } from "react"
import type { Stage } from "./lib/types"
import { stages } from "./lib/content"
import {
  exportProgress,
  importProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  type Progress,
} from "./lib/progress"
import { Icon } from "./components/Icon"
import { StageView } from "./components/StageView"

function readHash(): string {
  return window.location.hash.replace(/^#/, "")
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function Home({
  progress,
  onProgress,
}: {
  progress: Progress
  onProgress: (p: Progress) => void
}) {
  const totalProblems = stages.reduce((n, s) => n + s.problems.length, 0)
  const solvedProblems = Object.values(progress.solved).filter(Boolean).length
  const pct = totalProblems ? Math.round((solvedProblems / totalProblems) * 100) : 0

  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const handleExport = async () => {
    const ok = await copyText(exportProgress(progress))
    setToast(ok ? "Progres disalin sebagai JSON" : "Gagal menyalin")
  }

  const handleImport = async () => {
    const text = await navigator.clipboard.readText().catch(() => null)
    if (text === null) {
      setToast("Clipboard tidak bisa dibaca")
      return
    }
    const parsed = importProgress(text)
    if (!parsed) {
      setToast("JSON progres tidak valid")
      return
    }
    onProgress(parsed)
    setToast("Progres dimuat")
  }

  const handleReset = () => {
    onProgress(resetProgress())
    setToast("Progres direset")
  }

  return (
    <section className="home">
      <div className="hero">
        <h1>Belajar Scala 3, satu langkah kecil tiap hari.</h1>
        <p>
          Materi pendek dari kuliah, lalu langsung jawab soal di browser. Kode
          dijalankan di sandbox terpisah, jadi aman dan hasilnya langsung
          dinilai.
        </p>
      </div>

      <div className="progress">
        <div className="progress-top">
          <strong>
            {solvedProblems} dari {totalProblems} soal selesai
          </strong>
          <span>{pct}%</span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <h2 className="section-label">Daftar stage</h2>
      <div className="stage-grid">
        {stages.map((stage) => {
          const solved = stage.problems.filter((p) => progress.solved[p.id]).length
          const done = solved === stage.problems.length
          return (
            <a
              key={stage.id}
              className={`stage-card${done ? " is-done" : ""}`}
              href={`#${stage.id}`}
            >
              <span className="stage-num">
                {done ? <Icon name="check" size={18} /> : stage.order}
              </span>
              <span>
                <span className="stage-title">{stage.title}</span>
                <span className="stage-meta">
                  {solved}/{stage.problems.length} soal · minggu {stage.week}
                </span>
                <span className="concepts">
                  {stage.concepts.slice(0, 3).map((c) => (
                    <span className="concept" key={c}>
                      {c}
                    </span>
                  ))}
                </span>
              </span>
              <span className="stage-state">
                <Icon name="chevron-right" size={16} />
              </span>
            </a>
          )
        })}
      </div>

      <div className="topbar-actions" style={{ marginTop: 28 }}>
        <button className="btn btn-ghost btn-sm" onClick={handleExport} type="button">
          <Icon name="upload" size={15} />
          Ekspor
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleImport} type="button">
          <Icon name="download" size={15} />
          Impor
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleReset} type="button">
          <Icon name="trash" size={15} />
          Reset
        </button>
      </div>

      {toast ? (
        <div className="toast" role="status">
          <Icon name="check" size={14} />
          {toast}
        </div>
      ) : null}

      <p className="footer-note">
        Scala Learn · materi KOM120/KOM2205 · penilaian memakai Judge0 CE. Kode
        pelajar tidak pernah jalan di mesin ini.
      </p>
    </section>
  )
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [stageId, setStageId] = useState<string>(() => readHash())

  useEffect(() => {
    const onHash = () => {
      setStageId(readHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const handleProgress = useCallback((p: Progress) => {
    setProgress(p)
  }, [])

  const stage: Stage | undefined = stages.find((s) => s.id === stageId)

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-mark">
            <Icon name="terminal" size={17} />
          </span>
          Scala Learn
        </a>
      </header>

      <main>
        {stage ? (
          <StageView stage={stage} progress={progress} onProgress={handleProgress} />
        ) : (
          <Home progress={progress} onProgress={handleProgress} />
        )}
      </main>
    </div>
  )
}
