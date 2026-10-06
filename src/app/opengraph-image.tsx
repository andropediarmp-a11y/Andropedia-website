import { ImageResponse } from "next/og";

export const alt = "Andropedia: student technology club";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated share image (shown when the site is linked on social media or chat apps).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #050b16 0%, #0a1221 55%, #062b22 100%)",
          color: "#f1f5f9",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#34d399", textTransform: "uppercase" }}>
          Student Technology Club
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, marginTop: 16 }}>Andropedia</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#94a3b8" }}>
          Pioneering technology. Building creators.
        </div>
        <div style={{ fontSize: 30, marginTop: 56, color: "#34d399" }}>Recruitment is open &rarr; join us</div>
      </div>
    ),
    size
  );
}
