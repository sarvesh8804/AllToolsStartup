import { describe, expect, it } from "vitest";
import { jsonToTypescript } from "./to-typescript";

describe("jsonToTypescript", () => {
  it("infers nested interfaces", () => {
    const result = jsonToTypescript(
      JSON.stringify({
        name: "Forge",
        local: true,
        meta: { version: 1 },
        tools: ["a", "b"],
      }),
      { rootName: "App" },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.typescript).toContain("export interface Meta");
      expect(result.typescript).toContain("export interface App");
      expect(result.typescript).toContain("name: string;");
      expect(result.typescript).toContain("tools: string[];");
      expect(result.typescript).toContain("meta: Meta;");
    }
  });

  it("merges array object shapes with optionals", () => {
    const result = jsonToTypescript(
      JSON.stringify({
        items: [{ id: 1, name: "a" }, { id: 2 }],
      }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.typescript).toContain("name?: string;");
      expect(result.typescript).toContain("id: number;");
    }
  });

  it("handles root arrays", () => {
    const result = jsonToTypescript(JSON.stringify([1, 2, 3]), {
      rootName: "Ids",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.typescript).toContain("export type Ids = number[];");
    }
  });

  it("rejects invalid JSON", () => {
    expect(jsonToTypescript("{").ok).toBe(false);
  });

  it("can emit type aliases without export", () => {
    const result = jsonToTypescript('{"a":1}', {
      useInterface: false,
      exportTypes: false,
      rootName: "Foo",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.typescript).toContain("type Foo = {");
      expect(result.typescript.includes("export")).toBe(false);
    }
  });
});
