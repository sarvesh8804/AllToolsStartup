import { describe, expect, it } from "vitest";
import { formatJavascript, minifyJavascript } from "./javascript";

describe("formatJavascript", () => {
  it("indents braces", () => {
    const out = formatJavascript("function hi(){return 1;}");
    expect(out).toContain("function hi() {");
    expect(out).toContain("  return 1;");
    expect(out.trim().endsWith("}")).toBe(true);
  });

  it("preserves strings", () => {
    const out = formatJavascript('const s = "a { b }";');
    expect(out).toContain('"a { b }"');
  });

  it("preserves comments", () => {
    const out = formatJavascript("/* keep */\nconst x=1;");
    expect(out).toContain("/* keep */");
    expect(out).toContain("const x=1;");
  });
});

describe("minifyJavascript", () => {
  it("collapses whitespace outside literals", () => {
    const out = minifyJavascript("const  a  =  1 ;", { stripComments: false });
    expect(out).toContain("const");
    expect(out.length).toBeLessThan("const  a  =  1 ;".length);
  });

  it("strips comments by default", () => {
    const out = minifyJavascript("/* x */const a=1;//y\nconst b=2;");
    expect(out).not.toContain("/*");
    expect(out).not.toContain("//");
    expect(out).toContain("const a=1");
    expect(out).toContain("const b=2");
  });

  it("preserves strings while stripping comments", () => {
    const out = minifyJavascript('const s = "a // not comment"; /* drop */');
    expect(out).toContain('"a // not comment"');
    expect(out).not.toContain("drop");
  });
});
