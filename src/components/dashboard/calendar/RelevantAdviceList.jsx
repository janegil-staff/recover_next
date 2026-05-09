"use client";
// Renders the relevantAdvice array surfaced to the patient in the mobile app.
// IDs look like "m1, m3, r1, w2, med2, s2" — the prefix is the trigger
// category (mood / recovery / wellbeing / medication / sleep / cravings) and
// the number identifies the underlying advice topic. Multiple entries may
// share a numeric topic (m1 and r1 both → topic 1) — we keep them BOTH because
// the prefix tells the doctor *why* the advice was surfaced. The category
// badge replaces what would otherwise look like a duplicate.
//
// Translation keys are numeric: advice_${nid}_title, advice_${nid}_body.
// Category labels live at categoryMood, categoryRecovery, etc.
import { BO, MU, TX } from "./theme";

function parseAdviceFull(raw) {
  const str = String(raw).trim();
  const m = str.match(/^([a-zA-Z]+)?(\d+)/);
  if (!m) return { prefix: "", nid: str };
  return { prefix: (m[1] ?? "").toLowerCase(), nid: m[2] };
}

const CATEGORIES = {
  m: { labelKey: "categoryMood", fallback: "Mood", color: "#4a7ab5" },
  r: { labelKey: "categoryRecovery", fallback: "Recovery", color: "#059669" },
  w: { labelKey: "categoryWellbeing", fallback: "Wellbeing", color: "#9c27b0" },
  med: { labelKey: "categoryMedication", fallback: "Medication", color: "#0891B2" },
  s: { labelKey: "categorySleep", fallback: "Sleep", color: "#7c3aed" },
  c: { labelKey: "categoryCravings", fallback: "Cravings", color: "#f4a07a" },
};

export default function RelevantAdviceList({ data, t }) {
  const adviceIds = data?.relevantAdvice ?? [];

  if (adviceIds.length === 0) {
    return (
      <div
        style={{
          fontSize: 11,
          color: MU,
          fontStyle: "italic",
          padding: "8px 0",
        }}
      >
        {t.noAdvice ?? "No advice surfaced for this patient yet."}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {adviceIds.map((rawId, i) => {
        const { prefix, nid } = parseAdviceFull(rawId);
        const cat = CATEGORIES[prefix] ?? null;
        const title =
          t[`advice_${nid}_title`] ?? `${t.advice ?? "Advice"} ${nid}`;
        const body = t[`advice_${nid}_body`] ?? null;
        const accentColor = cat?.color ?? "var(--accent)";
        const categoryLabel = cat
          ? (t[cat.labelKey] ?? cat.fallback)
          : null;
        return (
          <div
            key={`${rawId}-${i}`}
            style={{
              padding: "8px 10px",
              background: "var(--bg)",
              borderRadius: 8,
              borderLeft: `3px solid ${accentColor}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 2,
              }}
            >
              {categoryLabel && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: "#fff",
                    background: accentColor,
                    padding: "1px 5px",
                    borderRadius: 3,
                    flexShrink: 0,
                  }}
                >
                  {categoryLabel}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: "var(--accent-strong)",
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                {i + 1}. {title}
              </span>
            </div>
            {body && (
              <div
                style={{
                  fontSize: 11,
                  color: TX,
                  marginTop: 4,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}