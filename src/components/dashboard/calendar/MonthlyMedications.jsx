"use client";
// Prescribed-medications pills + monthly intake bar list.
// Two sections: profile-level prescribed list, then per-medication day counts.
import { useMemo } from "react";
import { A, AD, AL, BG, BO, MU, TX } from "./theme";

const MED_BAR_COLOR = "#42a5f5";

export default function MonthlyMedications({
  monthRecs,
  profileMeds,
  monthLabel,
  t,
}) {
  const monthMedCounts = useMemo(() => {
    const c = {};
    monthRecs.forEach((r) =>
      (r.medicationsTaken ?? []).forEach((med) => {
        const name =
          typeof med === "object"
            ? (med.name ?? med.id ?? "Unknown")
            : String(med);
        c[name] = (c[name] ?? 0) + 1;
      }),
    );
    return Object.entries(c).sort((a, b) => b[1] - a[1]);
  }, [monthRecs]);

  const max = monthMedCounts[0]?.[1] ?? 0;

  return (
    <div style={{ borderTop: `1px solid ${BO}`, padding: "10px 14px" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: A,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {t.myMedications ?? "Medications"} — {monthLabel}
      </div>

      {profileMeds.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: MU,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t.prescribed ?? "Prescribed"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {profileMeds.map((name) => (
              <span
                key={name}
                style={{
                  background: AL,
                  color: AD,
                  border: `1px solid ${BO}`,
                  borderRadius: 20,
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: MU,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t.takenThisMonth ?? "Taken this month"}
        </div>
        {monthMedCounts.length === 0 ? (
          <span style={{ fontSize: 12, color: MU }}>
            {t.noMedsLogged ?? "No medications logged this month"}
          </span>
        ) : (
          monthMedCounts.map(([name, n]) => (
            <div key={name} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: MED_BAR_COLOR,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: TX,
                      textTransform: "capitalize",
                      fontWeight: 500,
                    }}
                  >
                    {name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: MED_BAR_COLOR,
                  }}
                >
                  {n} {t.days ?? "days"}
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: BG,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(n / max) * 100}%`,
                    height: "100%",
                    background: MED_BAR_COLOR,
                    borderRadius: 3,
                    transition: "width .4s ease",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
