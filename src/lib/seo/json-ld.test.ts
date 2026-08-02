import { describe, expect, it } from "vitest";
import {
  SAMPLE_JSON_LD,
  analyzeJsonLd,
  formatJsonLd,
  wrapJsonLdScript,
} from "./json-ld";

describe("formatJsonLd", () => {
  it("pretty-prints valid JSON-LD", () => {
    const result = formatJsonLd(SAMPLE_JSON_LD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formatted).toContain('"@context": "https://schema.org"');
    expect(result.formatted).toContain('"@type": "WebSite"');
  });

  it("wraps output in a script tag", () => {
    const result = formatJsonLd(SAMPLE_JSON_LD, { wrapScript: true });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formatted).toContain('<script type="application/ld+json">');
    expect(result.formatted).toContain("</script>");
  });

  it("minifies when spaces is 0", () => {
    const result = formatJsonLd(SAMPLE_JSON_LD, { spaces: 0 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.formatted).not.toContain("\n  ");
  });

  it("rejects invalid JSON", () => {
    expect(formatJsonLd("{bad").ok).toBe(false);
  });
});

describe("analyzeJsonLd", () => {
  it("warns when @context is missing", () => {
    const warnings = analyzeJsonLd({ "@type": "Thing", name: "Test" });
    expect(warnings.some((w) => w.includes("@context"))).toBe(true);
  });
});

describe("wrapJsonLdScript", () => {
  it("wraps formatted JSON", () => {
    expect(wrapJsonLdScript('{"a":1}')).toContain("application/ld+json");
  });
});
