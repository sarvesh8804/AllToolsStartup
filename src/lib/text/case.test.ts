import { describe, expect, it } from "vitest";
import {
  convertCase,
  splitWords,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
} from "./case";

describe("splitWords", () => {
  it("splits camelCase and snake_case", () => {
    expect(splitWords("helloWorld")).toEqual(["hello", "world"]);
    expect(splitWords("hello_world")).toEqual(["hello", "world"]);
    expect(splitWords("hello-world")).toEqual(["hello", "world"]);
  });

  it("handles consecutive capitals", () => {
    expect(splitWords("parseXMLHttp")).toEqual(["parse", "xml", "http"]);
  });

  it("returns empty for blank input", () => {
    expect(splitWords("   ")).toEqual([]);
  });
});

describe("convertCase", () => {
  it("upper and lower", () => {
    expect(convertCase("Hello", "upper")).toBe("HELLO");
    expect(convertCase("Hello", "lower")).toBe("hello");
  });

  it("title case", () => {
    expect(toTitleCase("hello world")).toBe("Hello World");
    expect(toTitleCase("it's a test")).toBe("It's A Test");
  });

  it("sentence case", () => {
    expect(toSentenceCase("HELLO. WORLD!")).toBe("Hello. World!");
  });

  it("identifier cases", () => {
    expect(toCamelCase("Hello World")).toBe("helloWorld");
    expect(toPascalCase("hello_world")).toBe("HelloWorld");
    expect(toSnakeCase("HelloWorld")).toBe("hello_world");
    expect(toKebabCase("Hello World")).toBe("hello-world");
    expect(toConstantCase("hello world")).toBe("HELLO_WORLD");
  });

  it("round-trips identifiers via kebab", () => {
    expect(toCamelCase(toKebabCase("userProfileId"))).toBe("userProfileId");
  });
});
