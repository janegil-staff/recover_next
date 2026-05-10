// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";
import { useTheme } from "@/context/ThemeContext";

import WeightChart from "@/components/dashboard/graphs/charts/WeightChart";
import MoodCravingsLine from "@/components/dashboard/graphs/charts/MoodCravingsLine";
import SubstanceMixDonut from "@/components/dashboard/graphs/charts/SubstanceMixDonut";
import SideEffectsBar from "@/components/dashboard/graphs/charts/SideEffectsBar";
import DayOfWeekPattern from "@/components/dashboard/graphs/charts/DayOfWeekPattern";
import SoberStreaks from "@/components/dashboard/graphs/charts/SoberStreaks";
import QRadarChart from "@/components/dashboard/graphs/charts/QRadarChart";
import WellbeingRadarChart from "@/components/dashboard/graphs/charts/WellbeingRadarChart";
import CravingsMoodLeadLag from "@/components/dashboard/graphs/charts/CravingsMoodLeadLag";
import { Card, SectionLabel } from "@/components/dashboard/graphs/charts/Card";
import { shortDate } from "@/components/dashboard/graphs/helpers";
import {
  CHART_COLORS,
  MU_VAR,
  SU_VAR,
  BO_VAR,
} from "@/components/dashboard/graphs/theme";
import StatTilesRow from "@/components/dashboard/graphs/StatTilesRow";
import KeyFindingsPanel from "@/components/dashboard/graphs/KeyFindingsPanel";
import ComparisonToggle from "@/components/dashboard/graphs/ComparisonToggle";
import {
  buildPeriodComparison,
  aggregateStats,
} from "@/components/dashboard/graphs/comparison";

