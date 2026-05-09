"use client";
// Weight over time. Insight quantifies +/- kg change over the period.
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip, Insight } from "./Card";

export default function WeightChart({ weightData, c, t }) {
  let insightText = null,
    insightTone = "neutral";
  if (weightData.length >= 2) {
    const first = weightData[0].weight;
    const last = weightData[weightData.length - 1].weight;
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

  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={weightData}
          margin={{ top: 4, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={c.grid}
            vertical={false}
          />
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
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}