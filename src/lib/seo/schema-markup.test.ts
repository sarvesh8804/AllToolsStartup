import { describe, expect, it } from "vitest";
import {
  SAMPLE_FAQ_SCHEMA,
  SAMPLE_HOWTO_SCHEMA,
  buildFaqSchema,
  buildHowToSchema,
} from "./schema-markup";

describe("buildFaqSchema", () => {
  it("builds FAQPage json-ld", () => {
    const result = buildFaqSchema(SAMPLE_FAQ_SCHEMA);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.json).toContain("FAQPage");
    expect(result.script).toContain("application/ld+json");
  });
});

describe("buildHowToSchema", () => {
  it("builds HowTo json-ld", () => {
    const result = buildHowToSchema(SAMPLE_HOWTO_SCHEMA);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.json).toContain("HowTo");
    expect(result.json).toContain("PT5M");
  });
});
