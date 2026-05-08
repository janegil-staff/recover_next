"use client";
// src/app/dashboard/page.jsx — Calendar tab.
// Pure orchestration: load patient data, manage month/modal state, lay out
// the cards. All UI lives in @/components/dashboard/calendar.
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "./LangContext";

import { BO, MU, SU } from "@/components/dashboard/calendar/theme";
import { fmtDate, pad } from "@/components/dashboard/calendar/helpers";
import WellnessIndex from "@/components/dashboard/calendar/WellnessIndex";
import CalendarGrid from "@/components/dashboard/calendar/CalendarGrid";
import MonthlySubstances from "@/components/dashboard/calendar/MonthlySubstances";
import MonthlyMedications from "@/components/dashboard/calendar/MonthlyMedications";
import MonthlyTrendsCard from "@/components/dashboard/calendar/MonthlyTrendsCard";
import QuestionnairesList from "@/components/dashboard/calendar/QuestionnairesList";
import DayModal from "@/components/dashboard/calendar/DayModal";
import QuestionnaireModal from "@/components/dashboard/calendar/QuestionnaireModal";
import StreakComparison from "@/components/dashboard/StreakComparison";

const A = "var(--accent)";
const AD = "var(--accent-strong)";
const AL = "var(--accent-soft)";

// ── Section wayfinding label ─────────────────────────────────────────────
// A small uppercase header that groups cards into "thoughts" the eye can
// process one at a time. Quiet enough to not compete with the cards below.
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: MU,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}

export default function CalendarPage() {
  const t = useDashboardT();

  // Hydration-safe data load: same loading state on server + first client
  // render, then populate from sessionStorage in an effect.
  const [data, setData] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("patientData");
      setData(raw ? JSON.parse(raw) : null);
    } catch {
      setData(null);
    }
    setHydrated(true);
  }, []);

  const [month, setMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [modalDate, setModalDate] = useState(null);
  const [qModal, setQModal] = useState(null);

  const months = t.months ?? [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const recMap = useMemo(() => {
    if (!data) return {};
    const m = {};
    (data.records ?? []).forEach((r) => {
      m[fmtDate(r.date ?? r.createdAt)] = r;
    });
    return m;
  }, [data]);

  const monthRecs = useMemo(() => {
    if (!data) return [];
    const prefix = `${month.y}-${pad(month.m + 1)}`;
    return (data.records ?? []).filter((r) =>
      fmtDate(r.date ?? r.createdAt).startsWith(prefix),
    );
  }, [data, month]);

  const profileMeds = useMemo(() => {
    return (data?.medicines ?? data?.medications ?? [])
      .map((m) =>
        typeof m === "object" ? (m.name ?? m.id ?? String(m)) : String(m),
      )
      .filter(Boolean);
  }, [data]);

  if (!hydrated || !data)
    return (
      <div
        suppressHydrationWarning
        style={{ padding: 40, textAlign: "center", color: MU }}
      >
        {t.loading ?? "Loading…"}
      </div>
    );

  const monthLabel = months[month.m];

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <style>{`
        .cal-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch}
        @media(max-width:720px){
          .cal-grid{grid-template-columns:1fr}
        }
        .qrow:hover { background: var(--accent-soft); }

        /* Vertical rhythm — a single class for major section gaps so spacing
           changes touch one line, not many. */
        .dash-section + .dash-section { margin-top: 28px; }

        /* Slightly soften secondary cards so the wellness card reads as
           the dominant element. Uses color-mix so it adapts to dark mode. */
        .secondary-card {
          background: var(--card);
          border-radius: 14px;
          border: 1px solid color-mix(in srgb, var(--card-border) 65%, transparent);
          box-shadow: var(--shadow-card);
          overflow: hidden;
        }
      `}</style>

      {/* ── SNAPSHOT — wellness index + streak comparison ── */}
      <div className="dash-section">
        <SectionLabel>{t.sectionSnapshot ?? "Snapshot"}</SectionLabel>
        <WellnessIndex data={data} t={t} month={month} />
        <StreakComparison data={data} t={t} />
      </div>

      {/* ── THIS MONTH — calendar + monthly trends + questionnaires ── */}
      <div className="dash-section">
        <SectionLabel>
          {t.sectionSelectedMonth ?? "Selected month"} · {monthLabel} {month.y}
        </SectionLabel>
        <div className="cal-grid">
          {/* Calendar + substances + medications stacked in left column */}
          <div className="secondary-card">
            <CalendarGrid
              month={month}
              recMap={recMap}
              onMonthChange={setMonth}
              onDayClick={setModalDate}
              t={t}
            />
            <MonthlySubstances
              monthRecs={monthRecs}
              monthLabel={monthLabel}
              t={t}
            />
            <MonthlyMedications
              monthRecs={monthRecs}
              profileMeds={profileMeds}
              monthLabel={monthLabel}
              t={t}
            />
          </div>

          {/* Right column: Monthly Averages + Questionnaires */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="secondary-card" style={{ flex: 1 }}>
              {/* Monthly Averages */}
              <div style={{ padding: "12px 14px 10px" }}>
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
                  {t.monthlyTrends ?? "Monthly Averages"}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 12,
                    padding: "6px 10px",
                    background: AL,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: A,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: AD }}>
                    {monthRecs.length}{" "}
                    <span style={{ fontWeight: 500, color: MU }}>
                      {t.daysLogged ?? "days logged"}
                    </span>
                  </span>
                </div>
                <MonthlyTrendsCard monthRecs={monthRecs} t={t} />
              </div>

              <div style={{ borderTop: `1px solid ${BO}` }} />

              {/* Questionnaires */}
              <div style={{ padding: "12px 14px 4px" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: A,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {t.questionnaires ?? "Questionnaires"}
                </div>
              </div>
              <QuestionnairesList data={data} onOpen={setQModal} />
            </div>
          </div>
        </div>
      </div>

      {modalDate && recMap[modalDate] && (
        <DayModal
          date={modalDate}
          rec={recMap[modalDate]}
          onClose={() => setModalDate(null)}
          t={t}
        />
      )}
      {qModal && (
        <QuestionnaireModal
          qKey={qModal}
          data={data}
          onClose={() => setQModal(null)}
        />
      )}
    </div>
  );
}
