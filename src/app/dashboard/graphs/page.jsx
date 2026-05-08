// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
            marginBottom: 0,
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

      {/* ── Substance bar chart ── */}
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