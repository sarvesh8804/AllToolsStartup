import { describe, expect, it } from "vitest";
import { buildJsonTree, SAMPLE_JSON_TREE } from "./tree";

describe("buildJsonTree", () => {
  it("builds a tree and formatted output", () => {
    const result = buildJsonTree(SAMPLE_JSON_TREE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formatted).toContain("Forge");
    expect(result.nodeCount).toBeGreaterThan(4);
  });
});
