import { describe, expect, it } from "vitest";
import {
  HTTP_STATUS_CODES,
  countHttpStatusEntries,
  filterHttpStatusCodes,
  findHttpStatus,
} from "./status-codes";

describe("HTTP_STATUS_CODES", () => {
  it("covers all five class ranges", () => {
    expect(HTTP_STATUS_CODES.map((c) => c.id)).toEqual([
      "1xx",
      "2xx",
      "3xx",
      "4xx",
      "5xx",
    ]);
  });

  it("has unique status codes", () => {
    const codes = HTTP_STATUS_CODES.flatMap((c) => c.entries.map((e) => e.code));
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("includes common codes", () => {
    expect(findHttpStatus(200)?.name).toBe("OK");
    expect(findHttpStatus(404)?.name).toBe("Not Found");
    expect(findHttpStatus(500)?.name).toBe("Internal Server Error");
  });
});

describe("filterHttpStatusCodes", () => {
  it("returns all when query is empty", () => {
    expect(countHttpStatusEntries(filterHttpStatusCodes(""))).toBe(
      countHttpStatusEntries(HTTP_STATUS_CODES),
    );
  });

  it("filters by code and name", () => {
    const byCode = filterHttpStatusCodes("404");
    expect(countHttpStatusEntries(byCode)).toBe(1);
    expect(byCode[0]?.entries[0]?.code).toBe(404);

    const byName = filterHttpStatusCodes("too many");
    expect(byName.some((c) => c.entries.some((e) => e.code === 429))).toBe(
      true,
    );
  });
});
