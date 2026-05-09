// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell,
} from "recharts";

const TX_VAR = "var(--text)";
const MU_VAR = "var(--text-muted)";
const AD_VAR = "var(--accent-strong)";
const SU_VAR = "var(--card)";
const BO_VAR = "var(--card-border)";

const CHART_COLORS = {
  light: {
    accent: "#4a7ab5", accentStrong: "#2d4a6e", text: "#1a2c3d",
    muted: "#7a9ab8", grid: "#d0dcea", surface: "#ffffff", border: "#d0dcea",
  },
  dark: {
    accent: "#7aabdb", accentStrong: "#a8c8e8", text: "#e2e8f0",
    muted: "#94a8be", grid: "#2a3a52", surface: "#1a2535", border: "#2a3a52",
  },
};

const SC = {
  alcohol: "#7986cb", cannabis: "#66bb6a", cocaine: "#ef5350",
  opioids: "#ab47bc", amphetamines: "#ff7043", benzodiazepines: "#26a69a",
  tobacco: "#8d6e63", prescription: "#42a5f5", mdma: "#ec407a",
  ecstasy: "#ec407a", ghb: "#00acc1", acid: "#9c27b0", other: "#bdbdbd",
};

function pad(n) { return String(n).padStart(2, "0"); }
function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}

// ── Section label — tells the doctor what they're looking at ──
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10, fontWeight: 700, color: MU_VAR,
        letterSpacing: 1.4, textTransform: "uppercase",
        marginBottom: 10, marginTop: 20,
      }}
    >
      {children}
    </div>
  );
}

