import { describe, expect, it } from "vitest";
import {
  bytesToBase64,
  buildCssBackground,
  buildDataUrl,
  buildHtmlImg,
  guessImageMime,
  imageBytesToBase64,
  selectImageBase64Output,
} from "./to-base64";

describe("image to base64", () => {
  it("encodes known bytes", () => {
    // "Hi" in ASCII
    const bytes = new Uint8Array([72, 105]);
    expect(bytesToBase64(bytes)).toBe("SGk=");
  });

  it("builds data URL and wrappers", () => {
    const result = imageBytesToBase64(
      new Uint8Array([137, 80, 78, 71]),
      "image/png",
      'a "pic"',
    );
    expect(result.dataUrl.startsWith("data:image/png;base64,")).toBe(true);
    expect(result.css).toContain("background-image: url(");
    expect(result.html).toContain("&quot;");
    expect(selectImageBase64Output(result, "raw")).toBe(result.base64);
  });

  it("guesses mime from filename", () => {
    expect(guessImageMime({ type: "", name: "photo.JPEG" })).toBe("image/jpeg");
    expect(guessImageMime({ type: "image/webp", name: "x.bin" })).toBe(
      "image/webp",
    );
  });

  it("accepts svg as encodable", async () => {
    const { isEncodableImageFile } = await import("./to-base64");
    expect(isEncodableImageFile({ type: "image/svg+xml", name: "a.svg" })).toBe(
      true,
    );
    expect(isEncodableImageFile({ type: "", name: "icon.svg" })).toBe(true);
  });

  it("escapes html alt and builds helpers", () => {
    expect(buildDataUrl("image/gif", "abc")).toBe("data:image/gif;base64,abc");
    expect(buildCssBackground("data:x")).toBe('background-image: url("data:x");');
    expect(buildHtmlImg("data:x", "<img>")).toContain("&lt;img&gt;");
  });
});
