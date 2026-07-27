import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Forge — free browser tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(145deg, #fff6b8 0%, #f7e96a 42%, #e8c91a 100%)",
          color: "#1a1708",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          Forge
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 600, maxWidth: 900 }}>
            Free online developer, PDF, image, calculator &amp; productivity
            tools
          </div>
          <div style={{ fontSize: 24, opacity: 0.75 }}>
            Runs securely in your browser · forge.tools
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
