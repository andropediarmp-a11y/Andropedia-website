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
          background: "radial-gradient(circle at 70% 30%, #2a2a8a 0%, #0b0b24 45%, #000000 80%)",
          color: "#f1f5f9",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#8cbfff", textTransform: "uppercase" }}>
          Student Technology Club
        </div>
        <div style={{ fontSize: 120, fontWeight: 800, marginTop: 16 }}>Andropedia</div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#94a3b8" }}>
          Pioneering technology. Building creators.
        </div>
        <div style={{ fontSize: 30, marginTop: 56, color: "#3395ff" }}>Recruitment is open &rarr; join us</div>
      </div>
    ),
    size
  );
}
