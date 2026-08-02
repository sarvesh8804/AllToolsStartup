import { describe, expect, it } from "vitest";
import {
  DEFAULT_API_KEY_TOKEN_OPTIONS,
  generateApiKeyToken,
  generateApiKeyTokens,
} from "./api-key-token";

describe("generateApiKeyToken", () => {
  it("creates stripe-style secret keys", () => {
    const token = generateApiKeyToken(DEFAULT_API_KEY_TOKEN_OPTIONS);
    expect(token.startsWith("sk_live_")).toBe(true);
    expect(token.length).toBeGreaterThan("sk_live_".length);
  });

  it("creates generic prefixed tokens", () => {
    const token = generateApiKeyToken({
      style: "generic",
      prefix: "forge",
      secretLength: 20,
    });
    expect(token.startsWith("forge_")).toBe(true);
    expect(token).toHaveLength("forge_".length + 20);
  });
});

describe("generateApiKeyTokens", () => {
  it("generates unique tokens in a batch", () => {
    const tokens = generateApiKeyTokens({ count: 10 });
    expect(tokens).toHaveLength(10);
    expect(new Set(tokens).size).toBe(10);
  });
});
