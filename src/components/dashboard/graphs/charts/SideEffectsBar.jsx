"use client";
// Horizontal bar list of side effects ordered by frequency.
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Insight } from "./Card";
import { MU_VAR } from "../theme";

export default function SideEffectsBar({ records, c, t }) {
  const data = useMemo(() => {
    const counts = {};
    records.forEach((r) => {
      (r.sideEffects ?? []).forEach((e) => {
        counts[e] = (counts[e] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([effect, count]) => ({ effect: effect.replace(/_/g, " "), count }));
  }, [records]);

  if (data.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: MU_VAR,
          fontSize: 12,
          padding: 20,
        }}
      >
        {t.noSideEffectsLogged ?? "No side effects logged in this period"}
      </div>
    );
  }

  // Insight: top side effect with frequency
  const top = data[0];
  const total = data.reduce((s, d) => s + d.count, 0);
  const insightText = `${top.effect.charAt(0).toUpperCase() + top.effect.slice(1)} ${
    t.insightTopSideEffect ?? "is the most reported"
  } (${top.count} ${
    top.count === 1 ? (t.day ?? "day") : (t.days ?? "days")
  }, ${Math.round((top.count / total) * 100)}% ${
    t.ofAllReports ?? "of all reports"
  }).`;

  const height = Math.max(180, data.length * 28 + 30);

  return (
    <>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={c.grid}
            horizontal={false}
          />
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
            formatter={(v) => [
              `${v} ${v === 1 ? (t.day ?? "day") : (t.days ?? "days")}`,
              t.count ?? "Count",
            ]}
          />
          <Bar
            dataKey="count"
            fill="#f4a07a"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            label={{
              position: "right",
              fill: c.text,
              fontSize: 10,
              fontWeight: 700,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
      <Insight text={insightText} tone="neutral" />
    </>
  );
}