// ── Card with consistent chrome ──
function Card({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        background: SU_VAR, borderRadius: 14, border: `1px solid ${BO_VAR}`,
        padding: 20, boxShadow: "var(--shadow-card)", marginBottom: 16,
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

// ── Insight caption — small italic finding at the bottom of a chart ──
// `tone` tints the line: positive=green, warning=amber, neutral=muted
function Insight({ text, tone = "neutral" }) {
  if (!text) return null;
  const color =
    tone === "positive" ? "#16A34A" :
    tone === "warning"  ? "#D97706" :
                          MU_VAR;
  return (
    <div
      style={{
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${BO_VAR}`,
        fontSize: 11, color, fontStyle: "italic", lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, c }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderRadius: 10, padding: "10px 14px",
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

// ── Recovery Profile radar (kept; substance radar removed) ──
function WellbeingRadarChart({ records, c, t }) {
  if (!records.length) return null;
  const avg = (key) => {
    const vals = records.map((r) => r[key]).filter((v) => v != null);
    return vals.length
      ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
      : 0;
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

  // Insight: strongest + weakest dimension
  const sorted = [...data].sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const insightText = weakest && strongest && strongest.value > weakest.value
    ? `${strongest.subject}: ${strongest.value}/5 — ${t.strongestArea ?? "strongest area"}. ${weakest.subject}: ${weakest.value}/5 — ${t.weakestArea ?? "needs attention"}.`
    : null;
  const insightTone = weakest?.value < 2 ? "warning" : strongest?.value >= 4 ? "positive" : "neutral";

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 40, left: 40, bottom: 10 }}>
          <PolarGrid stroke={c.grid} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
          <Radar
            name={t.patientProfile ?? "Patient profile"}
            dataKey="value" stroke="#66bb6a" fill="#66bb6a"
            fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: "#66bb6a" }}
          />
          <Tooltip
            formatter={(v, n) => [v, n]}
            contentStyle={{
              fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}

// ── Questionnaire radar ──
function QRadarChart({ qScores, c, t }) {
  const data = qScores
    .filter((q) => q.score != null)
    .map((q) => ({ subject: q.label, value: q.pct, fullMark: 100 }));
  if (data.length < 3)
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        {t.notEnoughQuestionnaireData ?? "Not enough questionnaire data"}
      </div>
    );

  // Insight: highest-percent area (most clinically severe)
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const insightText = top
    ? `${top.subject}: ${top.value}% ${t.ofMax ?? "of max"} — ${top.value >= 60 ? (t.elevatedScore ?? "elevated") : (t.withinRange ?? "within typical range")}.`
    : null;
  const insightTone = top?.value >= 60 ? "warning" : "neutral";

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke={c.grid} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: c.muted }} tickCount={4} />
          <Radar
            name={t.score ?? "Score"} dataKey="value"
            stroke={c.accent} fill={c.accent}
            fillOpacity={0.25} strokeWidth={2} dot={{ r: 4, fill: c.accent }}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, t.score ?? "Score"]}
            contentStyle={{
              fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}

// ── Sober Streaks (with insight) ──
function SoberStreaks({ records, c, t }) {
  const stats = useMemo(() => {
    if (records.length === 0) return { current: 0, longest: 0, totalSober: 0, streaks: [], days: [] };
    const days = records.map((r) => ({
      date: r.date ?? r.createdAt,
      shortDate: shortDate(r.date ?? r.createdAt),
      sober: (r.substances ?? []).length === 0,
    }));
    const streaks = [];
    let runStart = null, runLength = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i].sober) {
        if (runLength === 0) runStart = days[i].shortDate;
        runLength++;
      } else if (runLength > 0) {
        streaks.push({ start: runStart, length: runLength, end: days[i - 1].shortDate });
        runLength = 0; runStart = null;
      }
    }
    if (runLength > 0) {
      streaks.push({
        start: runStart, length: runLength,
        end: days[days.length - 1].shortDate, ongoing: true,
      });
    }
    const longest = streaks.reduce((m, s) => Math.max(m, s.length), 0);
    const totalSober = days.filter((d) => d.sober).length;
    const last = streaks[streaks.length - 1];
    const current = last?.ongoing ? last.length : 0;
    return { current, longest, totalSober, streaks, days };
  }, [records]);

  const topStreaks = useMemo(
    () => [...stats.streaks].sort((a, b) => b.length - a.length).slice(0, 5),
    [stats.streaks],
  );

  if (stats.days.length === 0) {
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        {t.noData ?? "No data in range"}
      </div>
    );
  }

  // Insight logic
  let insightText = null, insightTone = "neutral";
  if (stats.current >= 30) {
    insightText = t.insightStreakMonth ?? "Currently sustaining a 30+ day streak — major milestone.";
    insightTone = "positive";
  } else if (stats.current >= 14) {
    insightText = t.insightStreakTwoWeek ?? "Currently in a 2-week+ sober run — sustained progress.";
    insightTone = "positive";
  } else if (stats.current >= 7) {
    insightText = t.insightStreakWeek ?? "One-week streak in progress — building momentum.";
    insightTone = "positive";
  } else if (stats.current === stats.longest && stats.current > 0) {
    insightText = t.insightStreakNewBest ?? "Currently in patient's longest recorded streak.";
    insightTone = "positive";
  } else if (stats.current === 0 && stats.longest > 7) {
    insightText = t.insightStreakBroken ?? "Recently broke a longer streak — close support recommended.";
    insightTone = "warning";
  }

  const streakColor = (n) => {
    if (n >= 30) return "#16A34A";
    if (n >= 14) return "#22C55E";
    if (n >= 7) return "#7AABDB";
    if (n >= 3) return "#FBBF24";
    return "#FB923C";
  };

  return (
    <div>
      {/* Headline stats row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div style={{
            fontSize: 22, fontWeight: 800,
            color: stats.current > 0 ? streakColor(stats.current) : c.muted,
            lineHeight: 1,
          }}>
            {stats.current}
          </div>
          <div style={{
            fontSize: 9, color: c.muted, fontWeight: 700,
            letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4,
          }}>
            {t.currentStreak ?? "Current streak"} · {t.days ?? "days"}
          </div>
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div style={{
            fontSize: 22, fontWeight: 800,
            color: stats.longest > 0 ? streakColor(stats.longest) : c.muted,
            lineHeight: 1,
          }}>
            {stats.longest}
          </div>
          <div style={{
            fontSize: 9, color: c.muted, fontWeight: 700,
            letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4,
          }}>
            {t.longestStreak ?? "Longest streak"} · {t.days ?? "days"}
          </div>
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: c.accentStrong, lineHeight: 1 }}>
            {stats.totalSober}
            <span style={{ fontSize: 12, fontWeight: 600, color: c.muted, marginLeft: 4 }}>
              / {stats.days.length}
            </span>
          </div>
          <div style={{
            fontSize: 9, color: c.muted, fontWeight: 700,
            letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4,
          }}>
            {t.soberDaysTotal ?? "Sober days total"}
          </div>
        </div>
      </div>

      {/* Heatmap strip */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap", padding: "4px 0" }}>
          {stats.days.map((d, i) => (
            <div
              key={i}
              title={`${d.shortDate} — ${d.sober ? (t.sober ?? "Sober") : (t.used ?? "Used")}`}
              style={{
                width: 12, height: 12, borderRadius: 2,
                background: d.sober ? "#22C55E" : "#EF4444",
                opacity: d.sober ? 1 : 0.85,
              }}
            />
          ))}
        </div>
        <div style={{
          display: "flex", gap: 12, marginTop: 6,
          fontSize: 10, color: c.muted, fontWeight: 600,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, background: "#22C55E", borderRadius: 2 }} />
            {t.sober ?? "Sober"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, background: "#EF4444", borderRadius: 2, opacity: 0.85 }} />
            {t.used ?? "Used"}
          </div>
        </div>
      </div>

      {/* Top streaks bar list */}
      {topStreaks.length > 0 && (
        <div>
          <div style={{
            fontSize: 9, color: c.muted, fontWeight: 700,
            letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8,
          }}>
            {t.topStreaks ?? "Top streaks"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {topStreaks.map((s, i) => {
              const pct = stats.longest > 0 ? (s.length / stats.longest) * 100 : 0;
              return (
                <div key={i}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 3,
                  }}>
                    <span style={{
                      fontSize: 11, color: c.text,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {s.start} → {s.end}{" "}
                      {s.ongoing && (
                        <span style={{ color: streakColor(s.length), fontWeight: 700 }}>
                          · {t.ongoing ?? "ongoing"}
                        </span>
                      )}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 800,
                      color: streakColor(s.length),
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {s.length} {s.length === 1 ? (t.day ?? "day") : (t.days ?? "days")}
                    </span>
                  </div>
                  <div style={{
                    height: 6, background: c.grid,
                    borderRadius: 3, overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: streakColor(s.length),
                      borderRadius: 3, transition: "width .4s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}

// ── Day-of-week pattern (with insight) ──
function DayOfWeekPattern({ records, c, t }) {
  const data = useMemo(() => {
    const weekdayLabels = t.weekdaysShort ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const buckets = weekdayLabels.map((label) => ({ day: label, logged: 0, used: 0, pct: 0 }));
    records.forEach((r) => {
      const d = new Date(r.date ?? r.createdAt);
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].logged++;
      if ((r.substances ?? []).length > 0) buckets[idx].used++;
    });
    buckets.forEach((b) => {
      b.pct = b.logged ? Math.round((b.used / b.logged) * 100) : 0;
    });
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
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        {t.noData ?? "No data in range"}
      </div>
    );
  }

  // Insight logic
  let insightText = null, insightTone = "neutral";
  if (ranked.hardest && ranked.easiest) {
    const gap = ranked.hardest.pct - ranked.easiest.pct;
    if (ranked.hardest.pct === 0) {
      insightText = t.insightAllSober ?? "No use detected on any weekday in this period.";
      insightTone = "positive";
    } else if (gap >= 40) {
      insightText = `${ranked.hardest.day} ${t.insightHardestVsEasiest ?? "is the highest-risk day"} (${ranked.hardest.pct}%). ${ranked.easiest.day}: ${ranked.easiest.pct}%.`;
      insightTone = "warning";
    } else if (ranked.hardest.pct >= 50) {
      insightText = `${ranked.hardest.day} ${t.insightHighRisk ?? "shows elevated use rate"} (${ranked.hardest.pct}%).`;
      insightTone = "warning";
    } else {
      insightText = t.insightConsistentPattern ?? "Use rate is fairly consistent across weekdays.";
    }
  }

  return (
    <div>
      {ranked.hardest && ranked.hardest.pct > 0 && (
        <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 auto", minWidth: 120 }}>
            <div style={{
              fontSize: 16, fontWeight: 800,
              color: barColor(ranked.hardest.pct), lineHeight: 1.1,
            }}>
              {ranked.hardest.day} · {ranked.hardest.pct}%
            </div>
            <div style={{
              fontSize: 9, color: c.muted, fontWeight: 700,
              letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4,
            }}>
              {t.hardestDay ?? "Hardest day"}
            </div>
          </div>
          {ranked.easiest && ranked.easiest !== ranked.hardest && (
            <div style={{ flex: "1 1 auto", minWidth: 120 }}>
              <div style={{
                fontSize: 16, fontWeight: 800,
                color: barColor(ranked.easiest.pct), lineHeight: 1.1,
              }}>
                {ranked.easiest.day} · {ranked.easiest.pct}%
              </div>
              <div style={{
                fontSize: 9, color: c.muted, fontWeight: 700,
                letterSpacing: 0.5, textTransform: "uppercase", marginTop: 4,
              }}>
                {t.easiestDay ?? "Easiest day"}
              </div>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
            domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{
              fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text,
            }}
            formatter={(v, name, props) => {
              const p = props?.payload;
              if (!p) return [`${v}%`, name];
              const detail = `${p.used}/${p.logged} ${t.days ?? "days"} · ${v}%`;
              return [detail, t.useRate ?? "Use rate"];
            }}
            cursor={{ fill: c.grid, opacity: 0.3 }}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={40}
            label={{
              position: "top", fill: c.text, fontSize: 10, fontWeight: 700,
              formatter: (v) => (v > 0 ? `${v}%` : ""),
            }}>
            {data.map((entry, i) => (<Cell key={i} fill={barColor(entry.pct)} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}

// ── Side effects bar (with insight) ──
function SideEffectsBar({ records, c, t }) {
  const data = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      (r.sideEffects ?? []).forEach((e) => {
        counts[e] = (counts[e] ?? 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
      .map(([effect, count]) => ({ effect: effect.replace(/_/g, " "), count }));
  }, [records]);

  if (data.length === 0) {
    return (
      <div style={{ textAlign: "center", color: MU_VAR, fontSize: 12, padding: 20 }}>
        {t.noSideEffectsLogged ?? "No side effects logged in this period"}
      </div>
    );
  }

  // Insight: top side effect with frequency
  const top = data[0];
  const total = data.reduce((s, d) => s + d.count, 0);
  const insightText = `${top.effect.charAt(0).toUpperCase() + top.effect.slice(1)} ${t.insightTopSideEffect ?? "is the most reported"} (${top.count} ${top.count === 1 ? (t.day ?? "day") : (t.days ?? "days")}, ${Math.round((top.count / total) * 100)}% ${t.ofAllReports ?? "of all reports"}).`;

  const height = Math.max(180, data.length * 28 + 30);

  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="effect" tick={{ fontSize: 11, fill: c.text, fontWeight: 600 }} tickLine={false} axisLine={false} width={110} />
          <Tooltip
            contentStyle={{
              fontSize: 11, borderRadius: 8, border: `1px solid ${c.border}`,
              background: c.surface, color: c.text,
            }}
            formatter={(v) => [`${v} ${v === 1 ? (t.day ?? "day") : (t.days ?? "days")}`, t.count ?? "Count"]}
          />
          <Bar dataKey="count" fill="#f4a07a" radius={[0, 4, 4, 0]} maxBarSize={20}
            label={{ position: "right", fill: c.text, fontSize: 10, fontWeight: 700 }} />
        </BarChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone="neutral" />
    </>
  );
}

// ── Substance Mix donut (with insight) ──
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

  const totalUniqueDays = records.length;
  const isEmpty = data.length === 0;
  const sliceColor = (name) => {
    if (name === "sober") return "#94A3B8";
    if (name === "empty") return "#E8EEF5";
    return SC[name] ?? SC.other;
  };
  const labelOf = (name) => {
    if (name === "sober") return t.sober ?? "Sober";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Insight: dominant pattern
  let insightText = null, insightTone = "neutral";
  if (!isEmpty) {
    const sober = data.find((d) => d.name === "sober");
    const substances = data.filter((d) => d.name !== "sober");
    const soberPct = sober ? Math.round((sober.days / totalUniqueDays) * 100) : 0;
    if (soberPct >= 80) {
      insightText = `${soberPct}% ${t.insightMostlySober ?? "of days were sober — strong recovery period"}.`;
      insightTone = "positive";
    } else if (soberPct >= 50) {
      insightText = `${soberPct}% ${t.insightMajoritySober ?? "of days were sober"}. ${substances[0] ? `${labelOf(substances[0].name)}: ${substances[0].days}d` : ""}.`;
      insightTone = "neutral";
    } else if (substances.length >= 2) {
      insightText = `${t.insightPolysubstance ?? "Polysubstance pattern"}: ${substances.slice(0, 2).map((s) => labelOf(s.name)).join(" + ")} ${t.appearMostFrequently ?? "appear most frequently"}.`;
      insightTone = "warning";
    } else if (substances[0]) {
      insightText = `${labelOf(substances[0].name)}: ${substances[0].days} ${t.daysOfUse ?? "days of use"} (${Math.round((substances[0].days / totalUniqueDays) * 100)}%).`;
      insightTone = "warning";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ width: "100%", height: 200, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={isEmpty ? [{ name: "empty", days: 1 }] : data}
              dataKey="days" nameKey="name" cx="50%" cy="50%"
              innerRadius={45} outerRadius={80}
              startAngle={90} endAngle={-270}
              paddingAngle={data.length > 1 ? 2 : 0}
              labelLine={false} isAnimationActive={false}
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
                  fontSize: 11, borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surface, color: c.text,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {!isEmpty && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800,
              color: c.accentStrong, lineHeight: 1,
            }}>
              {totalUniqueDays}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 700, color: c.muted,
              letterSpacing: 0.6, textTransform: "uppercase", marginTop: 3,
            }}>
              {t.daysLogged ?? "days"}
            </div>
          </div>
        )}
      </div>

      {!isEmpty ? (
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "4px 12px", padding: "8px 4px 0", fontSize: 11,
        }}>
          {data.map((d) => {
            const pct = totalUniqueDays > 0 ? Math.round((d.days / totalUniqueDays) * 100) : 0;
            return (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                  background: sliceColor(d.name),
                }} />
                <span style={{
                  color: c.text, fontWeight: 600, flex: 1,
                  textTransform: "capitalize",
                }}>
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
        <div style={{
          textAlign: "center", color: c.muted, fontSize: 11,
          fontStyle: "italic", padding: "8px 0",
        }}>
          {t.noSubstances ?? "No data"}
        </div>
      )}

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}

// ── Mood/Cravings/Wellbeing line (with insight) ──
function MoodCravingsLine({ moodData, c, t }) {
  // Insight: trend in mood
  const validMood = moodData.filter((d) => d.mood != null);
  let insightText = null, insightTone = "neutral";
  if (validMood.length >= 4) {
    const half = Math.floor(validMood.length / 2);
    const firstHalf = validMood.slice(0, half);
    const secondHalf = validMood.slice(half);
    const avg = (arr) => arr.reduce((s, d) => s + d.mood, 0) / arr.length;
    const change = avg(secondHalf) - avg(firstHalf);
    if (change >= 0.5) {
      insightText = `${t.insightMoodImproving ?? "Mood improving"} (+${change.toFixed(1)} ${t.points ?? "points"} ${t.overPeriod ?? "over period"}).`;
      insightTone = "positive";
    } else if (change <= -0.5) {
      insightText = `${t.insightMoodDeclining ?? "Mood declining"} (${change.toFixed(1)} ${t.points ?? "points"} ${t.overPeriod ?? "over period"}).`;
      insightTone = "warning";
    } else {
      insightText = t.insightMoodStable ?? "Mood stable across the period.";
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={moodData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
            interval={Math.ceil(moodData.length / 8)} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} ticks={[1, 2, 3, 4, 5]} />
          <Tooltip content={<CustomTooltip c={c} />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }} />
          <ReferenceLine y={3} stroke={c.grid} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="mood" name={t.mood ?? "Mood"}
            stroke={c.accent} strokeWidth={2} dot={{ r: 3, fill: c.accent }}
            connectNulls activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="cravings" name={t.cravings ?? "Cravings"}
            stroke="#f4a07a" strokeWidth={2} dot={{ r: 3, fill: "#f4a07a" }}
            connectNulls activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="wellbeing" name={t.wellbeing ?? "Wellbeing"}
            stroke="#66bb6a" strokeWidth={2} dot={{ r: 3, fill: "#66bb6a" }}
            connectNulls activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}

// ── Weight chart (with insight) ──
function WeightChart({ weightData, c, t }) {
  let insightText = null, insightTone = "neutral";
  if (weightData.length >= 2) {
    const first = weightData[0].weight;
    const last = weightData[weightData.length - 1].weight;
    const change = last - first;
    if (Math.abs(change) >= 1) {
      insightText = `${t.weight ?? "Weight"} ${change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1)} ${t.kg ?? "kg"} ${t.overPeriod ?? "over period"}.`;
      insightTone = Math.abs(change) >= 5 ? "warning" : "neutral";
    } else {
      insightText = t.insightWeightStable ?? "Weight stable across the period.";
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={weightData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
            interval={Math.ceil(weightData.length / 6)} />
          <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false}
            domain={[(d) => Math.floor(d - 2), (d) => Math.ceil(d + 2)]} />
          <Tooltip content={<CustomTooltip c={c} />} />
          <Line type="monotone" dataKey="weight" name={`${t.weight ?? "Weight"} (${t.kg ?? "kg"})`}
            stroke={c.accentStrong} strokeWidth={2.5} dot={{ r: 4, fill: c.accentStrong }}
            activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}

// ── Page (reordered into clinical sections) ──
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
    7: `${t.last ?? "Last"} 7 ${t.days ?? "days"}`,
    30: `${t.last ?? "Last"} 30 ${t.days ?? "days"}`,
    90: `${t.last ?? "Last"} 90 ${t.days ?? "days"}`,
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

  const moodData = useMemo(() =>
    records.map((r) => ({
      date: shortDate(r.date ?? r.createdAt),
      mood: r.mood ?? null,
      cravings: r.cravings ?? null,
      wellbeing: r.wellbeing ?? null,
    })), [records]);

  const weightData = useMemo(() =>
    records.filter((r) => r.weight)
      .map((r) => ({ date: shortDate(r.date ?? r.createdAt), weight: r.weight })),
    [records]);

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
      const score = Object.values(raw).reduce((a, b) => (typeof b === "number" ? a + b : a), 0);
      return { ...q, score, pct: Math.round((score / q.max) * 100) };
    });
  }, [data, t]);

  const hasMoodData = moodData.some((d) => d.mood != null || d.cravings != null || d.wellbeing != null);
  const hasQuestionnaireData = qScores.filter((q) => q.score != null).length >= 3;

  if (!hydrated || !data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU_VAR }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Range selector */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 12, flexWrap: "wrap",
      }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: MU_VAR, letterSpacing: 0.5,
        }}>
          {(t.range ?? "RANGE").toUpperCase()}:
        </span>
        {[7, 30, 90, 365].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              background: range === r ? "var(--accent)" : SU_VAR,
              color: range === r ? "#fff" : MU_VAR,
              border: `1px solid ${range === r ? "var(--accent)" : BO_VAR}`,
              borderRadius: 20, padding: "5px 14px",
              fontSize: 11, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all .15s",
            }}
          >
            {rangeLabel[r]}
          </button>
        ))}
        <span style={{ fontSize: 11, color: MU_VAR, marginLeft: 4 }}>
          ({records.length} {t.entries ?? "entries"})
        </span>
      </div>

      {records.length === 0 && (
        <div style={{
          background: SU_VAR, borderRadius: 14, border: `1px solid ${BO_VAR}`,
          padding: 40, textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU_VAR }}>
            {t.noData ?? "No records in this time range"}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <>
          {/* ── BIG PICTURE ── Sober streaks + substance mix ── */}
          <SectionLabel>{t.sectionBigPicture ?? "Big picture"}</SectionLabel>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 16,
          }}>
            <Card title={t.soberStreaks ?? "Sober Streaks"}
              subtitle={t.streaksSubtitle ?? "Current run, longest stretch, sober/used heatmap"}>
              <SoberStreaks records={records} c={c} t={t} />
            </Card>
            <Card title={t.substanceMix ?? "Substance Mix"}
              subtitle={t.daysUsedPerSubstance ?? "Days used per substance"}>
              <SubstanceMixDonut records={records} c={c} t={t} />
            </Card>
          </div>

          {/* ── DAY-BY-DAY ── Mood line + day-of-week pattern ── */}
          {(hasMoodData || true) && (
            <>
              <SectionLabel>{t.sectionDayByDay ?? "Day-by-day"}</SectionLabel>
              {hasMoodData && (
                <Card title={t.moodCravingsWellbeing ?? "Mood, Cravings & Wellbeing"}
                  subtitle={t.scaleOneToFive ?? "Scale 1–5"}>
                  <MoodCravingsLine moodData={moodData} c={c} t={t} />
                </Card>
              )}
              <Card title={t.dayOfWeekPattern ?? "Day-of-Week Pattern"}
                subtitle={t.useRateByWeekday ?? "Use rate by weekday"}>
                <DayOfWeekPattern records={records} c={c} t={t} />
              </Card>
            </>
          )}

          {/* ── CLINICAL ── Questionnaires + side effects ── */}
          {(hasQuestionnaireData || (records.some((r) => (r.sideEffects ?? []).length > 0))) && (
            <>
              <SectionLabel>{t.sectionClinical ?? "Clinical"}</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                gap: 16,
              }}>
                {hasQuestionnaireData && (
                  <Card title={t.questionnaireRadar ?? "Questionnaire Radar"}
                    subtitle={t.percentOfMaxScore ?? "% of maximum score"}>
                    <QRadarChart qScores={qScores} c={c} t={t} />
                  </Card>
                )}
                <Card title={t.sideEffects ?? "Side Effects"}
                  subtitle={t.daysEachEffectLogged ?? "Days each effect was logged"}>
                  <SideEffectsBar records={records} c={c} t={t} />
                </Card>
              </div>
            </>
          )}

          {/* ── PROFILE ── Recovery profile radar ── */}
          <SectionLabel>{t.sectionProfile ?? "Patient profile"}</SectionLabel>
          <Card title={t.recoveryProfile ?? "Recovery Profile"}
            subtitle={t.higherIsBetter ?? "Higher = better across all axes"}>
            <WellbeingRadarChart records={records} c={c} t={t} />
          </Card>

          {/* ── TRENDS ── Weight ── */}
          {weightData.length > 1 && (
            <>
              <SectionLabel>{t.sectionTrends ?? "Trends"}</SectionLabel>
              <Card title={t.weightOverTime ?? "Weight Trend"} subtitle={t.kg ?? "kg"}>
                <WeightChart weightData={weightData} c={c} t={t} />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}