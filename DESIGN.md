# DESIGN.md

Deklarasi arah desain **Pemroq**. Aturan: tiap keputusan punya alasan tertulis.
Referensi: skill `anti-slop` (R-01..R-50) dan `popular-web-designs`.

## Product truth
Web belajar Scala interaktif untuk peserta Pemrog sesi UAS. Isinya materi pendek, kuis teori, dan soal coding yang langsung bisa dijawab di browser, dinilai oleh sandbox Judge0. Kode pelajar tidak pernah jalan di mesin ini. Materi diperbarui mingguan mengikuti pace dosen.

## Audience
Mahasiswa CS Indonesia yang baru kenal Scala. Mereka butuh penjelasan yang tenang dan jelas, bukan dor-doran motivasi ala aplikasi kursus.

## Visual language
**Netral + biru langit sebagai aksen utama, colorful sebagai variasi.** Basis situs netral: latar putih / netral sangat terang, teks gelap netral, garis halus netral — supaya warna nge-pop. Biru langit dipakai hemat hanya sebagai aksen: tombol utama/CTA, state aktif, highlight penting, isi bar progres, link, dan sentuhan dekoratif kecil. Bukan latar biru di mana-mana. Warna lain — kuning hangat, hijau, coral/oranye, ungu, teal — dipakai untuk variasi: aksen minggu/stage yang berbeda, kategori, elemen dekoratif, ilustrasi. Satu warna brand utama yang jelas (biru langit), sisanya variasi. Hijau juga tetap dipakai untuk makna sukses/benar, kuning untuk poin/peringatan.
Interaktif: umpan balik langsung saat menjalankan dan memeriksa kode, plus efek suara pendek dan ledakan konfeti saat lolos. Tombol chunky yang "tenggelam" saat ditekan, kartu yang terangkat saat hover, progres beranimasi.
Bukan klon Duolingo. Kita hanya meminjam semangatnya: belajar itu bisa ringan dan gerakannya menyenangkan.

## Palette

| Token | Value | Alasan |
|---|---|---|
| `base` | `#fafafa` | netral sangat terang, lapang; warna bisa nge-pop |
| `surface` | `#ffffff` | kartu, panel |
| `ink` | `#0f172a` | teks utama netral, kontras tinggi di base |
| `muted` | `#64748b` | teks sekunder, kontras AA |
| `line` | `#e2e8f0` | garis pemisah netral halus |
| `primary` | `#0ea5e9` | tombol & aksi utama; teks putih di atasnya |
| `primary-hover` | `#0284c7` | hover, lebih gelap |
| `primary-deep` | `#0369a1` | garis bawah tombol 3D, teks aksen |
| `primary-soft` | `#e0f2fe` | latar sorotan / sukses lembut |
| `amber` / `green` / `coral` / `violet` / `teal` | `#f59e0b` / `#22c55e` / `#f97316` / `#8b5cf6` / `#14b8a6` | variasi warna per minggu/stage (siklus `WEEK_COLORS`), kategori, dekorasi; masing-masing punya varian `-soft` / `-border` / `-ink` |
| `ok` | `#16a34a` | hanya untuk makna sukses/benar, bukan merek |
| `info` | `#0284c7` | tautan dan info |
| `warn` | `#b45309` | peringatan, latar `#fffbeb` |
| `danger` | `#dc2626` | error dan kegagalan, latar `#fef2f2` |

Mode gelap: basis netral gelap — `base #0f172a`, `surface #1e293b`, `primary #38bdf8` (teks gelap `#082f49` di atasnya); warna variasi ikut digelapkan (token `-soft`/`-border`/`-ink` per warna).

## Typography
- **UI:** `system-ui` stack. Alasan: native, instan, netral, nambah nol byte.
- **Kode:** `JetBrains Mono` (self-hosted, latin only). Alasan: lebar tetap, beda jelas huruf `l`/`1`/`O`/`0`.
- **Ikon:** Nerd Font subset (`icons.woff2`, 15KB) berisi 65 glyph Font Awesome. Alasan: satu file kecil, bukan emoji, bukan SVG berantai.

## Motion
- Transisi `140-200ms`, ease `cubic-bezier(0.34, 1.56, 0.64, 1)` untuk tekan (bouncy), `cubic-bezier(0.22, 1, 0.36, 1)` untuk masuk.
- Klik tombol: turun 2px + garis bawah menipis (efek 3D); kartu hover naik 4px.
- Masuk halaman: fade-up bertahap (`rise`, fill backwards supaya hover tetap jalan).
- Progres: cincin progres SVG (gradient biru langit) di sidebar, rail beranda, dan hero stage; bar progres minggu memakai warna aksen minggu itu; titik kuis aktif berdenyut halus.
- Sukses: checkmark pop lalu confetti ringan (palet langit + kuning).
- Gagal: shake halus pada kartu.
- Semua animasi dimatikan saat `prefers-reduced-motion: reduce`.

## Mode gelap
Token yang sama, nilai diganti lewat `[data-theme="dark"]`. Pilihan pengguna disimpan di `localStorage` (`pemroq-theme`); kalau belum ada, ikut `prefers-color-scheme`. Tema diterapkan di `index.html` sebelum paint supaya tak ada kedip. Alasan: membaca kode malam hari di kamar kos itu nyata.

