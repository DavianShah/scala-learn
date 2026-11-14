# Changelog

## 2026-11-14 — soal praktikum asli, coming soon, hero scramble

### Ditambahkan
- Tiga stage praktikum berisi 9 soal asli dari `SOAL PRAK PEMROG UAS.pdf`: `prak-8` (Minggu 9: Ganjil, Mutlak, Faktorial), `prak-9` (Minggu 10: Jumlah Kuadrat, Pencarian, Huruf Nama), `prak-10` (Minggu 11: Kuadrat Terbesar, Huruf Mutu, Palindrome). Penomoran mengikuti jadwal praktikum yang telat satu pertemuan dari nomor pertemuan di soal.
- Kata **Scala** di judul hero dianimasikan scramble per huruf (komponen `ScrambleText`): acak saat halaman dibuka, diam, dan diulang saat hover. Gradient brand + glow halus; `prefers-reduced-motion` mematikannya.
- Panel **Coming soon** di tab Praktik coding, beranda (badge + ringkasan), dan halaman Latihan Praktikum untuk stage yang praktikumnya belum keluar.

### Diubah
- Stage 8 & 9 (Minggu 12) soal praktik karangan dikosongkan: praktikum Minggu 12 belum ada, jadi tampil Coming soon. Materi teori, kuis, dan bank soal tetap ada.
- Halaman **Latihan Praktikum** khusus menampilkan soal asli praktikum (`prak-*`); soal tahap lain tidak lagi tampil di sana (tetap ada di dalam stage masing-masing, tab Latihan > Praktik coding).
- Box Coming soon dibuat ulang: kotak kosong dengan baris samar yang diblur dan satu teks "Praktikum Coming Soon" di tengah — bukan panel deskripsi di dalam box materi.
- Kartu stage di beranda dibersihkan: nomor urut dan meta (jumlah soal / estimasi menit / panah) dihapus, sisa judul + deskripsi singkat.
- Judul hero **Scala** kini diacak ulang tiap 5 detik (selain saat halaman dibuka dan saat hover).
- Dropdown minggu di beranda otomatis terbuka di minggu pertama (Minggu 9), bukan minggu terakhir.
- Validator konten mengizinkan 0 soal (coming soon) dan menaikkan batas maksimal jadi 3 soal per stage.
- Routing hash kini mengenali `prak-*` selain `stage-*`.

### Diperbaiki
- Test tersembunyi `prak-9-cari-bilangan` memakai format input yang benar (`N K` di baris pertama).

### Diverifikasi
- Build lolos; validasi konten 12 stage, 23 soal.
- Solusi 23 soal dijalankan sungguhan di Judge0 (Scala 3.4.2) terhadap semua test case.

## 2026-11-14 — kuis per sesi, navbar, kategori minggu, font Inter

### Ditambahkan
- Kuis pilihan ganda sekarang per sesi: tombol **Mulai kuis**, satu soal per tampilan dengan animasi geser, segmented progress, timer, jawaban terkunci, dan di akhir statistik poin, benar/total, waktu total, akurasi, rata-rata per soal, plus rekap jawaban. Riwayat 5 sesi tersimpan.
- Bank soal baru (`quiz-bank.json`) 6 soal per stage; tiap sesi mengambil 10 soal acak dari 20+ soal, jadi kombinasi berbeda tiap user/percobaan.
- Navbar Home, Playground, Latihan Praktikum. Halaman Playground (coba kode bebas, penilaian Judge0) dan halaman Latihan Praktikum (semua soal coding per stage).
- Beranda dikelompokkan per minggu jadi accordion; badge minggu empat aksen lembut.
- Font Inter Variable self-host; logo baru tiga balok simetris (SVG), favicon ikut.

### Diubah
- Hero: judul jadi "Belajar Matkul Pemrog — materi Scala", deskripsi jadi catatan bahwa materi diupdate per minggu mengikuti PPT dosen dan diambil dari materi/soal asli Pemrograman.
- Stage 8 dipecah dua: `stage-8` Array & List dasar (15 blok) dan `stage-9` List & rekursi (11 blok) — materi lebih ringan.
- UI lebih colorful: hero gradient lembut, tombol/progres bergradient, kartu stage vertikal dengan ringkasan, ikon statistik berwarna.
- Footer diganti jadi "made by Dav with pecut".

### Diperbaiki
- Sound: `solve` khusus jawaban kuis benar, `wrong` khusus jawaban salah/tes gagal, `cheer` khusus saat semua soal coding satu stage selesai. Suara lain dihentikan sebelum memutar supaya tidak tumpang tindih/"random".
- Playground tidak lagi dianggap gagal hanya karena warning JVM di stderr; warning itu ikut difilter.

### Diverifikasi
- Build tsc + vite lolos, `progress.test.ts` 3/3 lolos, `validate-content` lolos (9 stage, 16 soal praktik).
- Uji browser: alur kuis 10 soal sampai statistik + localStorage, Playground lolos Judge0, responsif 390px tanpa scroll horizontal, mode gelap.

