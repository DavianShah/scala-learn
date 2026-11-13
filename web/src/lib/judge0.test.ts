import { describe, expect, it } from "vitest"
import { LIMITS, filterJvmWarning, normalizeOutput, truncate } from "./judge0"

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

describe("filterJvmWarning", () => {
  const warning = [
    "WARNING: A terminally deprecated method in sun.misc.Unsafe has been called",
    "WARNING: sun.misc.Unsafe::objectFieldOffset has been called by scala.runtime.LazyVals$ (file:/usr/local/miniconda3/envs/scala3.4.2/libexec/scala3/lib/scala3-library_3-3.4.2-bin-SNAPSHOT.jar)",
    "WARNING: Please consider reporting this to the maintainers of class scala.runtime.LazyVals$",
    "WARNING: sun.misc.Unsafe::objectFieldOffset will be removed in a future release",
  ].join("\n")

  it("membuang peringatan JVM sun.misc.Unsafe", () => {
    expect(filterJvmWarning(warning)).toBe("")
  })

  it("mempertahankan error asli", () => {
    expect(filterJvmWarning("Exception in thread main")).toBe("Exception in thread main")
  })

  it("campuran: warning dibuang, error tetap", () => {
    expect(filterJvmWarning(warning + "\njava.lang.Exception: x")).toBe("java.lang.Exception: x")
  })

  it("string kosong tetap kosong", () => {
    expect(filterJvmWarning("")).toBe("")
  })
})

describe("LIMITS", () => {
  it("batas yang wajar", () => {
    expect(LIMITS.max_code_bytes).toBe(20 * 1024)
    expect(LIMITS.max_output_bytes).toBe(64 * 1024)
    expect(LIMITS.wall_time_limit).toBe(10)
  })
})
