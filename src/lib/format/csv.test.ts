import { describe, expect, it } from "vitest";
import { csvToJson, jsonToCsv, parseCsvLine } from "./csv";

describe("parseCsvLine", () => {
  it("handles quotes and escaped quotes", () => {
    expect(parseCsvLine('a,"b,c","say ""hi"""')).toEqual([
      "a",
      "b,c",
      'say "hi"',
    ]);
  });
});

describe("csvToJson", () => {
  it("converts headered CSV to objects", () => {
    const result = csvToJson("name,count\nForge,3\nAlpha,1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows).toEqual([
        { name: "Forge", count: 3 },
        { name: "Alpha", count: 1 },
      ]);
    }
  });

  it("preserves quoted commas", () => {
    const result = csvToJson('city,note\n"Sao Paulo","a, b"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rows[0]).toEqual({ city: "Sao Paulo", note: "a, b" });
    }
  });

  it("rejects empty input", () => {
    expect(csvToJson("").ok).toBe(false);
  });
});

describe("jsonToCsv", () => {
  it("converts objects to CSV with headers", () => {
    const result = jsonToCsv(
      JSON.stringify([
        { name: "Forge", count: 3 },
        { name: "Alpha", count: 1 },
      ]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.csv).toBe("name,count\nForge,3\nAlpha,1\n");
    }
  });

  it("escapes commas and quotes", () => {
    const result = jsonToCsv(
      JSON.stringify([{ note: 'hello, "world"' }]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.csv).toContain('"hello, ""world"""');
    }
  });

  it("rejects non-array JSON", () => {
    expect(jsonToCsv('{"a":1}').ok).toBe(false);
  });
});

describe("round trip", () => {
  it("csv -> json -> csv preserves rows", () => {
    const csv = "id,name\n1,Ada\n2,Grace\n";
    const asJson = csvToJson(csv);
    expect(asJson.ok).toBe(true);
    if (!asJson.ok) return;
    const back = jsonToCsv(asJson.json);
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.csv).toBe(csv);
  });
});
