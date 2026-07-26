import { describe, expect, it } from "vitest";
import { formatSql, minifySql } from "./sql";

describe("formatSql", () => {
  it("breaks major clauses onto new lines", () => {
    const out = formatSql(
      "select id, name from users where active = 1 order by name",
    );
    expect(out).toContain("SELECT");
    expect(out).toContain("\nFROM users");
    expect(out).toContain("\nWHERE active = 1");
    expect(out).toContain("\nORDER BY name");
  });

  it("indents JOIN and AND", () => {
    const out = formatSql(
      "select * from a join b on a.id = b.id where a.x = 1 and b.y = 2",
    );
    expect(out).toMatch(/\n\s+JOIN b/);
    expect(out).toMatch(/\n\s+AND b\.y = 2/);
  });

  it("preserves string literals", () => {
    const out = formatSql("select 'select from where' as label from t");
    expect(out).toContain("'select from where'");
  });

  it("splits select lists", () => {
    const out = formatSql("select a, b, c from t");
    expect(out).toContain("SELECT\n");
    expect(out).toContain("  a,");
    expect(out).toContain("  c\n");
  });
});

describe("minifySql", () => {
  it("collapses whitespace", () => {
    expect(minifySql("select   *\nfrom   t")).toBe("select * from t");
  });
});
