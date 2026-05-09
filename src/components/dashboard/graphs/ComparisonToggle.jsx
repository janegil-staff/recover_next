"use client";
// Small toggle next to the range selector. When active, charts that support
// comparison render a "vs prior period" delta.
import { MU_VAR, SU_VAR, BO_VAR } from "./theme";

export default function ComparisonToggle({ active, onChange, t }) {
  return (
    <button
      onClick={() => onChange(!active)}
      style={{
        background: active ? "var(--accent)" : SU_VAR,
        color: active ? "#fff" : MU_VAR,
        border: `1px solid ${active ? "var(--accent)" : BO_VAR}`,
        borderRadius: 20,
        padding: "5px 14px",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all .15s",
        marginLeft: 8,
      }}
    >
      {active ? "✓ " : ""}
      {t.compareVsPrior ?? "vs prior period"}
    </button>
  );
}