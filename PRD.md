# PRD: Scala Learn (nama sementara)

## 1. Ringkasan
Web belajar bahasa Scala berbasis **stage**. Tiap stage = materi singkat + contoh kode + 1-2 soal latihan yang dijalankan langsung di browser (editor kode, tombol Run, tombol Cek). Materi mengikuti perkuliahan Pemrograman IPB dan **bertambah tiap minggu secara otomatis**: pemilik cukup drop file slide, agent membuat materi + soal + memvalidasinya + mempublikasikannya.

## 2. Pengguna
- **Pemilik (Jamaludin)**: mahasiswa Ilmu Komputer IPB. Satu-satunya admin. Berinteraksi dengan sistem lewat agent, bukan lewat CMS.
- **Pelajar**: pemilik sendiri dulu, lalu teman sekelas / kelas Pemrograman. Tidak perlu login di v1.

## 3. Tujuan
1. Pelajar bisa belajar Scala dari nol sampai materi terkini kuliah, berurutan.
2. Pelajar menulis kode sendiri dan dapat umpan balik otomatis (lulus/gagal + diff output).
3. Menambah materi mingguan = drop file, tanpa coding manual dari pemilik.
4. Semua soal **terjamin valid** (solusi referensi lulus semua test) sebelum tayang.

## 4. Non-goals (v1)
Login/akun, leaderboard, forum, multi-bahasa pemrograman, penilaian untuk nilai kuliah resmi, mobile app.

## 5. Fitur v1
| ID | Fitur | Catatan |
|---|---|---|
| F1 | Daftar stage + progress | Stage terkunci sampai stage sebelumnya lulus semua soal. Progress di `localStorage`. |
| F2 | Halaman stage | Materi (Markdown), contoh kode, 1-2 soal. |
| F3 | Editor kode | Monaco/CodeMirror, highlight Scala, starter code dengan `// TODO`. |
| F4 | Run | Jalankan kode dengan stdin contoh, tampilkan stdout/stderr/compile error. |
| F5 | Cek jawaban | Jalankan kode terhadap semua test (visible + hidden), tampilkan hasil per test. Test hidden hanya tampil "gagal/lulus". |
| F6 | Hint bertingkat | Hint 1-3, dibuka berurutan. |
| F7 | Solusi | Terbuka setelah lulus atau setelah klik "Menyerah" (konfirmasi). Disertai penjelasan. |
| F8 | Content pipeline | Lihat `docs/CONTENT-PIPELINE.md`. Fitur terpenting. |
| F9 | Reset progress / export progress JSON | Sederhana, di halaman pengaturan. |

## 6. Kebutuhan non-fungsional
- **Keamanan**: kode pelajar = untrusted. Wajib sandbox (lihat `docs/ARCHITECTURE.md`).
- **Performa**: Run selesai < 10 detik normal; timeout keras 10 detik.
- **Biaya**: berjalan di server rumah pemilik, tanpa layanan berbayar wajib.
- **Maintainability**: semua konten berupa file di Git (bukan database). Agent boleh commit langsung ke `main` jika semua gate validasi lulus; kalau tidak, status `draft` + laporan ke pemilik.
- **Bahasa UI & materi**: Indonesia, istilah teknis tetap Inggris.

## 7. Seed konten (sudah ada dari kampus)
Sumber: KOM120C K09, KOM2205 K10, K11.
| Stage | Judul | Soal asal |
|---|---|---|
| 1 | Variabel, tipe data, I/O | SimpleCalculator (diskusi K09) |
| 2 | Function, if-else, match | `sumAbs`, kategori nilai |
| 3 | Loop while/for | kuadrat 1..n, FizzBuzz |
| 4 | First-class function & fungsi murni | `createMultiplier`, `applyTwice` |
| 5 | HOF: map, filter, reduce | Soal 01-02 K10 |
| 6 | foreach, sort, String HOF | Contoh #1 K11, Soal 03 K10 |
| 7 | groupBy & Map | Anagram, frekuensi, jumlah faktor (K11) |

Perkiraan topik berikutnya (belum pasti, ikuti slide yang di-drop): Map/Set/Tuple, zip, foldLeft, rekursi/tail recursion, case class, pattern matching, sealed trait, Option/Either, class/trait/OOP.

## 8. Catatan dari materi kampus (penting buat agent)
- Slide memakai **sintaks Scala 3** (`if a > 0 then a else -a`). Runner harus Scala 3.
- Banyak soal kampus memakai input console, jadi format soal = pasangan **stdin -> expected stdout**.
- Di slide K10, `List.range(1, 100)` **tidak termasuk 100** padahal soalnya "1 sampai 100". Jadikan soal jebakan/catatan di materi.
- Slide adalah karya dosen: **tulis ulang dengan kata sendiri**, jangan salin verbatim. Catat sumber di metadata.

## 9. Kriteria sukses
- Seed stage 1-7 tayang, semua soal lulus validasi otomatis.
- Menambah 1 minggu materi baru: dari drop file sampai tayang tanpa intervensi manual, kecuali agent melapor masalah.
- Pelajar bisa menyelesaikan stage 1 dalam < 15 menit tanpa bantuan.

## 10. Roadmap
- **v1**: fitur di atas.
- **v1.1**: tipe soal function-test (harness), tampilan progress yang lebih baik.
- **v2**: login opsional + progress di server, statistik soal tersulit, ringkasan mingguan.
