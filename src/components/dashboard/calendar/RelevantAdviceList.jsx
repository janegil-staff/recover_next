"use client";
// Renders the relevantAdvice array surfaced to the patient in the mobile app.
// Each entry is an ID string; the title and body live in translations under
// keys `advice_${id}_title` and `advice_${id}_body`. Falls back gracefully
// if the body translation is missing (some advice pieces are title-only).
import { BO, MU, TX } from "./theme";

function parseAdviceId(raw) {
  const m = String(raw).match(/(\d+)/);
  return m ? m[1] : String(raw);
}

export default function RelevantAdviceList({ data, t }) {
  const adviceIds = [...new Set(data?.relevantAdvice ?? [])];

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
      {adviceIds.map((id, i) => {
        const nid = parseAdviceId(id);
        const title = t[`advice_${nid}_title`] ?? `${t.advice ?? "Advice"} ${nid}`;
        const body = t[`advice_${nid}_body`] ?? null;
        return (
          <div
            key={id}
            style={{
              padding: "8px 10px",
              background: "var(--bg)",
              borderRadius: 8,
              borderLeft: `3px solid var(--accent)`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--accent-strong)",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {i + 1}. {title}
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