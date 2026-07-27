import { describe, expect, it } from "vitest";
import { formatSql, minifySql, minifySqlDetailed } from "./sql";

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

  it("supports lowercase keywords", () => {
    const out = formatSql("SELECT id FROM users", { keywordCase: "lower" });
    expect(out).toContain("select");
    expect(out).toContain("\nfrom users");
    expect(out).not.toMatch(/\bSELECT\b/);
  });

  it("can keep select list on one line", () => {
    const out = formatSql("select a, b, c from t", {
      splitSelectList: false,
    });
    expect(out).toMatch(/SELECT a, b, c/i);
    expect(out).not.toMatch(/SELECT\n/);
  });

  it("can disable join indent", () => {
    const out = formatSql("select * from a join b on a.id = b.id", {
      indentJoins: false,
    });
    expect(out).toMatch(/\nJOIN b/);
    expect(out).not.toMatch(/\n  JOIN b/);
  });

  it("supports tabs", () => {
    const out = formatSql("select a, b from t", {
      useTabs: true,
      splitSelectList: true,
    });
    expect(out).toContain("\t");
  });
});

describe("minifySql", () => {
  it("collapses whitespace", () => {
    expect(minifySql("select   *\nfrom   t")).toBe("select * from t");
  });

  it("strips comments by default", () => {
    expect(
      minifySql("select id -- comment\nfrom users /* block */ where 1=1"),
    ).toBe("select id from users where 1=1");
  });

  it("preserves strings that look like comments", () => {
    expect(minifySql("select '-- not comment' as x from t")).toBe(
      "select '-- not comment' as x from t",
    );
  });

  it("can keep comments", () => {
    expect(
      minifySql("select 1 -- x\n", { stripComments: false }),
    ).toContain("--");
  });
});

describe("minifySqlDetailed", () => {
  it("rejects empty input", () => {
    expect(minifySqlDetailed("   ").ok).toBe(false);
  });

  it("reports char savings", () => {
    const result = minifySqlDetailed("select   *\nfrom   t");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.minifiedChars).toBeLessThan(result.originalChars);
  });
});
