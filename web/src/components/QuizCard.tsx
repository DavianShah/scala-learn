import { useEffect, useState } from "react"
import type { QuizQuestion } from "../lib/types"
import type { Progress, QuizSessionRecord } from "../lib/progress"
import { playSound } from "../lib/sound"
import { Icon } from "./Icon"
import { ProgressRing } from "./ProgressRing"

const PER_SESSION = 10
const POINTS = 10
const HISTORY = 5

function shuffle<T>(input: T[]): T[] {
  const a = [...input]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

function fmtTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m > 0) return `${m} mnt ${s} dtk`
  return `${s} dtk`
}

interface Session {
  order: QuizQuestion[]
  answers: Record<string, number>
  index: number
  startedAt: number
  finishedAt: number | null
}

export function QuizCard({
  stageId,
  questions,
  progress,
  onProgress,
}: {
  stageId: string
  questions: QuizQuestion[]
  progress: Progress
  onProgress: (p: Progress) => void
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const running = session !== null && session.finishedAt === null
  const history = progress.quizSessions[stageId] ?? []
  const perSession = Math.min(PER_SESSION, questions.length)
  const best = history.length > 0 ? Math.max(...history.map((r) => r.score)) : 0

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [running, session?.index])

  function start() {
    setSession({
      order: shuffle(questions).slice(0, perSession),
      answers: {},
      index: 0,
      startedAt: Date.now(),
      finishedAt: null,
    })
  }

  function answer(optionIndex: number) {
    if (!session || session.finishedAt !== null) return
    const q = session.order[session.index]
    if (session.answers[q.id] !== undefined) return
    const correct = optionIndex === q.answer
    playSound(correct ? "solve" : "wrong")
    setSession({ ...session, answers: { ...session.answers, [q.id]: optionIndex } })
  }

  function next() {
    if (!session || session.finishedAt !== null) return
    const q = session.order[session.index]
    if (session.answers[q.id] === undefined) return

    if (session.index + 1 >= session.order.length) {
      const finishedAt = Date.now()
      const seconds = Math.max(1, Math.round((finishedAt - session.startedAt) / 1000))
      const correct = session.order.filter((x) => session.answers[x.id] === x.answer).length
      const record: QuizSessionRecord = {
        score: correct * POINTS,
        correct,
        total: session.order.length,
        seconds,
        at: finishedAt,
      }
      onProgress({
        ...progress,
        quizSessions: {
          ...progress.quizSessions,
          [stageId]: [...history, record].slice(-HISTORY),
        },
      })
      setSession({ ...session, finishedAt })
    } else {
      setSession({ ...session, index: session.index + 1 })
    }
  }

  if (!session) {
    return (
      <div className="quiz-idle">
        <div className="quiz-idle-main">
          <span className="quiz-idle-icon">
            <Icon name="question-circle" size={36} />
          </span>
          <div>
            <h2>Kuis Teori</h2>
            <p className="quiz-lead">
              Bank soal berisi {questions.length} soal. Tiap sesi mengambil {perSession} soal
              acak, jadi kombinasi bisa beda tiap kali kamu jalankan.
            </p>
          </div>
        </div>
        <div className="quiz-idle-side">
          {best > 0 ? (
            <div className="quiz-best">
              <span>Skor terbaik</span>
              <strong>{best}</strong>
            </div>
          ) : null}
          <button
            type="button"
            className="btn btn-primary btn-shine"
            onClick={start}
            disabled={questions.length === 0}
          >
            <Icon name="play" size={15} />
            Mulai kuis
          </button>
        </div>

        {history.length > 0 ? (
          <div className="quiz-history">
            <div className="quiz-history-title">Sesi terakhir</div>
            <div className="quiz-history-list">
              {[...history].slice(-HISTORY).reverse().map((r, i) => (
                <div className="quiz-history-row" key={`${r.at}-${i}`}>
                  <Icon name="trophy" size={13} />
                  <span className="qh-score">{r.score}</span>
                  <span className="qh-detail">{r.correct}/{r.total} benar</span>
                  <span className="qh-time">{fmtTime(r.seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (session.finishedAt !== null) {
    const finishedAt = session.finishedAt
    const seconds = Math.max(1, Math.round((finishedAt - session.startedAt) / 1000))
    const correct = session.order.filter((x) => session.answers[x.id] === x.answer).length
    const score = correct * POINTS
    const accuracy = Math.round((correct / session.order.length) * 100)
    const avg = Math.max(1, Math.round(seconds / session.order.length))

    return (
      <div className="quiz-done">
        <div className="quiz-scoreband">
          <ProgressRing value={correct} total={session.order.length} size={96}>
            {accuracy}%
          </ProgressRing>
          <div className="quiz-scoreband-text">
            <h2>Kuis selesai</h2>
            <p>{correct} dari {session.order.length} jawaban benar.</p>
          </div>
          <div className="quiz-score-points">
            <span>Poin</span>
            <strong>{score}</strong>
          </div>
        </div>

        <div className="quiz-stats">
          <div className="stat">
            <span className="stat-icon ok"><Icon name="circle-check" size={16} /></span>
            <span className="stat-value">{correct}/{session.order.length}</span>
            <span className="stat-label">Benar</span>
          </div>
          <div className="stat">
            <span className="stat-icon time"><Icon name="keyboard" size={16} /></span>
            <span className="stat-value">{fmtTime(seconds)}</span>
            <span className="stat-label">Waktu total</span>
          </div>
          <div className="stat">
            <span className="stat-icon acc"><Icon name="star" size={16} /></span>
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Akurasi</span>
          </div>
          <div className="stat">
            <span className="stat-icon avg"><Icon name="bolt" size={16} /></span>
            <span className="stat-value">{avg} dtk</span>
            <span className="stat-label">Rata-rata / soal</span>
          </div>
        </div>

        <div className="quiz-review">
          <div className="quiz-history-title">Rekap jawaban</div>
          {session.order.map((item, i) => {
            const ok = session.answers[item.id] === item.answer
            return (
              <div className={`quiz-review-row ${ok ? "ok" : "bad"}`} key={item.id}>
                <span className="qr-num">{i + 1}</span>
                <span className="qr-q">{item.question}</span>
                <Icon name={ok ? "circle-check" : "circle-xmark"} size={14} />
              </div>
            )
          })}
        </div>

        <div className="quiz-actions">
          <button type="button" className="btn btn-primary" onClick={start}>
            <Icon name="redo" size={15} />
            Ulangi kuis
          </button>
          <button type="button" className="btn" onClick={() => setSession(null)}>
            Kembali
          </button>
        </div>
      </div>
    )
  }

  const q = session.order[session.index]
  const chosen = session.answers[q.id]
  const answered = chosen !== undefined
  const correctSoFar = session.order.filter(
    (x, i) => i <= session.index && session.answers[x.id] === x.answer,
  ).length
  const elapsed = Math.max(0, Math.round(((session.finishedAt ?? now) - session.startedAt) / 1000))

  return (
    <div className="quiz-run">
      <div className="quiz-top">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setSession(null)}
        >
          <Icon name="xmark" size={14} />
          Keluar
        </button>
        <div
          className="quiz-dots"
          role="progressbar"
          aria-label="Kemajuan kuis"
          aria-valuemin={0}
          aria-valuemax={session.order.length}
          aria-valuenow={session.index + 1}
        >
          {session.order.map((item, i) => {
            const cls =
              i < session.index
                ? session.answers[item.id] === item.answer
                  ? "done-ok"
                  : "done-bad"
                : i === session.index
                  ? "current"
                  : "todo"
            return (
              <span className={`quiz-dot ${cls}`} key={item.id}>
                {i + 1}
              </span>
            )
          })}
        </div>
        <span className="quiz-timer">
          <Icon name="keyboard" size={14} />
          {fmtTime(elapsed)}
        </span>
      </div>

      <div className="quiz-slide" key={session.index}>
        <h2 className="quiz-question">{q.question}</h2>
        <div className="quiz-options">
          {q.options.map((opt, i) => {
            const state = !answered ? "" : i === q.answer ? "ok" : i === chosen ? "bad" : "muted"
            return (
              <button
                type="button"
                key={i}
                className={`quiz-opt ${state}`}
                disabled={answered}
                onClick={() => answer(i)}
              >
                <span className="quiz-opt-key">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
                {answered && i === q.answer ? (
                  <Icon name="check" size={14} className="quiz-opt-icon" />
                ) : null}
                {answered && i === chosen && i !== q.answer ? (
                  <Icon name="xmark" size={14} className="quiz-opt-icon" />
                ) : null}
              </button>
            )
          })}
        </div>
        {answered ? (
          <div className={`quiz-exp ${chosen === q.answer ? "ok" : "bad"}`}>
            <Icon name={chosen === q.answer ? "circle-check" : "info-circle"} size={15} />
            <span>{q.explanation}</span>
          </div>
        ) : null}
      </div>

      <div className="quiz-actionbar">
        <span className="quiz-poin">
          <Icon name="trophy" size={13} />
          Poin sementara: <strong>{correctSoFar * POINTS}</strong>
        </span>
        <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={!answered}>
          {session.index + 1 === session.order.length ? "Selesaikan kuis" : "Soal berikutnya"}
          <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  )
}
