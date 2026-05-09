"use client";
// Self-contextualizing streak line. Sits below the wellness index and tells
// the doctor where today's streak sits in the patient's lifetime distribution
// — saving them from mentally computing whether "12 days" is good or middling
// for this specific patient.
import { BO, MU, SU, TX } from "./calendar/theme";

function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// Walk the full record list (ascending by date) and return every sober streak
// length. A streak ends at any use day; we capture the length and reset.
function computeStreaks(records) {
  if (!records || records.length === 0)
    return { all: [], current: 0, best: 0, avg: 0 };

  const sortedAsc = [...records].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  const all = [];
  let run = 0;
  sortedAsc.forEach((r) => {
    const isSober = !r.substances?.length;
    if (isSober) {
      run++;
    } else if (run > 0) {
      all.push(run);
      run = 0;
    }
  });
  // Trailing (current) run — include it in `all` for avg calc, but track separately
  let current = 0;
  if (run > 0) {
    all.push(run);
    current = run;
  }

  const best = all.reduce((m, n) => Math.max(m, n), 0);
  const avg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;

  return { all, current, best, avg };
}

function colorFor(days) {
  if (days >= 30) return "#16A34A";
  if (days >= 14) return "#22C55E";
  if (days >= 7) return "#7AABDB";
  if (days >= 3) return "#FBBF24";
  return "#FB923C";
}

export default function StreakComparison({ data, t }) {
  const recs = data?.records ?? [];
  if (recs.length === 0) return null;

  const { current, best, avg, all } = computeStreaks(recs);

  // Need at least one finished streak (or a current run) to be useful
  if (all.length === 0 && current === 0) return null;

  // Render each stat with its color cue
  const items = [
    {
      label: t.currentStreak ?? "Current streak",
      value: current,
      color: current > 0 ? colorFor(current) : MU,
    },
    {
      label: t.lifetimeBest ?? "Lifetime best",
      value: best,
      color: colorFor(best),
    },
    {
      label: t.avgStreak ?? "Average streak",
      value: Math.round(avg),
      color: colorFor(Math.round(avg)),
    },
  ];

  let contextLine = null;
  if (current > 0 && best > 0) {
    if (current === best) {
      contextLine = t.streakContextNewBest ?? "New personal best";
    } else if (current >= best * 0.9) {
      contextLine = t.streakContextNearBest ?? "Approaching personal best";
    } else if (current > avg) {
      contextLine = t.streakContextAboveAvg ?? "Above average";
    } else if (Math.abs(current - avg) < 0.5) {
      contextLine = t.streakContextAverage ?? "At average";
    } else {
      contextLine = t.streakContextBuildingUp ?? "Building up";
    }
  }

  return (
    <div
      style={{
        background: SU,
        border: `1px solid ${BO}`,
        borderRadius: 10,
        padding: "8px 14px",
        marginBottom: 16,
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 14,
        fontSize: 11,
        color: MU,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "baseline", gap: 4 }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {item.label}:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: item.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.value}
          </span>
          <span style={{ fontSize: 10, color: MU, fontWeight: 500 }}>
            {item.value === 1
              ? (t.daySingular ?? "day")
              : (t.daysPlural ?? "days")}
          </span>
        </div>
      ))}

      {contextLine && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 600,
            color: colorFor(current),
            fontStyle: "italic",
          }}
        >
          {contextLine}
        </span>
      )}
    </div>
  );
}
