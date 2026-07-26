import { describe, expect, it } from "vitest";
import { isUuidV4, uuidV4, uuidV4Batch } from "./uuid";

describe("uuid v4", () => {
  it("generates a valid v4 uuid", () => {
    expect(isUuidV4(uuidV4())).toBe(true);
  });

  it("generates unique values", () => {
    const set = new Set(uuidV4Batch(200));
    expect(set.size).toBe(200);
  });

  it("clamps batch size between 1 and 1000", () => {
    expect(uuidV4Batch(0)).toHaveLength(1);
    expect(uuidV4Batch(5000)).toHaveLength(1000);
  });

  it("rejects malformed uuids", () => {
    expect(isUuidV4("not-a-uuid")).toBe(false);
    expect(isUuidV4("12345678-1234-1234-1234-123456789012")).toBe(false);
  });
});
