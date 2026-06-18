"use client";
// 365-cell strip showing every day of the past year. Each cell is colored by:
//   • Red — substance used that day
//   • Green — sober (logged, no substances)
//   • Grey — no log on that day
// Click a cell to jump to its month in the calendar above.
//
// Layout: the grid scales to fit the container width — cells use a percentage
// width derived from week count, so 12 month abbreviations always fit on one
// line with no horizontal scroll.
import { useMemo } from "react";
import { BO, MU, SU, TX } from "./theme";

function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// A day is sober if substances is empty OR every entry is the "sober" tag.
function isSober(rec) {
  const subs = rec.substances ?? [];
  return subs.length === 0 || subs.every((s) => s === "sober");
}

export default function YearInPixels({ data, t, onMonthJump, currentMonth }) {
  const days = useMemo(() => {
    const recMap = {};
    (data?.records ?? []).forEach((r) => {
      recMap[fmtDate(new Date(r.date ?? r.createdAt))] = r;
    });

    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = fmtDate(d);
      const rec = recMap[ds];
      let state = "none";
      if (rec) {
        state = isSober(rec) ? "sober" : "use";
      }
      out.push({ date: d, ds, state });
    }
    return out;
  }, [data]);

  const grid = useMemo(() => {
    if (days.length === 0) return { weeks: [], monthLabels: [] };

    // Pad start so the first column begins on Monday (Mon=0..Sun=6)
    const first = days[0].date;
    const firstDow = (first.getDay() + 6) % 7;
    const padded = [...Array(firstDow).fill(null), ...days];

    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }

    const monthsT = t.monthsShort ?? [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const raw = [];
    let lastMonth = -1;
    weeks.forEach((week, wIdx) => {
      const firstReal = week.find((d) => d != null);
      if (firstReal && firstReal.date.getMonth() !== lastMonth) {
        lastMonth = firstReal.date.getMonth();
        raw.push({
          col: wIdx,
          label: monthsT[lastMonth],
          year: firstReal.date.getFullYear(),
        });
      }
    });
    const monthLabels = raw.map((m, i) => ({
      ...m,
      span: (raw[i + 1]?.col ?? weeks.length) - m.col,
    }));

    return { weeks, monthLabels };
  }, [days, t]);

  const stats = useMemo(() => {
    let sober = 0, use = 0, none = 0;
    days.forEach((d) => {
      if (d.state === "sober") sober++;
      else if (d.state === "use") use++;
      else none++;
    });
    return { sober, use, none, total: days.length };
  }, [days]);

  const colorFor = (state) => {
    if (state === "use") return "#EF4444";
    if (state === "sober") return "#22C55E";
    return "transparent";
  };

  const totalWeeks = grid.weeks.length;

  return (
    <div
      style={{
        background: SU,
        borderRadius: 14,
        border: `1px solid ${BO}`,
        boxShadow: "var(--shadow-card)",
        padding: "12px 14px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
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
          {t.yearAtAGlance ?? "Year at a glance"}
        </div>
        <div
          style={{
            fontSize: 9,
            color: MU,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: "#16A34A" }}>{stats.sober}</span>
          {" · "}
          <span style={{ color: "#DC2626" }}>{stats.use}</span>
        </div>
      </div>

      {/* Month labels */}
      <div
        style={{
          display: "flex",
          gap: 2,
          marginBottom: 4,
          fontSize: 8,
          color: MU,
          fontWeight: 600,
        }}
      >
        {grid.monthLabels.map((m, i) => (
          <div
            key={i}
            style={{
              flex: `${m.span} 0 0`,
              fontSize: 8,
              color: MU,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "clip",
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {grid.weeks.map((week, wIdx) => (
          <div
            key={wIdx}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              flex: "1 0 0",
              minWidth: 0,
              aspectRatio: "1 / 7",
            }}
          >
            {week.map((cell, dIdx) => {
              if (cell === null) {
                return (
                  <div
                    key={dIdx}
                    style={{ flex: "1 0 0", background: "transparent" }}
                  />
                );
              }
              return (
                <button
                  key={dIdx}
                  onClick={() => {
                    onMonthJump?.({
                      y: cell.date.getFullYear(),
                      m: cell.date.getMonth(),
                    });
                  }}
                  title={`${cell.ds} — ${
                    cell.state === "use"
                      ? (t.usedShort ?? "Used")
                      : cell.state === "sober"
                        ? (t.sober ?? "Sober")
                        : (t.noLog ?? "No log")
                  }`}
                  style={{
                    flex: "1 0 0",
                    width: "100%",
                    background: colorFor(cell.state),
                    border: "none",
                    borderRadius: 2,
                    cursor: "pointer",
                    padding: 0,
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.4)";
                    e.currentTarget.style.zIndex = "2";
                    e.currentTarget.style.position = "relative";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.zIndex = "auto";
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 8,
          fontSize: 9,
          color: MU,
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 8, height: 8, background: "#22C55E", borderRadius: 2, display: "inline-block" }} />
          {t.sober ?? "Sober"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 8, height: 8, background: "#EF4444", borderRadius: 2, display: "inline-block" }} />
          {t.usedShort ?? "Used"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 8, height: 8, background: "var(--bg)", border: `1px solid ${BO}`, borderRadius: 2, display: "inline-block" }} />
          {t.noLog ?? "No log"}
        </span>
        <span style={{ marginLeft: "auto", fontStyle: "italic", color: MU, fontSize: 9 }}>
          {t.clickToJump ?? "Click any day to jump"}
        </span>
      </div>
    </div>
  );
}