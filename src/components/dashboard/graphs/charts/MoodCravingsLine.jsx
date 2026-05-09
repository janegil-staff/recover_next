"use client";
// Three-line chart: mood, cravings, wellbeing on the 1-5 scale.
// Insight detects whether mood is improving, declining, or stable.
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
import { CustomTooltip, Insight } from "./Card";

export default function MoodCravingsLine({ moodData, c, t }) {
  // Insight: trend in mood over the period (compare first vs second half)
  const validMood = moodData.filter((d) => d.mood != null);
  let insightText = null,
    insightTone = "neutral";
  if (validMood.length >= 4) {
    const half = Math.floor(validMood.length / 2);
    const firstHalf = validMood.slice(0, half);
    const secondHalf = validMood.slice(half);
    const avg = (arr) => arr.reduce((s, d) => s + d.mood, 0) / arr.length;
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
      insightText =
        t.insightMoodStable ?? "Mood stable across the period.";
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={moodData}
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
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}