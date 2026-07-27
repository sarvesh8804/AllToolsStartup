import { describe, expect, it } from "vitest";
import { isUuidV4 } from "./uuid";
import {
  formatUuidV4,
  generateUuidBulk,
  joinUuids,
} from "./uuid-bulk";

describe("generateUuidBulk", () => {
  it("generates the requested count", () => {
    const result = generateUuidBulk({
      count: 12,
      uppercase: false,
      hyphens: true,
      braces: false,
      urn: false,
      separator: "newline",
    });
    expect(result.count).toBe(12);
    expect(result.ids).toHaveLength(12);
    expect(result.ids.every((id) => isUuidV4(id))).toBe(true);
  });

  it("clamps to 10000", () => {
    expect(
      generateUuidBulk({
        count: 50_000,
        uppercase: false,
        hyphens: true,
        braces: false,
        urn: false,
        separator: "newline",
      }).count,
    ).toBe(10_000);
  });

  it("formats without hyphens and with braces", () => {
    const id = formatUuidV4("550e8400-e29b-41d4-a716-446655440000", {
      uppercase: true,
      hyphens: false,
      braces: true,
      urn: false,
    });
    expect(id).toBe("{550E8400E29B41D4A716446655440000}");
  });

  it("supports urn prefix", () => {
    const id = formatUuidV4("550e8400-e29b-41d4-a716-446655440000", {
      uppercase: false,
      hyphens: true,
      braces: false,
      urn: true,
    });
    expect(id).toBe("urn:uuid:550e8400-e29b-41d4-a716-446655440000");
  });

  it("joins as json array", () => {
    const text = joinUuids(["a", "b"], "json");
    expect(JSON.parse(text)).toEqual(["a", "b"]);
  });
});
