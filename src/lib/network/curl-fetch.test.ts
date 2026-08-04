import { describe, expect, it } from "vitest";
import { curlToFetch, SAMPLE_CURL } from "./curl-fetch";

describe("curlToFetch", () => {
  it("converts curl to fetch", () => {
    const result = curlToFetch(SAMPLE_CURL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.code).toContain("fetch(");
    expect(result.code).toContain("POST");
  });
});
