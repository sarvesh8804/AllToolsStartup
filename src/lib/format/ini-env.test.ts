import { describe, expect, it } from "vitest";
import {
  SAMPLE_ENV,
  SAMPLE_INI,
  convertIniEnv,
  parseEnv,
  parseIni,
} from "./ini-env";

describe("parseEnv", () => {
  it("parses env lines", () => {
    const result = parseEnv(SAMPLE_ENV);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.APP_NAME).toBe("Forge");
    expect(result.data.DATABASE_URL).toBe("postgres://localhost/forge");
  });
});

describe("parseIni", () => {
  it("parses ini sections", () => {
    const result = parseIni(SAMPLE_INI);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.app?.name).toBe("Forge");
    expect(result.data.database?.url).toContain("postgres");
  });
});

describe("convertIniEnv", () => {
  it("converts env to json", () => {
    const result = convertIniEnv(SAMPLE_ENV, "env", "json");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.output).toContain("APP_NAME");
  });
});
