import { describe, expect, it } from "vitest";
import {
  SAMPLE_USER_AGENTS,
  parseUserAgent,
} from "./user-agent";

describe("parseUserAgent", () => {
  it("parses Chrome on Windows", () => {
    const result = parseUserAgent(SAMPLE_USER_AGENTS.chrome);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.browser).toBe("Chrome");
    expect(result.value.os).toBe("Windows");
    expect(result.value.deviceType).toBe("desktop");
    expect(result.value.isBot).toBe(false);
  });

  it("parses mobile Safari", () => {
    const result = parseUserAgent(SAMPLE_USER_AGENTS.safariMobile);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.browser).toBe("Safari");
    expect(result.value.deviceType).toBe("mobile");
    expect(result.value.device).toBe("iPhone");
  });

  it("detects bots", () => {
    const result = parseUserAgent(SAMPLE_USER_AGENTS.googlebot);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isBot).toBe(true);
    expect(result.value.deviceType).toBe("bot");
  });

  it("parses curl", () => {
    const result = parseUserAgent(SAMPLE_USER_AGENTS.curl);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.browser).toBe("curl");
    expect(result.value.browserVersion).toBe("8.4.0");
  });

  it("rejects empty input", () => {
    expect(parseUserAgent("").ok).toBe(false);
  });
});
