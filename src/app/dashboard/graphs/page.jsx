// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell,
} from "recharts";

// Card-level colors use CSS variables for non-SVG content
const TX_VAR = "var(--text)";
const MU_VAR = "var(--text-muted)";
const AD_VAR = "var(--accent-strong)";
const SU_VAR = "var(--card)";
const BO_VAR = "var(--card-border)";

// Recharts SVG props need hex/rgb strings — resolve them here based on theme
const CHART_COLORS = {
  light: {
    accent: "#4a7ab5",
    accentStrong: "#2d4a6e",
    text: "#1a2c3d",
    muted: "#7a9ab8",
    grid: "#d0dcea",
    surface: "#ffffff",
    border: "#d0dcea",
  },
  dark: {
    accent: "#7aabdb",
    accentStrong: "#a8c8e8",
    text: "#e2e8f0",
    muted: "#94a8be",
    grid: "#2a3a52",
    surface: "#1a2535",
    border: "#2a3a52",
  },
};

// Substance colors — semantic, same in both modes
const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  mdma: "#ec407a",
  ecstasy: "#ec407a",
  ghb: "#00acc1",
  acid: "#9c27b0",
  other: "#bdbdbd",
};

function pad(n) {
  return String(n).padStart(2, "0");
}
function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// Score → color, matches mobile app's SCORE_COLORS palette
const SCORE_COLORS = {
  0: "#22C55E", // green   — best
  1: "#7AABDB", // blue
  2: "#FBBF24", // yellow
  3: "#FB923C", // orange
  4: "#EF4444", // red
  5: "#991B1B", // dark red — worst
};
const FREQ_SCORE = { none: 0, once: 1, few_times: 2, daily: 3, multiple_daily: 4 };

// Same logic as mobile's avgScore — clamped 0–5
function dayScore(rec) {
  if (!rec) return null;
  const vals = [];
  if (rec.cravings != null) vals.push(rec.cravings);
  if (rec.mood != null) vals.push(6 - rec.mood);
  if (rec.wellbeing != null) vals.push(6 - rec.wellbeing);
  if (rec.amount != null) vals.push(Math.min(5, (rec.amount / 10) * 5));
  if (rec.frequency != null && FREQ_SCORE[rec.frequency] != null)
    vals.push(FREQ_SCORE[rec.frequency]);
  if (!vals.length) return null;
  return Math.min(5, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
}

function Card({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        background: SU_VAR,
        borderRadius: 14,
        border: `1px solid ${BO_VAR}`,
        padding: 20,
        boxShadow: "var(--shadow-card)",
        marginBottom: 16,
        ...style,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: AD_VAR }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: MU_VAR, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: c.accentStrong, marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ fontSize: 11, color: c.text }}>{p.name}:</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.accentStrong }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Spider / Radar chart for mental health questionnaires ──────────────────
function QRadarChart({ qScores, c }) {
  const data = qScores
    .filter((q) => q.score != null)
    .map((q) => ({ subject: q.label, value: q.pct, fullMark: 100 }));

  if (data.length < 3)
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        Not enough questionnaire data
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar
          name="Score"
          dataKey="value"
          stroke={c.accent}
          fill={c.accent}
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 4, fill: c.accent }}
        />
        <Tooltip
          formatter={(v) => [`${v}%`, "Score"]}
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: c.surface,
            color: c.text,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Spider chart for substance profile ─────────────────────────────────────
