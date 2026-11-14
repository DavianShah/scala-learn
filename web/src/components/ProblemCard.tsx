import { useEffect, useRef, useState } from "react"
import type { Problem } from "../lib/types"
import {
  filterJvmWarning,
  normalizeOutput,
  runCode,
  truncate,
  type RunResult,
} from "../lib/judge0"
import { Icon } from "./Icon"
import { Confetti } from "./Confetti"
import { Markdown } from "./Markdown"
import { playSound } from "../lib/sound"

const MAX_OUT = 4000

const STATUS_UI: Record<RunResult["status"], string> = {
  ok: "Jalan tanpa error",
  compile_error: "Error kompilasi",
  runtime_error: "Error saat jalan",
  timeout: "Waktu jalan habis",
  memory_limit: "Memori habis",
  internal: "Sandbox bermasalah",
  unknown: "Status tidak dikenal",
}

export interface Props {
  problem: Problem
  solved: boolean
  initialCode: string
  onCodeChange: (code: string) => void
  onSolved: () => void
}

interface TestOutcome {
  idx: number
  pass: boolean
  got: string
  hidden: boolean
}

export function ProblemCard({
  problem,
  solved,
  initialCode,
  onCodeChange,
  onSolved,
}: Props) {
  const [code, setCode] = useState(initialCode)
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState("")
  const [verdict, setVerdict] = useState<"ok" | "bad" | "compile" | "error" | null>(null)
  const [detail, setDetail] = useState("")
  const [tests, setTests] = useState<TestOutcome[] | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [hints, setHints] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const [burst, setBurst] = useState(0)
  const [copied, setCopied] = useState<"starter" | "solution" | null>(null)
  const [editorScroll, setEditorScroll] = useState(0)
  const alreadyFired = useRef(false)

  useEffect(() => {
    setCode(initialCode)
    setOut("")
    setVerdict(null)
    setDetail("")
    setTests(null)
    setRevealed(false)
    setShowSolution(false)
    setHints(0)
    alreadyFired.current = false
  }, [problem.id, initialCode])

  const handleCode = (value: string) => {
    setCode(value)
    onCodeChange(value)
  }

  const handleRun = async () => {
    setBusy(true)
    setVerdict(null)
    setTests(null)
    const res = await runCode(code, "")
    setOut(
      normalizeOutput(res.stdout || filterJvmWarning(res.compileOutput)) || "(tidak ada output)",
    )
    if (res.status !== "ok") {
      setVerdict(res.status === "compile_error" ? "compile" : "error")
      setDetail(
        filterJvmWarning(res.compileOutput || res.stderr) ||
          STATUS_UI[res.status] ||
          "Tanpa detail",
      )
      setShakeKey((k) => k + 1)
    }
    setBusy(false)
  }

  const handleCheck = async () => {
    setBusy(true)
    setVerdict(null)
    setTests(null)
    // Tiap tes dijalankan sendiri-sendiri: program biasanya baca satu baris
    // per eksekusi, jadi menggabung semua input akan menghasilkan output salah.
    const results = await Promise.all(problem.tests.map((t) => runCode(code, t.input)))
    const outcomes: TestOutcome[] = problem.tests.map((t, i) => {
      const res = results[i]
      return {
        idx: i,
        pass: res.status === "ok" && normalizeOutput(res.stdout) === normalizeOutput(t.expected),
        got: normalizeOutput(res.stdout),
        hidden: t.hidden,
      }
    })
    const allPass = outcomes.every((o) => o.pass)
    setTests(outcomes)

    if (allPass) {
      const slowest = Math.max(...results.map((r) => r.timeMs))
      setVerdict("ok")
      setDetail(`${slowest} ms · ${outcomes.length}/${outcomes.length} tes lolos`)
      if (!alreadyFired.current) {
        alreadyFired.current = true
        setBurst((b) => b + 1)
        onSolved()
      }
    } else {
      const bad = results.find((r) => r.status !== "ok")
      if (bad) {
        setVerdict(bad.status === "compile_error" ? "compile" : "error")
        setDetail(
          filterJvmWarning(bad.compileOutput || bad.stderr) ||
            STATUS_UI[bad.status] ||
            "Tanpa detail",
        )
      } else {
        setVerdict("bad")
        const failed = outcomes.filter((o) => !o.pass).length
        setDetail(`${failed} dari ${outcomes.length} tes belum cocok`)
      }
      setShakeKey((k) => k + 1)
      playSound("wrong")
    }
    setBusy(false)
  }

  const copy = async (text: string, which: "starter" | "solution") => {
    const ok = await navigator.clipboard.writeText(text).catch(() => false)
    if (ok) {
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    }
  }

  const verdictUi = {
    ok: { cls: "verdict-ok", icon: "circle-check" as const, label: "Lolos semua tes" },
    bad: { cls: "verdict-bad", icon: "circle-xmark" as const, label: "Belum lolos" },
    compile: { cls: "verdict-compile", icon: "exclamation-circle" as const, label: "Error kompilasi" },
    error: { cls: "verdict-error", icon: "exclamation-circle" as const, label: "Error saat jalan" },
  }

  return (
    <article className={`problem${solved ? " is-solved" : ""}`} id={problem.id}>
      <Confetti burstKey={burst} />
      <div className="problem-head">
        <div className="problem-title-wrap">
          <h3 className="problem-title">{problem.title}</h3>
          <span className={`diff diff-${problem.difficulty}`}>
            {problem.difficulty === 1 ? "Dasar" : "Lanjutan"}
          </span>
        </div>
        <span className="problem-state">
          {solved ? <Icon name="circle-check" size={18} /> : <Icon name="circle-blank" size={18} />}
        </span>
      </div>

      <div className="problem-grid">
        <div className="problem-left">
          <p className="problem-statement">
            <Markdown source={problem.statement} />
          </p>

          {revealed ? (
            <div className="hint">
              <div className="hint-title">
                <Icon name="lightbulb" size={15} />
                Petunjuk
              </div>
              {problem.hints.slice(0, hints + 1).map((h, i) => (
                <div className="hint-item" key={i}>
                  <Markdown source={h} />
                </div>
              ))}
              {hints < problem.hints.length - 1 ? (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => setHints((h) => h + 1)}
                  type="button"
                >
                  <Icon name="chevron-down" size={14} />
                  Petunjuk berikutnya
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="problem-right">
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
              className="editor"
              value={code}
              spellCheck={false}
              wrap="off"
              onChange={(e) => handleCode(e.target.value)}
              onScroll={(e) => setEditorScroll(e.currentTarget.scrollTop)}
              aria-label={`Editor kode soal ${problem.title}`}
            />
          </div>

      <div className="problem-actions">
        <button className="btn btn-ghost" onClick={handleRun} type="button" disabled={busy}>
          <Icon name={busy ? "spinner" : "play"} size={15} className={busy ? "spin" : ""} />
          Jalankan
        </button>
        <button className="btn btn-primary" onClick={handleCheck} type="button" disabled={busy}>
          <Icon name={busy ? "spinner" : "check"} size={15} className={busy ? "spin" : ""} />
          Cek jawaban
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => copy(code, "starter")}
          type="button"
          disabled={busy}
        >
          <Icon name={copied === "starter" ? "check" : "copy"} size={15} />
          Salin
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => setRevealed((r) => !r)}
          type="button"
          aria-expanded={revealed}
        >
          <Icon name="lightbulb" size={15} />
          {revealed ? "Tutup petunjuk" : "Petunjuk"}
        </button>
      </div>

      {out ? (
        <div className="output" style={{ marginTop: 14 }}>
          <div className="code-head">
            <span className="code-label">
              <Icon name="terminal" size={13} />
              Output program
            </span>
          </div>
          <pre>
            <code>{truncate(out, MAX_OUT)}</code>
          </pre>
        </div>
      ) : null}

      {verdict ? (
        <div key={shakeKey} className={`verdict ${verdictUi[verdict].cls}${shakeKey ? " shake" : ""}`}>
          <Icon name={verdictUi[verdict].icon} size={18} className={verdict === "ok" ? "pop" : ""} />
          <div>
            <strong>{verdictUi[verdict].label}</strong>
            {detail ? <div className="verdict-detail">{detail}</div> : null}
          </div>
        </div>
      ) : null}

      {tests ? (
        <div className="tests">
          <div className="tests-title">Hasil tes</div>
          {tests.map((t) => (
            <div className={`test ${t.pass ? "test-pass" : "test-fail"}`} key={t.idx}>
              <div className="test-row">
                <span className="test-icon">
                  <Icon name={t.pass ? "check" : "xmark"} size={14} />
                </span>
                <span className={t.hidden ? "test-hidden" : "test-head"}>
                  Tes {t.idx + 1}
                  {t.hidden ? " (tersembunyi)" : ""}
                </span>
              </div>
              {!t.hidden ? (
                <div className="test-io">
                  <div className="test-io-row">
                    <span className="test-io-label">input</span>
                    <pre>{problem.tests[t.idx].input || "(kosong)"}</pre>
                  </div>
                  <div className="test-io-row">
                    <span className="test-io-label">harus</span>
                    <pre className="test-expected">{problem.tests[t.idx].expected}</pre>
                  </div>
                  <div className="test-io-row">
                    <span className="test-io-label">jawaban</span>
                    <pre className={`test-got ${t.pass ? "" : "bad"}`}>{t.got || "(kosong)"}</pre>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

        </div>
      </div>

      <div className="solution">
        <div className="solution-head">
          <span className="solution-title">
            <Icon name={showSolution ? "eye" : "lock"} size={14} />
            {showSolution ? "Solusi dosen" : "Solusi dosen (terkunci)"}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowSolution((s) => !s)}
            type="button"
            aria-expanded={showSolution}
          >
            <Icon name={showSolution ? "xmark" : "eye"} size={14} />
            {showSolution ? "Tutup" : "Lihat"}
          </button>
        </div>
        {showSolution ? (
          <>
            <pre>
              <code>{problem.solution}</code>
            </pre>
            <p className="expl">{problem.explanation}</p>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 10 }}
              onClick={() => copy(problem.solution, "solution")}
              type="button"
            >
              <Icon name={copied === "solution" ? "check" : "copy"} size={14} />
              Salin solusi
            </button>
          </>
        ) : (
          <p className="expl" style={{ margin: 0 }}>
            Coba dulu pakai petunjuk. Solusi dibuka kalau kamu masih mentok.
          </p>
        )}
      </div>
    </article>
  )
}
