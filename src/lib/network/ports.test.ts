import { describe, expect, it } from "vitest";
import {
  PORT_NUMBERS,
  countPortEntries,
  filterPortNumbers,
  findPort,
} from "./ports";

describe("PORT_NUMBERS", () => {
  it("includes common ports", () => {
    expect(findPort(443)?.service).toBe("HTTPS");
    expect(findPort(22)?.service).toBe("SSH");
    expect(findPort(3306)?.service).toBe("MySQL");
  });
});

describe("filterPortNumbers", () => {
  it("returns all when query empty", () => {
    expect(countPortEntries(filterPortNumbers(""))).toBe(
      countPortEntries(PORT_NUMBERS),
    );
  });

  it("filters by port number and service name", () => {
    expect(countPortEntries(filterPortNumbers("5432"))).toBe(1);
    expect(filterPortNumbers("redis").some((c) => c.entries.length > 0)).toBe(
      true,
    );
  });
});
