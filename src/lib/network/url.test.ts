import { describe, expect, it } from "vitest";
import {
  SAMPLE_URL,
  buildUrlFromParts,
  parseUrlInput,
} from "./url";

describe("parseUrlInput", () => {
  it("parses a full URL with auth, port, query, and hash", () => {
    const result = parseUrlInput(SAMPLE_URL);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.protocol).toBe("https");
    expect(result.value.hostname).toBe("api.example.com");
    expect(result.value.port).toBe("8443");
    expect(result.value.username).toBe("user");
    expect(result.value.password).toBe("pass");
    expect(result.value.pathname).toBe("/v1/users");
    expect(result.value.hash).toBe("#profile");
    expect(result.value.queryParams).toEqual([
      { key: "page", value: "1" },
      { key: "limit", value: "20" },
    ]);
  });

  it("adds https scheme for bare hostnames", () => {
    const result = parseUrlInput("example.com/path");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.protocol).toBe("https");
    expect(result.value.hostname).toBe("example.com");
    expect(result.value.pathname).toBe("/path");
  });

  it("rejects empty input", () => {
    expect(parseUrlInput("").ok).toBe(false);
  });
});

describe("buildUrlFromParts", () => {
  it("builds a URL from components", () => {
    const result = buildUrlFromParts({
      protocol: "https",
      hostname: "api.example.com",
      port: "8443",
      pathname: "/v1/users",
      search: "?page=1",
      hash: "#x",
      username: "user",
      password: "pass",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.url).toContain("https://user:pass@api.example.com:8443/v1/users?page=1#x");
  });

  it("requires hostname", () => {
    expect(
      buildUrlFromParts({
        protocol: "https",
        hostname: "",
        port: "",
        pathname: "/",
        search: "",
        hash: "",
        username: "",
        password: "",
      }).ok,
    ).toBe(false);
  });
});