## 2026-11-14 — layout full width + soal praktik dua kolom

### Diubah
- Batas lebar konten 860px dihapus, halaman jadi full width dengan padding samping 24px (16px di HP) dan topbar full-bleed. Kartu stage otomatis multi-kolom mengisi layar.
- Soal praktik coding sekarang dua kolom: panel soal plus petunjuk di kiri, editor, tombol, output, dan hasil tes di kanan. Editor punya gutter nomor baris per baris yang sejajar dengan isinya. Konsep layout mengikuti editor latihan umum, palet warna tetap warm Pemrok. Di lebar di bawah 900px otomatis jadi satu kolom.

### Diverifikasi
- Build tsc + vite lolos, uji end-to-end "Cek jawaban" 4/4 tes di layout baru, cek responsif 780px dan 390px tanpa scroll horizontal.

## 2026-11-14 — stage 8 Array, List & Container

### Ditambahkan
- `stage-8` `container-array-list` dari slide `KOM2205 - K12 - CONTAINER - STUDENT.pdf`: struktur data vs container, sifat Array, akses/modifikasi indeks, HOF di Array, karakteristik List, operasi `++`/`.concat`/`:+`, operator `::` head/tail, rekursi di List, 2 studi kasus (kemunculan nilai, penjumlahan genap), dan 3 soal diskusi kelas.
- 15 soal kuis stage 8 plus 2 soal praktik coding: "Kuadrat Bilangan Ganjil" dan "Gabung Dua List Terurut".
- Meta `og:*` dan `twitter:*` beserta `public/og.png` (1200x630) supaya link preview menampilkan judul, deskripsi, dan gambar.

### Diverifikasi
- `validate-content` lolos, semua kode materi (37 contoh) lolos Judge0, solusi soal stage 8 4/4 tes.

## 2026-11-14 — restyle UI warm minimalism + fix penilaian soal

### Ditambahkan
- Ikon asli dari font Nerd Font subset (`web/public/fonts/icons.woff2`, 15 KB) lewat komponen `Icon`. Tidak ada lagi emoji di UI.
- Font kode JetBrains Mono untuk editor, output, dan blok kode.
- Konfeti + animasi pop/shake saat lolos atau gagal.
- Tombol salin di contoh kode materi, editor soal, dan solusi.
- Toast untuk ekspor/impor/reset progres.
- Progress bar total di beranda (soal selesai vs total).
- `DESIGN.md`: arah desain dan token warna.

### Diubah
- Tema jadi terang hangat (bukan dark). Palet: dasar `#fafaf9`, aksen hijau `#15803d`, garis tipis. Bukan klon Duolingo, hanya meminjam idenya "belajar itu bisa ringan".
- Em dash di materi diganti tanda baca natural.
- **Fix penilaian:** tiap test case dijalankan sebagai eksekusi Scala terpisah. Sebelumnya semua input digabung satu run, sehingga program yang membaca satu baris per eksekusi selalu gagal semua tes.

### Catatan
- Judul tab dan ikon font diambil dari `index.html` + `public/fonts/`. Vercel menyajikan apa yang ada di repo.

## 2026-11-12 — v0.1 seed

### Ditambahkan
- 7 stage konten (`stage-1` .. `stage-7`) dari slide KOM120C K09, KOM2205 K10, KOM2205 K11.
- 14 soal dengan test (min 3, ada hidden), 3 tingkat hint, dan solusi referensi.
- Frontend React + Vite: daftar materi, editor kode, panel output, progress `localStorage`, dark mode.
- Runner sandbox via Judge0 CE publik (Scala 3.4.2).
- Script validasi: `validate-content`, `verify-lesson-code`, `verify-problems`.
- Unit test (vitest): `normalizeOutput`, `truncate`, import/export progress.

### Diubah
- Runner dipindah dari Docker sandbox lokal ke **Judge0 CE publik**: web jadi statis penuh di Vercel, tanpa server sendiri. Konsekuensi: test (termasuk `hidden`) dan solusi ikut ter-bundle — "hidden" berarti tidak ditampilkan di UI, bukan tersembunyi dari inspect. Detail di `docs/ARCHITECTURE.md`.

### Catatan
- Entry point Scala wajib `object Main { def main(args: Array[String]): Unit = ... }` (batas Judge0).
- Contoh kode materi yang butuh stdin ditandai `runnable: false`.

## 2026-11-13 — fix: warning JVM di panel output

### Diubah
- Panel output menyaring warning `sun.misc.Unsafe` dari JDK modern. Warning itu muncul di `stderr`/`compile_output` saat Scala 3 memakai `lazy val`; **stdout tetap bersih**, jadi penilaian soal tidak terpengaruh. Disaring hanya supaya panel tidak menakut-nakuti pemula.
