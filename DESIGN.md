# DESIGN.md

Deklarasi arah desain **Scala Learn**. Aturan: tiap keputusan punya alasan tertulis.
Referensi: skill `anti-slop` (R-01..R-50) dan `popular-web-designs`.

## Product truth
Web belajar Scala interaktif untuk mahasiswa pemula. Isinya materi pendek plus soal yang langsung bisa dijawab di browser, dinilai oleh sandbox Judge0. Kode pelajar tidak pernah jalan di mesin ini.

## Audience
Mahasiswa CS Indonesia yang baru kenal Scala. Mereka butuh penjelasan yang tenang dan jelas, bukan dor-doran motivasi ala aplikasi kursus.

## Visual language
**Warm minimalism.** Putih hangat, garis tipis, satu aksen hijau, ruang napas lega, hierarki jelas.
Interaktif: umpan balik langsung saat menjalankan dan memeriksa kode.
Bukan klon Duolingo. Kita hanya meminjam satu hal: belajar itu bisa ringan.

## Palette

| Token | Value | Alasan |
|---|---|---|
| `base` | `#fafaf9` | putih hangat, tidak steril di mata |
| `surface` | `#ffffff` | kartu, panel |
| `ink` | `#1c1917` | teks utama, kontras ~16:1 di base |
| `muted` | `#78716c` | teks sekunder, kontras ~4.8:1 (AA) |
| `line` | `#e7e5e4` | garis pemisah, tidak dominan |
| `primary` | `#15803d` | tombol & aksi utama; teks putih di atasnya ~5.5:1 (AA) |
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

## Pola interaksi
- Tombol besar (min 44px tinggi sentuh), sudut 12px, garis bawah tebal khas tombol "3D" yang turun saat ditekan.
- Umpan balik status wajib ada: menunggu, berhasil, gagal, kosong.
- Ikon dipakai hanya di tempat yang artinya benar-benar nyambung (R-04).
- Semua elemen interaktif punya `:focus-visible` yang kelihatan (R-39).

## Yang sengaja tidak dipakai
- Emoji sebagai ikon (diganti Nerd Font).
- Em dash di teks (R-02).
- Grid gradien ala Lovable.
- Sudut membulat berlebihan (glassmorphism).
