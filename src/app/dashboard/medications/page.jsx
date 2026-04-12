// src/app/dashboard/medications/page.jsx
"use client";
import { useState } from "react";
import { useDashboardT } from "../LangContext";

const A = "#4a7ab5",
  AD = "#2d4a6e",
  AL = "#dde8f4",
  BG = "#eef2f7",
  SU = "#ffffff",
  BO = "#d0dcea",
  TX = "#1a2c3d",
  MU = "#7a9ab8";

function Card({ title, children }) {
  return (
    <div
      style={{
        background: SU,
        borderRadius: 14,
        border: `1px solid ${BO}`,
        padding: 18,
        boxShadow: "0 2px 8px rgba(74,122,181,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: A,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export default function MedicationsPage() {
  const t = useDashboardT();

  const [data] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("patientData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  if (!data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  const medicines = data.medicines ?? [];
  const weights = (data.records ?? [])
    .filter((r) => r.weight)
    .map((r) => ({ d: fmtDate(r.date ?? r.createdAt), w: r.weight }));
  const latestW = weights[weights.length - 1];
  const bmi =
    latestW && data.height
      ? (latestW.w / (data.height / 100) ** 2).toFixed(1)
      : null;

  // Build medication usage history from records
  const medHistory = {};
  (data.records ?? []).forEach((r) => {
    (r.medicationsTaken ?? []).forEach((med) => {
      const name = typeof med === "object" ? (med.name ?? med.id) : med;
      const date = fmtDate(r.date ?? r.createdAt);
      if (!medHistory[name]) medHistory[name] = [];
      medHistory[name].push({
        date,
        dose: typeof med === "object" ? (med.dosage ?? med.dose ?? null) : null,
      });
    });
  });

  const timesLogged = (n) => `(${n} ${t.days ?? "times"})`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Prescribed medications */}
      <Card title={t.prescribedMeds ?? "Prescribed medications"}>
        {medicines.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {medicines.map((med, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: BG,
                  borderRadius: 10,
                  border: `1px solid ${BO}`,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: AL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  💊
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: AD,
                      textTransform: "capitalize",
                    }}
                  >
                    {med.name ?? med.id}
                  </div>
                  {med.dosage && (
                    <div style={{ fontSize: 11, color: MU, marginTop: 1 }}>
                      {med.dosage}
                    </div>
                  )}
                  {med.frequency && (
                    <div style={{ fontSize: 10, color: MU, marginTop: 1 }}>
                      {med.frequency}
                    </div>
                  )}
                </div>
                {med.atcCode && (
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
                    {med.atcCode}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: MU }}>
            {t.noMedications ?? "No prescribed medications registered."}
          </p>
        )}
      </Card>

      {/* Medication usage history */}
      {Object.keys(medHistory).length > 0 && (
        <Card title={t.medicationHistory ?? "Medication usage history"}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(medHistory).map(([name, entries]) => (
              <div key={name}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: AD,
                    textTransform: "capitalize",
                    marginBottom: 6,
                  }}
                >
                  {name}{" "}
                  <span style={{ fontSize: 10, color: MU, fontWeight: 400 }}>
                    {timesLogged(entries.length)}
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {entries.slice(-10).map((e, i) => (
                    <div
                      key={i}
                      style={{
                        background: BG,
                        border: `1px solid ${BO}`,
                        borderRadius: 8,
                        padding: "4px 8px",
                        fontSize: 10,
                      }}
                    >
                      <span style={{ color: MU }}>{e.date}</span>
                      {e.dose && (
                        <span
                          style={{ color: AD, fontWeight: 600, marginLeft: 4 }}
                        >
                          {e.dose}
                        </span>
                      )}
                    </div>
                  ))}
                  {entries.length > 10 && (
                    <span
                      style={{ fontSize: 10, color: MU, alignSelf: "center" }}
                    >
                      +{entries.length - 10} {t.readMore ?? ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weight & BMI */}
      <Card title={t.weightBmi ?? "Weight & BMI"}>
        {latestW ? (
          <>
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: AD,
                    lineHeight: 1,
                  }}
                >
                  {latestW.w}
                </div>
                <div style={{ fontSize: 11, color: MU }}>{t.kg ?? "kg"}</div>
              </div>
              {bmi && (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 800,
                      color: A,
                      lineHeight: 1,
                    }}
                  >
                    {bmi}
                  </div>
                  <div style={{ fontSize: 11, color: MU }}>
                    {t.bmi ?? "BMI"}
                  </div>
                </div>
              )}
              {data.height && (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: MU,
                      lineHeight: 1,
                    }}
                  >
                    {data.height}
                  </div>
                  <div style={{ fontSize: 11, color: MU }}>cm</div>
                </div>
              )}
            </div>
            {weights.length > 1 && (
              <div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: MU,
                    letterSpacing: 0.5,
                    marginBottom: 8,
                  }}
                >
                  {(t.weightHistory ?? "Weight history").toUpperCase()}
                </div>
                {weights
                  .slice(-10)
                  .reverse()
                  .map((w, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: `1px solid ${BG}`,
                      }}
                    >
                      <span style={{ fontSize: 12, color: MU }}>{w.d}</span>
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: AD }}
                      >
                        {w.w} {t.kg ?? "kg"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ fontSize: 12, color: MU }}>
            {t.noWeight ?? "No weight data logged."}
          </p>
        )}
      </Card>
    </div>
  );
}
