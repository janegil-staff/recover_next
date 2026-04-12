// src/app/dashboard/summary/page.jsx
"use client";
import { useState, useMemo } from "react";
import { useDashboardT } from "../LangContext";

const A = "#4a7ab5",
  AD = "#2d4a6e",
  BG = "#eef2f7",
  SU = "#ffffff",
  BO = "#d0dcea",
  TX = "#1a2c3d",
  MU = "#7a9ab8";
const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  other: "#bdbdbd",
};
const sc = (s) => SC[s] ?? "#bdbdbd";
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: SU,
        borderRadius: 14,
        border: `1px solid ${BO}`,
        padding: 16,
        boxShadow: "0 2px 8px rgba(74,122,181,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: A,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function StatRow({ dot, label, val }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 0",
        borderBottom: `1px solid ${BG}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12, color: TX }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: AD }}>{val}</span>
    </div>
  );
}

export default function SummaryPage() {
  const t = useDashboardT();

  const [data] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("patientData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [month, setMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const months = t.months ?? [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthRecs = useMemo(() => {
    if (!data) return [];
    return (data.records ?? []).filter((r) => {
      const d = new Date(r.date ?? r.createdAt);
      return d.getFullYear() === month.y && d.getMonth() === month.m;
    });
  }, [data, month]);

  const allRecs = data?.records ?? [];

  const subCounts = useMemo(() => {
    const c = {};
    monthRecs.forEach((r) =>
      (r.substances ?? []).forEach((s) => {
        c[s] = (c[s] ?? 0) + 1;
      }),
    );
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [monthRecs]);

  const allSubCounts = useMemo(() => {
    const c = {};
    allRecs.forEach((r) =>
      (r.substances ?? []).forEach((s) => {
        c[s] = (c[s] ?? 0) + 1;
      }),
    );
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [allRecs]);

  if (!data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  const avgOf = (field) =>
    monthRecs.length
      ? (
          monthRecs.reduce((a, r) => a + (r[field] ?? 0), 0) / monthRecs.length
        ).toFixed(1)
      : "—";
  const { y, m } = month;

  const weights = (data.records ?? [])
    .filter((r) => r.weight)
    .map((r) => ({ d: fmtDate(r.date ?? r.createdAt), w: r.weight }));
  const latestWeight = weights[weights.length - 1];
  const bmi =
    latestWeight && data.height
      ? (latestWeight.w / (data.height / 100) ** 2).toFixed(1)
      : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Month selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() =>
            setMonth((p) => {
              const d = new Date(p.y, p.m - 1);
              return { y: d.getFullYear(), m: d.getMonth() };
            })
          }
          style={{
            background: SU,
            border: `1px solid ${BO}`,
            borderRadius: 7,
            width: 28,
            height: 28,
            cursor: "pointer",
            color: MU,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: AD }}>
          {months[m]} {y}
        </span>
        <button
          onClick={() =>
            setMonth((p) => {
              const d = new Date(p.y, p.m + 1);
              return { y: d.getFullYear(), m: d.getMonth() };
            })
          }
          style={{
            background: SU,
            border: `1px solid ${BO}`,
            borderRadius: 7,
            width: 28,
            height: 28,
            cursor: "pointer",
            color: MU,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
          }}
        >
          ›
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 12,
        }}
      >
        {/* Month stats */}
        <Card title={`${months[m]} stats`}>
          <StatRow
            dot="#a8d5a2"
            label={t.daysLogged ?? "Days logged"}
            val={monthRecs.length}
          />
          <StatRow
            dot="#f4a07a"
            label={t.avgCravings ?? "Avg cravings"}
            val={avgOf("cravings")}
          />
          <StatRow
            dot={A}
            label={t.avgMood ?? "Avg mood"}
            val={avgOf("mood")}
          />
          <StatRow
            dot="#9c27b0"
            label={t.avgWellbeing ?? "Avg wellbeing"}
            val={avgOf("wellbeing")}
          />
          <StatRow
            dot={MU}
            label={t.totalRecords ?? "Total records"}
            val={allRecs.length}
          />
        </Card>

        {/* Substances this month */}
        <Card title={t.substancesMonth ?? "Substances this month"}>
          {subCounts.length > 0 ? (
            subCounts.map(([s, n]) => (
              <div key={s} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
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
                        fontSize: 12,
                        color: TX,
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc(s) }}>
                    {n} {t.days ?? "days"}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: BG,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(n / monthRecs.length) * 100}%`,
                      height: "100%",
                      background: sc(s),
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <span style={{ fontSize: 12, color: MU }}>
              {t.noSubstancesMonth ?? "No substances logged this month"}
            </span>
          )}
        </Card>

        {/* All-time substance breakdown */}
        <Card title={t.substancesAllTime ?? "All-time substances"}>
          {allSubCounts.length > 0 ? (
            allSubCounts.map(([s, n]) => (
              <div key={s} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
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
                        fontSize: 12,
                        color: TX,
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc(s) }}>
                    {n} {t.days ?? "days"}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: BG,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(n / allRecs.length) * 100}%`,
                      height: "100%",
                      background: sc(s),
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <span style={{ fontSize: 12, color: MU }}>
              {t.noSubstances ?? "No substances logged"}
            </span>
          )}
        </Card>

        {/* Weight & BMI */}
        <Card title={t.weightBmi ?? "Weight & BMI"}>
          {latestWeight ? (
            <>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: AD,
                  marginBottom: 4,
                }}
              >
                {latestWeight.w}{" "}
                <span style={{ fontSize: 14, color: MU }}>{t.kg ?? "kg"}</span>
              </div>
              {bmi && (
                <div style={{ fontSize: 12, color: MU, marginBottom: 8 }}>
                  {t.bmi ?? "BMI"}{" "}
                  <span style={{ fontWeight: 700, color: AD }}>{bmi}</span>
                </div>
              )}
              <div style={{ fontSize: 10, color: MU, marginBottom: 10 }}>
                {t.lastLogged ?? "Last logged"} {latestWeight.d}
              </div>
              {weights.length > 1 && (
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: MU,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    {(t.weightHistory ?? "History").toUpperCase()}
                  </div>
                  {weights
                    .slice(-6)
                    .reverse()
                    .map((w, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom: `1px solid ${BG}`,
                        }}
                      >
                        <span style={{ fontSize: 11, color: MU }}>{w.d}</span>
                        <span
                          style={{ fontSize: 11, fontWeight: 600, color: AD }}
                        >
                          {w.w} {t.kg ?? "kg"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </>
          ) : (
            <span style={{ fontSize: 12, color: MU }}>
              {t.noWeight ?? "No weight logged"}
            </span>
          )}
        </Card>
      </div>
    </div>
  );
}
