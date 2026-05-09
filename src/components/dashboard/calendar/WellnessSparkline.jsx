"use client";
// 6-month trend of monthly wellness scores. Pairs with the WellnessIndex
// card at the top of the dashboard: number now + trajectory below.
// Pure SVG — no chart library. Theme-aware via CSS variables.
import { useMemo } from "react";
import { BO, MU, SU } from "./theme";
import { calculateWellness } from "./wellnessScore";

export default function WellnessSparkline({ data, t, currentMonth }) {
  // Compute wellness scores for the last 6 months
  const points = useMemo(() => {
    if (!data) return [];
    const out = [];
    const baseY = currentMonth?.y ?? new Date().getFullYear();
    const baseM = currentMonth?.m ?? new Date().getMonth();

    for (let i = 5; i >= 0; i--) {
      // Walk back i months from the current/selected month
      let y = baseY;
      let m = baseM - i;
      while (m < 0) {
        m += 12;
        y -= 1;
      }
      const monthObj = { y, m };
      const calc = calculateWellness(data, monthObj, t);
      out.push({
        y,
        m,
        score: calc?.scoreNow != null ? Math.round(calc.scoreNow) : null,
      });
    }
    return out;
  }, [data, currentMonth, t]);

  // Skip render entirely if we don't have at least 2 valid points
  const validPoints = points.filter((p) => p.score != null);
  if (validPoints.length < 2) return null;

  // SVG viewBox: 200 wide × 60 tall — sparkline-style aspect ratio
  const W = 200;
  const H = 63;
  const PAD_X = 6;
  const PAD_Y = 6;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  // Scale: x by index, y by score (0-100, but we can tighten the visible band
  // for clarity — clamp to the actual range with some padding)
  const scores = validPoints.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const range = Math.max(maxScore - minScore, 10); // avoid divide-by-zero

  const xFor = (i) => PAD_X + (i / (points.length - 1)) * innerW;
  const yFor = (score) =>
    PAD_Y + innerH - ((score - minScore) / range) * innerH;

  // Build the line path, skipping null gaps
  let pathD = "";
  let lastValid = null;
  points.forEach((p, i) => {
    if (p.score == null) {
      lastValid = null;
      return;
    }
    const x = xFor(i);
    const y = yFor(p.score);
    if (lastValid === null) {
      pathD += `M ${x.toFixed(2)} ${y.toFixed(2)} `;
    } else {
      pathD += `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
    lastValid = i;
  });

  // Color the line based on overall trajectory
const first = validPoints[0].score;
const last = validPoints[validPoints.length - 1].score;
const lineColor = "var(--text)";

  // Month labels (short — Jan, Feb, etc.)
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

  return (
<div
  style={{
    background: SU,
    borderRadius: 12,
    border: `1px solid ${BO}`,
    boxShadow: "var(--shadow-card)",
    padding: "12px 14px 10px",
    marginTop: 18,
    marginBottom: 10,
  }}
>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {t.trajectory ?? "Trajectory"}
        </div>
        <div
          style={{
            fontSize: 10,
            color: lineColor,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {first} → {last}
        </div>
      </div>

      {/* Sparkline SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {/* Line path */}
        <path
          d={pathD}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Dots at each point */}
        {points.map((p, i) =>
          p.score != null ? (
            <circle
              key={i}
              cx={xFor(i)}
              cy={yFor(p.score)}
              r={i === points.length - 1 ? 2.5 : 1.5}
              fill={lineColor}
              stroke={i === points.length - 1 ? "var(--card)" : "none"}
              strokeWidth={i === points.length - 1 ? 1 : 0}
            >
              <title>
                {monthsT[p.m]} {p.y}: {p.score}/100
              </title>
            </circle>
          ) : null,
        )}
      </svg>

      {/* Month labels — only first, middle, last to avoid clutter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
          fontSize: 9,
          color: MU,
          fontWeight: 600,
        }}
      >
        <span>{monthsT[points[0].m]}</span>
        <span>{monthsT[points[Math.floor(points.length / 2)].m]}</span>
        <span>{monthsT[points[points.length - 1].m]}</span>
      </div>
    </div>
  );
}
