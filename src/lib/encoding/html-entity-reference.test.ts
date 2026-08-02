import { describe, expect, it } from "vitest";
import {
  HTML_ENTITY_REFERENCE,
  countHtmlEntityEntries,
  filterHtmlEntities,
  findHtmlEntity,
} from "./html-entity-reference";

describe("filterHtmlEntities", () => {
  it("returns all categories when query is empty", () => {
    expect(filterHtmlEntities("")).toEqual(HTML_ENTITY_REFERENCE);
  });

  it("filters by entity name", () => {
    const result = filterHtmlEntities("nbsp");
    expect(result.some((c) => c.entries.some((e) => e.name === "nbsp"))).toBe(
      true,
    );
  });

  it("filters by character description", () => {
    const result = filterHtmlEntities("copyright");
    expect(result.some((c) => c.entries.some((e) => e.name === "copy"))).toBe(
      true,
    );
  });
});

describe("findHtmlEntity", () => {
  it("finds by name with or without delimiters", () => {
    expect(findHtmlEntity("amp")?.character).toBe("&");
    expect(findHtmlEntity("&amp;")?.named).toBe("&amp;");
  });
});

describe("countHtmlEntityEntries", () => {
  it("counts entries across categories", () => {
    expect(countHtmlEntityEntries(HTML_ENTITY_REFERENCE)).toBeGreaterThan(40);
  });
});
