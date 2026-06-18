"use client";
// Bar list of substances logged in the selected month, sorted descending.
// Each row: colored dot, name, day count, proportional bar.
import { useMemo } from "react";
import { A, BG, BO, MU, TX } from "./theme";
import { sc } from "./helpers";

// SUBSTANCE_I18N_2026-06-18 — translate the raw substance tag (e.g. "alcohol",
// "amphetamines") via the t dictionary; fall back to a capitalized raw value
// if no translation key exists. Previously the raw English tag was rendered
// directly with CSS capitalize, so even tags WITH translations (alcohol →
// Alkohol) showed in English.
function substanceLabel(s, t) {
  if (t && t[s]) return t[s];
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function MonthlySubstances({ monthRecs, monthLabel, t }) {
  const monthSubCounts = useMemo(() => {
    const c = {};
    monthRecs.forEach((r) =>
      (r.substances ?? []).forEach((s) => {
        c[s] = (c[s] ?? 0) + 1;
      }),
    );
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [monthRecs]);

  const max = monthSubCounts[0]?.[1] ?? 0;

  return (
    <div style={{ borderTop: `1px solid ${BO}`, padding: "10px 14px" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: A,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {t.substancesThisMonth ?? "Substances"} — {monthLabel}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {monthSubCounts.length === 0 ? (
          <span style={{ fontSize: 12, color: MU }}>
            {t.noSubstances ?? "No substances logged this month"}
          </span>
        ) : (
          monthSubCounts.map(([s, n]) => (
            <div key={s}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: sc(s),
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: TX,
                      fontWeight: 500,
                    }}
                  >
                    {substanceLabel(s, t)}
                  </span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: sc(s) }}>
                  {n} {t.days ?? "days"}
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: BG,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(n / max) * 100}%`,
                    height: "100%",
                    background: sc(s),
                    borderRadius: 3,
                    transition: "width .4s ease",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}