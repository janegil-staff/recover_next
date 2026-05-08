"use client";
// Detail modal for a single questionnaire (GAD-7, PHQ-9, AUDIT, etc).
// Shows total score + severity at the top, then each question with its answer
// circled in a severity color (0=green, 1=orange, 2=red-orange, 3=red).
import { BG, BO, MU, SU, TX } from "./theme";
import { Q_DETAILS, SCORE_LABELS } from "./constants";
import { scoreTotal, qVal } from "./helpers";

export default function QuestionnaireModal({ qKey, data, onClose }) {
  const def = Q_DETAILS[qKey];
  if (!def || !data[qKey]) return null;

  const rec = data[qKey];
  const total = scoreTotal(rec);
  const sev = def.sev(total);
  const pct = Math.min(100, (total / def.max) * 100);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,30,50,0.6)",
        backdropFilter: "blur(5px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: SU,
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-elevated)",
          border: `1px solid ${BO}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg,${def.color},${def.color}cc)`,
            borderRadius: "20px 20px 0 0",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Questionnaire
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>
              {def.label}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Summary banner */}
          <div
            style={{
              background: def.color + "10",
              border: `1px solid ${def.color}30`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  background: BG,
                  borderRadius: 3,
                  overflow: "hidden",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: def.color,
                    borderRadius: 3,
                    transition: "width .4s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: def.color, fontWeight: 700 }}>
                {sev}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: def.color,
                  lineHeight: 1,
                }}
              >
                {total}
              </div>
              <div style={{ fontSize: 10, color: MU, fontWeight: 600 }}>
                / {def.max}
              </div>
            </div>
          </div>

          {/* Question list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {def.questions.map(({ key, label }, qi) => {
              const val = qVal(rec, key, qi);
              const scoreColor =
                val === 0
                  ? "#4caf50"
                  : val === 1
                    ? "#ff9800"
                    : val === 2
                      ? "#ff5722"
                      : "#f44336";
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "9px 0",
                    borderBottom: `1px solid ${BG}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: TX,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: 10, color: MU, marginTop: 2 }}>
                      {SCORE_LABELS[val] ?? "—"}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: scoreColor,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {val}
                  </div>
                </div>
              );
            })}
          </div>

          {rec.date && (
            <div style={{ fontSize: 10, color: MU, textAlign: "right" }}>
              Recorded: {rec.date}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