## Pola interaksi
- Tombol besar (min 44px tinggi sentuh), sudut 12px, garis bawah tebal khas tombol "3D" yang turun saat ditekan.
- Umpan balik status wajib ada: menunggu, berhasil, gagal, kosong.
- Ikon dipakai hanya di tempat yang artinya benar-benar nyambung (R-04).
- Semua elemen interaktif punya `:focus-visible` yang kelihatan (R-39).
- Setiap stage punya dua mode, **Materi** dan **Latihan**, dipilih lewat pill switcher di tengah halaman (bukan tab full-width). Di latihan ada sub-tab **Praktik coding** dan **Kuis teori**. Tombol "Lanjut ke latihan" di bawah materi menutup materi tanpa mengunci, balik ke materi bisa dari pill yang sama.
- Kuis teori dijalankan per sesi: bank soal 20+ per stage (soal lama + `quiz-bank.json`), tiap sesi mengambil 10 soal acak sehingga kombinasi beda tiap kali. Satu soal per tampilan dengan transisi geser dan titik bernomor (benar/salah/aktif), jawaban terkunci setelah dipilih, penjelasan muncul di bawah soal, dan tombol aksi besar di bar bawah. Di akhir tampil band skor (cincin akurasi + poin), 4 stat (benar/total, waktu total, akurasi, rata-rata per soal — poin sudah di band), plus rekap jawaban. Riwayat 5 sesi terakhir tersimpan di localStorage.
- Kerangka aplikasi: sidebar kiri 248px di desktop (brand, nav bertumpuk, kartu cincin progres, switcher tema di bawah); di bawah 1024px sidebar hilang dan diganti topbar (brand + tema) + bottom tab bar 3 item. Konten max-width 1120px, padding samping 32px (16px di HP).
- Beranda: hero band dua kolom (kiri: eyebrow, judul, deskripsi, CTA "Lanjutkan belajar"/"Mulai belajar" + "Coba Playground", stat; kanan: jendela kode dekoratif + chip melayang, latar dot-matrix) lalu jalur belajar vertikal: tiap minggu jadi chapter dengan pill warna minggu + bar progres minggu, node-node stage sebagai lingkaran di trek vertikal (selesai = hijau + centang, saat ini = biru + denyut + tag "Lanjutkan", sebagian = outline biru, segera = garis putus-putus). Rail kanan sticky berisi kartu progres (cincin), kartu poin kuis, dan tautan cepat Playground / Latihan Praktikum.
- Halaman stage: bar navigasi stage (kembali + prev/next stage), hero band stage (kicker, judul, mata kuliah, meta, cincin progres soal), pill mode switcher, lalu materi dalam layout dua kolom (kolom baca + rail kanan sticky berisi tujuan & fakta stage) atau latihan. Kartu "Stage berikutnya" di bawah.
- Soal praktik coding pakai workbench: header bar penuh (judul + chip kesulitan + status selesai), badan dua kolom — brief di kiri (pernyataan + contoh tes + petunjuk) dan area kerja di kanan (toolbar di ATAS editor: Jalankan / Cek jawaban / Salin / Petunjuk, editor dengan gutter nomor baris, konsol di bawah editor berisi output + verdict + hasil tes + empty state). Solusi dosen tetap di bawah. Di bawah 900px otomatis jadi satu kolom. Chip kesulitan: Dasar = hijau, Lanjutan = coral.
- Playground pakai workbench dua kolom: panel editor kiri (toolbar di atas: Jalankan / Reset contoh) + panel konsol kanan (header + chip status, empty state, output saat jalan).
- Halaman Latihan Praktikum: strip ringkasan (total soal, selesai, minggu) + grid 2 kolom kartu minggu (header band warna minggu + baris soal dengan status), kartu Minggu 12 Coming Soon tetap ada.
- Navbar atas diganti sidebar; tombol tema tetap switcher kapsul berisi ikon matahari (terang) dan bulan (gelap); thumb berpindah ke bulan saat dark mode aktif.
- Komponen dekorasi 21st.dev diadaptasi ke CSS murni (tanpa dependency baru): **Shiny Button** (Hyperiux) → class `.btn-shine`, kilau menyapu tombol utama saat hover; **Dot Matrix** (bagherifarzad) → class `.dot-matrix`, grid titik radial dengan fade mask di belakang hero. Keduanya disesuaikan ke palet Pemroq, bukan ditempel mentah.
- Beranda dikelompokkan per minggu sebagai chapter di jalur belajar (satu minggu bisa berisi beberapa materi). Aksen minggu bersiklus enam warna (`WEEK_COLORS`: sky, amber, green, coral, violet, teal — sky = biru langit utama). Tiap kartu node stage punya notch: **Praktikum** (warna minggu) atau **Materi** (netral), supaya praktikum gampang dibedakan.
- Halaman Latihan Praktikum menampilkan soal asli praktikum per minggu, lengkap dengan penanda Coming Soon untuk minggu yang belum keluar (Minggu 12).
- Font antarmuka Inter Variable (self-host lewat `@fontsource-variable/inter`), mirip font sistem modern; kode tetap JetBrains Mono.
- Logo tiga balok simetris (SVG `public/logo.svg`, komponen `Logo.tsx`) — gradient biru langit (`#0284c7` → `#38bdf8`); sengaja tidak memakai glyph prompt miring.
- Judul hero: kata **Scala** memakai teks gradient biru langit dan dianimasikan per huruf (komponen `ScrambleText`): acak saat halaman dibuka, diam, lalu diacak ulang tiap 5 detik; hover juga memicu animasi baru. Dekorasi hero: latar dot-matrix (grid titik dengan fade mask) + jendela kode contoh + chip melayang ("Soal lolos", "+10 poin"). `prefers-reduced-motion` mematikan animasi, dan `aria-label` menyimpan teks asli.
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
