# DESIGN.md

Deklarasi arah desain **Pemroq**. Aturan: tiap keputusan punya alasan tertulis.
Referensi: skill `anti-slop` (R-01..R-50) dan `popular-web-designs`.

## Product truth
Web belajar Scala interaktif untuk peserta Pemrog sesi UAS. Isinya materi pendek, kuis teori, dan soal coding yang langsung bisa dijawab di browser, dinilai oleh sandbox Judge0. Kode pelajar tidak pernah jalan di mesin ini. Materi diperbarui mingguan mengikuti pace dosen.

## Audience
Mahasiswa CS Indonesia yang baru kenal Scala. Mereka butuh penjelasan yang tenang dan jelas, bukan dor-doran motivasi ala aplikasi kursus.

## Visual language
**Warm minimalism.** Putih hangat, garis tipis, satu aksen hijau, ruang napas lega, hierarki jelas.
Interaktif: umpan balik langsung saat menjalankan dan memeriksa kode, plus efek suara pendek dan ledakan konfeti saat lolos.
Bukan klon Duolingo. Kita hanya meminjam satu hal: belajar itu bisa ringan.

## Palette

| Token | Value | Alasan |
|---|---|---|
| `base` | `#fafaf9` | putih hangat, tidak steril di mata |
| `surface` | `#ffffff` | kartu, panel |
| `ink` | `#1c1917` | teks utama, kontras ~16:1 di base |
| `muted` | `#78716c` | teks sekunder, kontras ~4.8:1 (AA) |
| `line` | `#e7e5e4` | garis pemisah, tidak dominan |
| `primary` | `#15803d` | tombol & aksi utama; teks gelap `#052e16` di atasnya ~7:1 (AAA) |
| `primary-hover` | `#166534` | hover, lebih gelap |
| `primary-soft` | `#f0fdf4` | latar sukses / sorotan |
| `info` | `#1d4ed8` | tautan dan info |
| `warn` | `#b45309` | peringatan, latar `#fffbeb` |
| `danger` | `#b91c1c` | error dan kegagalan, latar `#fef2f2` |

## Typography
- **UI:** `system-ui` stack. Alasan: native, instan, netral, nambah nol byte.
- **Kode:** `JetBrains Mono` (self-hosted, latin only). Alasan: lebar tetap, beda jelas huruf `l`/`1`/`O`/`0`.
- **Ikon:** Nerd Font subset (`icons.woff2`, 15KB) berisi 65 glyph Font Awesome. Alasan: satu file kecil, bukan emoji, bukan SVG berantai.

## Motion
- Transisi `120-180ms ease-out`.
- Klik: `scale(0.98)`.
- Sukses: checkmark pop lalu confetti ringan.
- Gagal: shake halus pada kartu.
- Semua animasi dimatikan saat `prefers-reduced-motion: reduce`.

## Mode gelap
Token yang sama, nilai diganti lewat `[data-theme="dark"]`. Pilihan pengguna disimpan di `localStorage` (`pemroq-theme`); kalau belum ada, ikut `prefers-color-scheme`. Tema diterapkan di `index.html` sebelum paint supaya tak ada kedip. Alasan: membaca kode malam hari di kamar kos itu nyata.

