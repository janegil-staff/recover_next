"use client";
// 6-month trend of monthly wellness scores. Pairs with the WellnessIndex
// card at the top of the dashboard: number now + trajectory below.
// Pure SVG — no chart library. Theme-aware via CSS variables.
//
// Visual conventions:
//   • Line color reflects direction: green = improving, red = declining,
//     neutral = roughly flat (|delta| < FLAT_THRESHOLD).
//   • The last dot is enlarged. If the rightmost month is still in progress
//     (today falls inside it), the dot renders as a dashed hollow ring to
//     signal "score will firm up as more days are logged."
import { useMemo } from "react";
import { BO, MU, SU } from "./theme";
import { calculateWellness } from "./wellnessScore";

// How many points difference counts as "flat" rather than improving/declining.
// Tuned for a 0-100 score range; below this, month-to-month noise dominates
// and the doctor shouldn't read a trend into it.
const FLAT_THRESHOLD = 3;

const COLOR_UP = "#16A34A";    // green — improving
const COLOR_DOWN = "#DC2626";  // red   — declining
const COLOR_FLAT = "var(--text)";

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

  // Direction = first valid → last valid. Color the line accordingly.
  const first = validPoints[0].score;
  const last = validPoints[validPoints.length - 1].score;
  const delta = last - first;
  const direction =
    Math.abs(delta) < FLAT_THRESHOLD ? "flat" : delta > 0 ? "up" : "down";
  const lineColor =
    direction === "up"
      ? COLOR_UP
      : direction === "down"
        ? COLOR_DOWN
        : COLOR_FLAT;

  // Direction badge — small arrow next to the "first → last" readout
  const directionIcon =
    direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  const directionLabel =
    direction === "up"
      ? (t.improving ?? "improving")
      : direction === "down"
        ? (t.declining ?? "declining")
        : (t.stable ?? "stable");

  // Is the rightmost point the current (in-progress) month? If so, render
  // it as a hollow dashed circle so the doctor knows the score will firm up.
  const today = new Date();
  const lastPoint = points[points.length - 1];
  const isLastInProgress =
    lastPoint &&
    today.getFullYear() === lastPoint.y &&
    today.getMonth() === lastPoint.m;

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
          gap: 8,
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
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            fontSize: 10,
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: MU, fontWeight: 600 }}>
            {first} → {last}
          </span>
          <span style={{ color: lineColor }}>
            {directionIcon} {directionLabel}
          </span>
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

        {/* Dots at each point. The rightmost dot is special:
            - If the last month is in progress → hollow dashed circle
            - Otherwise → solid filled circle (slightly larger) */}
        {points.map((p, i) => {
          if (p.score == null) return null;
          const isLast = i === points.length - 1;
          const cx = xFor(i);
          const cy = yFor(p.score);

          if (isLast && isLastInProgress) {
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={3}
                fill="var(--card)"
                stroke={lineColor}
                strokeWidth={1.5}
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              >
                <title>
                  {monthsT[p.m]} {p.y}: {p.score}/100 ·{" "}
                  {t.inProgress ?? "in progress"}
                </title>
              </circle>
            );
          }

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={isLast ? 2.5 : 1.5}
              fill={lineColor}
              stroke={isLast ? "var(--card)" : "none"}
              strokeWidth={isLast ? 1 : 0}
            >
              <title>
                {monthsT[p.m]} {p.y}: {p.score}/100
              </title>
            </circle>
          );
        })}
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