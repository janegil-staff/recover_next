"use client";
// Shared chrome for graph charts: SectionLabel, Card, Insight, CustomTooltip.
// All four are pure presentation, no chart logic.
import { MU_VAR, AD_VAR, SU_VAR, BO_VAR } from "../theme";
// ── Section label — tells the doctor what they're looking at ──
export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: MU_VAR,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        marginBottom: 10,
        marginTop: 20,
      }}
    >
      {children}
    </div>
  );
}

// ── Card with consistent chrome ──
export function Card({ title, subtitle, children, style }) {
  return (
    <div
      style={{
        background: SU_VAR,
        borderRadius: 14,
        border: `1px solid ${BO_VAR}`,
        padding: 20,
        boxShadow: "var(--shadow-card)",
        marginBottom: 16,
        ...style,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: AD_VAR }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: MU_VAR, marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Insight caption — small italic finding line at the bottom of a chart ──
// `tone` tints the line: positive=green, warning=amber, neutral=muted
export function Insight({ text, tone = "neutral" }) {
  if (!text) return null;
  const color =
    tone === "positive"
      ? "#16A34A"
      : tone === "warning"
        ? "#D97706"
        : MU_VAR;
  return (
    <div
      style={{
        marginTop: 12,
        paddingTop: 10,
        borderTop: `1px solid ${BO_VAR}`,
        fontSize: 11,
        color,
        fontStyle: "italic",
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

// ── Tooltip used by line/bar charts that need richer formatting ──
export function CustomTooltip({ active, payload, label, c }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: c.accentStrong,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 3,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
            }}
          />
          <span style={{ fontSize: 11, color: c.text }}>{p.name}:</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.accentStrong }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}