# Scala Learn

Web belajar pemrograman **Scala 3** untuk pemula — bahasa Indonesia, santai, dengan soal interaktif yang langsung bisa dijawab di browser.

## Stack

- **Frontend:** Vite + React + TypeScript. Output statis, deploy ke Vercel.
- **Runner:** [Judge0 CE publik](https://ce.judge0.com) (Scala 3.4.2). Kode pelajar **hanya** jalan di sandbox Judge0.
- **Konten:** `content/stages/<NN-slug>/stage.json`.

Tidak ada server sendiri, tidak ada Docker, tidak ada backend.

## Perintah

```bash
npm --prefix web install   # install dependency frontend
npm run dev                # dev server di 127.0.0.1:5173
npm run build              # build ke web/dist
npm test                   # unit test + validasi konten
npm run verify             # verifikasi kode materi + soal (butuh Judge0)
```

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Vercel -> Add New Project -> pilih repo.
3. **Root Directory:** `web`
4. **Build Command:** `npm run build`  ·  **Output Directory:** `dist`
5. Deploy.

## Struktur

```
content/stages/NN-slug/stage.json   # konten (materi + soal)
web/                                # frontend Vite + React
scripts/validate-content.mjs        # skema + semantik konten
scripts/verify-lesson-code.mjs      # jalankan contoh kode materi
scripts/verify-problems.mjs         # solution lulus semua test, starter gagal
inbox/                              # slide masuk
docs/                               # arsitektur, skema, pipeline
```

## Aturan main

Lihat `AGENTS.md`. Intinya: kode pelajar wajib di sandbox, soal tayang wajib punya solusi yang lulus semua test, jangan salin slide verbatim, jangan ubah `id` stage/soal yang sudah tayang.
