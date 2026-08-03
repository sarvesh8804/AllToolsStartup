import { describe, expect, it } from "vitest";
import { buildClipPathCss, DEFAULT_CLIP_PATH } from "./clip-path";

describe("buildClipPathCss", () => {
  it("builds clip-path css", () => {
    const result = buildClipPathCss(DEFAULT_CLIP_PATH);
    expect(result.declaration).toContain("clip-path:");
    expect(result.value).toContain("polygon");
  });
});
