"use client";
// Shared "all fields of one record" detail renderer.
// Used by:
//   • DayModal (calendar page) in `stacked` mode — sections one above the other
//   • LogRow (log page) in `grid` mode — auto-fit columns, more compact
//
// Both consumers pass the same `rec` and `t` props; only the `layout` differs.
// New fields added here appear on both pages automatically.

import { sc } from "../calendar/helpers";

const AD = "var(--accent-strong)";
const AL = "var(--accent-soft)";
const BG = "var(--bg)";
const BO = "var(--card-border)";
const TX = "var(--text)";
const MU = "var(--text-muted)";

// ── Helpers ────────────────────────────────────────────────────────────────

function freqLabel(rec, t) {
  const map = {
    once: t.freqOnceDaily ?? "Once",
    few_times: t.freqFewTimes ?? "Few times",
    daily: t.freqDaily ?? "Several times",
    multiple_daily: t.freqMultipleDaily ?? "Many times",
  };
  return rec.frequency ? (map[rec.frequency] ?? rec.frequency) : null;
}

function medName(med) {
  return typeof med === "object"
    ? (med.name ?? med.id ?? "Unknown")
    : String(med);
}

function medDose(med) {
  return typeof med === "object" ? (med.dosage ?? med.dose ?? null) : null;
}

// ── Section primitives ─────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        color: MU,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ label, val, color }) {
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

// ── Reusable field renderers ───────────────────────────────────────────────
// Each returns { label, content } so the parent can wrap them differently
// depending on layout mode.

