"use client";
// Top ribbon: current streak, last use, best/worst day by mood, total log count.
// Read-only summary derived from the full ascending-sorted record list.
import { useMemo } from "react";
import { BO, MU, SU, TX } from "../calendar/theme";
import { fmtDate } from "../calendar/helpers";

function shortDate(d) {
  const dt = new Date(d);
  return `${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
}

export default function PeriodRibbon({ records, t }) {
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const sortedAsc = [...records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );

    // Current streak from the most recent record backwards
    let current = 0;
    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      if (!sortedAsc[i].substances?.length) current++;
      else break;
    }

    // Last use day (most recent record with substances)
    const lastUse = [...sortedAsc].reverse().find((r) => r.substances?.length);

    // Best & worst days by mood (lower = better in this scale; check)
    const withMood = sortedAsc.filter((r) => r.mood != null);
    const best = withMood.reduce(
      (b, r) => (!b || r.mood < b.mood ? r : b),
      null,
    );
    const worst = withMood.reduce(
      (w, r) => (!w || r.mood > w.mood ? r : w),
      null,
    );

    return { current, lastUse, best, worst, total: records.length };
  }, [records]);

  if (!stats) return null;

  const items = [
    {
      label: t.streakNow ?? "Current streak",
      value:
        stats.current > 0 ? `${stats.current} ${t.daysPlural ?? "days"}` : "—",
      color:
        stats.current >= 7 ? "#16A34A" : stats.current > 0 ? "#7AABDB" : MU,
    },
    {
      label: t.lastUse ?? "Last use",
      value: stats.lastUse
        ? shortDate(stats.lastUse.date ?? stats.lastUse.createdAt)
        : (t.never ?? "Never"),
      color: stats.lastUse ? "#DC2626" : "#16A34A",
    },
    {
      label: t.bestDay ?? "Best day",
      value: stats.best
        ? shortDate(stats.best.date ?? stats.best.createdAt)
        : "—",
      color: "#16A34A",
    },
    {
      label: t.worstDay ?? "Worst day",
      value: stats.worst
        ? shortDate(stats.worst.date ?? stats.worst.createdAt)
        : "—",
      color: "#DC2626",
    },
    {
      label: t.totalLogs ?? "Total logs",
      value: String(stats.total),
      color: TX,
    },
  ];

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: "12px 16px",
        marginBottom: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((item, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: 9,
                color: MU,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: item.color,
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
