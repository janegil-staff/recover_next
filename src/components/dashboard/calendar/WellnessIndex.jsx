"use client";
// Top-of-page patient snapshot card. Three glances:
//   1. Number → how is the patient
//   2. Arrow  → trending which way
//   3. Badge  → still engaged?
// Click "Show detail" to see what today's data says vs the patient's baseline.
import { useState } from "react";
import { BG, BO, MU, SU, TX } from "./theme";
import { calculateWellness } from "./wellnessScore";

const COMPONENT_KEYS = [
  "sobriety",
  "cravings",
  "moodWellbeing",
  "mentalHealth",
  "engagement",
];

function tierFor(score, t) {
  if (score >= 80)
    return { color: "#16A34A", label: t.tierThriving ?? "Thriving" };
  if (score >= 60)
    return { color: "#7AABDB", label: t.tierStable ?? "Stable" };
  if (score >= 40)
    return { color: "#FBBF24", label: t.tierWatch ?? "Watch" };
  if (score >= 20)
    return { color: "#FB923C", label: t.tierAtRisk ?? "At risk" };
  return { color: "#EF4444", label: t.tierCritical ?? "Critical" };
}

function trendFor(change, t) {
  if (change == null) return null;
  if (change > 2)
    return { icon: "↑", color: "#16A34A", label: t.improving ?? "improving" };
  if (change < -2)
    return { icon: "↓", color: "#EF4444", label: t.declining ?? "declining" };
  return { icon: "→", color: "#7a9ab8", label: t.stable ?? "stable" };
}

function logTierFor(days) {
  if (days == null) return null;
  if (days <= 1) return "#16A34A";
  if (days <= 4) return "#D97706";
  return "#DC2626";
}

function logLabelFor(days, t) {
  if (days == null) return null;
  if (days === 0) return t.logToday ?? "Logged today";
  if (days === 1) return t.logYesterday ?? "Logged yesterday";
  return `${days} ${t.daysAgo ?? "days ago"}`;
}

function barColorFor(pct) {
  if (pct >= 75) return "#16A34A";
  if (pct >= 50) return "#7AABDB";
  if (pct >= 25) return "#FBBF24";
  return "#EF4444";
}

