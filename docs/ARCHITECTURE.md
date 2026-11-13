# Arsitektur

## Komponen
```
Browser (web/) --static--> Vercel (CDN)
Browser --POST /submissions--> Judge0 CE public API (Scala 3.4.2)
Agent --baca/tulis--> content/ (Git) --> build web --> deploy Vercel
```

Tidak ada server sendiri, tidak ada Docker, tidak ada backend. Semua statis + satu API publik.

## Frontend (`web/`)
- **Vite + React + TypeScript**, output statis, deploy ke **Vercel**.
- Editor: `textarea` monospace + highlight ringan (tanpa Monaco/CodeMirror supaya bundle kecil dan build simpel).
- Konten stage dibaca dari `content/stages/**/stage.json` saat build (`import.meta.glob`).
- **Tradeoff yang disepakati pemilik:** frontend memanggil Judge0 langsung, jadi test (termasuk `hidden`) dan `solution` ikut ter-bundle. Artinya "hidden" = tidak ditampilkan di UI, bukan benar-benar tersembunyi dari inspect browser.
- UI: daftar stage + progress, panel materi, panel editor + output. Progress di `localStorage`. Dark mode.

## Runner: Judge0 CE publik
- Layanan: `https://ce.judge0.com` (Judge0 CE v1.14.0). `language_id` **112** = **Scala 3.4.2**.
- Dipanglangsung dari browser; CORS terbuka (`access-control-allow-origin` echo origin, `allow-methods: *`).
- Tanpa API key, tanpa auth, tanpa server.
- **Entry point wajib** `object Main { def main(args: Array[String]): Unit = ... }`.
  `@main def` dan top-level **tidak** jalan (Judge0 panggil entry point `Main` yang spesifik).
- Batas per submission: `wall_time_limit` 10s, `cpu_time_limit` 5s, `memory_limit` 51200 KB, output dipotong 64 KB, kode maks 20 KB.
- Rate limit publik tidak terdokumentasi; sisi agent memace wajar saat validasi konten ( concurrency kecil + jeda).

### Tradeoff
| Aspek | Konsekuensi |
|---|---|
| Stabilitas | Instance publik bersama — bisa lambat (4-11s) atau down. Kalau mati, tombol Run mati; materi tetap bisa dibaca. |
| Test hidden | Ada di bundle (bisa di-inspect). |
| Biaya | 0 |
| Ops | 0 (no server, no Docker, no gateway) |

## Sandbox
Kode pelajar **hanya** jalan di sandbox Judge0 (container terisolasi, network mati, non-root).
Kode tidak pernah jalan di browser, di Vercel, atau di mesin agent.

## Testing
- `npm test` = unit test frontend + `scripts/validate-content` (schema + semantik).
- `scripts/verify-problems`: untuk tiap soal, jalankan `solution` ke semua test (harus lulus) dan `starter` (harus gagal minimal 1) via Judge0. Anti-flaky: diulang 2x.
- `scripts/verify-lesson-code`: jalankan semua blok `runnable`, cocokkan/isi `output`.
- Smoke test e2e: build web, buka stage 1, Run contoh, Cek solusi referensi -> lulus.

## Deployment
- **Vercel**, git-connected. Build command `npm run build` (cwd `web/`), output `web/dist`.
- Agent push ke `main` -> Vercel auto-deploy -> smoke test -> rollback manual kalau gagal.
- Backup: repo Git di GitHub (konten = file).
