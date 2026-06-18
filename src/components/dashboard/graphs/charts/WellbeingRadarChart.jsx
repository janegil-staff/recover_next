"use client";
// Recovery Profile radar — 5 dimensions of recovery on a 0-5 scale.
// Insight surfaces the strongest and weakest area.
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import { Insight } from "./Card";
import { isSoberDay } from "./streakUtils";

export default function WellbeingRadarChart({ records, c, t }) {
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
  // SOBER_DAY_FIX_2026-06-18 — a sober day is recorded with substances:
  // ["sober"] (the literal tag), NOT an empty array. The old check
  // `!r.substances?.length` treated ["sober"] (length 1) as "not sober",
  // collapsing this axis to ~0. Route through isSoberDay (single source of
  // truth, same helper SoberStreaks uses) so the count is correct.
  const sobrietyDays = records.filter((r) => isSoberDay(r)).length;
  const sobrietyPct =
    Math.round((sobrietyDays / records.length) * 5 * 10) / 10;

  const data = [
    { subject: t.mood ?? "Mood", value: avgMood, fullMark: 5 },
    { subject: t.wellbeing ?? "Wellbeing", value: avgWellbeing, fullMark: 5 },
    {
      subject: t.lowCravings ?? "Low cravings",
      value: Math.max(0, 5 - avgCravings),
      fullMark: 5,
    },
    {
      subject: t.lowAmount ?? "Low amount",
      value: Math.max(0, 5 - (avgAmount / 10) * 5),
      fullMark: 5,
    },
    { subject: t.soberDays ?? "Sober days", value: sobrietyPct, fullMark: 5 },
  ];

  // Insight: strongest + weakest dimension
  const sorted = [...data].sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const insightText =
    weakest && strongest && strongest.value > weakest.value
      ? `${strongest.subject}: ${strongest.value}/5 — ${
          t.strongestArea ?? "strongest area"
        }. ${weakest.subject}: ${weakest.value}/5 — ${
          t.weakestArea ?? "needs attention"
        }.`
      : null;
  const insightTone =
    weakest?.value < 2
      ? "warning"
      : strongest?.value >= 4
        ? "positive"
        : "neutral";

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart
          data={data}
          margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
        >
          <PolarGrid stroke={c.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 9, fill: c.muted }}
            tickCount={4}
          />
          <Radar
            name={t.patientProfile ?? "Patient profile"}
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
      <Insight text={insightText} tone={insightTone} />
    </>
  );
}