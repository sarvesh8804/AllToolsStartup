import { describe, expect, it } from "vitest";
import {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
} from "./url";

describe("url encoding", () => {
  it("encodes reserved characters as a component", () => {
    expect(encodeUrlComponent("a b&c=d")).toBe("a%20b%26c%3Dd");
  });

  it("round-trips component", () => {
    const input = "name=John Doe&city=São Paulo";
    expect(decodeUrlComponent(encodeUrlComponent(input))).toBe(input);
  });

  it("full-url encode preserves reserved delimiters", () => {
    expect(encodeUrl("https://x.io/a b?q=1")).toBe(
      "https://x.io/a%20b?q=1",
    );
  });

  it("round-trips full url", () => {
    const input = "https://x.io/piñata?q=a b";
    expect(decodeUrl(encodeUrl(input))).toBe(input);
  });
});
