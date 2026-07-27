import { describe, expect, it } from "vitest";
import QRCode from "qrcode";
import { decodeQrFromImageData, modulesToImageData } from "./decode";

describe("decodeQrFromImageData", () => {
  it("returns error for empty image", () => {
    const result = decodeQrFromImageData({
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0,
    });
    expect(result.ok).toBe(false);
  });

  it("returns error when no QR is present", () => {
    const data = new Uint8ClampedArray(16 * 16 * 4);
    data.fill(255);
    const result = decodeQrFromImageData({ data, width: 16, height: 16 });
    expect(result.ok).toBe(false);
  });

  it("round-trips text via qrcode modules", async () => {
    const qr = await QRCode.create("forge-qr-roundtrip", {
      errorCorrectionLevel: "M",
    });
    const size = qr.modules.size;
    const modules: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        row.push(Boolean(qr.modules.get(x, y)));
      }
      modules.push(row);
    }
    const image = modulesToImageData(modules, 6, 4);
    const result = decodeQrFromImageData(image);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.text).toBe("forge-qr-roundtrip");
  });
});
