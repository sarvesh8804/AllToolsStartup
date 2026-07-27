import { describe, expect, it } from "vitest";
import {
  chunkPages,
  everyPageChunks,
  parsePageRanges,
} from "@/lib/pdf/ranges";

describe("parsePageRanges", () => {
  it("parses singles and ranges", () => {
    expect(parsePageRanges("1,3-5,7", 10)).toEqual({
      ok: true,
      pages: [1, 3, 4, 5, 7],
    });
  });

  it("supports open-ended range", () => {
    expect(parsePageRanges("8-", 10)).toEqual({
      ok: true,
      pages: [8, 9, 10],
    });
  });

  it("dedupes and sorts", () => {
    expect(parsePageRanges("5,1-3,2", 5)).toEqual({
      ok: true,
      pages: [1, 2, 3, 5],
    });
  });

  it("rejects out of range", () => {
    expect(parsePageRanges("1-12", 10).ok).toBe(false);
    expect(parsePageRanges("0", 10).ok).toBe(false);
  });

  it("rejects empty / junk", () => {
    expect(parsePageRanges("  ", 5).ok).toBe(false);
    expect(parsePageRanges("a-b", 5).ok).toBe(false);
    expect(parsePageRanges("5-2", 5).ok).toBe(false);
  });
});

describe("chunkPages / everyPageChunks", () => {
  it("chunks evenly", () => {
    expect(chunkPages(5, 2)).toEqual({
      ok: true,
      chunks: [[1, 2], [3, 4], [5]],
    });
  });

  it("rejects bad chunk size", () => {
    expect(chunkPages(5, 0).ok).toBe(false);
  });

  it("every page", () => {
    expect(everyPageChunks(3)).toEqual([[1], [2], [3]]);
  });
});
