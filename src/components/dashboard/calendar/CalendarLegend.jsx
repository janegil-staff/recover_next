"use client";
// Small icon legend below the calendar grid.
// Mirrors the badges rendered by DayCell — keep them in sync if you add more.
import { MU } from "./theme";

export default function CalendarLegend({ t, soberLabel }) {
  return (
    <div
      style={{
        padding: "0 14px 10px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px 12px",
        fontSize: 10,
        color: MU,
      }}
    >
      {/* Sober — top-left */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
          <path
            d="M 7 0 L 8.5 5.5 L 14 7 L 8.5 8.5 L 7 14 L 5.5 8.5 L 0 7 L 5.5 5.5 Z"
            fill="#d4a017"
            stroke="#8a6a0e"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </svg>
        <span>{soberLabel}</span>
      </div>

      {/* Medication — top-right */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <img
          src="/ico_medicine.png"
          alt=""
          style={{ width: 11, height: 11, objectFit: "contain" }}
        />
        <span>{t.medicationsTaken ?? t.medicationsTitle ?? "Medication"}</span>
      </div>

      {/* High cravings — bottom-left */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 11, lineHeight: 1 }} aria-hidden="true">
          🔥
        </span>
        <span>{t.highCravings ?? "High cravings"}</span>
      </div>

      {/* Note — bottom-right */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg
          viewBox="0 0 20 20"
          width="11"
          height="11"
          fill="none"
          aria-hidden="true"
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
        <span>{t.note ?? "Note"}</span>
      </div>
    </div>
  );
}
