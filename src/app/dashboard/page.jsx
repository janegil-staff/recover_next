"use client";
// src/app/dashboard/page.jsx — Calendar tab.
// Pure orchestration: load patient data, manage month/modal state, lay out
// the cards. All UI lives in @/components/dashboard/calendar.
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "./LangContext";

import { BO, MU } from "@/components/dashboard/calendar/theme";
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
import Collapsible from "@/components/dashboard/Collapsible";
import RelevantAdviceList from "@/components/dashboard/calendar/RelevantAdviceList";

// ── Section wayfinding label ─────────────────────────────────────────────
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

  // Collapsible badge counts
  const substanceCount = useMemo(
    () =>
      monthRecs.reduce(
        (n, r) => n + ((r.substances ?? []).length > 0 ? 1 : 0),
        0,
      ),
    [monthRecs],
  );
  const medicationCount = useMemo(
    () =>
      monthRecs.reduce(
        (n, r) => n + ((r.medicationsTaken ?? []).length > 0 ? 1 : 0),
        0,
      ),
    [monthRecs],
  );

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
        .cal-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
        @media(max-width:720px){
          .cal-grid{grid-template-columns:1fr}
        }
        .qrow:hover { background: var(--accent-soft); }
        .dash-section + .dash-section { margin-top: 28px; }
        .secondary-card {
          background: var(--card);
          border-radius: 14px;
          border: 1px solid var(--card-border);
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

      {/* ── SELECTED MONTH — calendar (left) + all collapsibles (right) ── */}
      <div className="dash-section">
        <SectionLabel>
          {monthLabel} {month.y}
        </SectionLabel>

        <div className="cal-grid">
          {/* ── Left column: Calendar only ── */}
          <div>
            <div className="secondary-card">
              <CalendarGrid
                month={month}
                recMap={recMap}
                onMonthChange={setMonth}
                onDayClick={setModalDate}
                t={t}
              />
            </div>
          </div>

          {/* ── Right column: All collapsibles in priority order ── */}
          <div>
            <Collapsible
              id="monthly-trends"
              title={t.monthlyTrends ?? "Monthly Averages"}
              badge={
                monthRecs.length === 0
                  ? (t.noneThisMonth ?? "none this month")
                  : `${monthRecs.length} ${t.daysLogged ?? "days logged"}`
              }
            >
              <MonthlyTrendsCard monthRecs={monthRecs} t={t} />
            </Collapsible>

            <Collapsible
              id="questionnaires"
              title={t.questionnaires ?? "Questionnaires"}
            >
              <QuestionnairesList data={data} onOpen={setQModal} />
            </Collapsible>

            <Collapsible
              id="relevant-advice"
              title={t.relevantAdvice ?? "Relevant Advice"}
              badge={
                (data.relevantAdvice ?? []).length === 0
                  ? (t.noneSurfaced ?? "none surfaced")
                  : `${[...new Set(data.relevantAdvice)].length} ${t.items ?? "items"}`
              }
            >
              <RelevantAdviceList data={data} t={t} />
            </Collapsible>

            <Collapsible
              id="substances"
              title={t.substancesUsed ?? "Substances"}
              badge={
                substanceCount === 0
                  ? (t.noneThisMonth ?? "none this month")
                  : `${substanceCount} ${
                      substanceCount === 1
                        ? (t.daySingular ?? "day")
                        : (t.daysPlural ?? "days")
                    }`
              }
            >
              <MonthlySubstances
                monthRecs={monthRecs}
                monthLabel={monthLabel}
                t={t}
              />
            </Collapsible>

            <Collapsible
              id="medications"
              title={t.medicationsTitle ?? "Medications"}
              badge={
                profileMeds.length === 0
                  ? (t.noneThisMonth ?? "none this month")
                  : medicationCount === 0
                    ? `${profileMeds.length} ${t.prescribed ?? "prescribed"}`
                    : `${profileMeds.length} ${t.prescribed ?? "prescribed"} · ${medicationCount} ${
                        medicationCount === 1
                          ? (t.daySingular ?? "day")
                          : (t.daysPlural ?? "days")
                      } ${t.takenLower ?? "taken"}`
              }
            >
              <MonthlyMedications
                monthRecs={monthRecs}
                profileMeds={profileMeds}
                monthLabel={monthLabel}
                t={t}
              />
            </Collapsible>
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