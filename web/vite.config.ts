/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Root repo ada satu level di atas `web/` — ini dibaca frontend dari
// `content/stages/**/stage.json` saat build (import.meta.glob).
const repoRoot = fileURLToPath(new URL("..", import.meta.url))

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    fs: { allow: [repoRoot] },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
