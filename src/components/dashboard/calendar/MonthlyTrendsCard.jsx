"use client";
// Averaged trend bars for the selected month — cravings, mood, wellbeing,
// frequency, amount. Each row: emoji + label + average + bar.
import { useMemo } from "react";
import { BG, MU, TX } from "./theme";
import { TREND_SERIES, FREQ_VAL } from "./constants";

export default function MonthlyTrendsCard({ monthRecs, t }) {
  const avgs = useMemo(() => {
    const out = {};
    TREND_SERIES.forEach(({ key }) => {
      const vals = monthRecs
        .map((r) => {
          if (key === "frequency") return FREQ_VAL[r.frequency] ?? null;
          return r[key] ?? null;
        })
        .filter((v) => v != null);
      out[key] = vals.length
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : null;
    });
    return out;
  }, [monthRecs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TREND_SERIES.map((s) => {
        const avg = avgs[s.key];
        const pct = avg != null ? (avg / s.max) * 100 : 0;
        return (
          <div key={s.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TX }}>
                  {t[s.key] ?? s.label}
                </span>
              </div>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: avg != null ? s.color : MU,
                }}
              >
                {avg != null ? avg.toFixed(1) : "—"}
                {avg != null && (
                  <span style={{ fontSize: 10, fontWeight: 500, color: MU }}>
                    {" "}
                    / {s.max}
                  </span>
                )}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: BG,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: s.color,
                  borderRadius: 3,
                  transition: "width .4s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
