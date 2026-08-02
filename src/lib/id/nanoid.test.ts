import { describe, expect, it } from "vitest";
import {
  DEFAULT_NANOID_ALPHABET,
  DEFAULT_NANOID_SIZE,
  nanoid,
  nanoidBatch,
} from "./nanoid";

describe("nanoid", () => {
  it("generates ids of the requested size", () => {
    const id = nanoid(12);
    expect(id).toHaveLength(12);
    expect([...id].every((ch) => DEFAULT_NANOID_ALPHABET.includes(ch))).toBe(
      true,
    );
  });

  it("defaults to 21 characters", () => {
    expect(nanoid()).toHaveLength(DEFAULT_NANOID_SIZE);
  });

  it("generates unique values in a batch", () => {
    const ids = nanoidBatch({ count: 20, size: 16 });
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
  });
});
