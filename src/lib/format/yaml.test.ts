import { describe, expect, it } from "vitest";
import { formatYaml, minifyYaml } from "./yaml";

describe("formatYaml", () => {
  it("pretty-prints nested mappings", () => {
    const result = formatYaml("name: Forge\nmeta: {v: 1, local: true}");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.yaml).toContain("name: Forge");
      expect(result.yaml).toContain("meta:");
      expect(result.yaml).toContain("v: 1");
    }
  });

  it("rejects invalid YAML", () => {
    const result = formatYaml("foo: [");
    expect(result.ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(formatYaml("").ok).toBe(false);
  });

  it("can sort keys", () => {
    const result = formatYaml("b: 2\na: 1", { sortKeys: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const a = result.yaml.indexOf("a:");
      const b = result.yaml.indexOf("b:");
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeGreaterThan(a);
    }
  });
});

describe("minifyYaml", () => {
  it("compacts nested structures", () => {
    const result = minifyYaml("root:\n  a: 1\n  b: 2");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.yaml.includes("\n  ")).toBe(false);
      expect(result.yaml).toContain("a:");
    }
  });
});
