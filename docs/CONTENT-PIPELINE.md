# Content Pipeline: dari slide mingguan jadi stage

Pemicu: pemilik menaruh file (PDF/PPTX/teks) di `inbox/` dan bilang "ada materi baru" (boleh sertakan minggu ke berapa). Agent menjalankan semua langkah di bawah. Tujuan: **tanpa intervensi manual** kecuali ada masalah.

## Langkah

### 1. Ingest
- Ekstrak teks dari file (PDF: `pdftotext`/PyMuPDF; slide berisi gambar: render halaman jadi gambar dan baca visual).
- Catat nama file, mata kuliah, nomor pertemuan/minggu (dari judul slide, mis. "K10", "Pekan ke-09").
- Abaikan slide non-materi: cover, learning outcome, catatan UTS/statistik nilai, absensi, pengumuman.

### 2. Petakan konsep
- Buat daftar konsep baru yang diajarkan di slide ini.
- Bandingkan dengan `content/stages/*/stage.json` (`concepts`). Jika konsep sudah ada, **perluas stage yang ada** (tambah `lesson` / soal, jangan ganti id); jika konsep baru, buat stage baru dengan `order` berikutnya.
- Satu stage = satu tema yang bisa dipelajari 15-25 menit. Slide yang terlalu padat dipecah jadi 2 stage, slide tipis digabung.
- Tentukan `prerequisites`.

### 3. Tulis materi (`lesson`)
- Tulis ulang dengan kata sendiri (jangan salin slide). Gaya: lihat `AGENTS.md`.
- Pertahankan contoh kode dari slide jika ada (kode pendek boleh), tapi **jalankan dulu** di runner. Jika ada bug/ketidakakuratan di slide (mis. `List.range(1, 100)` tidak mencakup 100), jangan diam-diam diperbaiki: jelaskan di blok `pitfall`.
- Catat sintaks yang berbeda antara slide dan Scala 3 aktual, jika ada.

### 4. Buat soal (1-2 per stage)
- **Sumber soal**: ambil dari "Diskusi Kelas", "Contoh", "Latihan" di slide terlebih dahulu (ubah ke format stdin -> stdout dan lengkapi spesifikasi input/output yang sering kurang jelas di slide). Jika slide tidak punya soal, buat sendiri.
- Soal 1: pakai konsep baru secara langsung (difficulty 1). Soal 2: sedikit menantang, menggabungkan dengan konsep stage sebelumnya (difficulty 2).
- Jangan bergantung pada fitur yang belum diajarkan (cek `prerequisites` dan konsep stage sebelumnya).
- Tulis: `statement`, `starter` (dengan `// TODO`, boilerplate input sudah jadi), `solution`, `explanation`, 3 `hints`, minimal 3 `tests` (satu hidden, termasuk edge case).
- Jangan buat soal yang jawabannya persis sama dengan contoh di materi.

### 5. Validasi (gate wajib)
Jalankan berurutan; semua harus hijau:
1. `validate-content`: schema + id unik + order unik + referensi prerequisite.
2. `verify-lesson-code`: semua blok `runnable` dikompilasi, `output` terisi dari hasil asli.
3. `verify-problems`: `solution` lulus semua tests; `starter` gagal minimal 1 test; tidak ada test yang flaky (jalankan 2x, hasil sama).
4. Kualitas: kalau `solution` bisa lulus tanpa menggunakan konsep stage (mis. soal HOF diselesaikan dengan loop), pertimbangkan menambah test atau mempertegas `statement` ("gunakan `map` dan `filter`"). Catatan: sistem v1 tidak memaksa konsep, hanya memeriksa output.
5. Build web + smoke test.

Jika ada gate gagal: perbaiki dan ulangi maksimal 3 kali. Jika masih gagal, simpan stage dengan `status: "draft"`, jangan tayang, dan laporkan ke pemilik beserta alasannya.

### 6. Publish
- Set `status: "published"`, commit (`content: tambah stage <id> (minggu N)`), deploy.
- Pindahkan file sumber ke `inbox/processed/`.
- Tambah entri `CHANGELOG.md`.

### 7. Lapor ke pemilik (maks 10 baris)
- Stage apa yang ditambah/diperluas, berapa soal, link halamannya.
- Hal yang ambigu atau kamu putuskan sendiri.
- Hal yang tidak beres di slide (typo, kode salah, soal ambigu).
- Yang gagal/ditunda dan butuh keputusan pemilik.

## Kasus khusus
- **Slide hanya revisi/duplikat** materi lama: update stage yang ada, jangan buat stage baru.
- **Slide non-Scala** (mis. materi teori/OOP umum): buat stage hanya bagian yang relevan dengan Scala; sisanya catat di laporan.
- **Konsep belum bisa diuji dengan stdin -> stdout** (mis. class/trait): buat soal yang `main`-nya sudah disediakan dan pelajar melengkapi class/trait; output dicetak lewat `main`. Atau tandai kebutuhan tipe soal `function` (v1.1) di laporan.
- **File tidak terbaca / scan buram**: minta pemilik kirim ulang, jangan mengarang isi.
- **Materi bertentangan dengan stage lama**: jangan ubah diam-diam, laporkan.

## Template prompt singkat dari pemilik (contoh)
> "ada materi minggu 12, file di inbox."

Itu sudah cukup. Agent mengerjakan sisanya sesuai dokumen ini.
