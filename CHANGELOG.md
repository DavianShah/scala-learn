# Changelog

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
