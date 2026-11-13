import { useEffect, useState } from "react"
import { getStage, nextStageId, stages } from "./lib/content"
import type { Stage } from "./lib/types"
import { exportProgress, importProgress, loadProgress, resetProgress, saveProgress } from "./lib/progress"
import type { Progress } from "./lib/progress"
import { StageView } from "./components/StageView"

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash.replace(/^#/, "") || "/")
  useEffect(() => {
    const on = () => setHash(window.location.hash.replace(/^#/, "") || "/")
    window.addEventListener("hashchange", on)
    return () => window.removeEventListener("hashchange", on)
  }, [])
  return hash
}

export default function App() {
  const route = useHashRoute()
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [message, setMessage] = useState("")

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  function markSolved(id: string): void {
    setProgress((p) => (p.solved[id] ? p : { ...p, solved: { ...p.solved, [id]: true } }))
  }

  function openHint(id: string, level: number): void {
    setProgress((p) => ({
      ...p,
      openedHints: { ...p.openedHints, [id]: Math.max(p.openedHints[id] ?? 0, level) },
    }))
  }

  function saveCode(id: string, code: string): void {
    setProgress((p) => ({ ...p, code: { ...p.code, [id]: code } }))
  }

  const stageMatch = route.match(/^\/stage\/(.+)$/)
  const stage = stageMatch ? getStage(stageMatch[1]) : undefined

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          Scala <span>Learn</span>
        </a>
        <nav>
          <a href="#/">Materi</a>
          <a href="#/settings">Pengaturan</a>
        </nav>
      </header>

      {message && <div className="banner-ok">{message}</div>}

      {route === "/settings" ? (
        <Settings
          progress={progress}
          onReset={() => {
            setProgress(resetProgress())
            setMessage("Progress dihapus.")
          }}
          onImport={(json) => {
            const p = importProgress(json)
            if (p) {
              setProgress(p)
              setMessage("Progress dimuat.")
            } else {
              setMessage("JSON tidak valid.")
            }
          }}
          onExport={() => exportProgress(progress)}
        />
      ) : stage ? (
        <StageView
          stage={stage}
          progress={progress}
          onSolved={markSolved}
          onHint={openHint}
          onCodeChange={saveCode}
        />
      ) : (
        <Home progress={progress} />
      )}

      {stage && (
        <div className="next-row">
          {nextStageId(stage.id) ? (
            <a className="primary" href={`#/stage/${nextStageId(stage.id)}`}>
              Stage berikutnya →
            </a>
          ) : (
            <span className="muted">Semua stage selesai. 🎉</span>
          )}
        </div>
      )}
    </div>
  )
}

function unlocked(s: Stage, p: Progress): boolean {
  return s.prerequisites.every((id) => {
    const pre = stages.find((x) => x.id === id)
    return pre ? pre.problems.every((pr) => p.solved[pr.id]) : true
  })
}

function Home({ progress }: { progress: Progress }) {
  const total = stages.length
  const done = stages.filter((s) => s.problems.every((p) => progress.solved[p.id])).length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="home">
      <h2>Materi Pemrograman Scala</h2>
      <p className="muted">
        {done}/{total} stage selesai · {pct}%
      </p>
      <div className="progressbar">
        <div style={{ width: `${pct}%` }} />
      </div>
      <ol className="stage-list">
        {stages.map((s) => {
          const locked = !unlocked(s, progress)
          const solvedCount = s.problems.filter((p) => progress.solved[p.id]).length
          const all = solvedCount === s.problems.length
          return (
            <li key={s.id} className={locked ? "locked" : ""}>
              <a href={`#/stage/${s.id}`}>
                <span className="num">{s.order}</span>
                <span className="t">
                  <strong>{s.title}</strong>
                  <span className="muted">
                    Minggu {s.week} · {solvedCount}/{s.problems.length} soal
                  </span>
                </span>
                <span className="state">{locked ? "🔒" : all ? "✅" : "▶"}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Settings({
  progress,
  onReset,
  onImport,
  onExport,
}: {
  progress: Progress
  onReset: () => void
  onImport: (json: string) => void
  onExport: () => string
}) {
  const [json, setJson] = useState("")
  return (
    <div className="settings">
      <h2>Pengaturan</h2>
      <p className="muted">
        Tersimpan di browser ini ({Object.keys(progress.solved).length} soal selesai). Tidak ada
        akun, tidak ada server.
      </p>
      <div className="actions">
        <button
          className="ghost"
          onClick={() => {
            const blob = new Blob([onExport()], { type: "application/json" })
            const a = document.createElement("a")
            a.href = URL.createObjectURL(blob)
            a.download = "scala-learn-progress.json"
            a.click()
            URL.revokeObjectURL(a.href)
          }}
        >
          ⬇ Ekspor progress
        </button>
        <button
          className="ghost"
          onClick={() => {
            if (window.confirm("Hapus semua progress?")) onReset()
          }}
        >
          🗑 Reset progress
        </button>
      </div>
      <label className="field-label" htmlFor="import">
        Impor progress (tempel JSON)
      </label>
      <textarea
        id="import"
        className="code"
        rows={4}
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
      />
      <div className="actions">
        <button className="primary" onClick={() => onImport(json)} disabled={!json.trim()}>
          Impor
        </button>
      </div>
    </div>
  )
}
