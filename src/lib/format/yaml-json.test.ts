import { describe, expect, it } from "vitest";
import { yamlToJson } from "./yaml-json";

describe("yamlToJson", () => {
  it("converts a mapping to JSON", () => {
    const result = yamlToJson("name: Forge\nlocal: true\ncount: 3");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JSON.parse(result.json)).toEqual({
        name: "Forge",
        local: true,
        count: 3,
      });
    }
  });

  it("converts nested structures and arrays", () => {
    const result = yamlToJson(`
tools:
  - json
  - yaml
meta:
  version: 1
`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        tools: ["json", "yaml"],
        meta: { version: 1 },
      });
    }
  });

  it("supports minified JSON output", () => {
    const result = yamlToJson("a: 1", 0);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.json).toBe('{"a":1}');
  });

  it("rejects empty input", () => {
    expect(yamlToJson("   ").ok).toBe(false);
  });

  it("rejects invalid YAML", () => {
    const result = yamlToJson(":\n: bad");
    expect(result.ok).toBe(false);
  });
});
