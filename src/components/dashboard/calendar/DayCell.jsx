"use client";
import { A, BO, MU } from "./theme";
import { dayBg, dayScore, isSoberDay } from "./helpers";

export default function DayCell({
  day,
  ds,
  rec,
  isToday,
  soberLabel,
  onClick,
}) {
  const highCravings = rec?.cravings >= 4;
  const tookMeds = (rec?.medicationsTaken?.length ?? 0) > 0;
  const hasNote = !!rec?.note?.trim();
  const sober = isSoberDay(rec); // drives the star marker only

  // SOBER_COLOR_PARITY_2026-06-18 — match the mobile calendar: a sober day keeps
  // its score-based background color (dayBg) and is marked with the gold star,
  // rather than being forced solid green. Previously this cell overrode sober
  // days to #22C55E, so identical entries showed a different color on web vs
  // phone.
  const bg = rec ? dayBg(rec) : "transparent";
  const score = dayScore(rec);

  return (
    <div
      onClick={() => rec && onClick(ds)}
      style={{
        borderRadius: 6,
        padding: "4px 1px",
        textAlign: "center",
        cursor: rec ? "pointer" : "default",
        minHeight: 30,
        background: bg,
        border: isToday
          ? `2px solid ${A}`
          : `1px solid ${rec ? "transparent" : BO}`,
        transition: "all .1s",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: isToday ? 700 : 400,
          color: rec ? (score >= 3.5 ? "#fff" : "#1a2c3d") : MU,
          lineHeight: 1,
        }}
      >
        {day}
      </div>

      {sober && (
        <svg
          viewBox="0 0 14 14"
          width="13"
          height="13"
          role="img"
          aria-label={soberLabel}
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            pointerEvents: "none",
          }}
        >
          <title>{soberLabel}</title>
          <path
            d="M 7 0 L 8.5 5.5 L 14 7 L 8.5 8.5 L 7 14 L 5.5 8.5 L 0 7 L 5.5 5.5 Z"
            fill="#d4a017"
            stroke="#8a6a0e"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {tookMeds && (
        <img
          src="/ico_medicine.png"
          alt="medication taken"
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 13,
            height: 13,
            objectFit: "contain",
          }}
        />
      )}

      {highCravings && (
        <span
          style={{
            position: "absolute",
            bottom: -4,
            left: -4,
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          🔥
        </span>
      )}

      {hasNote && (
        <svg
          viewBox="0 0 20 20"
          style={{
            position: "absolute",
            bottom: -4,
            right: -4,
            width: 13,
            height: 13,
          }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="16" height="12" rx="3" fill="#4a7ab5" />
          <path d="M5 16 L8 13 H2 Q2 16 5 16Z" fill="#4a7ab5" />
          <rect
            x="5"
            y="5.5"
            width="10"
            height="1.5"
            rx="0.75"
            fill="white"
            opacity="0.9"
          />
          <rect
            x="5"
            y="8.5"
            width="7"
            height="1.5"
            rx="0.75"
            fill="white"
            opacity="0.9"
          />
        </svg>
      )}
    </div>
  );
}