import { describe, expect, it } from "vitest";
import {
  DEFAULT_TWITTER_CARD_INPUT,
  buildTwitterCardHtml,
} from "./twitter-card";

describe("buildTwitterCardHtml", () => {
  it("emits card, title, and image tags", () => {
    const { html, warnings } = buildTwitterCardHtml(DEFAULT_TWITTER_CARD_INPUT);
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('name="twitter:image"');
    expect(warnings.length).toBe(0);
  });

  it("adds @ to site and creator", () => {
    const { html } = buildTwitterCardHtml({
      ...DEFAULT_TWITTER_CARD_INPUT,
      site: "forge",
      creator: "@ada",
    });
    expect(html).toContain('content="@forge"');
    expect(html).toContain('content="@ada"');
  });

  it("includes player fields for player cards", () => {
    const { html, warnings } = buildTwitterCardHtml({
      ...DEFAULT_TWITTER_CARD_INPUT,
      card: "player",
      playerUrl: "https://example.com/player",
      playerWidth: "640",
      playerHeight: "360",
    });
    expect(html).toContain('name="twitter:player"');
    expect(html).toContain('name="twitter:player:width" content="640"');
    expect(warnings.some((w) => /player/i.test(w))).toBe(false);
  });

  it("warns when title is missing", () => {
    const { warnings } = buildTwitterCardHtml({
      ...DEFAULT_TWITTER_CARD_INPUT,
      title: "",
    });
    expect(warnings.some((w) => /title/i.test(w))).toBe(true);
  });

  it("escapes attribute content", () => {
    const { html } = buildTwitterCardHtml({
      ...DEFAULT_TWITTER_CARD_INPUT,
      title: `A "quoted" <title>`,
    });
    expect(html).toContain("&quot;");
    expect(html).toContain("&lt;");
  });
});
