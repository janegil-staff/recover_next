"use client";
// Weight over time, aggregated into Mon–Sun calendar week averages.
// Daily weights fluctuate ±1-2kg from water/food/timing; weekly averages
// reveal genuine trend. Insight quantifies +/- kg change first→last week.
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Insight } from "./Card";

// ── Week aggregation helpers ──────────────────────────────────────────────
function mondayOf(d) {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const dayIdx = (out.getDay() + 6) % 7; // Mon=0, Sun=6
  out.setDate(out.getDate() - dayIdx);
  return out;
}

function isoWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
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

export default function WeightChart({ records, c, t }) {
  const monthsT = t.monthsShort ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Aggregate weight measurements into Mon-Sun calendar weeks
  const weeklyData = useMemo(() => {
    if (!records?.length) return [];

    const buckets = new Map();
    records.forEach((r) => {
      if (r.weight == null || !r.weight) return;
      const date = new Date(r.date ?? r.createdAt);
      if (isNaN(date.getTime())) return;
      const monday = mondayOf(date);
      const key = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          weekStart: monday,
          weekNum: isoWeek(monday),
          weights: [],
        });
      }
      buckets.get(key).weights.push(Number(r.weight));
    });

    const sorted = [...buckets.values()].sort(
      (a, b) => a.weekStart - b.weekStart,
    );

    return sorted.map((b) => ({
      weekKey: `W${b.weekNum}`,
      weekLabel: `${t.weekShort ?? "Wk"} ${b.weekNum}`,
      dateLabel: shortMonthDay(b.weekStart, monthsT),
      weekStart: b.weekStart,
      weight: +(
        b.weights.reduce((s, v) => s + v, 0) / b.weights.length
      ).toFixed(1),
      dayCount: b.weights.length,
    }));
  }, [records, t, monthsT]);

  // Insight: weight change from first to last week
  let insightText = null,
    insightTone = "neutral";
  if (weeklyData.length >= 2) {
    const first = weeklyData[0].weight;
    const last = weeklyData[weeklyData.length - 1].weight;
    const change = last - first;
    if (Math.abs(change) >= 1) {
      insightText = `${t.weight ?? "Weight"} ${
        change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1)
      } ${t.kg ?? "kg"} ${t.overPeriod ?? "over period"}.`;
      insightTone = Math.abs(change) >= 5 ? "warning" : "neutral";
    } else {
      insightText = t.insightWeightStable ?? "Weight stable across the period.";
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
        {t.noData ?? "No weight data in this range"}
      </div>
    );
  }

  // Custom tooltip with week range, weight, and sample size
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
          {d.weekLabel} · {shortMonthDay(d.weekStart, monthsT)} →{" "}
          {shortMonthDay(weekEnd, monthsT)}
        </div>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span style={{ color: c.accentStrong, fontWeight: 600 }}>
            {t.weight ?? "Weight"}
          </span>
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
            {d.weight.toFixed(1)} {t.kg ?? "kg"}
          </span>
        </div>
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
          n = {d.dayCount}{" "}
          {d.dayCount === 1
            ? (t.measurement ?? "measurement")
            : (t.measurements ?? "measurements")}
        </div>
      </div>
    );
  };

  // 2-line X-axis tick: week number + start date
  const XTick = ({ x, y, payload }) => {
    const d = weeklyData[payload.index];
    if (!d) return null;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={4}
          textAnchor="middle"
          fontSize={10}
          fill={c.muted}
          fontWeight={600}
        >
          {d.weekLabel}
        </text>
        <text
          x={0}
          y={16}
          textAnchor="middle"
          fontSize={9}
          fill={c.muted}
          fontWeight={500}
        >
          {d.dateLabel}
        </text>
      </g>
    );
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
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
            tick={{ fontSize: 10, fill: c.muted }}
            tickLine={false}
            axisLine={false}
            domain={[(d) => Math.floor(d - 2), (d) => Math.ceil(d + 2)]}
          />
          <Tooltip content={<WeeklyTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            name={`${t.weight ?? "Weight"} (${t.kg ?? "kg"})`}
            stroke={c.accentStrong}
            strokeWidth={2.5}
            dot={{ r: 5, fill: c.accentStrong }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}
