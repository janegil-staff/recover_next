"use client";
// Three-line chart: weekly averages of mood, cravings, wellbeing on the 1-5 scale.
// Daily noise is collapsed into Mon-Sun calendar weeks so trend is visible.
// Insight detects whether mood is improving, declining, or stable across weeks.
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Insight } from "./Card";

// ── Week aggregation helpers ──────────────────────────────────────────────
// Returns the Monday (00:00 local) of the week containing `d`.
function mondayOf(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const dayIdx = (out.getDay() + 6) % 7; // Mon=0, Sun=6
  out.setDate(out.getDate() - dayIdx);
  return out;
}

// ISO week number (1-53). Doctors recognize "Wk 16" as a clinical anchor.
function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // Set to Thursday in current week (ISO weeks: Mon-start, week containing Thu)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const weekOne = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - weekOne.getTime()) / 86400000 -
        3 +
        ((weekOne.getDay() + 6) % 7)) /
        7,
    )
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function shortMonthDay(d, monthsT) {
  return `${monthsT[d.getMonth()]} ${pad(d.getDate())}`;
}

export default function MoodCravingsLine({ records, c, t }) {
  const monthsT = t.monthsShort ?? [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Aggregate daily records into Mon-Sun calendar weeks
  const weeklyData = useMemo(() => {
    if (!records?.length) return [];

    // Group records by their week's Monday key (YYYY-MM-DD)
    const buckets = new Map();
    records.forEach((r) => {
      const date = new Date(r.date ?? r.createdAt);
      if (isNaN(date.getTime())) return;
      const monday = mondayOf(date);
      const key = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          weekStart: monday,
          weekNum: isoWeek(monday),
          mood: [], cravings: [], wellbeing: [],
          dayCount: 0,
        });
      }
      const b = buckets.get(key);
      b.dayCount++;
      if (r.mood != null) b.mood.push(r.mood);
      if (r.cravings != null) b.cravings.push(r.cravings);
      if (r.wellbeing != null) b.wellbeing.push(r.wellbeing);
    });

    // Sort by week start ascending
    const sorted = [...buckets.values()].sort(
      (a, b) => a.weekStart - b.weekStart,
    );

    // Build series with averages, dropping null dimensions for weeks
    // where that metric had no data
    const avg = (arr) =>
      arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(2) : null;

    return sorted.map((b) => ({
      weekKey: `W${b.weekNum}`,
      weekLabel: `${t.weekShort ?? "Wk"} ${b.weekNum}`,
      dateLabel: shortMonthDay(b.weekStart, monthsT),
      weekStart: b.weekStart,
      mood: avg(b.mood),
      cravings: avg(b.cravings),
      wellbeing: avg(b.wellbeing),
      dayCount: b.dayCount,
    }));
  }, [records, t, monthsT]);

  // Insight: mood trend across weeks (first half vs second half by week)
  let insightText = null,
    insightTone = "neutral";
  const weeksWithMood = weeklyData.filter((w) => w.mood != null);
  if (weeksWithMood.length >= 2) {
    const half = Math.max(1, Math.floor(weeksWithMood.length / 2));
    const firstHalf = weeksWithMood.slice(0, half);
    const secondHalf = weeksWithMood.slice(half);
    const avg = (arr) => arr.reduce((s, w) => s + w.mood, 0) / arr.length;
    const change = avg(secondHalf) - avg(firstHalf);
    if (change >= 0.5) {
      insightText = `${
        t.insightMoodImproving ?? "Mood improving"
      } (+${change.toFixed(1)} ${t.points ?? "points"} ${
        t.overPeriod ?? "over period"
      }).`;
      insightTone = "positive";
    } else if (change <= -0.5) {
      insightText = `${
        t.insightMoodDeclining ?? "Mood declining"
      } (${change.toFixed(1)} ${t.points ?? "points"} ${
        t.overPeriod ?? "over period"
      }).`;
      insightTone = "warning";
    } else {
      insightText = t.insightMoodStable ?? "Mood stable across the period.";
    }
  }

  if (weeklyData.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: c.muted,
          fontSize: 12,
          padding: 20,
        }}
      >
        {t.noData ?? "No data in this range"}
      </div>
    );
  }

  // Custom tooltip with week range + day count
  const WeeklyTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const weekEnd = new Date(d.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return (
      <div
        style={{
          background: c.surface ?? "var(--surface)",
          border: `1px solid ${c.border ?? "var(--card-border)"}`,
          borderRadius: 8,
          padding: "8px 10px",
          fontSize: 11,
          color: c.text,
          boxShadow: "0 4px 12px rgba(45,74,110,0.15)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: c.muted,
            fontSize: 10,
            marginBottom: 4,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {d.weekLabel} · {shortMonthDay(d.weekStart, monthsT)} → {shortMonthDay(weekEnd, monthsT)}
        </div>
        {payload.map((p, i) => (
          <div
            key={i}
            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
          >
            <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
              {p.value != null ? p.value.toFixed(1) : "—"}
            </span>
          </div>
        ))}
        <div
          style={{
            marginTop: 4,
            paddingTop: 4,
            borderTop: `1px solid ${c.grid}`,
            fontSize: 9,
            color: c.muted,
            fontWeight: 600,
          }}
        >
          n = {d.dayCount} {d.dayCount === 1 ? (t.day ?? "day") : (t.days ?? "days")} {t.logged ?? "logged"}
        </div>
      </div>
    );
  };

  // Custom 2-line X-axis tick: week number on top, date below
  const XTick = ({ x, y, payload }) => {
    const d = weeklyData[payload.index];
    if (!d) return null;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0} y={4}
          textAnchor="middle" fontSize={10}
          fill={c.muted} fontWeight={600}
        >
          {d.weekLabel}
        </text>
        <text
          x={0} y={16}
          textAnchor="middle" fontSize={9}
          fill={c.muted} fontWeight={500}
        >
          {d.dateLabel}
        </text>
      </g>
    );
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={weeklyData}
          margin={{ top: 4, right: 10, left: -20, bottom: 16 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={c.grid}
            vertical={false}
          />
          <XAxis
            dataKey="weekKey"
            tick={<XTick />}
            tickLine={false}
            axisLine={false}
            interval={0}
            height={32}
          />
          <YAxis
            domain={[0, 5]}
            tick={{ fontSize: 10, fill: c.muted }}
            tickLine={false}
            axisLine={false}
            ticks={[1, 2, 3, 4, 5]}
          />
          <Tooltip content={<WeeklyTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8, color: c.text }}
          />
          <ReferenceLine y={3} stroke={c.grid} strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="mood"
            name={t.mood ?? "Mood"}
            stroke={c.accent}
            strokeWidth={2}
            dot={{ r: 4, fill: c.accent }}
            connectNulls
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cravings"
            name={t.cravings ?? "Cravings"}
            stroke="#f4a07a"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f4a07a" }}
            connectNulls
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="wellbeing"
            name={t.wellbeing ?? "Wellbeing"}
            stroke="#66bb6a"
            strokeWidth={2}
            dot={{ r: 4, fill: "#66bb6a" }}
            connectNulls
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}