"use client";
// Chip row for filtering the log list. Each chip shows a count.
// Active chip's color matches the category (red for use days, green for sober, etc.).
import { AD, BO, SU } from "../calendar/theme";

const A_FALLBACK = "var(--accent)";

export default function FilterChips({ activeFilter, setFilter, counts, t }) {
  const chips = [
    { key: "all", label: t.filterAll ?? "All", count: counts.all },
    {
      key: "useDays",
      label: t.filterUseDays ?? "Use days",
      count: counts.useDays,
      color: "#DC2626",
    },
    {
      key: "soberDays",
      label: t.filterSoberDays ?? "Sober days",
      count: counts.soberDays,
      color: "#16A34A",
    },
    {
      key: "highCravings",
      label: t.filterHighCravings ?? "Cravings ≥4",
      count: counts.highCravings,
      color: "#FB923C",
    },
    {
      key: "notes",
      label: t.filterNotes ?? "With notes",
      count: counts.notes,
      color: "#4a7ab5",
    },
    {
      key: "sideEffects",
      label: t.filterSideEffects ?? "Side effects",
      count: counts.sideEffects,
      color: "#7C3AED",
    },
    {
      key: "milestones",
      label: t.filterMilestones ?? "Milestones",
      count: counts.milestones,
      color: "#16A34A",
    },
  ];

  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}
    >
      {chips.map((chip) => {
        const active = activeFilter === chip.key;
        const baseColor = chip.color ?? A_FALLBACK;
        return (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            style={{
              background: active ? baseColor : SU,
              color: active ? "#fff" : (chip.color ?? AD),
              border: `1px solid ${active ? baseColor : BO}`,
              borderRadius: 18,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .12s",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {chip.label}
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                opacity: active ? 0.85 : 0.6,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