## Pola interaksi
- Tombol besar (min 44px tinggi sentuh), sudut 12px, garis bawah tebal khas tombol "3D" yang turun saat ditekan.
- Umpan balik status wajib ada: menunggu, berhasil, gagal, kosong.
- Ikon dipakai hanya di tempat yang artinya benar-benar nyambung (R-04).
- Semua elemen interaktif punya `:focus-visible` yang kelihatan (R-39).
- Setiap stage punya dua tab, **Materi** dan **Latihan**. Di latihan ada sub-tab **Praktik coding** dan **Kuis teori**. Tombol "Lanjut ke latihan" menutup materi tanpa mengunci, balik ke materi bisa dari tab yang sama.
- Kuis teori dijalankan per sesi: bank soal 20+ per stage (soal lama + `quiz-bank.json`), tiap sesi mengambil 10 soal acak sehingga kombinasi beda tiap kali. Satu soal per tampilan dengan transisi geser dan segmented progress; jawaban terkunci setelah dipilih. Di akhir tampil statistik poin, benar/total, waktu total, akurasi, rata-rata per soal, plus rekap jawaban. Riwayat 5 sesi terakhir tersimpan di localStorage.
- Halaman full width: batas lebar konten dihapus, padding samping 24px (16px di HP), topbar full-bleed. Kartu stage otomatis beberapa kolom mengisi layar.
- Soal praktik coding pakai dua kolom: panel soal plus petunjuk di kiri, editor, tombol, output, dan hasil tes di kanan. Editor punya gutter nomor baris di sebelah kiri yang sejajar dengan isinya. Di bawah 900px otomatis jadi satu kolom. Konsepnya mengikuti layout editor latihan umum (soal di kiri, kerja di kanan), bukan salinan persis.
- Navbar atas: Home, Playground, Latihan Praktikum. Hero hanya memakai satu CTA ("Mulai belajar") — taut Latihan Soal & Playground ada di navbar. Tombol tema di ujung kanan berbentuk switcher kapsul berisi ikon matahari (terang) dan bulan (gelap); thumb berpindah ke bulan saat dark mode aktif.
- Beranda dikelompokkan per minggu sebagai accordion (satu minggu bisa berisi beberapa materi). Badge minggu memakai satu dari empat aksen lembut: hijau, amber, indigo, teal. Aksen yang sama dipakai untuk gradient hero, progres, dan ikon statistik — warna tetap terbatas, bukan rainbow. Tiap kartu stage punya notch di pojok kanan atas: **Praktikum** (hijau) atau **Materi** (kuning), supaya praktikum gampang dibedakan.
- Halaman Latihan Praktikum menampilkan soal asli praktikum per minggu, lengkap dengan penanda Coming Soon untuk minggu yang belum keluar (Minggu 12).
- Font antarmuka Inter Variable (self-host lewat `@fontsource-variable/inter`), mirip font sistem modern; kode tetap JetBrains Mono.
- Logo tiga balok simetris (SVG `public/logo.svg`, komponen `Logo.tsx`) — sengaja tidak memakai glyph prompt miring.
- Judul hero: kata **Scala** dianimasikan per huruf (komponen `ScrambleText`): acak saat halaman dibuka, diam, lalu diacak ulang tiap 5 detik; hover juga memicu animasi baru. Teks solid (`--primary`, tanpa gradient/glow); ambient hero sangat halus. `prefers-reduced-motion` mematikan animasi, dan `aria-label` menyimpan teks asli.
- Navbar solid (tanpa blur/glass). Kartu stage flat dengan border; bayangan hanya muncul saat hover/interaksi.
- Halaman **Latihan Praktikum** hanya menampilkan soal asli praktikum (`prak-*`); soal tahap lain tetap hidup di dalam stage masing-masing.
- Kalau praktikum belum keluar, stage menampilkan kotak blur **Praktikum Coming Soon**: baris samar yang diblur sebagai latar, satu teks tegas di tengah. Beranda tetap memakai badge Coming soon. Validator mengizinkan stage dengan 0 soal (maks 3).
- Kartu stage di beranda berisi judul + deskripsi singkat saja (tanpa nomor, jumlah soal, atau estimasi menit). Dropdown minggu terbuka default di minggu pertama.
- Suara: `solve` hanya saat jawaban kuis benar, `wrong` hanya saat jawaban kuis salah atau tes kode gagal, `cheer` hanya saat semua soal praktik coding satu stage selesai. File pendek di `public/sounds`, dimainkan lewat `lib/sound.ts`; fungsi ini menghentikan suara lain sebelum memutar supaya tidak tumpang tindih. Klik tombol atau tab biasa sengaja tidak bersuara.
- Konfeti ringan (36 keping, sekitar 1,15 detik) saat lolos soal praktik. Kuis sempurna cukup statistik, tanpa suara tambahan.

## Yang sengaja tidak dipakai
- Emoji sebagai ikon (diganti Nerd Font).
- Em dash di teks (R-02).
- Grid gradien ala Lovable.
- Sudut membulat berlebihan (glassmorphism).