function ScoreCards({ rec, t }) {
  const cards = [
    {
      label: t.mood ?? "Mood",
      val: rec.mood,
      icon: "😊",
      max: 5,
      color: "#4a7ab5",
    },
    {
      label: t.cravings ?? "Cravings",
      val: rec.cravings,
      icon: "🔥",
      max: 5,
      color: "#f4a07a",
    },
    {
      label: t.wellbeing ?? "Wellbeing",
      val: rec.wellbeing,
      icon: "💙",
      max: 5,
      color: "#9c27b0",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 8,
      }}
    >
      {cards.map((s) => (
        <div
          key={s.label}
          style={{
            background: BG,
            borderRadius: 12,
            padding: "11px 6px",
            textAlign: "center",
            border: `1px solid ${BO}`,
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1,
              color: s.val != null ? AD : MU,
            }}
          >
            {s.val != null ? s.val : "—"}
          </div>
          <div
            style={{
              fontSize: 9,
              color: MU,
              fontWeight: 700,
              letterSpacing: 0.4,
              marginTop: 2,
            }}
          >
            {s.label.toUpperCase()} / {s.max}
          </div>
          <div
            style={{
              height: 3,
              background: BO,
              borderRadius: 2,
              marginTop: 5,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: s.val != null ? `${(s.val / s.max) * 100}%` : "0%",
                height: "100%",
                background: s.color,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreCardsCompact({ rec, t }) {
  // Tighter version for log-page grid mode — no progress bar, smaller padding
  const cards = [
    { k: "mood", l: t.mood ?? "Mood" },
    { k: "cravings", l: t.cravings ?? "Cravings" },
    { k: "wellbeing", l: t.wellbeing ?? "Wellbeing" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {cards.map((s) => (
        <div
          key={s.k}
          style={{
            background: BG,
            borderRadius: 8,
            padding: "6px 9px",
            textAlign: "center",
            minWidth: 50,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: rec[s.k] != null ? AD : MU,
              lineHeight: 1,
            }}
          >
            {rec[s.k] ?? "-"}
          </div>
          <div
            style={{
              fontSize: 8,
              color: MU,
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function FrequencyAmount({ rec, t, mode }) {
  const fLabel = freqLabel(rec, t);
  if (mode === "stacked") {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Pill
          label={t.frequency ?? "Frequency"}
          val={fLabel ?? "—"}
          color="#4a7ab5"
        />
        <Pill
          label={t.amount ?? "Amount"}
          val={rec.amount != null ? rec.amount : "—"}
          color="#2d4a6e"
        />
      </div>
    );
  }
  // Grid mode — terser
  return (
    <div style={{ fontSize: 12, color: TX }}>
      {fLabel ?? "—"}
      {rec.amount != null ? ` · ${rec.amount}` : ""}
    </div>
  );
}

function Substances({ rec, t }) {
  const subs = rec.substances ?? [];
  if (subs.length === 0) {
    return (
      <span
        style={{
          background: "#22C55E22",
          color: "#16A34A",
          border: "1px solid #22C55E44",
          borderRadius: 20,
          padding: "5px 13px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {t.sober ?? "Sober"}
      </span>
    );
  }
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {subs.map((s) => (
        <span
          key={s}
          style={{
            background: sc(s) + "22",
            color: sc(s),
            border: `1px solid ${sc(s)}44`,
            borderRadius: 20,
            padding: "5px 13px",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function Medications({ rec, mode }) {
  const meds = rec.medicationsTaken ?? [];
  if (meds.length === 0) {
    return mode === "stacked" ? (
      <span style={{ fontSize: 12, color: MU }}>—</span>
    ) : null;
  }

  if (mode === "stacked") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {meds.map((med, i) => {
          const name = medName(med);
          const dose = medDose(med);
          return (
            <div
              key={i}
              style={{
                background: BG,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: `1px solid ${BO}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: TX,
                  textTransform: "capitalize",
                }}
              >
                {name}
              </div>
              {dose != null && (
                <span
                  style={{
                    fontSize: 10,
                    background: AL,
                    color: AD,
                    borderRadius: 20,
                    padding: "2px 8px",
                    fontWeight: 600,
                  }}
                >
                  {dose}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Grid mode — single-line per med
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {meds.map((med, i) => {
        const name = medName(med);
        const dose = medDose(med);
        return (
          <div
            key={i}
            style={{ fontSize: 11, color: TX, textTransform: "capitalize" }}
          >
            {name}
            {dose && (
              <span style={{ color: MU, marginLeft: 4 }}>({dose})</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SideEffects({ rec, mode }) {
  const effects = rec.sideEffects ?? [];
  if (effects.length === 0) {
    return mode === "stacked" ? (
      <span style={{ fontSize: 12, color: MU }}>—</span>
    ) : null;
  }
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {effects.map((e) => (
        <span
          key={e}
          style={{
            background: "var(--warn-soft)",
            color: "var(--warn)",
            border: "1px solid var(--warn-soft)",
            borderRadius: mode === "stacked" ? 20 : 16,
            padding: mode === "stacked" ? "5px 13px" : "2px 9px",
            fontSize: mode === "stacked" ? 12 : 11,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

function Weight({ rec, t, mode }) {
  if (rec.weight == null) {
    return mode === "stacked" ? (
      <span style={{ fontSize: 12, color: MU }}>—</span>
    ) : null;
  }
  if (mode === "stacked") {
    return (
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: AD }}>
          {rec.weight}
        </span>
        <span style={{ fontSize: 13, color: MU }}>{t.kg ?? "kg"}</span>
      </div>
    );
  }
  return (
    <span style={{ fontSize: 16, fontWeight: 700, color: AD }}>
      {rec.weight} {t.kg ?? "kg"}
    </span>
  );
}

function Note({ rec, t, mode }) {
  if (!rec.note) {
    return mode === "stacked" ? (
      <span style={{ fontSize: 12, color: MU }}>—</span>
    ) : null;
  }
  return (
    <div
      style={{
        background: AL,
        borderRadius: 10,
        padding: mode === "stacked" ? "12px 14px" : "8px 12px",
        fontSize: mode === "stacked" ? 13 : 12,
        color: TX,
        borderLeft: `3px solid var(--accent)`,
        fontStyle: "italic",
        lineHeight: mode === "stacked" ? 1.7 : 1.6,
      }}
    >
      "{rec.note}"
    </div>
  );
}

// ── Main exports ───────────────────────────────────────────────────────────

// Stacked layout — used by DayModal. Each section is full-width, vertical flow.
function StackedLayout({ rec, t }) {
  const subs = rec.substances ?? [];
  const meds = rec.medicationsTaken ?? [];
  const effects = rec.sideEffects ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <ScoreCards rec={rec} t={t} />

      <div>
        <SectionLabel>{t.frequency ?? "Frequency & Amount"}</SectionLabel>
        <FrequencyAmount rec={rec} t={t} mode="stacked" />
      </div>

      <div>
        <SectionLabel>{t.substances ?? "Substances"}</SectionLabel>
        <Substances rec={rec} t={t} />
      </div>

      <div>
        <SectionLabel>{t.medicationsTitle ?? "Medications"}</SectionLabel>
        <Medications rec={rec} mode="stacked" />
      </div>

      <div>
        <SectionLabel>{t.sideEffects ?? "Side effects"}</SectionLabel>
        <SideEffects rec={rec} mode="stacked" />
      </div>

      <div>
        <SectionLabel>{t.weight ?? "Weight"}</SectionLabel>
        <Weight rec={rec} t={t} mode="stacked" />
      </div>

      <div>
        <SectionLabel>{t.note ?? "Note"}</SectionLabel>
        <Note rec={rec} t={t} mode="stacked" />
      </div>
    </div>
  );
}

// Grid layout — used by LogRow's expanded view. Cells in auto-fit columns,
// only present sections that have data (skips empty meds/effects/weight).
function GridLayout({ rec, t }) {
  const subs = rec.substances ?? [];
  const meds = rec.medicationsTaken ?? [];
  const effects = rec.sideEffects ?? [];
  const hasFrequency = rec.frequency || rec.amount != null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 10,
        }}
      >
        <div>
          <SectionLabel>{t.scores ?? "Scores"}</SectionLabel>
          <ScoreCardsCompact rec={rec} t={t} />
        </div>

        {hasFrequency && (
          <div>
            <SectionLabel>
              {t.frequency ?? "Frequency"} & {t.amount ?? "Amount"}
            </SectionLabel>
            <FrequencyAmount rec={rec} t={t} mode="grid" />
          </div>
        )}

        {subs.length > 0 && (
          <div>
            <SectionLabel>{t.substances ?? "Substances"}</SectionLabel>
            <Substances rec={rec} t={t} />
          </div>
        )}

        {meds.length > 0 && (
          <div>
            <SectionLabel>{t.medicationsTitle ?? "Medications"}</SectionLabel>
            <Medications rec={rec} mode="grid" />
          </div>
        )}

        {effects.length > 0 && (
          <div>
            <SectionLabel>{t.sideEffects ?? "Side effects"}</SectionLabel>
            <SideEffects rec={rec} mode="grid" />
          </div>
        )}

        {rec.weight != null && (
          <div>
            <SectionLabel>{t.weight ?? "Weight"}</SectionLabel>
            <Weight rec={rec} t={t} mode="grid" />
          </div>
        )}
      </div>

      {rec.note && (
        <div style={{ marginTop: 10 }}>
          <SectionLabel>{t.note ?? "Note"}</SectionLabel>
          <Note rec={rec} t={t} mode="grid" />
        </div>
      )}
    </>
  );
}

export default function RecordDetailGrid({ rec, t, layout = "grid" }) {
  if (layout === "stacked") return <StackedLayout rec={rec} t={t} />;
  return <GridLayout rec={rec} t={t} />;
}
