import { ImageResponse } from "next/og";

export const alt = "CruxPad - AI Study Workspace";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          color: "#f8fbff",
          background:
            "radial-gradient(1200px 540px at 2% -6%, #274caa 0%, transparent 62%), radial-gradient(900px 430px at 98% -8%, #0aa690 0%, transparent 58%), linear-gradient(145deg, #0a173d 0%, #0f53cb 58%, #0b9b8d 100%)",
          fontFamily: "Segoe UI, Inter, Arial",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.34)",
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            CP
          </div>
          CruxPad
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05 }}>
            Turn Engineering Docs Into
            <br />
            Revision-Ready Study Packs
          </div>
          <div style={{ fontSize: 30, opacity: 0.92 }}>
            AI cheatsheets, exam notes, interview questions, and concept graphs.
          </div>
        </div>
      </div>
    ),
    size
  );
}
