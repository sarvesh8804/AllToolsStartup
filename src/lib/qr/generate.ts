import QRCode from "qrcode";

export type QrErrorCorrection = "L" | "M" | "Q" | "H";

export type QrOptions = {
  errorCorrection: QrErrorCorrection;
  /** Pixel size of the quiet-zone-included image. */
  size: number;
  margin: number;
  darkColor: string;
  lightColor: string;
};

export const DEFAULT_QR_OPTIONS: QrOptions = {
  errorCorrection: "M",
  size: 280,
  margin: 2,
  darkColor: "#1a1a14",
  lightColor: "#fffef6",
};

export const ERROR_LEVELS: { id: QrErrorCorrection; label: string }[] = [
  { id: "L", label: "L (~7%)" },
  { id: "M", label: "M (~15%)" },
  { id: "Q", label: "Q (~25%)" },
  { id: "H", label: "H (~30%)" },
];

export function clampQrSize(size: number): number {
  return Math.max(128, Math.min(1024, Math.floor(size)));
}

export async function generateQrDataUrl(
  text: string,
  options: QrOptions = DEFAULT_QR_OPTIONS,
): Promise<string> {
  if (!text) {
    throw new Error("Enter text or a URL to generate a QR code.");
  }
  const size = clampQrSize(options.size);
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options.errorCorrection,
    width: size,
    margin: options.margin,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  });
}

export async function generateQrSvg(
  text: string,
  options: QrOptions = DEFAULT_QR_OPTIONS,
): Promise<string> {
  if (!text) {
    throw new Error("Enter text or a URL to generate a QR code.");
  }
  const size = clampQrSize(options.size);
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: options.errorCorrection,
    width: size,
    margin: options.margin,
    color: {
      dark: options.darkColor,
      light: options.lightColor,
    },
  });
}
