import { describe, expect, it } from "vitest";
import { jsonToYaml } from "./json-yaml";

describe("jsonToYaml", () => {
  it("converts an object to YAML", () => {
    const result = jsonToYaml('{"name":"Forge","local":true}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.yaml).toContain("name: Forge");
      expect(result.yaml).toContain("local: true");
    }
  });

  it("converts arrays", () => {
    const result = jsonToYaml('{"tools":["a","b"]}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.yaml).toContain("tools:");
      expect(result.yaml).toMatch(/- a/);
    }
  });

  it("rejects invalid JSON", () => {
    expect(jsonToYaml("{").ok).toBe(false);
  });

  it("rejects empty input", () => {
    expect(jsonToYaml("  ").ok).toBe(false);
  });
});
