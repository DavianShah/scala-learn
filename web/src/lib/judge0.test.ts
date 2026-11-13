import { describe, expect, it } from "vitest"
import { LIMITS, normalizeOutput, truncate } from "./judge0"

describe("normalizeOutput", () => {
  it("membuang CRLF dan spasi/enter di pinggir", () => {
    expect(normalizeOutput("  halo  \n")).toBe("halo")
    expect(normalizeOutput("a\r\nb\r\n")).toBe("a\nb")
  })

  it("string kosong/whitespace jadi kosong", () => {
    expect(normalizeOutput("\n")).toBe("")
    expect(normalizeOutput("   ")).toBe("")
  })

  it("mempertahankan baris di tengah", () => {
    expect(normalizeOutput("a\nb\nc")).toBe("a\nb\nc")
  })
})

describe("truncate", () => {
  it("memotong output yang melewati batas", () => {
    const s = "x".repeat(LIMITS.max_output_bytes + 50)
    const out = truncate(s, LIMITS.max_output_bytes)
    expect(out.length).toBeLessThan(s.length)
    expect(out).toContain("dipotong")
  })

  it("tidak mengubah output yang pendek", () => {
    expect(truncate("pendek", 100)).toBe("pendek")
  })
})

describe("LIMITS", () => {
  it("batas yang wajar", () => {
    expect(LIMITS.max_code_bytes).toBe(20 * 1024)
    expect(LIMITS.max_output_bytes).toBe(64 * 1024)
    expect(LIMITS.wall_time_limit).toBe(10)
  })
})
