import { useState } from "react"
import { filterJvmWarning, runCode, type RunResult } from "../lib/judge0"
import { Icon } from "./Icon"

const STARTER = `object Main {
  def main(args: Array[String]): Unit = {
    val angka = List(3, 1, 4, 1, 5)
    println(angka.map(x => x * x).mkString(" "))
  }
}
`

export function Playground() {
  const [code, setCode] = useState(STARTER)
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [error, setError] = useState("")

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
  const failed =
    result !== null && (result.status !== "ok" || compileOutput !== "")

  return (
    <section>
      <div className="stage-head">
        <div className="stage-kicker">
          <Icon name="terminal" size={12} />
          <span>Area bebas</span>
        </div>
        <h1>Playground Scala</h1>
        <p className="lead">
          Tulis dan jalankan kode Scala 3 tanpa penilaian tes. Cocok buat mencoba sintaks
          yang baru kamu baca.
        </p>
      </div>

      <label className="field-label" htmlFor="playground-code">
        Kode
      </label>
      <textarea
        id="playground-code"
        className="editor playground-editor"
        value={code}
        spellCheck={false}
        onChange={(e) => setCode(e.target.value)}
      />

      <div className="problem-actions">
        <button type="button" className="btn btn-primary" onClick={run} disabled={pending}>
          {pending ? (
            <>
              <Icon name="spinner" size={15} />
              Menjalankan…
            </>
          ) : (
            <>
              <Icon name="play" size={15} />
              Jalankan
            </>
          )}
        </button>
        <button type="button" className="btn" onClick={() => { setCode(STARTER); setResult(null); setError("") }}>
          <Icon name="redo" size={15} />
          Reset contoh
        </button>
      </div>
      <p className="form-error">{error}</p>

      {result ? (
        <div className={`verdict ${failed ? "wrong" : "ok"}`} role="status">
          <div className="verdict-title">
            <Icon name={failed ? "xmark" : "check"} size={14} />
            {failed ? "Ada yang perlu dibenahi" : "Jalan lancar"}
            <span className="verdict-status">status {result.status}</span>
          </div>
          {result.stdout ? <pre className="output">{result.stdout}</pre> : null}
          {compileOutput ? <pre className="output">{compileOutput}</pre> : null}
          {stderr ? <pre className="output">{stderr}</pre> : null}
          {!result.stdout && !compileOutput && !stderr ? (
            <pre className="output">(tidak ada keluaran)</pre>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
