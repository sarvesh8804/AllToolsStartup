import { describe, expect, it } from "vitest";
import {
  DNS_RECORD_TYPES,
  countDnsRecordEntries,
  filterDnsRecords,
  findDnsRecord,
} from "./dns-records";

describe("DNS_RECORD_TYPES", () => {
  it("includes common record types", () => {
    expect(findDnsRecord("A")?.name).toBe("IPv4 address");
    expect(findDnsRecord("MX")?.name).toBe("Mail exchange");
    expect(findDnsRecord("CNAME")?.name).toBe("Canonical name");
  });

  it("has unique types", () => {
    const types = DNS_RECORD_TYPES.flatMap((c) => c.entries.map((e) => e.type));
    expect(new Set(types).size).toBe(types.length);
  });
});

describe("filterDnsRecords", () => {
  it("returns all when query empty", () => {
    expect(countDnsRecordEntries(filterDnsRecords(""))).toBe(
      countDnsRecordEntries(DNS_RECORD_TYPES),
    );
  });

  it("filters by type and keyword", () => {
    expect(countDnsRecordEntries(filterDnsRecords("caa"))).toBe(1);
    expect(filterDnsRecords("spf").some((c) => c.entries.length > 0)).toBe(
      true,
    );
  });
});