export default function WellnessIndex({ data, t, month }) {

  const [showDetail, setShowDetail] = useState(false);

  // Pure calc — keep heavy logic out of the component file
  const calc = calculateWellness(data, month, t);
  if (!calc || calc.scoreNow == null) return null;

  const score = Math.round(calc.scoreNow);
  const change = calc.change != null ? Math.round(calc.change) : null;
  const days = calc.daysSinceLog;

  const tier = tierFor(score, t);
  const trend = trendFor(change, t);
  const logTier = logTierFor(days);
  const logLabel = logLabelFor(days, t);

  const componentLabels = {
    sobriety: t.compSobriety ?? "Sobriety",
    cravings: t.compLowCravings ?? "Low cravings",
    moodWellbeing: t.compMoodWellbeing ?? "Mood/Wellbeing",
    mentalHealth: t.compMentalWellness ?? "Mental wellness",
    engagement: t.compEngagement ?? "Engagement",
  };

  const months = t.months ?? [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthLabel = `${months[month.m]} ${month.y}`;

  return (
    <div
      style={{
        background: SU,
        borderRadius: 14,
        border: `1px solid ${BO}`,
        boxShadow: "var(--shadow-card)",
        padding: 18,
        marginBottom: 16,
      }}
    >
      {/* Top row — score + label + trend + last log */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 18,
          alignItems: "center",
        }}
      >
        {/* Score circle */}
        <div
          style={{
            position: "relative",
            width: 110,
            height: 110,
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 110 110" style={{ position: "absolute", inset: 0 }}>
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke={BG}
              strokeWidth="9"
            />
            <circle
              cx="55"
              cy="55"
              r="48"
              fill="none"
              stroke={tier.color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 301.6} 301.6`}
              transform="rotate(-90 55 55)"
              style={{ transition: "stroke-dasharray .6s ease" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: tier.color,
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <div
              style={{
                fontSize: 9,
                color: MU,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              / 100
            </div>
          </div>
        </div>

        {/* Tier label + meta + breakdown */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: tier.color }}>
              {tier.label}
            </div>
            {trend && (
              <div style={{ fontSize: 13, color: trend.color, fontWeight: 700 }}>
                {trend.icon} {Math.abs(change)} {trend.label}
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 10,
              color: MU,
              fontWeight: 600,
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {t.wellnessIndex ?? "Wellness Index"} · {monthLabel}
            {change != null && (
              <span
                style={{
                  fontWeight: 500,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 10,
                  color: MU,
                  marginLeft: 6,
                }}
              >
                ({t.vsPrevMonth ?? "vs. previous month"})
              </span>
            )}
          </div>

          {/* Component bars */}
          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {COMPONENT_KEYS.map((key) => {
              const comp = calc.components[key];
              if (comp.now == null) return null;
              const pct = Math.round(comp.now);
              return (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: MU,
                      fontWeight: 600,
                      width: 100,
                      flexShrink: 0,
                    }}
                  >
                    {componentLabels[key]}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 5,
                      background: BG,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: barColorFor(pct),
                        borderRadius: 3,
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: MU,
                      fontWeight: 700,
                      width: 28,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {pct}
                  </div>
                </div>
              );
            })}
          </div>

          {calc.weakest && calc.weakest[1].now < 60 && (
            <div
              style={{
                fontSize: 10,
                color: "#FB923C",
                fontWeight: 600,
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>⚠</span>
              <span>
                {t.attentionNeeded ?? "Watch"}:{" "}
                {componentLabels[calc.weakest[0]]} (
                {Math.round(calc.weakest[1].now)})
              </span>
            </div>
          )}
        </div>

        {/* Last-log badge — top right */}
        {logLabel && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
              alignSelf: "flex-start",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: MU,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {t.lastLog ?? "Last log"}
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                color: logTier,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: logTier,
                  animation:
                    days >= 5 ? "lastLogPulse 2s ease-in-out infinite" : "none",
                }}
              />
              {logLabel}
            </div>
          </div>
        )}
      </div>

      {/* Expandable detail row */}
      {calc.latestVsTypical.length > 0 && (
        <>
          <button
            onClick={() => setShowDetail((s) => !s)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: 10,
              color: MU,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            <span>{showDetail ? "▾" : "▸"}</span>
            <span>
              {showDetail
                ? (t.hideDetail ?? "Hide latest log detail")
                : (t.showDetail ?? "Show latest log vs typical")}
            </span>
            {!calc.latestInMonth && (
              <span
                style={{
                  fontWeight: 500,
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 10,
                  color: MU,
                  marginLeft: 4,
                }}
              >
                ({t.outsideMonth ?? "outside selected month"})
              </span>
            )}
          </button>

          {showDetail && (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: `1px solid ${BG}`,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {calc.latestVsTypical.map((m) => {
                const delta = m.today - m.avg;
                const deltaAbs = Math.abs(delta).toFixed(1);
                const isBetter = m.higherIsBetter ? delta > 0 : delta < 0;
                const isAtBaseline = Math.abs(delta) < 0.25;
                const color = isAtBaseline
                  ? "#7a9ab8"
                  : isBetter
                    ? "#16A34A"
                    : "#DC2626";
                const arrow = isAtBaseline ? "→" : delta > 0 ? "↑" : "↓";
                const aboveBelow = isAtBaseline
                  ? (t.atBaseline ?? "at baseline")
                  : delta > 0
                    ? (t.aboveAverage ?? "above average")
                    : (t.belowAverage ?? "below average");
                return (
                  <div
                    key={m.key}
                    style={{ borderLeft: `2px solid ${color}`, paddingLeft: 8 }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        color: MU,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: TX,
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      {m.today}
                      <span style={{ fontSize: 10, color: MU, fontWeight: 500 }}>
                        {" "}
                        / {m.scale}
                      </span>
                      <span style={{ color, marginLeft: 5 }}>
                        {arrow} {deltaAbs}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color,
                        fontWeight: 600,
                        marginTop: 1,
                      }}
                    >
                      {aboveBelow} ({t.avg ?? "avg"} {m.avg.toFixed(1)})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
