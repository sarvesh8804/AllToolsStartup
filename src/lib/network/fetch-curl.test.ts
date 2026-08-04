import { describe, expect, it } from "vitest";
import { fetchToCurl, SAMPLE_FETCH } from "./fetch-curl";

describe("fetchToCurl", () => {
  it("converts fetch to curl", () => {
    const result = fetchToCurl(SAMPLE_FETCH);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.curl).toContain("curl");
    expect(result.curl).toContain("-X POST");
  });
});
