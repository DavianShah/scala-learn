import { describe, expect, it } from "vitest"
import { exportProgress, importProgress } from "./progress"

describe("progress import/export", () => {
  it("round-trip JSON", () => {
    const p = { solved: { a: true }, openedHints: { a: 2 }, code: { a: "x" } }
    expect(importProgress(exportProgress(p))).toEqual(p)
  })

  it("JSON tidak valid -> null", () => {
    expect(importProgress("bukan json")).toBeNull()
    expect(importProgress("[1,2,3]")).toBeNull()
  })

  it("objek kosong -> struktur default", () => {
    expect(importProgress("{}")).toEqual({ solved: {}, openedHints: {}, code: {} })
  })

  it("field hilang diisi default", () => {
    const p = importProgress('{"solved":{"b":true}}')
    expect(p).toEqual({ solved: { b: true }, openedHints: {}, code: {} })
  })
})