function SubstanceRadarChart({ records, c }) {
  const subMap = {};
  records.forEach((r) => {
    (r.substances ?? []).forEach((s) => {
      if (!subMap[s]) subMap[s] = { count: 0, totalAmount: 0 };
      subMap[s].count++;
      subMap[s].totalAmount += r.amount ?? 0;
    });
  });

  const data = Object.entries(subMap).map(([s, v]) => ({
    subject: s.charAt(0).toUpperCase() + s.slice(1),
    days: v.count,
    avgAmount: Math.round((v.totalAmount / v.count) * 10) / 10,
  }));

  if (data.length < 3)
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        Need at least 3 substances for radar
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar name="Days used" dataKey="days" stroke="#ec407a" fill="#ec407a" fillOpacity={0.2} strokeWidth={2} />
        <Radar name="Avg amount" dataKey="avgAmount" stroke={c.accent} fill={c.accent} fillOpacity={0.2} strokeWidth={2} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: c.surface,
            color: c.text,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Wellbeing radar ─────────────────────────────────────────────────────────
function WellbeingRadarChart({ records, c }) {
  if (!records.length) return null;

  const avg = (key) => {
    const vals = records.map((r) => r[key]).filter((v) => v != null);
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  };

  const avgMood = avg("mood");
  const avgWellbeing = avg("wellbeing");
  const avgCravings = avg("cravings");
  const avgAmount = avg("amount");
  const sobrietyDays = records.filter((r) => !r.substances?.length).length;
  const sobrietyPct = Math.round((sobrietyDays / records.length) * 5 * 10) / 10;

  const data = [
    { subject: "Mood", value: avgMood, fullMark: 5 },
    { subject: "Wellbeing", value: avgWellbeing, fullMark: 5 },
    { subject: "Low cravings", value: Math.max(0, 5 - avgCravings), fullMark: 5 },
    { subject: "Low amount", value: Math.max(0, 5 - (avgAmount / 10) * 5), fullMark: 5 },
    { subject: "Sober days", value: sobrietyPct, fullMark: 5 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar
          name="Patient profile"
          dataKey="value"
          stroke="#66bb6a"
          fill="#66bb6a"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 4, fill: "#66bb6a" }}
        />
        <Tooltip
          formatter={(v, n) => [v, n]}
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: c.surface,
            color: c.text,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Sober streak heatmap ───────────────────────────────────────────────────
// GitHub-contributions style. One cell per day in the range. Color uses
// SCORE_COLORS (mobile palette). Days without records are neutral gray.
function SoberStreakHeatmap({ records, range, c }) {
  const recMap = useMemo(() => {
    const m = {};
    records.forEach((r) => {
      m[fmtDate(r.date ?? r.createdAt)] = r;
    });
    return m;
  }, [records]);

  // Build the grid of dates from oldest in range → today, oldest first
  const days = useMemo(() => {
    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (range - 1));
    for (let i = 0; i < range; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [range]);

  // Streak metrics
  const stats = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    let running = 0;
    let soberCount = 0;
    let usedCount = 0;
    let runningCurrent = 0;

    days.forEach((d, i) => {
      const rec = recMap[fmtDate(d)];
      const subs = rec?.substances ?? [];
      const isSober = rec && subs.length === 0;
      const isUsed = rec && subs.length > 0;
      if (isSober) soberCount++;
      if (isUsed) usedCount++;

      // Longest streak — count any sober day; reset on use; missing days break the streak
      if (isSober) {
        running++;
        longestStreak = Math.max(longestStreak, running);
      } else {
        running = 0;
      }

      // Current streak — counted from end of range backward in second pass
      if (i === days.length - 1) {
        // start counting backward
        for (let j = days.length - 1; j >= 0; j--) {
          const r = recMap[fmtDate(days[j])];
          const ss = r?.substances ?? [];
          if (r && ss.length === 0) {
            runningCurrent++;
          } else {
            break;
          }
        }
        currentStreak = runningCurrent;
      }
    });

    return { currentStreak, longestStreak, soberCount, usedCount, totalDays: days.length };
  }, [days, recMap]);

  // Cell sizing — aim for ~7 columns when range=7, otherwise wider grid
  const cols = range <= 14 ? range : range <= 31 ? 7 : range <= 90 ? 13 : 14;
  const rows = Math.ceil(days.length / cols);

  // Reorganize days into a column-major grid so newest is bottom-right
  const grid = [];
  for (let col = 0; col < cols; col++) {
    grid.push([]);
    for (let row = 0; row < rows; row++) {
      const idx = col * rows + row;
      grid[col].push(idx < days.length ? days[idx] : null);
    }
  }

  const cellSize = 14;
  const cellGap = 3;

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <Stat label="Current sober streak" value={`${stats.currentStreak}d`} accent={c.accent} muted={c.muted} text={c.text} />
        <Stat label="Longest in range"     value={`${stats.longestStreak}d`} accent="#22C55E" muted={c.muted} text={c.text} />
        <Stat label="Sober days"            value={`${stats.soberCount}/${stats.totalDays}`} accent="#22C55E" muted={c.muted} text={c.text} />
        <Stat label="Use days"              value={`${stats.usedCount}/${stats.totalDays}`}  accent="#EF4444" muted={c.muted} text={c.text} />
      </div>

      {/* Heatmap grid */}
      <div style={{ display: "flex", gap: cellGap, alignItems: "flex-start" }}>
        {grid.map((column, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: cellGap }}>
            {column.map((d, ri) => {
              if (!d) return <div key={ri} style={{ width: cellSize, height: cellSize }} />;
              const rec = recMap[fmtDate(d)];
              const score = dayScore(rec);
              const bg = rec == null ? c.grid : score == null ? c.grid : SCORE_COLORS[score];
              const tooltip = rec
                ? `${fmtDate(d)} · ${rec.substances?.length ? rec.substances.join(", ") : "Sober"}${score != null ? ` · score ${score}` : ""}`
                : `${fmtDate(d)} · No log`;
              return (
                <div
                  key={ri}
                  title={tooltip}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background: bg,
                    borderRadius: 3,
                    border: rec == null ? `1px dashed ${c.border}` : "none",
                    cursor: "default",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 10, color: c.muted, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600 }}>Severity:</span>
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: SCORE_COLORS[s] }} />
            <span>{s === 0 ? "best" : s === 5 ? "worst" : s}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "transparent", border: `1px dashed ${c.border}` }} />
          <span>no log</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, muted, text }) {
  return (
    <div style={{ flex: "1 1 auto", minWidth: 100 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 9, color: muted, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

// ── Side effects frequency bar ────────────────────────────────────────────
// Horizontal bars, sorted by count descending. Color is warning-orange.
function SideEffectsBar({ records, c }) {
  const data = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      (r.sideEffects ?? []).forEach((e) => {
        counts[e] = (counts[e] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([effect, count]) => ({
        effect: effect.replace(/_/g, " "),
        count,
      }));
  }, [records]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        No side effects logged in this period
      </div>
    );
  }

  const height = Math.max(180, data.length * 28 + 30);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: c.muted }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="effect"
          tick={{ fontSize: 11, fill: c.text, fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
          width={110}
        />
        <Tooltip
          contentStyle={{
            fontSize: 11,
            borderRadius: 8,
            border: `1px solid ${c.border}`,
            background: c.surface,
            color: c.text,
          }}
          formatter={(v) => [`${v} day${v === 1 ? "" : "s"}`, "Count"]}
        />
        <Bar
          dataKey="count"
          fill="#f4a07a"
          radius={[0, 4, 4, 0]}
          maxBarSize={20}
          label={{ position: "right", fill: c.text, fontSize: 10, fontWeight: 700 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Substance mix donut ────────────────────────────────────────────────────
// Mirrors Coachly's CategoryMixDonut layout: 200px donut + 2-col legend.
// Slice = days. Tooltip shows days + total amount. Includes a "Sober" slice
// for days with no substances logged.
function SubstanceMixDonut({ records, c, t }) {
  const data = useMemo(() => {
    const stats = {};
    let soberDays = 0;
    records.forEach((r) => {
      const subs = r.substances ?? [];
      if (subs.length === 0) {
        soberDays += 1;
        return;
      }
      subs.forEach((s) => {
        if (!stats[s]) stats[s] = { days: 0, totalAmount: 0 };
        stats[s].days += 1;
        stats[s].totalAmount += Number(r.amount) || 0;
      });
    });

    const entries = Object.entries(stats)
      .sort((a, b) => b[1].days - a[1].days)
      .map(([name, v]) => ({ name, days: v.days, amount: v.totalAmount }));

    // Prepend Sober if there are any sober days
    if (soberDays > 0) {
      entries.unshift({ name: "sober", days: soberDays, amount: 0 });
    }
    return entries;
  }, [records]);

  const totalDays = data.reduce((s, d) => s + d.days, 0);
  const isEmpty = data.length === 0;

  // Sober uses the green from SCORE_COLORS (semantic match with the heatmap)
  const sliceColor = (name) => {
    if (name === "sober") return "#22C55E";
    if (name === "empty") return "#E8EEF5";
    return SC[name] ?? SC.other;
  };

  const labelOf = (name) => {
    if (name === "sober") return t.sober ?? "Sober";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ width: "100%", height: 200, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={isEmpty ? [{ name: "empty", days: 1 }] : data}
              dataKey="days"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              paddingAngle={data.length > 1 ? 2 : 0}
              labelLine={false}
              isAnimationActive={false}
            >
              {(isEmpty ? [{ name: "empty" }] : data).map((entry, i) => (
                <Cell key={`${entry.name}-${i}`} fill={sliceColor(entry.name)} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                formatter={(value, name, props) => {
                  const amt = props?.payload?.amount ?? 0;
                  const isSober = name === "sober";
                  const detail = isSober
                    ? `${value} ${t.days ?? "days"}`
                    : `${value} ${t.days ?? "days"} · ${amt} ${t.totalAmount ?? "total amount"}`;
                  return [detail, labelOf(name)];
                }}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surface,
                  color: c.text,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center text — total tracked days */}
        {!isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: c.accentStrong, lineHeight: 1 }}>
              {totalDays}
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, color: c.muted, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 3 }}>
              {t.daysLogged ?? "days"}
            </div>
          </div>
        )}
      </div>

      {/* Legend: 2-column grid like Coachly */}
      {!isEmpty ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px 12px",
            padding: "8px 4px 0",
            fontSize: 11,
          }}
        >
          {data.map((d) => {
            const pct = totalDays > 0 ? Math.round((d.days / totalDays) * 100) : 0;
            return (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: sliceColor(d.name),
                  }}
                />
                <span style={{ color: c.text, fontWeight: 600, flex: 1, textTransform: "capitalize" }}>
                  {labelOf(d.name)}
                </span>
                <span style={{ color: c.muted, fontVariantNumeric: "tabular-nums" }}>
                  {d.days}d · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", color: c.muted, fontSize: 11, fontStyle: "italic", padding: "8px 0" }}>
          {t.noSubstances ?? "No data"}
        </div>
      )}
    </div>
  );
}

export default function GraphsPage() {
  const t = useDashboardT();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

  // Hydration-safe data load
  const [data, setData] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("patientData");
      setData(raw ? JSON.parse(raw) : null);
    } catch {
      setData(null);
    }
    setHydrated(true);
  }, []);

  const [range, setRange] = useState(30);

  const rangeLabel = {
    7: `Last 7 ${t.days ?? "days"}`,
    30: `Last 30 ${t.days ?? "days"}`,
    90: `Last 90 ${t.days ?? "days"}`,
    365: `All time`,
  };

  const records = useMemo(() => {
    if (!data) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return [...(data.records ?? [])]
      .filter((r) => new Date(r.date ?? r.createdAt) >= cutoff)
      .sort((a, b) => (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt));
  }, [data, range]);

  const moodData = useMemo(
    () =>
      records.map((r) => ({
        date: shortDate(r.date ?? r.createdAt),
        mood: r.mood ?? null,
        cravings: r.cravings ?? null,
        wellbeing: r.wellbeing ?? null,
      })),
    [records],
  );

  const substanceData = useMemo(() => {
    const weeks = {};
    records.forEach((r) => {
      const d = new Date(r.date ?? r.createdAt);
      const day = d.getDay();
      const diff = d.getDate() - (day === 0 ? 6 : day - 1);
      const mon = new Date(d);
      mon.setDate(diff);
      const key = `${pad(mon.getMonth() + 1)}/${pad(mon.getDate())}`;
      if (!weeks[key]) weeks[key] = { week: key };
      (r.substances ?? []).forEach((s) => {
        weeks[key][s] = (weeks[key][s] ?? 0) + 1;
      });
    });
    return Object.values(weeks);
  }, [records]);

  const allSubs = useMemo(() => {
    const s = new Set();
    records.forEach((r) => (r.substances ?? []).forEach((x) => s.add(x)));
    return [...s];
  }, [records]);

  const weightData = useMemo(
    () =>
      records
        .filter((r) => r.weight)
        .map((r) => ({ date: shortDate(r.date ?? r.createdAt), weight: r.weight })),
    [records],
  );

  const qScores = useMemo(() => {
    if (!data) return [];
    return [
      { key: "latestGad7",      label: "GAD-7",     max: 21, color: "#7C3AED" },
      { key: "latestPhq9",      label: "PHQ-9",     max: 27, color: "#DC2626" },
      { key: "latestAudit",     label: "AUDIT",     max: 40, color: "#D97706" },
      { key: "latestDast10",    label: "DAST-10",   max: 10, color: "#059669" },
      { key: "latestCage",      label: "CAGE",      max: 4,  color: "#0284C7" },
      { key: "latestReadiness", label: "Readiness", max: 30, color: "#0891B2" },
    ].map((q) => {
      const raw = data[q.key];
      if (!raw) return { ...q, score: null, pct: 0 };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      return { ...q, score, pct: Math.round((score / q.max) * 100) };
    });
  }, [data]);

  if (!hydrated || !data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU_VAR }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Range selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MU_VAR, letterSpacing: 0.5 }}>
          {(t.graphs ?? "RANGE").toUpperCase()}:
        </span>
        {[7, 30, 90, 365].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              background: range === r ? "var(--accent)" : SU_VAR,
              color: range === r ? "#fff" : MU_VAR,
              border: `1px solid ${range === r ? "var(--accent)" : BO_VAR}`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {rangeLabel[r]}
          </button>
        ))}
        <span style={{ fontSize: 11, color: MU_VAR, marginLeft: 4 }}>
          ({records.length} entries)
        </span>
      </div>

      {records.length === 0 && (
        <div
          style={{
            background: SU_VAR,
            borderRadius: 14,
            border: `1px solid ${BO_VAR}`,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU_VAR }}>
            {t.noData ?? "No records in this time range"}
          </div>
        </div>
      )}

      {/* ── Spider charts row ── */}
      {records.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Card title="Recovery Profile" subtitle="Higher = better across all axes">
            <WellbeingRadarChart records={records} c={c} />
          </Card>

          {allSubs.length >= 3 && (
            <Card title="Substance Profile" subtitle="Days used & avg amount per substance">
              <SubstanceRadarChart records={records} c={c} />
            </Card>
          )}

          {qScores.filter((q) => q.score != null).length >= 3 && (
            <Card title="Questionnaire Radar" subtitle="% of maximum score">
              <QRadarChart qScores={qScores} c={c} />
            </Card>
          )}
        </div>
      )}

      {/* ── Top grid: Sobriety + Mix + Side Effects + Substance Use ── */}
      {records.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 16,
          }}
        >
          <Card title="Sobriety Heatmap" subtitle="One cell per day · color = day severity">
            <SoberStreakHeatmap records={records} range={range === 365 ? Math.max(records.length, 90) : range} c={c} />
          </Card>

          <Card title="Substance Mix" subtitle="Days used per substance">
            <SubstanceMixDonut records={records} c={c} t={t} />
          </Card>

          <Card title="Side Effects" subtitle="Days each effect was logged">
            <SideEffectsBar records={records} c={c} />
          </Card>

          {substanceData.length > 0 && allSubs.length > 0 && (
            <Card title={t.substancesByWeek ?? "Substance Use"} subtitle={`${t.days ?? "days"} / week`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={substanceData} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: c.muted }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: c.muted }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip c={c} />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
                  {allSubs.map((s) => (
                    <Bar
                      key={s}
                      dataKey={s}
                      name={s.charAt(0).toUpperCase() + s.slice(1)}
                      fill={SC[s] ?? "#bdbdbd"}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* ── Mood/Cravings/Wellbeing line chart ── */}
      {moodData.some((d) => d.mood != null || d.cravings != null || d.wellbeing != null) && (
        <Card title={t.moodCravingsWellbeing ?? "Mood, Cravings & Wellbeing"} subtitle="Scale 1–5">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={moodData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: c.muted }}
                tickLine={false}
                axisLine={false}
                interval={Math.ceil(moodData.length / 8)}
              />
              <YAxis
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: c.muted }}
                tickLine={false}
                axisLine={false}
                ticks={[1, 2, 3, 4, 5]}
              />
              <Tooltip content={<CustomTooltip c={c} />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
              <ReferenceLine y={3} stroke={c.grid} strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="mood"
                name={t.mood ?? "Mood"}
                stroke={c.accent}
                strokeWidth={2}
                dot={{ r: 3, fill: c.accent }}
                connectNulls
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="cravings"
                name={t.cravings ?? "Cravings"}
                stroke="#f4a07a"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f4a07a" }}
                connectNulls
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="wellbeing"
                name={t.wellbeing ?? "Wellbeing"}
                stroke="#66bb6a"
                strokeWidth={2}
                dot={{ r: 3, fill: "#66bb6a" }}
                connectNulls
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── Weight trend ── */}
      {weightData.length > 1 && (
        <Card title={t.weightOverTime ?? "Weight Trend"} subtitle={t.kg ?? "kg"}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: c.muted }}
                tickLine={false}
                axisLine={false}
                interval={Math.ceil(weightData.length / 6)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: c.muted }}
                tickLine={false}
                axisLine={false}
                domain={[(d) => Math.floor(d - 2), (d) => Math.ceil(d + 2)]}
              />
              <Tooltip content={<CustomTooltip c={c} />} />
              <Line
                type="monotone"
                dataKey="weight"
                name={`${t.weight ?? "Weight"} (${t.kg ?? "kg"})`}
                stroke={c.accentStrong}
                strokeWidth={2.5}
                dot={{ r: 4, fill: c.accentStrong }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}