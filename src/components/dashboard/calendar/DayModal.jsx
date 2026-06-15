"use client";
// Per-day detail modal — opens when a logged calendar day is clicked.
// Shows mood/cravings/wellbeing scores, frequency/amount pills, substances,
// medications, side effects, weight, and the patient's note.
import { AD, AL, BG, BO, MU, SU, TX } from "./theme";
import { sc } from "./helpers";
import { Section, Pill } from "./Section";

export default function DayModal({ date, rec, onClose, t }) {
  if (!rec) return null;

 
const subs = (rec.substances ?? []).filter(s => s !== "sober");
  const effects = rec.sideEffects ?? [];
  const meds = rec.medicationsTaken ?? [];

  const freqLabel = {
    once: t.freqOnceDaily ?? "Once",
    few_times: t.freqFewTimes ?? "Few times",
    daily: t.freqDaily ?? "Several times",
    multiple_daily: t.freqMultipleDaily ?? "Many times",
  };

  const scoreCards = [
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
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,30,50,0.6)",
        backdropFilter: "blur(5px)",
        zIndex: 100,
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
            background: `linear-gradient(135deg, var(--accent), var(--accent-strong))`,
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
                color: "rgba(255,255,255,0.65)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {t.dailyLog ?? "Daily log"}
            </div>
            <div style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>
              {date}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
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
          {/* Score cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {scoreCards.map((s) => (
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

          {/* Frequency & Amount */}
          <Section title={t.frequency ?? "Frequency & Amount"}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill
                label={t.frequency ?? "Frequency"}
                val={
                  rec.frequency
                    ? (freqLabel[rec.frequency] ?? rec.frequency)
                    : "—"
                }
                color="#4a7ab5"
              />
              <Pill
                label={t.amount ?? "Amount"}
                val={rec.amount != null ? rec.amount : "—"}
                color="#2d4a6e"
              />
            </div>
          </Section>

          {/* Substances */}
          <Section title={t.substances ?? "Substances"}>
            {subs.length > 0 ? (
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
                    {t[s] ?? s}
                  </span>
                ))}
              </div>
            ) : (
              <span
                style={{
                  background: "#22C55E22",
                  color: "#16A34A",
                  border: "1px solid #22C55E88",
                  borderRadius: 20,
                  padding: "5px 13px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {t.sober ?? "Sober"}
              </span>
            )}
          </Section>

          {/* Medications */}
          <Section title={t.medicationsTitle ?? "Medications"}>
            {meds.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {meds.map((med, i) => {
                  const name =
                    typeof med === "object"
                      ? (med.name ?? med.id ?? "Unknown")
                      : String(med);
                  const dose =
                    typeof med === "object"
                      ? (med.dosage ?? med.dose ?? null)
                      : null;
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
            ) : (
              <span style={{ fontSize: 12, color: MU }}>—</span>
            )}
          </Section>

          {/* Side effects */}
          <Section title={t.sideEffects ?? "Side effects"}>
            {effects.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {effects.map((e) => (
                  <span
                    key={e}
                    style={{
                      background: "var(--warn-soft)",
                      color: "var(--warn)",
                      border: "1px solid var(--warn-soft)",
                      borderRadius: 20,
                      padding: "5px 13px",
                      fontSize: 12,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 12, color: MU }}>—</span>
            )}
          </Section>

          {/* Weight */}
          <Section title={t.weight ?? "Weight"}>
            {rec.weight ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: AD }}>
                  {rec.weight}
                </span>
                <span style={{ fontSize: 13, color: MU }}>{t.kg ?? "kg"}</span>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: MU }}>—</span>
            )}
          </Section>

          {/* Note */}
          <Section title={t.note ?? "Note"}>
            {rec.note ? (
              <div
                style={{
                  background: AL,
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 13,
                  color: TX,
                  borderLeft: `3px solid var(--accent)`,
                  fontStyle: "italic",
                  lineHeight: 1.7,
                }}
              >
                "{rec.note}"
              </div>
            ) : (
              <span style={{ fontSize: 12, color: MU }}>—</span>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
