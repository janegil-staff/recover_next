"use client";
// 6-month trend of monthly wellness scores. Pairs with the WellnessIndex
// card at the top of the dashboard: number now + trajectory below.
// Pure SVG — no chart library. Theme-aware via CSS variables.
//
// Header layout:
//   TRAJECTORY                            60 → 63  ↑ improving
//                                                  6mo: 81 → 63
//
//   • The bold badge (right top) shows last-month vs current-month with a
//     colored direction icon. This matches the WellnessIndex arrow above.
//   • The muted subtext (right bottom) shows the full 6-month arc as
//     context — so a small recent bounce doesn't hide a long-term decline.
//
// Visual conventions:
//   • Line color reflects the SHORT-TERM (last vs previous month) so it
//     agrees with the badge.
//   • The last dot is enlarged. If the rightmost month is still in progress
//     (today falls inside it), the dot renders as a dashed hollow ring.
//   • Hover any month → custom popover shows that month's score.
import { useMemo, useState } from "react";
import { BO, MU, SU, TX } from "./theme";
import { calculateWellness } from "./wellnessScore";

// Below this delta, treat as flat. Matches the threshold used by the
// WellnessIndex arrow (which fires "improving" at change > 2).
const FLAT_THRESHOLD = 2;

const COLOR_UP = "#16A34A";
const COLOR_DOWN = "#DC2626";
const COLOR_FLAT = "var(--text)";

export default function WellnessSparkline({ data, t, currentMonth }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  // Compute wellness scores for the last 6 months
  const points = useMemo(() => {
    if (!data) return [];
    const out = [];
    const baseY = currentMonth?.y ?? new Date().getFullYear();
    const baseM = currentMonth?.m ?? new Date().getMonth();

    for (let i = 5; i >= 0; i--) {
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

  const validPoints = points.filter((p) => p.score != null);
  if (validPoints.length < 2) return null;

  // SVG viewBox dimensions
  const W = 200;
  const H = 63;
  const PAD_X = 6;
  const PAD_Y = 6;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  // Scale calculations
  const scores = validPoints.map((p) => p.score);
  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const range = Math.max(maxScore - minScore, 10);

  const xFor = (i) => PAD_X + (i / (points.length - 1)) * innerW;
  const yFor = (score) =>
    PAD_Y + innerH - ((score - minScore) / range) * innerH;

  // Build the line path
  let pathD = "";
  let lastValid = null;
  points.forEach((p, i) => {
    if (p.score == null) {
      lastValid = null;
      return;
    }
    const x = xFor(i);
    const y = yFor(p.score);
    pathD +=
      lastValid === null
        ? `M ${x.toFixed(2)} ${y.toFixed(2)} `
        : `L ${x.toFixed(2)} ${y.toFixed(2)} `;
    lastValid = i;
  });

  // Endpoints we care about
  const first = validPoints[0].score; // 6-month start
  const last = validPoints[validPoints.length - 1].score; // current month
  const prev =
    validPoints.length >= 2
      ? validPoints[validPoints.length - 2].score
      : last;

  // Short-term direction (drives the badge AND the line color)
  const shortDelta = last - prev;
  const direction =
    Math.abs(shortDelta) < FLAT_THRESHOLD
      ? "flat"
      : shortDelta > 0
        ? "up"
        : "down";
  const lineColor =
    direction === "up"
      ? COLOR_UP
      : direction === "down"
        ? COLOR_DOWN
        : COLOR_FLAT;

  const directionIcon =
    direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
  const directionLabel =
    direction === "up"
      ? (t.improving ?? "improving")
      : direction === "down"
        ? (t.declining ?? "declining")
        : (t.stable ?? "stable");

  // Long-arc context — shown muted so it doesn't compete with the badge
  const longDelta = last - first;
  const longDirection =
    Math.abs(longDelta) < FLAT_THRESHOLD
      ? "flat"
      : longDelta > 0
        ? "up"
        : "down";
  const longArrow =
    longDirection === "up" ? "↑" : longDirection === "down" ? "↓" : "→";

  // Is the rightmost point the current (in-progress) month?
  const today = new Date();
  const lastPoint = points[points.length - 1];
  const isLastInProgress =
    lastPoint &&
    today.getFullYear() === lastPoint.y &&
    today.getMonth() === lastPoint.m;

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

  const sliceW = W / points.length;
  const active = hoverIdx != null ? points[hoverIdx] : null;
  const activeHasScore = active && active.score != null;

  // "6mo" subtext — abbreviation that fits in the tight space.
  // Falls back to literal "6mo" if no translation provided.
  const longArcLabel = t.sixMo ?? "6mo";

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
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
            paddingTop: 1,
          }}
        >
          {t.trajectory ?? "Trajectory"}
        </div>

        {/* Right column — two stacked lines:
            (a) bold: short-term change with direction icon, line-colored
            (b) muted: 6-month arc context */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <span style={{ color: MU, fontWeight: 600 }}>
              {prev} → {last}
            </span>
            <span style={{ color: lineColor }}>
              {directionIcon} {directionLabel}
            </span>
          </div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 500,
              color: MU,
              letterSpacing: 0.2,
            }}
          >
            {longArcLabel}: {first} {longArrow} {last}
          </div>
        </div>
      </div>

      {/* Wrapper is `relative` so the tooltip can absolute-position itself
          over the active dot. */}
      <div style={{ position: "relative" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          preserveAspectRatio="none"
          style={{ display: "block" }}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />

          {points.map((p, i) => {
            if (p.score == null) return null;
            const isLast = i === points.length - 1;
            const isHovered = hoverIdx === i;
            const cx = xFor(i);
            const cy = yFor(p.score);

            if (isLast && isLastInProgress) {
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 4 : 3}
                  fill="var(--card)"
                  stroke={lineColor}
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              );
            }

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={isHovered ? 3.5 : isLast ? 2.5 : 1.5}
                fill={lineColor}
                stroke={isLast || isHovered ? "var(--card)" : "none"}
                strokeWidth={isLast || isHovered ? 1 : 0}
                pointerEvents="none"
              />
            );
          })}

          {/* Invisible hit-test rectangles for hover */}
          {points.map((p, i) => (
            <rect
              key={`hit-${i}`}
              x={i * sliceW}
              y={0}
              width={sliceW}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: p.score != null ? "pointer" : "default" }}
            />
          ))}
        </svg>

        {/* Tooltip popover */}
        {activeHasScore && (
          <div
            style={{
              position: "absolute",
              left: `${(xFor(hoverIdx) / W) * 100}%`,
              bottom: "100%",
              transform: "translate(-50%, -4px)",
              background: "var(--card)",
              border: `1px solid ${BO}`,
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 700,
              color: TX,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 2,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ color: MU, fontWeight: 600, marginRight: 6 }}>
              {monthsT[active.m]} {active.y}
            </span>
            <span style={{ color: lineColor }}>{active.score}/100</span>
            {hoverIdx === points.length - 1 && isLastInProgress && (
              <span
                style={{
                  color: MU,
                  fontWeight: 500,
                  marginLeft: 4,
                  fontStyle: "italic",
                }}
              >
                · {t.inProgress ?? "in progress"}
              </span>
            )}
          </div>
        )}
      </div>

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