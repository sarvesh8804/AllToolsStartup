import { describe, expect, it } from "vitest";
import { formatGraphql, minifyGraphql } from "./graphql";

const SAMPLE = `query GetUser($id: ID!) { user(id: $id) { id name email posts { title } } }`;

describe("formatGraphql", () => {
  it("pretty-prints a query with nested selection sets", () => {
    const result = formatGraphql(SAMPLE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toContain("query GetUser($id: ID!) {");
    expect(result.text).toContain("user(id: $id) {");
    expect(result.text).toContain("posts {");
    expect(result.text).toMatch(/^\s+name$/m);
  });

  it("preserves string literals", () => {
    const result = formatGraphql(
      `{ search(q: "hello { world }") { id } }`,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.text).toContain('"hello { world }"');
  });

  it("rejects empty input", () => {
    expect(formatGraphql("  ").ok).toBe(false);
  });
});

describe("minifyGraphql", () => {
  it("collapses whitespace", () => {
    const pretty = formatGraphql(SAMPLE);
    expect(pretty.ok).toBe(true);
    if (!pretty.ok) return;
    const mini = minifyGraphql(pretty.text);
    expect(mini.ok).toBe(true);
    if (!mini.ok) return;
    expect(mini.text.trim().includes("\n")).toBe(false);
    expect(mini.text).toContain("user(id:$id)");
  });
});
