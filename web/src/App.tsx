import { useEffect, useState } from "react"
import { stages } from "./lib/content"
import { loadProgress, saveProgress, type Progress } from "./lib/progress"
import { Icon } from "./components/Icon"
import { LogoMark } from "./components/Logo"
import { Home } from "./components/Home"
import { StageView } from "./components/StageView"
import { Playground } from "./components/Playground"
import { Practice } from "./components/Practice"

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

  const linkClass = (name: Route["name"]) =>
    `nav-link${route.name === name ? " active" : ""}`

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/" aria-label="Pemroq - beranda">
          <LogoMark size={30} />
          <span>Pemroq</span>
        </a>
        <nav className="nav" aria-label="Navigasi utama">
          <a className={linkClass("home")} href="#/">
            <Icon name="book" size={14} />
            Home
          </a>
          <a className={linkClass("playground")} href="#/playground">
            <Icon name="terminal" size={14} />
            Playground
          </a>
          <a className={linkClass("practice")} href="#/latihan">
            <Icon name="code" size={14} />
            Latihan Praktikum
          </a>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Ubah ke tema terang" : "Ubah ke tema gelap"}
        >
          {theme === "dark" ? "Tema terang" : "Tema gelap"}
        </button>
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
  )
}
