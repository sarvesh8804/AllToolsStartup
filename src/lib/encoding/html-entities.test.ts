import { describe, expect, it } from "vitest";
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
} from "./html-entities";

describe("encodeHtmlEntities", () => {
  it("escapes basic markup characters", () => {
    expect(encodeHtmlEntities(`<a href="x">A&B</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;A&amp;B&lt;/a&gt;",
    );
  });

  it("can encode non-ascii", () => {
    expect(
      encodeHtmlEntities("café", { encodeNonAscii: true }),
    ).toBe("caf&#233;");
    expect(
      encodeHtmlEntities("€", { encodeNonAscii: true, useHex: true }),
    ).toBe("&#x20AC;");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes named and numeric entities", () => {
    const result = decodeHtmlEntities(
      "&lt;div&gt;A&amp;B &#169; &#x20AC;&lt;/div&gt;",
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("<div>A&B © €</div>");
  });

  it("leaves unknown named entities intact", () => {
    const result = decodeHtmlEntities("&notarealthing;");
    expect(result.ok && result.value).toBe("&notarealthing;");
  });
});
