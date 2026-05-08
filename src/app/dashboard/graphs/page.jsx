// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

const TX_VAR = "var(--text)";
const MU_VAR = "var(--text-muted)";
const AD_VAR = "var(--accent-strong)";
const SU_VAR = "var(--card)";
const BO_VAR = "var(--card-border)";

const CHART_COLORS = {
  light: { accent: "#4a7ab5", accentStrong: "#2d4a6e", text: "#1a2c3d", muted: "#7a9ab8", grid: "#d0dcea", surface: "#ffffff", border: "#d0dcea" },
  dark:  { accent: "#7aabdb", accentStrong: "#a8c8e8", text: "#e2e8f0", muted: "#94a8be", grid: "#2a3a52", surface: "#1a2535", border: "#2a3a52" },
};

const SC = {
  alcohol: "#7986cb", cannabis: "#66bb6a", cocaine: "#ef5350", opioids: "#ab47bc",
  amphetamines: "#ff7043", benzodiazepines: "#26a69a", tobacco: "#8d6e63",
  prescription: "#42a5f5", mdma: "#ec407a", ecstasy: "#ec407a", ghb: "#00acc1",
  acid: "#9c27b0", other: "#bdbdbd",
};

function pad(n) { return String(n).padStart(2, "0"); }
function shortDate(d) { const dt = new Date(d); return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`; }
function fmtDate(d) { const dt = new Date(d); return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`; }

function Card({ title, subtitle, children, style }) {
  return (
    <div style={{ background: SU_VAR, borderRadius: 14, border: `1px solid ${BO_VAR}`, padding: 20,
      boxShadow: "var(--shadow-card)", marginBottom: 16, ...style }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: AD_VAR }}>{title}</div>
        {subtitle && (<div style={{ fontSize: 11, color: MU_VAR, marginTop: 2 }}>{subtitle}</div>)}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10,
      padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c.accentStrong, marginBottom: 6 }}>{label}</div>
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

