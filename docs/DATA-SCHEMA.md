# Data Schema

Konten disimpan sebagai file JSON di Git: `content/stages/NN-slug/stage.json`. `NN` = urutan dua digit. Frontend membacanya saat build (static), tanpa database.

## 1. Stage
```json
{
  "id": "hof-map-filter-reduce",
  "order": 5,
  "title": "HOF: map, filter, reduce",
  "status": "published",
  "week": 10,
  "course": "KOM2205",
  "sources": ["KOM2205_-_K10_-_HOF-STUDENT.pdf"],
  "concepts": ["map", "filter", "reduce", "lambda", "wildcard"],
  "prerequisites": ["first-class-function"],
  "estimatedMinutes": 20,
  "summary": "Satu kalimat tentang stage ini.",
  "lesson": [
    { "type": "text",  "md": "Penjelasan dalam Markdown..." },
    { "type": "code",  "lang": "scala", "code": "val d = List(2,3,4)\nprintln(d.map(_ * 2))", "output": "List(4, 6, 8)", "runnable": true },
    { "type": "pitfall", "md": "Kesalahan umum..." },
    { "type": "recap", "items": ["poin 1", "poin 2", "poin 3"] }
  ],
  "problems": [ /* lihat bagian 2 */ ],
  "createdAt": "2026-11-12",
  "updatedAt": "2026-11-12"
}
```
Aturan:
- `id`: kebab-case, unik, **permanen**.
- `order`: bilangan bulat unik, menentukan urutan dan pembukaan stage.
- `status`: `draft` | `published`. Hanya `published` tampil di web.
- `lesson[].type = code` dengan `runnable: true` **harus** dikompilasi oleh validator. `output` diisi dari hasil eksekusi asli, bukan ditulis tangan.
- `sources`: nama file di `inbox/` yang menjadi asal materi.

## 2. Problem
```json
{
  "id": "hof-map-filter-reduce-p1",
  "title": "Jumlah kuadrat bilangan genap",
  "difficulty": 1,
  "statement": "Markdown. Jelaskan format input dan output dengan tepat.",
  "starter": "object Main {\n  def main(args: Array[String]): Unit = {\n    val xs = scala.io.StdIn.readLine().trim.split(\"\\\\s+\").map(_.toInt).toList\n    // TODO\n  }\n}\n",
  "solution": "object Main { ... }",
  "explanation": "Kenapa solusi ini benar, 2-5 kalimat.",
  "hints": ["arah umum", "konsep yang dipakai", "kerangka solusi"],
  "tests": [
    { "stdin": "1 2 3 4", "stdout": "20", "hidden": false },
    { "stdin": "1 3",     "stdout": "0",  "hidden": true }
  ],
  "comparison": "trim"
}
```
Aturan:
- `difficulty`: 1 (langsung pakai konsep baru), 2 (sedikit menantang), 3 (opsional/bonus).
- `tests`: minimal 3, minimal 1 `hidden: true`, dan harus mencakup **edge case** (kosong, satu elemen, nilai negatif, dst. sesuai soal).
- `comparison`: `exact` | `trim` (default; trim ujung output dan spasi di akhir tiap baris) | `tokens` (bandingkan token dipisah spasi, urutan tetap).
- `starter` harus gagal minimal 1 test; `solution` harus lulus semua.
- Soal harus deterministik: tidak bergantung waktu, random, atau urutan HashMap tanpa diurutkan.
- Soal **v1 hanya tipe stdin -> stdout**. Tipe `function` (test harness) masuk v1.1.

## 3. JSON Schema (ringkas, untuk validator)
Simpan sebagai `scripts/stage.schema.json`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id","order","title","status","lesson","problems"],
  "properties": {
    "id": {"type":"string","pattern":"^[a-z0-9]+(-[a-z0-9]+)*$"},
    "order": {"type":"integer","minimum":1},
    "title": {"type":"string","minLength":3},
    "status": {"enum":["draft","published"]},
    "week": {"type":"integer"},
    "course": {"type":"string"},
    "sources": {"type":"array","items":{"type":"string"}},
    "concepts": {"type":"array","items":{"type":"string"}},
    "prerequisites": {"type":"array","items":{"type":"string"}},
    "estimatedMinutes": {"type":"integer"},
    "summary": {"type":"string"},
    "lesson": {"type":"array","minItems":1},
    "problems": {
      "type":"array","minItems":1,"maxItems":3,
      "items": {
        "type":"object",
        "required":["id","title","difficulty","statement","starter","solution","explanation","hints","tests"],
        "properties": {
          "id":{"type":"string"},
          "difficulty":{"enum":[1,2,3]},
          "hints":{"type":"array","minItems":3,"maxItems":3},
          "tests":{"type":"array","minItems":3,"items":{
            "type":"object","required":["stdin","stdout"],
            "properties":{"stdin":{"type":"string"},"stdout":{"type":"string"},"hidden":{"type":"boolean"}}}},
          "comparison":{"enum":["exact","trim","tokens"]}
        }
      }
    }
  }
}
```
Validator (`scripts/validate-content.*`) juga mengecek hal yang tidak bisa diekspresikan schema: id unik global, `order` unik, `prerequisites` merujuk id yang ada, minimal satu test hidden per soal.

## 4. Progress pelajar (client-side, v1)
`localStorage` key `scalalearn:v1`:
```json
{
  "solved": { "hof-map-filter-reduce-p1": { "at": "2026-11-12T10:00:00Z", "attempts": 3 } },
  "drafts": { "hof-map-filter-reduce-p1": "kode terakhir di editor" },
  "hintsOpened": { "hof-map-filter-reduce-p1": 2 }
}
```
Stage terbuka jika semua soal di stage `order` sebelumnya ada di `solved`. Karena itu `id` soal tidak boleh berubah.

## 5. API runner
`POST /run`
```json
// request
{ "language": "scala3", "code": "...", "stdin": "..." }
// response
{ "status": "ok|compile_error|runtime_error|timeout|memory_limit",
  "stdout": "...", "stderr": "...", "compileOutput": "...", "timeMs": 812 }
```
`POST /check` (opsional, kalau tests disimpan di server supaya hidden test tidak bocor ke browser)
```json
// request
{ "problemId": "hof-map-filter-reduce-p1", "code": "..." }
// response
{ "passed": false,
  "results": [ { "index": 0, "hidden": false, "ok": true },
               { "index": 1, "hidden": true,  "ok": false } ] }
```
Rekomendasi: `/check` dijalankan di server dan **test hidden tidak pernah dikirim ke browser**. Build frontend hanya memuat test dengan `hidden: false`. Solusi (`solution`) juga tidak dimasukkan ke bundle publik; kirim lewat endpoint setelah pelajar lulus/menyerah.

## 6. (Opsional v2) Tabel database
Jika nanti butuh akun: `users(id, handle, created_at)`, `submissions(id, user_id, problem_id, code, passed, created_at)`, `progress(user_id, problem_id, solved_at, attempts)`. Konten tetap di file.
