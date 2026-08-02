import { describe, expect, it } from "vitest";
import {
  decodeUlidTimestamp,
  isUlid,
  ulid,
  ulidBatch,
} from "./ulid";

describe("ulid", () => {
  it("generates a 26-character id", () => {
    const id = ulid(1_700_000_000_000);
    expect(id).toHaveLength(26);
    expect(isUlid(id)).toBe(true);
  });

  it("encodes the timestamp in the first 10 characters", () => {
    const ts = 1_700_000_000_000;
    const id = ulid(ts);
    expect(decodeUlidTimestamp(id)).toBe(ts);
  });

  it("generates sortable batch ids when timestamps increment", () => {
    const ids = ulidBatch(3, 1_700_000_000_000);
    expect(ids).toHaveLength(3);
    expect(ids[0]! < ids[1]!).toBe(true);
    expect(ids[1]! < ids[2]!).toBe(true);
  });
});

describe("isUlid", () => {
  it("rejects invalid lengths", () => {
    expect(isUlid("abc")).toBe(false);
  });
});
