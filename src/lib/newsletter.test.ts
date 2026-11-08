import { describe, expect, it } from "vitest";
import { cleanEmail } from "./newsletter";

describe("cleanEmail", () => {
  it("lowercases and trims a good address", () => {
    expect(cleanEmail("  Kunal@Example.COM ")).toBe("kunal@example.com");
  });
  it("rejects bad input", () => {
    for (const bad of ["", "a@b", "no-at.com", "two@@x.com", "sp ace@x.com", "a@b.c", 42, null, undefined]) {
      expect(cleanEmail(bad)).toBeNull();
    }
  });
  it("rejects very long addresses", () => {
    expect(cleanEmail(`${"a".repeat(250)}@x.com`)).toBeNull();
  });
});
