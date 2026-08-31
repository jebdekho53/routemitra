import { ImageResponse } from "next/og";

export const alt = "RouteMitra — Bus, Train & Flight ek jagah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(1000px 500px at 10% -20%, #0a6ed122, transparent), #f2f4f7",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#0a6ed1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 10, background: "#fff" }} />
            <div style={{ width: 10, height: 10, borderRadius: 10, background: "#fff" }} />
            <div style={{ width: 10, height: 10, borderRadius: 10, background: "#fff" }} />
          </div>
          <div
            style={{
              fontSize: 30,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#55606f",
              fontFamily: "monospace",
            }}
          >
            RouteMitra
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 40,
            fontSize: 76,
            lineHeight: 1.05,
            color: "#16181d",
            fontWeight: 600,
            maxWidth: 950,
          }}
        >
          <span>Ek jagah.</span>
          <span style={{ color: "#0a6ed1", fontStyle: "italic" }}>
            Bus, train, flight.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#55606f",
            maxWidth: 820,
          }}
        >
          Do city ke beech saare options compare karo — sabse sasta ya sabse tez
          chuno.
        </div>
      </div>
    ),
    size,
  );
}
