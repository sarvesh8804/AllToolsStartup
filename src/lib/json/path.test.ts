import { describe, expect, it } from "vitest";
import {
  SAMPLE_JSON_PATH,
  SAMPLE_JSON_PATH_EXPR,
  testJsonPath,
} from "./path";

describe("testJsonPath", () => {
  it("reads nested property", () => {
    const result = testJsonPath(SAMPLE_JSON_PATH, SAMPLE_JSON_PATH_EXPR);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.matches[0]).toBe("Forge");
  });
});