function QRadarChart({ qScores, c, t }) {
  const data = qScores.filter((q) => q.score != null).map((q) => ({ subject: q.label, value: q.pct, fullMark: 100 }));
  if (data.length < 3)
    return (<div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
      {t.notEnoughQuestionnaireData ?? "Not enough questionnaire data"}
    </div>);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar name={t.score ?? "Score"} dataKey="value" stroke={c.accent} fill={c.accent}
          fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: c.accent }} />
        <Tooltip formatter={(v) => [`${v}%`, t.score ?? "Score"]}
          contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
            background: c.surface, color: c.text }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function SubstanceRadarChart({ records, c, t }) {
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
    return (<div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
      {t.needThreeSubstances ?? "Need at least 3 substances for radar"}
    </div>);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar name={t.daysUsed ?? "Days used"} dataKey="days" stroke="#ec407a" fill="#ec407a"
          fillOpacity={0.2} strokeWidth={2} />
        <Radar name={t.avgAmount ?? "Avg amount"} dataKey="avgAmount" stroke={c.accent} fill={c.accent}
          fillOpacity={0.2} strokeWidth={2} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
          background: c.surface, color: c.text }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function WellbeingRadarChart({ records, c, t }) {
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
    { subject: t.mood ?? "Mood", value: avgMood, fullMark: 5 },
    { subject: t.wellbeing ?? "Wellbeing", value: avgWellbeing, fullMark: 5 },
    { subject: t.lowCravings ?? "Low cravings", value: Math.max(0, 5 - avgCravings), fullMark: 5 },
    { subject: t.lowAmount ?? "Low amount", value: Math.max(0, 5 - (avgAmount / 10) * 5), fullMark: 5 },
    { subject: t.soberDays ?? "Sober days", value: sobrietyPct, fullMark: 5 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
        <PolarGrid stroke={c.grid} />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
        <Radar name={t.patientProfile ?? "Patient profile"} dataKey="value" stroke="#66bb6a" fill="#66bb6a"
          fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: "#66bb6a" }} />
        <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8,
          border: `1px solid ${c.border}`, background: c.surface, color: c.text }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function SubstanceAmountTrend({ records, c, t }) {
  const data = useMemo(() => records.map((r) => ({
    date: shortDate(r.date ?? r.createdAt),
    amount: Number(r.amount) || 0,
    sober: (r.substances ?? []).length === 0,
  })), [records]);

  const stats = useMemo(() => {
    const useDays = data.filter((d) => !d.sober);
    const totalAmount = useDays.reduce((s, d) => s + d.amount, 0);
    const avgUseDay = useDays.length ? Math.round((totalAmount / useDays.length) * 10) / 10 : 0;
    const peak = data.reduce((max, d) => (d.amount > max.amount ? d : max), { date: null, amount: 0 });
    return { totalAmount, avgUseDay, peak, useDayCount: useDays.length };
  }, [data]);

  if (data.length === 0 || stats.totalAmount === 0) {
    return (<div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
      {t.noUseInRange ?? "No substance use logged in this period"}
    </div>);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.accentStrong, lineHeight: 1 }}>{stats.totalAmount}</div>
          <div style={{ fontSize: 9, color: c.muted, fontWeight: 700, letterSpacing: 0.5,
            textTransform: "uppercase", marginTop: 4 }}>{t.totalAmount ?? "Total amount"}</div>
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: c.accent, lineHeight: 1 }}>{stats.avgUseDay}</div>
          <div style={{ fontSize: 9, color: c.muted, fontWeight: 700, letterSpacing: 0.5,
            textTransform: "uppercase", marginTop: 4 }}>{t.avgPerUseDay ?? "Avg / use day"}</div>
        </div>
        {stats.peak.amount > 0 && (
          <div style={{ flex: "1 1 auto", minWidth: 100 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#EF4444", lineHeight: 1 }}>{stats.peak.amount}</div>
            <div style={{ fontSize: 9, color: c.muted, fontWeight: 700, letterSpacing: 0.5,
              textTransform: "uppercase", marginTop: 4 }}>{t.peakDay ?? "Peak"} · {stats.peak.date}</div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec407a" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ec407a" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false}
            axisLine={false} interval={Math.ceil(data.length / 8)} />
          <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text }}
            formatter={(v, name, props) => {
              const isSober = props?.payload?.sober;
              if (isSober) return [t.sober ?? "Sober", ""];
              return [v, t.amount ?? "Amount"];
            }}
          />
          <Area type="monotone" dataKey="amount" stroke="#ec407a" strokeWidth={2}
            fill="url(#amountGradient)" dot={{ r: 2, fill: "#ec407a", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DayOfWeekPattern({ records, c, t }) {
  const data = useMemo(() => {
    const weekdayLabels = t.weekdaysShort ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const buckets = weekdayLabels.map((label) => ({ day: label, logged: 0, used: 0, pct: 0 }));
    records.forEach((r) => {
      const d = new Date(r.date ?? r.createdAt);
      const idx = (d.getDay() + 6) % 7;
      const bucket = buckets[idx];
      bucket.logged++;
      if ((r.substances ?? []).length > 0) bucket.used++;
    });
    buckets.forEach((b) => { b.pct = b.logged ? Math.round((b.used / b.logged) * 100) : 0; });
    return buckets;
  }, [records, t]);

  const totalLogged = data.reduce((s, d) => s + d.logged, 0);

  const ranked = useMemo(() => {
    const withData = data.filter((d) => d.logged > 0);
    if (withData.length === 0) return { hardest: null, easiest: null };
    const sorted = [...withData].sort((a, b) => b.pct - a.pct);
    return { hardest: sorted[0], easiest: sorted[sorted.length - 1] };
  }, [data]);

  const barColor = (pct) => {
    if (pct === 0) return "#22C55E";
    if (pct < 25) return "#7AABDB";
    if (pct < 50) return "#FBBF24";
    if (pct < 75) return "#FB923C";
    return "#EF4444";
  };

  if (totalLogged === 0) {
    return (<div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
      {t.noData ?? "No data in range"}
    </div>);
  }

  return (
    <div>
      {ranked.hardest && ranked.hardest.pct > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 auto", minWidth: 120 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: barColor(ranked.hardest.pct),
              lineHeight: 1.1 }}>{ranked.hardest.day} · {ranked.hardest.pct}%</div>
            <div style={{ fontSize: 9, color: c.muted, fontWeight: 700, letterSpacing: 0.5,
              textTransform: "uppercase", marginTop: 4 }}>{t.hardestDay ?? "Hardest day"}</div>
          </div>
          {ranked.easiest && ranked.easiest !== ranked.hardest && (
            <div style={{ flex: "1 1 auto", minWidth: 120 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: barColor(ranked.easiest.pct),
                lineHeight: 1.1 }}>{ranked.easiest.day} · {ranked.easiest.pct}%</div>
              <div style={{ fontSize: 9, color: c.muted, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase", marginTop: 4 }}>{t.easiestDay ?? "Easiest day"}</div>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }}
            tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
            domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text }}
            formatter={(v, name, props) => {
              const p = props?.payload;
              if (!p) return [`${v}%`, name];
              const detail = `${p.used}/${p.logged} ${t.days ?? "days"} · ${v}%`;
              return [detail, t.useRate ?? "Use rate"];
            }}
            labelFormatter={(label) => label} cursor={{ fill: c.grid, opacity: 0.3 }}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={40}
            label={{ position: "top", fill: c.text, fontSize: 10, fontWeight: 700,
              formatter: (v) => (v > 0 ? `${v}%` : "") }}>
            {data.map((entry, i) => (<Cell key={i} fill={barColor(entry.pct)} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SideEffectsBar({ records, c, t }) {
  const data = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      (r.sideEffects ?? []).forEach((e) => { counts[e] = (counts[e] ?? 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([effect, count]) => ({ effect: effect.replace(/_/g, " "), count }));
  }, [records]);

  if (data.length === 0) {
    return (<div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
      {t.noSideEffectsLogged ?? "No side effects logged in this period"}
    </div>);
  }

  const height = Math.max(180, data.length * 28 + 30);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: c.muted }} tickLine={false}
          axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="effect" tick={{ fontSize: 11, fill: c.text, fontWeight: 600 }}
          tickLine={false} axisLine={false} width={110} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
          background: c.surface, color: c.text }}
          formatter={(v) => [`${v} ${v === 1 ? (t.day ?? "day") : (t.days ?? "days")}`, t.count ?? "Count"]} />
        <Bar dataKey="count" fill="#f4a07a" radius={[0, 4, 4, 0]} maxBarSize={20}
          label={{ position: "right", fill: c.text, fontSize: 10, fontWeight: 700 }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SubstanceMixDonut({ records, c, t }) {
  const data = useMemo(() => {
    const stats = {};
    let soberDays = 0;
    records.forEach((r) => {
      const subs = r.substances ?? [];
      if (subs.length === 0) { soberDays += 1; return; }
      subs.forEach((s) => {
        if (!stats[s]) stats[s] = { days: 0, totalAmount: 0 };
        stats[s].days += 1;
        stats[s].totalAmount += Number(r.amount) || 0;
      });
    });
    const entries = Object.entries(stats).sort((a, b) => b[1].days - a[1].days)
      .map(([name, v]) => ({ name, days: v.days, amount: v.totalAmount }));
    if (soberDays > 0) entries.unshift({ name: "sober", days: soberDays, amount: 0 });
    return entries;
  }, [records]);

  const totalDays = data.reduce((s, d) => s + d.days, 0);
  const isEmpty = data.length === 0;

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
            <Pie data={isEmpty ? [{ name: "empty", days: 1 }] : data} dataKey="days" nameKey="name"
              cx="50%" cy="50%" innerRadius={45} outerRadius={80} startAngle={90} endAngle={-270}
              paddingAngle={data.length > 1 ? 2 : 0} labelLine={false} isAnimationActive={false}>
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
                contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
                  background: c.surface, color: c.text }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {!isEmpty && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.accentStrong, lineHeight: 1 }}>{totalDays}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: c.muted, letterSpacing: 0.6,
              textTransform: "uppercase", marginTop: 3 }}>{t.daysLogged ?? "days"}</div>
          </div>
        )}
      </div>

      {!isEmpty ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px",
          padding: "8px 4px 0", fontSize: 11 }}>
          {data.map((d) => {
            const pct = totalDays > 0 ? Math.round((d.days / totalDays) * 100) : 0;
            return (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                  background: sliceColor(d.name) }} />
                <span style={{ color: c.text, fontWeight: 600, flex: 1, textTransform: "capitalize" }}>
                  {labelOf(d.name)}
                </span>
                <span style={{ color: c.muted, fontVariantNumeric: "tabular-nums" }}>{d.days}d · {pct}%</span>
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

  const [data, setData] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("patientData");
      setData(raw ? JSON.parse(raw) : null);
    } catch { setData(null); }
    setHydrated(true);
  }, []);

  const [range, setRange] = useState(30);

  const rangeLabel = {
    7:   `${t.last ?? "Last"} 7 ${t.days ?? "days"}`,
    30:  `${t.last ?? "Last"} 30 ${t.days ?? "days"}`,
    90:  `${t.last ?? "Last"} 90 ${t.days ?? "days"}`,
    365: t.allTime ?? "All time",
  };

  const records = useMemo(() => {
    if (!data) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return [...(data.records ?? [])]
      .filter((r) => new Date(r.date ?? r.createdAt) >= cutoff)
      .sort((a, b) => (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt));
  }, [data, range]);

  const moodData = useMemo(() => records.map((r) => ({
    date: shortDate(r.date ?? r.createdAt),
    mood: r.mood ?? null,
    cravings: r.cravings ?? null,
    wellbeing: r.wellbeing ?? null,
  })), [records]);

  const allSubs = useMemo(() => {
    const s = new Set();
    records.forEach((r) => (r.substances ?? []).forEach((x) => s.add(x)));
    return [...s];
  }, [records]);

  const weightData = useMemo(() => records.filter((r) => r.weight)
    .map((r) => ({ date: shortDate(r.date ?? r.createdAt), weight: r.weight })), [records]);

  const qScores = useMemo(() => {
    if (!data) return [];
    return [
      { key: "latestGad7", label: "GAD-7", max: 21, color: "#7C3AED" },
      { key: "latestPhq9", label: "PHQ-9", max: 27, color: "#DC2626" },
      { key: "latestAudit", label: "AUDIT", max: 40, color: "#D97706" },
      { key: "latestDast10", label: "DAST-10", max: 10, color: "#059669" },
      { key: "latestCage", label: "CAGE", max: 4, color: "#0284C7" },
      { key: "latestReadiness", label: t.readiness ?? "Readiness", max: 30, color: "#0891B2" },
    ].map((q) => {
      const raw = data[q.key];
      if (!raw) return { ...q, score: null, pct: 0 };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a), 0);
      return { ...q, score, pct: Math.round((score / q.max) * 100) };
    });
  }, [data, t]);

  if (!hydrated || !data)
    return (<div style={{ padding: 40, textAlign: "center", color: MU_VAR }}>{t.loading ?? "Loading…"}</div>);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: MU_VAR, letterSpacing: 0.5 }}>
          {(t.range ?? "RANGE").toUpperCase()}:
        </span>
        {[7, 30, 90, 365].map((r) => (
          <button key={r} onClick={() => setRange(r)}
            style={{ background: range === r ? "var(--accent)" : SU_VAR,
              color: range === r ? "#fff" : MU_VAR,
              border: `1px solid ${range === r ? "var(--accent)" : BO_VAR}`,
              borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
            {rangeLabel[r]}
          </button>
        ))}
        <span style={{ fontSize: 11, color: MU_VAR, marginLeft: 4 }}>
          ({records.length} {t.entries ?? "entries"})
        </span>
      </div>

      {records.length === 0 && (
        <div style={{ background: SU_VAR, borderRadius: 14, border: `1px solid ${BO_VAR}`,
          padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU_VAR }}>
            {t.noData ?? "No records in this time range"}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 16, marginBottom: 16 }}>
          <Card title={t.recoveryProfile ?? "Recovery Profile"}
            subtitle={t.higherIsBetter ?? "Higher = better across all axes"}>
            <WellbeingRadarChart records={records} c={c} t={t} />
          </Card>

          {allSubs.length >= 3 && (
            <Card title={t.substanceProfile ?? "Substance Profile"}
              subtitle={t.daysAndAvgPerSubstance ?? "Days used & avg amount per substance"}>
              <SubstanceRadarChart records={records} c={c} t={t} />
            </Card>
          )}

          {qScores.filter((q) => q.score != null).length >= 3 && (
            <Card title={t.questionnaireRadar ?? "Questionnaire Radar"}
              subtitle={t.percentOfMaxScore ?? "% of maximum score"}>
              <QRadarChart qScores={qScores} c={c} t={t} />
            </Card>
          )}
        </div>
      )}

      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
          <Card title={t.sideEffects ?? "Side Effects"}
            subtitle={t.daysEachEffectLogged ?? "Days each effect was logged"}>
            <SideEffectsBar records={records} c={c} t={t} />
          </Card>

          <Card title={t.substanceMix ?? "Substance Mix"}
            subtitle={t.daysUsedPerSubstance ?? "Days used per substance"}>
            <SubstanceMixDonut records={records} c={c} t={t} />
          </Card>

          <Card title={t.amountOverTime ?? "Amount Over Time"}
            subtitle={t.dailyConsumption ?? "Daily consumption · 0 = sober"}>
            <SubstanceAmountTrend records={records} c={c} t={t} />
          </Card>

          <Card title={t.dayOfWeekPattern ?? "Day-of-Week Pattern"}
            subtitle={t.useRateByWeekday ?? "Use rate by weekday"}>
            <DayOfWeekPattern records={records} c={c} t={t} />
          </Card>
        </div>
      )}

      {moodData.some((d) => d.mood != null || d.cravings != null || d.wellbeing != null) && (
        <Card title={t.moodCravingsWellbeing ?? "Mood, Cravings & Wellbeing"}
          subtitle={t.scaleOneToFive ?? "Scale 1–5"}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={moodData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false}
                axisLine={false} interval={Math.ceil(moodData.length / 8)} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: c.muted }} tickLine={false}
                axisLine={false} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip content={<CustomTooltip c={c} />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
              <ReferenceLine y={3} stroke={c.grid} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="mood" name={t.mood ?? "Mood"} stroke={c.accent}
                strokeWidth={2} dot={{ r: 3, fill: c.accent }} connectNulls activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="cravings" name={t.cravings ?? "Cravings"} stroke="#f4a07a"
                strokeWidth={2} dot={{ r: 3, fill: "#f4a07a" }} connectNulls activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="wellbeing" name={t.wellbeing ?? "Wellbeing"} stroke="#66bb6a"
                strokeWidth={2} dot={{ r: 3, fill: "#66bb6a" }} connectNulls activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {weightData.length > 1 && (
        <Card title={t.weightOverTime ?? "Weight Trend"} subtitle={t.kg ?? "kg"}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false}
                axisLine={false} interval={Math.ceil(weightData.length / 6)} />
              <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
                domain={[(d) => Math.floor(d - 2), (d) => Math.ceil(d + 2)]} />
              <Tooltip content={<CustomTooltip c={c} />} />
              <Line type="monotone" dataKey="weight" name={`${t.weight ?? "Weight"} (${t.kg ?? "kg"})`}
                stroke={c.accentStrong} strokeWidth={2.5} dot={{ r: 4, fill: c.accentStrong }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}