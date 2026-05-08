"use client";
// Calendar grid card: month nav, weekday header row, day cells, and legend.
// Pure presentational — receives {month, recMap, onMonthChange, onDayClick, t}.
import { A, BO, MU } from "./theme";
import { fmtDate, daysInMonth, firstDow, pad } from "./helpers";
import DayCell from "./DayCell";
import CalendarLegend from "./CalendarLegend";

export default function CalendarGrid({
  month,
  recMap,
  onMonthChange,
  onDayClick,
  t,
}) {
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
  const weekdays = t.weekdays ?? ["M", "T", "W", "T", "F", "S", "S"];
  const soberLabel = t.sober ?? "Sober";

  const { y, m } = month;
  const days = daysInMonth(y, m);
  const firstDay = firstDow(y, m);
  const todayStr = fmtDate(new Date());

  const navBtnStyle = {
    background: "none",
    border: `1px solid ${BO}`,
    borderRadius: 6,
    width: 26,
    height: 26,
    cursor: "pointer",
    color: MU,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  };

  return (
    <>
      {/* Month nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 8px",
        }}
      >
        <button
          onClick={() => {
            const d = new Date(y, m - 1);
            onMonthChange({ y: d.getFullYear(), m: d.getMonth() });
          }}
          style={navBtnStyle}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: A,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {months[m]} {y}
        </span>
        <button
          onClick={() => {
            const d = new Date(y, m + 1);
            onMonthChange({ y: d.getFullYear(), m: d.getMonth() });
          }}
          style={navBtnStyle}
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          padding: "0 10px",
          gap: 2,
        }}
      >
        {weekdays.map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 9,
              fontWeight: 700,
              color: MU,
              paddingBottom: 3,
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          padding: "0 10px 10px",
          gap: 2,
        }}
      >
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = `${y}-${pad(m + 1)}-${pad(day)}`;
          return (
            <DayCell
              key={day}
              day={day}
              ds={ds}
              rec={recMap[ds]}
              isToday={ds === todayStr}
              soberLabel={soberLabel}
              onClick={onDayClick}
            />
          );
        })}
      </div>

      <CalendarLegend t={t} soberLabel={soberLabel} />
    </>
  );
}
