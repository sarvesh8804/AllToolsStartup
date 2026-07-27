import { describe, expect, it } from "vitest";
import { buildHtaccessRedirects } from "./htaccess";

describe("buildHtaccessRedirects", () => {
  it("builds a simple Redirect", () => {
    const result = buildHtaccessRedirects({
      rules: [
        {
          id: "1",
          from: "/old",
          to: "https://example.com/new",
          code: 301,
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain("Redirect 301 /old https://example.com/new");
      expect(result.text).toContain("RewriteEngine On");
    }
  });

  it("adds https and www rules", () => {
    const result = buildHtaccessRedirects({
      rules: [],
      forceHttps: true,
      forceWww: "www",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.text).toContain("%{HTTPS}");
      expect(result.text).toContain("www.");
    }
  });

  it("rejects empty config", () => {
    expect(buildHtaccessRedirects({ rules: [] }).ok).toBe(false);
  });
});
