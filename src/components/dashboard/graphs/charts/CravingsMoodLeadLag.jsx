"use client";
// Cross-correlation analysis between mood and cravings across ±3 day lags.
// Answers: does mood predict cravings (negative lag), or do cravings predict
// mood (positive lag)? Shown as a small bar chart with the strongest lag
// highlighted and the finding stated in plain English.
import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import { Insight } from "./Card";
import { MU_VAR } from "../theme";

// Pearson correlation coefficient
function pearson(xs, ys) {
  const n = xs.length;
  if (n < 4) return null;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0,
    dx2 = 0,
    dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? null : num / denom;
}

export default function CravingsMoodLeadLag({ records, c, t }) {
  const result = useMemo(() => {
    if (records.length < 8) return null;

    // Build aligned time series — only days where both mood and cravings exist
    const sorted = [...records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );
    const moods = [];
    const cravings = [];
    sorted.forEach((r) => {
      if (r.mood != null && r.cravings != null) {
        moods.push(r.mood);
        cravings.push(r.cravings);
      }
    });
    if (moods.length < 8) return null;

    // For each lag from -3 to +3 days, compute Pearson correlation
    const lags = [];
    for (let lag = -3; lag <= 3; lag++) {
      let xs, ys;
      if (lag < 0) {
        // Mood at t - |lag| vs cravings at t (mood leads cravings)
        xs = moods.slice(0, moods.length + lag);
        ys = cravings.slice(-lag);
      } else if (lag > 0) {
        // Cravings at t - lag vs mood at t (cravings lead mood)
        xs = cravings.slice(0, cravings.length - lag);
        ys = moods.slice(lag);
      } else {
        xs = moods;
        ys = cravings;
      }
      const r = pearson(xs, ys);
      lags.push({ lag, r: r != null ? Math.round(r * 100) / 100 : null });
    }

    // Find lag with strongest absolute correlation
    const ranked = lags
      .filter((l) => l.r != null)
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
    const strongest = ranked[0] ?? null;

    return { lags, strongest };
  }, [records]);

  if (!result || !result.strongest) {
    return (
      <div
        style={{
          textAlign: "center",
          color: MU_VAR,
          fontSize: 12,
          padding: 20,
        }}
      >
        {t.notEnoughDataForLeadLag ?? "Not enough data for correlation analysis"}
      </div>
    );
  }

  // Build chart data — show absolute correlation strength so direction-agnostic bars
  const chartData = result.lags.map((l) => ({
    lag: l.lag === 0 ? "0" : l.lag > 0 ? `+${l.lag}` : `${l.lag}`,
    lagNum: l.lag,
    rAbs: l.r != null ? Math.abs(l.r) : 0,
    r: l.r,
  }));

  // Color the strongest bar differently
  const barColor = (lag) => {
    if (lag === result.strongest.lag) return "var(--accent)";
    return "#94A3B8";
  };

  // Compute insight
  const { lag, r } = result.strongest;
  const strength = Math.abs(r);
  const strengthLabel =
    strength >= 0.5
      ? (t.strong ?? "strong")
      : strength >= 0.3
        ? (t.moderate ?? "moderate")
        : (t.weak ?? "weak");
  const direction = r > 0 ? "+" : "";

  let insightText = null;
  let insightTone = "neutral";

  if (strength < 0.2) {
    insightText =
      t.insightLeadLagNoCorrelation ??
      "No significant correlation between mood and cravings.";
    insightTone = "neutral";
  } else if (lag === 0) {
    insightText = `${
      t.insightLeadLagSameDay ?? "Mood and cravings move together same-day"
    } (r = ${direction}${r.toFixed(2)}, ${strengthLabel}).`;
    insightTone = strength >= 0.5 ? "warning" : "neutral";
  } else if (lag < 0) {
    // Mood leads cravings — clinically interesting predictor
    const days = Math.abs(lag);
    insightText = `${
      t.insightLeadLagMoodLeads ?? "Mood predicts cravings"
    } (${days} ${days === 1 ? (t.day ?? "day") : (t.days ?? "days")} ${
      t.aheadOf ?? "ahead of"
    }, r = ${direction}${r.toFixed(2)}, ${strengthLabel}).`;
    insightTone = strength >= 0.4 ? "warning" : "neutral";
  } else {
    // Cravings lead mood
    const days = lag;
    insightText = `${
      t.insightLeadLagCravingsLeads ?? "Cravings precede mood changes"
    } (${days} ${days === 1 ? (t.day ?? "day") : (t.days ?? "days")} ${
      t.aheadOf ?? "ahead of"
    }, r = ${direction}${r.toFixed(2)}, ${strengthLabel}).`;
    insightTone = strength >= 0.4 ? "warning" : "neutral";
  }

  return (
    <>
      <div
        style={{
          fontSize: 10,
          color: MU_VAR,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {t.leadLagAxisLabel ?? "Days mood leads ←  →  Cravings lead"}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="lag"
            tick={{ fontSize: 10, fill: c.muted, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: c.muted }}
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <ReferenceLine y={0.3} stroke={c.grid} strokeDasharray="4 4" />
          <Bar
            dataKey="rAbs"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            label={{
              position: "top",
              fill: c.text,
              fontSize: 9,
              fontWeight: 700,
              formatter: (v) => (v > 0 ? v.toFixed(2) : ""),
            }}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.lagNum)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}