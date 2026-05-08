"use client";
// Small layout primitives shared by DayModal (and potentially other modals).
import { MU } from "./theme";

export function Section({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: MU,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export function Pill({ label, val, color }) {
  return (
    <div
      style={{
        background: color + "18",
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: "8px 14px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
      <div style={{ fontSize: 9, color: MU, fontWeight: 600, marginTop: 1 }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}
