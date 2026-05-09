"use client";
// Questionnaire radar — % of max score across GAD-7, PHQ-9, AUDIT, etc.
// Insight calls out the most clinically severe area.
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
import { MU_VAR } from "../theme";

export default function QRadarChart({ qScores, c, t }) {
  const data = qScores
    .filter((q) => q.score != null)
    .map((q) => ({ subject: q.label, value: q.pct, fullMark: 100 }));

  if (data.length < 3) {
    return (
      <div
        style={{
          textAlign: "center",
          color: MU_VAR,
          fontSize: 12,
          padding: 20,
        }}
      >
        {t.notEnoughQuestionnaireData ?? "Not enough questionnaire data"}
      </div>
    );
  }

  // Insight: highest-percent area (most clinically severe)
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const insightText = top
    ? `${top.subject}: ${top.value}% ${t.ofMax ?? "of max"} — ${
        top.value >= 60
          ? (t.elevatedScore ?? "elevated")
          : (t.withinRange ?? "within typical range")
      }.`
    : null;
  const insightTone = top?.value >= 60 ? "warning" : "neutral";

  return (
    <>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart
          data={data}
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
        >
          <PolarGrid stroke={c.grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: c.muted }}
            tickCount={4}
          />
          <Radar
            name={t.score ?? "Score"}
            dataKey="value"
            stroke={c.accent}
            fill={c.accent}
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 4, fill: c.accent }}
          />
          <Tooltip
            formatter={(v) => [`${v}%`, t.score ?? "Score"]}
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