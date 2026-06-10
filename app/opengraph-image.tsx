import { ImageResponse } from "next/og";

export const alt = "Моживо — Всі можливості в одному місці";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #3B4FE8 0%, #2D3DD6 60%, #1e2fb8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: logo + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 900,
              color: "white",
            }}
          >
            М
          </div>
          <span style={{ color: "white", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>Моживо</span>
          <div
            style={{
              marginLeft: 16,
              padding: "6px 16px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Платформа можливостей
          </div>
        </div>

        {/* Center: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1
            style={{
              color: "white",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-2px",
            }}
          >
            Знайди свою<br />можливість у світі
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 26, margin: 0, fontWeight: 400, lineHeight: 1.4 }}>
            Гранти · Стажування · Обміни · Стипендії для молоді України
          </p>
        </div>

        {/* Bottom: stats */}
        <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
          {[
            { num: "1 200+", label: "можливостей" },
            { num: "40+",    label: "країн" },
            { num: "5 000+", label: "молодих людей" },
          ].map(({ num, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ color: "white", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{num}</span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
            mozhyvo.ua
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