export default function GraphsPage() {
  const t = useDashboardT();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const c = isDark ? CHART_COLORS.dark : CHART_COLORS.light;

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

  const [range, setRange] = useState(30);
  const [compareMode, setCompareMode] = useState(false);

  const rangeLabel = {
    7: `${t.last ?? "Last"} 7 ${t.days ?? "days"}`,
    30: `${t.last ?? "Last"} 30 ${t.days ?? "days"}`,
    90: `${t.last ?? "Last"} 90 ${t.days ?? "days"}`,
    365: t.allTime ?? "All time",
  };

  // Period split for comparison mode
  const periodSplit = useMemo(() => {
    if (!data) return { current: [], prior: [] };
    return buildPeriodComparison(data.records ?? [], range);
  }, [data, range]);

  const records = useMemo(() => {
    if (compareMode) return periodSplit.current;
    if (!data) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return [...(data.records ?? [])]
      .filter((r) => new Date(r.date ?? r.createdAt) >= cutoff)
      .sort((a, b) =>
        (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt),
      );
  }, [data, range, compareMode, periodSplit]);

  // Comparison summary deltas
  const comparisonStats = useMemo(() => {
    if (!compareMode) return null;
    const current = aggregateStats(periodSplit.current);
    const prior = aggregateStats(periodSplit.prior);
    return { current, prior };
  }, [compareMode, periodSplit]);

  const moodData = useMemo(
    () =>
      records.map((r) => ({
        date: shortDate(r.date ?? r.createdAt),
        mood: r.mood ?? null,
        cravings: r.cravings ?? null,
        wellbeing: r.wellbeing ?? null,
      })),
    [records],
  );

  const weightData = useMemo(
    () =>
      records
        .filter((r) => r.weight)
        .map((r) => ({
          date: shortDate(r.date ?? r.createdAt),
          weight: r.weight,
        })),
    [records],
  );

  const qScores = useMemo(() => {
    if (!data) return [];
    return [
      { key: "latestGad7", label: "GAD-7", max: 21, color: "#7C3AED" },
      { key: "latestPhq9", label: "PHQ-9", max: 27, color: "#DC2626" },
      { key: "latestAudit", label: "AUDIT", max: 40, color: "#D97706" },
      { key: "latestDast10", label: "DAST-10", max: 10, color: "#059669" },
      { key: "latestCage", label: "CAGE", max: 4, color: "#0284C7" },
      {
        key: "latestReadiness",
        label: t.readiness ?? "Readiness",
        max: 30,
        color: "#0891B2",
      },
    ].map((q) => {
      const raw = data[q.key];
      if (!raw) return { ...q, score: null, pct: 0 };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      return { ...q, score, pct: Math.round((score / q.max) * 100) };
    });
  }, [data, t]);

  const hasMoodData = moodData.some(
    (d) => d.mood != null || d.cravings != null || d.wellbeing != null,
  );
  const hasQuestionnaireData =
    qScores.filter((q) => q.score != null).length >= 3;
  const hasSideEffects = records.some((r) => (r.sideEffects ?? []).length > 0);

  if (!hydrated || !data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU_VAR }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
      {/* Range selector + compare toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: MU_VAR,
            letterSpacing: 0.5,
          }}
        >
          {(t.range ?? "RANGE").toUpperCase()}:
        </span>
        {[7, 30, 90, 365].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              background: range === r ? "var(--accent)" : SU_VAR,
              color: range === r ? "#fff" : MU_VAR,
              border: `1px solid ${range === r ? "var(--accent)" : BO_VAR}`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
            }}
          >
            {rangeLabel[r]}
          </button>
        ))}
        <span style={{ fontSize: 11, color: MU_VAR, marginLeft: 4 }}>
          ({records.length} {t.entries ?? "entries"})
        </span>
        {range !== 365 && (
          <ComparisonToggle
            active={compareMode}
            onChange={setCompareMode}
            t={t}
          />
        )}
      </div>

      {/* Period comparison summary banner */}
      {compareMode && comparisonStats && (
        <div
          style={{
            background: SU_VAR,
            border: `1px solid ${BO_VAR}`,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 16,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t.thisVsPriorPeriod ?? "This period vs prior period"}
          </div>
          <ComparisonRow
            label={t.soberDays ?? "Sober days"}
            current={comparisonStats.current.sober}
            prior={comparisonStats.prior.sober}
            higherIsBetter
          />
          <ComparisonRow
            label={t.useDaysShort ?? "Use days"}
            current={comparisonStats.current.use}
            prior={comparisonStats.prior.use}
            higherIsBetter={false}
          />
          {comparisonStats.current.moodAvg != null &&
            comparisonStats.prior.moodAvg != null && (
              <ComparisonRow
                label={t.mood ?? "Mood"}
                current={comparisonStats.current.moodAvg}
                prior={comparisonStats.prior.moodAvg}
                higherIsBetter
                isDecimal
              />
            )}
          {comparisonStats.current.cravingsAvg != null &&
            comparisonStats.prior.cravingsAvg != null && (
              <ComparisonRow
                label={t.cravings ?? "Cravings"}
                current={comparisonStats.current.cravingsAvg}
                prior={comparisonStats.prior.cravingsAvg}
                higherIsBetter={false}
                isDecimal
              />
            )}
        </div>
      )}

      {records.length === 0 && (
        <div
          style={{
            background: SU_VAR,
            borderRadius: 14,
            border: `1px solid ${BO_VAR}`,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU_VAR }}>
            {t.noData ?? "No records in this time range"}
          </div>
        </div>
      )}

      {records.length > 0 && (
        <>
          {/* Stat tiles row */}
          <StatTilesRow data={data} records={records} t={t} />

          {/* Key findings panel */}
          <KeyFindingsPanel records={records} qScores={qScores} t={t} />

          {/* ── BIG PICTURE ── */}
          <SectionLabel>{t.sectionBigPicture ?? "Big picture"}</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
              gap: 16,
            }}
          >
            <Card
              title={t.soberStreaks ?? "Sober Streaks"}
              subtitle={
                t.streaksSubtitle ??
                "Current run, longest stretch, sober/used heatmap"
              }
            >
              <SoberStreaks records={records} c={c} t={t} />
            </Card>
            <Card
              title={t.substanceMix ?? "Substance Mix"}
              subtitle={t.daysUsedPerSubstance ?? "Days used per substance"}
            >
              <SubstanceMixDonut records={records} c={c} t={t} />
            </Card>
          </div>

          {/* ── DAY-BY-DAY ── */}
          <SectionLabel>{t.sectionDayByDay ?? "Day-by-day"}</SectionLabel>
          {hasMoodData && (
            <Card
              title={t.moodCravingsWellbeing ?? "Mood, Cravings & Wellbeing"}
              subtitle={t.weeklyAverages ?? "Weekly averages (Mon–Sun)"}
            >
              <MoodCravingsLine records={records} c={c} t={t} />
            </Card>
          )}
          <Card
            title={t.dayOfWeekPattern ?? "Day-of-Week Pattern"}
            subtitle={t.useRateByWeekday ?? "Use rate by weekday"}
          >
            <DayOfWeekPattern records={records} c={c} t={t} />
          </Card>

          {/* Cravings vs Mood lead-lag 
          <Card
            title={t.cravingsMoodLeadLag ?? "Cravings vs Mood — Lead/Lag"}
            subtitle={
              t.crossCorrelationAnalysis ??
              "Cross-correlation across ±3 day lags"
            }
          >
            <CravingsMoodLeadLag records={records} c={c} t={t} />
          </Card>
*/}
          {/* ── CLINICAL ── */}
          {(hasQuestionnaireData || hasSideEffects) && (
            <>
              <SectionLabel>{t.sectionClinical ?? "Clinical"}</SectionLabel>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
                  gap: 16,
                }}
              >
                {hasQuestionnaireData && (
                  <Card
                    title={t.questionnaireRadar ?? "Questionnaire Radar"}
                    subtitle={t.percentOfMaxScore ?? "% of maximum score"}
                  >
                    <QRadarChart qScores={qScores} c={c} t={t} />
                  </Card>
                )}
                {hasSideEffects && (
                  <Card
                    title={t.sideEffects ?? "Side Effects"}
                    subtitle={
                      t.daysEachEffectLogged ?? "Days each effect was logged"
                    }
                  >
                    <SideEffectsBar records={records} c={c} t={t} />
                  </Card>
                )}
              </div>
            </>
          )}

          {/* ── PATIENT PROFILE ── */}
          <SectionLabel>{t.sectionProfile ?? "Patient profile"}</SectionLabel>
          <Card
            title={t.recoveryProfile ?? "Recovery Profile"}
            subtitle={t.higherIsBetter ?? "Higher = better across all axes"}
          >
            <WellbeingRadarChart records={records} c={c} t={t} />
          </Card>

          {weightData.length > 1 && (
            <>
              <SectionLabel>{t.sectionTrends ?? "Trends"}</SectionLabel>
              <Card
                title={t.weightOverTime ?? "Weight Trend"}
                subtitle={t.kg ?? "kg"}
              >
                <WeightChart records={records} c={c} t={t} />
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Internal helper for the comparison summary banner ──
function ComparisonRow({ label, current, prior, higherIsBetter, isDecimal }) {
  const delta = current - prior;
  const isImproved = higherIsBetter ? delta > 0 : delta < 0;
  const isWorse = higherIsBetter ? delta < 0 : delta > 0;
  const color = isImproved ? "#16A34A" : isWorse ? "#DC2626" : MU_VAR;
  const sign = delta > 0 ? "+" : "";
  const formatVal = (v) => (isDecimal ? v.toFixed(1) : v);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 0",
        fontSize: 12,
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{
          fontVariantNumeric: "tabular-nums",
          color: "var(--text)",
          fontWeight: 600,
        }}
      >
        {formatVal(current)}{" "}
        <span
          style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 10 }}
        >
          (was {formatVal(prior)})
        </span>{" "}
        <span style={{ color, fontWeight: 700, marginLeft: 4 }}>
          {sign}
          {formatVal(delta)}
        </span>
      </span>
    </div>
  );
}
