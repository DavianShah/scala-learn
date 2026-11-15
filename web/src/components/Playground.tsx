import { useState } from "react"
import { filterJvmWarning, normalizeOutput, runCode, truncate, type RunResult } from "../lib/judge0"
import { Icon } from "./Icon"

const MAX_OUT = 4000
const STARTER = `object Main {
  def main(args: Array[String]): Unit = {
    val skor = List(70, 85, 60, 90)
    println(skor.filter(_ >= 75).mkString(", "))
  }
}
`

export function Playground() {
  const [code, setCode] = useState(STARTER)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState("")
  const [editorScroll, setEditorScroll] = useState(0)

  async function run() {
    setPending(true)
    setError("")
    try {
      setResult(await runCode(code, ""))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghubungi Judge0")
      setResult(null)
    } finally {
      setPending(false)
    }
  }

  const compileOutput = result ? filterJvmWarning(result.compileOutput) : ""
  const stderr = result ? filterJvmWarning(result.stderr) : ""
  const stdout = result ? normalizeOutput(result.stdout) : ""
  const failed = result !== null && (result.status !== "ok" || compileOutput !== "")

  return (
    <section className="playground-page">
      <header className="page-head">
        <h1>Playground</h1>
        <p>Tulis dan jalankan kode Scala 3 tanpa soal, tanpa nilai.</p>
      </header>

      <div className="workbench">
        <div className="workbench-editor">
          <div className="problem-toolbar">
            <span className="code-label">
              <Icon name="code" size={13} />
              Scala 3
            </span>
            <span className="toolbar-actions">
              <button
                className="btn btn-primary btn-sm"
                onClick={run}
                type="button"
                disabled={pending}
              >
                <Icon name={pending ? "spinner" : "play"} size={14} className={pending ? "spin" : ""} />
                {pending ? "Menjalankan…" : "Jalankan"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setCode(STARTER)
                  setResult(null)
                  setError("")
                }}
                type="button"
              >
                <Icon name="redo" size={14} />
                Reset contoh
              </button>
            </span>
          </div>
          <div className="editor-wrap">
            <div className="editor-gutter" aria-hidden="true">
              <div
                className="editor-gutter-inner"
                style={{ transform: `translateY(${-editorScroll}px)` }}
              >
                {Array.from({ length: code.split("\n").length }, (_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
            </div>
            <textarea
              id="playground-code"
              className="editor editor-lg"
              value={code}
              spellCheck={false}
              wrap="off"
              onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => setEditorScroll(e.currentTarget.scrollTop)}
              aria-label="Editor kode playground"
            />
          </div>
        </div>

        <div className="workbench-console">
          <div className="console-head">
            <span className="code-label">
              <Icon name="terminal" size={13} />
              Console
            </span>
            {result === null && !error ? (
              <span className="status-chip idle">Siap</span>
            ) : pending ? (
              <span className="status-chip running">Menjalankan…</span>
            ) : failed ? (
              <span className="status-chip error">
                <Icon name="xmark" size={13} />
                Ada yang perlu dibenahi
              </span>
            ) : (
              <span className="status-chip ok">
                <Icon name="check" size={13} />
                Jalan lancar
              </span>
            )}
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          {result === null && !error ? (
            <div className="console-empty">
              Tulis kode di kiri, lalu tekan <strong>Jalankan</strong> — output muncul di
              sini.
            </div>
          ) : result ? (
            <>
              <span className="verdict-status">status {result.status}</span>
              {stdout ? (
                <pre>
                  <code>{truncate(stdout, MAX_OUT)}</code>
                </pre>
              ) : null}
              {compileOutput ? (
                <pre>
                  <code>{compileOutput}</code>
                </pre>
              ) : null}
              {stderr ? (
                <pre>
                  <code>{stderr}</code>
                </pre>
              ) : null}
              {!stdout && !compileOutput && !stderr ? (
                <pre>
                  <code>(tidak ada keluaran)</code>
                </pre>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
