import { describe, expect, it } from "vitest";
import { sha1 } from "./sha1";

describe("sha1", () => {
  it("matches NIST / RFC vectors", () => {
    expect(sha1("")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
    expect(sha1("abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
    expect(sha1("The quick brown fox jumps over the lazy dog")).toBe(
      "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
    );
  });

  it("handles unicode via UTF-8", () => {
    expect(sha1("café")).toHaveLength(40);
  });
});
