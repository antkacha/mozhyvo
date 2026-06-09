import { ImageResponse } from "next/og";
import { opportunities } from "@/lib/data";

export const alt = "Моживо — можливість";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

const TYPE_COLORS: Record<string, string> = {
  scholarship:  "#3B4FE8",
  internship:   "#2563EB",
  exchange:     "#16A34A",
  volunteering: "#0D9488",
  competition:  "#EA580C",
  grant:        "#CA8A04",
  conference:   "#DB2777",
  hackathon:    "#DC2626",
};

const FUNDING_LABEL: Record<string, string> = {
  "fully-funded":      "✓ Повне фінансування",
  "partially-funded":  "Часткове фінансування",
  "self-funded":       "Без фінансування",
};

export default function Image({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) {
    return new ImageResponse(
      <div style={{ background: "#3B4FE8", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white", fontSize: 48, fontWeight: 900 }}>Моживо</p>
      </div>,
      { ...size }
    );
  }

  const accentColor = TYPE_COLORS[opp.type] ?? "#3B4FE8";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAFAFA",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent left border strip */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: accentColor }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "60px 72px 60px 84px", justifyContent: "space-between" }}>

          {/* Top row: type badge + funding */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: "8px 20px",
                background: accentColor,
                borderRadius: 100,
                color: "white",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {opp.typeName}
            </div>
            {opp.funding === "fully-funded" && (
              <div
                style={{
                  padding: "8px 20px",
                  background: "#DCFCE7",
                  borderRadius: 100,
                  color: "#15803D",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {FUNDING_LABEL[opp.funding]}
              </div>
            )}
          </div>

          {/* Middle: org + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
              style={{
                color: "#6B7280",
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {opp.org}
            </p>
            <h1
              style={{
                color: "#0F0F0F",
                fontSize: opp.title.length > 60 ? 46 : 56,
                fontWeight: 900,
                lineHeight: 1.08,
                margin: 0,
                letterSpacing: "-1.5px",
                maxWidth: "90%",
              }}
            >
              {opp.title}
            </h1>
          </div>

          {/* Bottom: meta + logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
              {[
                { label: "Місце",     val: `${opp.flag} ${opp.location}` },
                { label: "Дедлайн",   val: opp.deadlineDisplay },
                opp.duration ? { label: "Тривалість", val: opp.duration } : null,
              ].filter(Boolean).map((item) => (
                <div key={item!.label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                    {item!.label}
                  </span>
                  <span style={{ color: "#374151", fontSize: 20, fontWeight: 700 }}>{item!.val}</span>
                </div>
              ))}
            </div>

            {/* Mozhyvo branding */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: accentColor,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                М
              </div>
              <span style={{ color: "#374151", fontSize: 20, fontWeight: 800 }}>mozhyvo.ua</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
