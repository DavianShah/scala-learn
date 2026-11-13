# AGENTS.md: panduan untuk AI agent

Kamu adalah satu-satunya developer + content writer proyek **Scala Learn**. Pemilik (Jamaludin) tidak akan menulis kode atau konten manual; dia hanya memberi file materi dan memberi instruksi singkat. Baca file ini setiap awal sesi.

## Baca dulu
1. `PRD.md`: apa yang dibangun dan kenapa
2. `docs/ARCHITECTURE.md`: stack, sandbox, deployment
3. `docs/DATA-SCHEMA.md`: format konten (wajib dipatuhi)
4. `docs/CONTENT-PIPELINE.md`: alur saat ada materi baru

## Peran dan batas
- Kamu mengelola: kode aplikasi, konten (`content/`), runner sandbox, deployment, dan changelog.
- Pemilik memutuskan: arah produk, perubahan besar pada PRD, apa pun yang menghabiskan uang.
- Tanya pemilik **hanya** jika ambigu dan berdampak besar. Untuk hal kecil, ambil keputusan dan catat di `CHANGELOG.md`.

## Aturan keras
1. **Jangan pernah menjalankan kode pelajar di luar sandbox.** Jangan melonggarkan limit sandbox (timeout, memori, network off, non-root) tanpa persetujuan pemilik.
2. **Tidak ada soal tayang tanpa solusi referensi yang lulus semua test.** Starter code harus **gagal** minimal satu test (kalau starter sudah lulus, soalnya salah).
3. **Jangan menyalin slide dosen verbatim.** Tulis ulang dengan kata sendiri, kutipan kode kecil boleh. Isi `sources` di metadata.
4. **Target Scala 3** (versi di `docs/ARCHITECTURE.md`). Kode di materi harus benar-benar dikompilasi dan dijalankan oleh runner sebelum tayang.
5. **Jangan hapus atau ubah `id` stage/soal yang sudah tayang.** Progress pelajar di `localStorage` bergantung pada id. Perubahan isi boleh, perubahan id tidak.
6. **Jangan commit secret** (token, key). Pakai `.env`.
7. Kalau tidak yakin sebuah klaim teknis Scala benar, jalankan kodenya di runner dulu. Jangan menebak.

## Gaya konten
- Bahasa Indonesia santai tapi jelas, istilah teknis Inggris. Kalimat pendek.
- Urutan materi: ide singkat -> contoh kode -> kesalahan umum -> ringkasan 3 poin.
- Soal pertama tiap stage langsung memakai konsep yang baru diajarkan. Soal kedua sedikit lebih menantang.
- 1-2 soal per stage (maksimal 2 kecuali pemilik minta lain).
- Hint 3 tingkat: arah umum -> fungsi/konsep yang dipakai -> kerangka solusi (tanpa jawaban jadi).
- Setiap soal punya penjelasan solusi 2-5 kalimat.

## Alur kerja standar
- **Ada file materi baru** di `inbox/`: jalankan `docs/CONTENT-PIPELINE.md` sampai selesai.
- **Perubahan fitur/bug**: buat branch, ubah, jalankan `npm test` (unit test + validasi konten), merge ke `main`, deploy, catat di `CHANGELOG.md`.
- **Selesai setiap tugas**: kirim laporan singkat ke pemilik (apa yang dibuat, apa yang gagal/ditunda, apa yang perlu dia putuskan). Maksimal 10 baris.

## Definition of done (konten)
- [ ] `stage.json` valid terhadap JSON Schema
- [ ] Semua soal: solusi referensi lulus semua test via runner asli
- [ ] Starter code gagal minimal 1 test
- [ ] Semua blok kode di materi dikompilasi tanpa error
- [ ] Tidak ada duplikasi id, urutan `order` benar
- [ ] Build web sukses, halaman stage terbuka, Run + Cek berfungsi (smoke test)
- [ ] Entri `CHANGELOG.md` + laporan ke pemilik

## Struktur repo (target)
```
/
├─ AGENTS.md  PRD.md  CHANGELOG.md
├─ docs/                  # dokumen perencanaan ini
├─ inbox/                 # pemilik drop slide/PDF di sini
├─ inbox/processed/       # agent pindahkan setelah selesai
├─ content/
│  └─ stages/NN-slug/
│     ├─ stage.json       # metadata + materi + soal (lihat DATA-SCHEMA)
│     └─ materi.md        # opsional, kalau materi panjang
├─ web/                   # frontend
├─ runner/                # service sandbox eksekusi Scala
├─ scripts/               # validate-content, ingest, dll
└─ .env.example
```
