import { describe, expect, it } from "vitest";
import { formatCss, minifyCss } from "./css";

describe("formatCss", () => {
  it("beautifies a simple rule", () => {
    const out = formatCss("body{color:red;margin:0}");
    expect(out).toBe("body {\n  color: red;\n  margin: 0;\n}\n");
  });

  it("handles nested-looking blocks", () => {
    const out = formatCss("@media (max-width:600px){body{font-size:14px}}");
    expect(out).toContain("@media (max-width: 600px) {");
    expect(out).toContain("  body {");
    expect(out).toContain("    font-size: 14px;");
  });
});

describe("minifyCss", () => {
  it("removes comments and whitespace", () => {
    const out = minifyCss("/* note */\nbody {\n  color: red;\n}");
    expect(out).toBe("body{color:red}");
  });

  it("preserves strings with spaces", () => {
    const out = minifyCss('.x { content: "a b"; }');
    expect(out).toContain('"a b"');
  });
});
