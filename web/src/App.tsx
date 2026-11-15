import { useEffect, useState } from "react"
import { stages } from "./lib/content"
import { loadProgress, saveProgress, type Progress } from "./lib/progress"
import { Icon } from "./components/Icon"
import { LogoMark } from "./components/Logo"
import { Home } from "./components/Home"
import { StageView } from "./components/StageView"
import { Playground } from "./components/Playground"
import { Practice } from "./components/Practice"
import { ThemeSwitch } from "./components/ThemeSwitch"
import { ProgressRing } from "./components/ProgressRing"

type Route =
  | { name: "home" }
  | { name: "stage"; id: string }
  | { name: "playground" }
  | { name: "practice" }

const THEME_KEY = "pemroq-theme"
const THEME_LEGACY = "pemrok-theme"

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#/, "")
  if (h === "/playground") return { name: "playground" }
  if (h === "/latihan") return { name: "practice" }
  if (h.startsWith("stage-") || h.startsWith("prak-")) return { name: "stage", id: h }
  return { name: "home" }
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  )

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  function updateProgress(next: Progress) {
    setProgress(next)
    saveProgress(next)
  }

  const stage = route.name === "stage" ? stages.find((s) => s.id === route.id) : undefined

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    document.documentElement.dataset.theme = next === "dark" ? "dark" : ""
    try {
      localStorage.setItem(THEME_KEY, next)
      localStorage.removeItem(THEME_LEGACY)
    } catch {
      /* localStorage tak tersedia */
    }
  }

  const totalProblems = stages.reduce((n, s) => n + s.problems.length, 0)
  const solved = Object.values(progress.solved).filter(Boolean).length
  const doneStages = stages.filter(
    (s) => s.problems.length > 0 && s.problems.every((p) => progress.solved[p.id]),
  ).length
  const pct = totalProblems ? Math.round((solved / totalProblems) * 100) : 0

  const navItems = [
    { name: "home" as const, href: "#/", icon: "book" as const, label: "Home" },
    { name: "playground" as const, href: "#/playground", icon: "terminal" as const, label: "Playground" },
    { name: "practice" as const, href: "#/latihan", icon: "code" as const, label: "Latihan Praktikum" },
  ]

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#/" aria-label="Pemroq - beranda">
          <LogoMark size={32} />
          <span>Pemroq</span>
        </a>
        <nav className="sidenav" aria-label="Navigasi utama">
          {navItems.map((item) => (
            <a
              key={item.name}
              className={`sidenav-link${route.name === item.name ? " active" : ""}`}
              href={item.href}
              aria-current={route.name === item.name ? "page" : undefined}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </a>
          ))}
        </nav>
        <div className="side-progress">
          <ProgressRing value={solved} total={totalProblems} size={64}>
            {pct}%
          </ProgressRing>
          <div className="side-progress-text">
            <strong>
              {solved} / {totalProblems} soal
            </strong>
            <span>
              {doneStages} dari {stages.length} materi selesai
            </span>
          </div>
        </div>
        <div className="side-foot">
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />
          <span className="side-foot-label">{theme === "dark" ? "Gelap" : "Terang"}</span>
        </div>
      </aside>

      <div className="main-col">
        <header className="topbar">
          <a className="brand" href="#/" aria-label="Pemroq - beranda">
            <LogoMark size={30} />
            <span>Pemroq</span>
          </a>
          <ThemeSwitch theme={theme} onToggle={toggleTheme} />
        </header>

        <main className="content">
          {route.name === "home" && <Home progress={progress} />}
          {route.name === "stage" && stage && (
            <StageView stage={stage} progress={progress} onProgress={updateProgress} />
          )}
          {route.name === "playground" && <Playground />}
          {route.name === "practice" && <Practice progress={progress} />}
        </main>

        <footer className="footer-note">
          <span>made by Dav with pecut</span>
          <span className="footer-update">
            Materi bakal di update per Minggu nya sesuai ppt dosen.
          </span>
        </footer>
      </div>

      <nav className="bottombar" aria-label="Navigasi utama">
        {navItems.map((item) => (
          <a
            key={item.name}
            className={`bottom-link${route.name === item.name ? " active" : ""}`}
            href={item.href}
            aria-current={route.name === item.name ? "page" : undefined}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}
