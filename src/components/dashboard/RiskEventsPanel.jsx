"use client";
// Auto-detected risk events from patient data. Surfaces clinically relevant
// concerns at the top of the dashboard so doctors triage in 5 seconds:
//   🚨 URGENT  — suicidal ideation (PHQ-9 q9 ≥ 1)
//   ⚠  WARNING — sustained high cravings, broken streak, log gap, AUDIT high
//   ✓ NO ALERTS — empty state with reassurance
import { useMemo } from "react";
import { BO, MU, SU } from "./calendar/theme";
import { fmtDate } from "./calendar/helpers";

const URGENT = "#DC2626";
const WARNING = "#D97706";
const OK = "#16A34A";

export default function RiskEventsPanel({ data, t }) {
  const events = useMemo(() => detectRiskEvents(data, t), [data, t]);

  // Group by severity for the count display
  const urgent = events.filter((e) => e.severity === "urgent");
  const warning = events.filter((e) => e.severity === "warning");
  const info = events.filter((e) => e.severity === "info");
  const totalAlerts = urgent.length + warning.length;

  // Empty state — no alerts is itself useful information
  if (events.length === 0) {
    return (
      <div
        style={{
          background: SU,
          borderRadius: 14,
          border: `1px solid ${BO}`,
          boxShadow: "var(--shadow-card)",
          padding: "12px 16px",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: `${OK}22`,
            color: OK,
            fontSize: 14,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          ✓
        </span>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: OK,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {t.noAlerts ?? "No alerts"}
          </div>
          <div style={{ fontSize: 11, color: MU, marginTop: 1 }}>
            {t.noAlertsBody ?? "All recent metrics within expected ranges."}
          </div>
        </div>
      </div>
    );
  }

  // Has events — render flag list
  return (
    <div
      style={{
        background: SU,
        borderRadius: 14,
        border: `1px solid ${urgent.length > 0 ? URGENT : WARNING}`,
        boxShadow: "var(--shadow-card)",
        padding: "12px 16px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: urgent.length > 0 ? URGENT : WARNING,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {totalAlerts} {totalAlerts === 1
            ? (t.itemToReview ?? "item to review")
            : (t.itemsToReview ?? "items to review")}
        </div>
        <div
          style={{
            fontSize: 9,
            color: MU,
            fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {urgent.length > 0 && (
            <span style={{ color: URGENT }}>
              {urgent.length} {t.severityUrgent ?? "urgent"}
            </span>
          )}
          {urgent.length > 0 && warning.length > 0 && " · "}
          {warning.length > 0 && (
            <span style={{ color: WARNING }}>
              {warning.length} {t.severityWarning ?? "warning"}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {events.map((e, i) => (
          <RiskRow key={i} event={e} />
        ))}
      </div>
    </div>
  );
}

function RiskRow({ event }) {
  const color =
    event.severity === "urgent" ? URGENT :
    event.severity === "warning" ? WARNING :
    MU;
  const icon =
    event.severity === "urgent" ? "🚨" :
    event.severity === "warning" ? "⚠" :
    "ⓘ";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 10px",
        background: `${color}10`,
        border: `1px solid ${color}33`,
        borderRadius: 10,
      }}
    >
      <span style={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color,
            lineHeight: 1.3,
          }}
        >
          {event.label}
        </div>
        {event.detail && (
          <div
            style={{
              fontSize: 11,
              color: MU,
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {event.detail}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Detection logic ──────────────────────────────────────────────────────
// Returns array of { severity, label, detail } sorted by severity.
function detectRiskEvents(data, t) {
  const events = [];
  if (!data) return events;

  const records = [...(data.records ?? [])].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  // 1. PHQ-9 question 9 (suicidal ideation) — URGENT
  // Field names may vary; check for q9, question9, item9, or array index 8
  const phq9 = data.latestPhq9;
  if (phq9) {
    const q9 = phq9.q9 ?? phq9.question9 ?? phq9.item9 ??
      (Array.isArray(phq9) ? phq9[8] : null);
    if (q9 != null && Number(q9) >= 1) {
      events.push({
        severity: "urgent",
        label: t.flagSuicidalIdeation ?? "Suicidal ideation indicator",
        detail: `${t.flagPhq9q9 ?? "PHQ-9 question 9"}: ${q9}/3`,
      });
    }
  }

  // 2. Sustained high cravings — WARNING (3+ consecutive days, avg ≥ 4)
  const recentForCravings = records.slice(-30);
  let cravingsStreak = 0;
  let cravingsStreakStart = null;
  let peakCravingsRun = null;
  for (const r of recentForCravings) {
    if (r.cravings != null && r.cravings >= 4) {
      if (cravingsStreak === 0) cravingsStreakStart = r.date ?? r.createdAt;
      cravingsStreak++;
      if (cravingsStreak >= 3 && (!peakCravingsRun || cravingsStreak > peakCravingsRun.length)) {
        peakCravingsRun = {
          length: cravingsStreak,
          start: cravingsStreakStart,
          end: r.date ?? r.createdAt,
        };
      }
    } else {
      cravingsStreak = 0;
      cravingsStreakStart = null;
    }
  }
  if (peakCravingsRun) {
    events.push({
      severity: "warning",
      label: t.flagHighCravings ?? "Sustained high cravings",
      detail: `${peakCravingsRun.length} ${t.consecutiveDays ?? "consecutive days"} ≥ 4 (${fmtDate(peakCravingsRun.start)} → ${fmtDate(peakCravingsRun.end)})`,
    });
  }

  // 3. Broken sober streak (was 14+ days, then a use day in last 30) — WARNING
  let runningStreak = 0;
  let brokenStreakInfo = null;
  for (const r of records) {
    const isUse = (r.substances ?? []).length > 0;
    if (isUse) {
      if (runningStreak >= 14) {
        const breakDate = r.date ?? r.createdAt;
        const daysAgo = Math.floor(
          (Date.now() - new Date(breakDate)) / 86400000,
        );
        if (daysAgo <= 30) {
          brokenStreakInfo = { length: runningStreak, breakDate, daysAgo };
        }
      }
      runningStreak = 0;
    } else {
      runningStreak++;
    }
  }
  if (brokenStreakInfo) {
    events.push({
      severity: "warning",
      label: t.flagStreakBroken ?? "Recently broke a long sober streak",
      detail: `${brokenStreakInfo.length}-${t.daySingular ?? "day"} ${t.streak ?? "streak"} ${t.endedOn ?? "ended on"} ${fmtDate(brokenStreakInfo.breakDate)} (${brokenStreakInfo.daysAgo} ${t.daysAgo ?? "days ago"})`,
    });
  }

  // 4. Log gap (no record for 5+ days, only if patient has history) — WARNING
  if (records.length >= 5) {
    const last = records[records.length - 1];
    const lastDate = new Date(last.date ?? last.createdAt);
    const gapDays = Math.floor((Date.now() - lastDate) / 86400000);
    if (gapDays >= 5) {
      events.push({
        severity: "warning",
        label: t.flagNoRecentLog ?? "No recent log",
        detail: `${t.lastLogged ?? "Last logged"} ${fmtDate(last.date ?? last.createdAt)} (${gapDays} ${t.daysAgo ?? "days ago"})`,
      });
    }
  }

  // 5. AUDIT score elevated — WARNING (≥ 16 indicates likely dependence)
  const audit = data.latestAudit;
  if (audit) {
    const total = Object.values(audit).reduce(
      (s, v) => (typeof v === "number" ? s + v : s),
      0,
    );
    if (total >= 16) {
      events.push({
        severity: "warning",
        label: t.flagAuditHigh ?? "AUDIT score elevated",
        detail: `${total}/40 — ${t.likelyDependence ?? "indicates likely alcohol dependence"}`,
      });
    }
  }

  // Sort: urgent first, then warning, then info
  const order = { urgent: 0, warning: 1, info: 2 };
  return events.sort((a, b) => order[a.severity] - order[b.severity]);
}