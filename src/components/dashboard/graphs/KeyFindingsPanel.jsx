"use client";
// Auto-detected key findings for the top of the graphs page.
// Surfaces the most clinically relevant statements drawn from the data
// so a doctor reads conclusions before exploring charts.
import { useMemo } from "react";
import { MU_VAR, SU_VAR, BO_VAR } from "./theme";

const POSITIVE = "#16A34A";
const WARNING = "#D97706";
const URGENT = "#DC2626";

export default function KeyFindingsPanel({ records, qScores, t }) {
  const findings = useMemo(() => detectFindings(records, qScores, t), [
    records,
    qScores,
    t,
  ]);

  if (findings.length === 0) return null;

  return (
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
          marginBottom: 10,
        }}
      >
        {t.keyFindings ?? "Key findings"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {findings.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1.2, flexShrink: 0 }}>
              {f.icon}
            </span>
            <span style={{ color: f.color, fontWeight: 600, flex: 1 }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Findings detection ────────────────────────────────────────────────────
// Walks the records once to surface the most relevant statements.
// Returns up to 5 findings in priority order.
function detectFindings(records, qScores, t) {
  const findings = [];
  if (!records.length) return findings;

  const sortedAsc = [...records].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(
      String(b.date ?? b.createdAt),
    ),
  );

  // 1. Day-of-week pattern — hardest day stands out
  const weekdayLabels = t.weekdaysShort ?? [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
  ];
  const dowBuckets = weekdayLabels.map((label) => ({
    label,
    used: 0,
    logged: 0,
  }));
  records.forEach((r) => {
    const d = new Date(r.date ?? r.createdAt);
    const idx = (d.getDay() + 6) % 7;
    dowBuckets[idx].logged++;
    if ((r.substances ?? []).length > 0) dowBuckets[idx].used++;
  });
  const dowWithData = dowBuckets.filter((b) => b.logged > 0);
  if (dowWithData.length >= 3) {
    const ranked = [...dowWithData].sort(
      (a, b) => b.used / b.logged - a.used / a.logged,
    );
    const hardest = ranked[0];
    const easiest = ranked[ranked.length - 1];
    const hardestPct = Math.round((hardest.used / hardest.logged) * 100);
    const easiestPct = Math.round((easiest.used / easiest.logged) * 100);
    if (hardestPct >= 50 && hardestPct - easiestPct >= 30) {
      findings.push({
        icon: "🔥",
        color: WARNING,
        text: `${hardest.label} ${
          t.findingHighRiskDay ?? "is the highest-risk day"
        } (${hardestPct}% ${t.vsLower ?? "vs"} ${easiestPct}% ${
          t.onOtherDays ?? "on other days"
        }).`,
      });
    }
  }

  // 2. Mood trend
  const validMood = sortedAsc.filter((r) => r.mood != null);
  if (validMood.length >= 4) {
    const half = Math.floor(validMood.length / 2);
    const firstAvg =
      validMood.slice(0, half).reduce((s, r) => s + r.mood, 0) / half;
    const secondAvg =
      validMood.slice(half).reduce((s, r) => s + r.mood, 0) /
      (validMood.length - half);
    const change = secondAvg - firstAvg;
    if (change >= 0.5) {
      findings.push({
        icon: "📈",
        color: POSITIVE,
        text: `${t.findingMoodImproving ?? "Mood improving"} (+${change.toFixed(1)} ${t.points ?? "points"} ${t.overPeriod ?? "over period"}).`,
      });
    } else if (change <= -0.5) {
      findings.push({
        icon: "📉",
        color: WARNING,
        text: `${t.findingMoodDeclining ?? "Mood declining"} (${change.toFixed(1)} ${t.points ?? "points"} ${t.overPeriod ?? "over period"}).`,
      });
    }
  }

  // 3. Current sober streak
  let currentStreak = 0;
  for (let i = sortedAsc.length - 1; i >= 0; i--) {
    if ((sortedAsc[i].substances ?? []).length === 0) currentStreak++;
    else break;
  }
  if (currentStreak >= 30) {
    findings.push({
      icon: "✓",
      color: POSITIVE,
      text: `${t.findingStreakMonth ?? "Currently sustaining"} ${currentStreak}-${t.daySingular ?? "day"} ${t.soberStreak ?? "sober streak"}.`,
    });
  } else if (currentStreak >= 14) {
    findings.push({
      icon: "✓",
      color: POSITIVE,
      text: `${t.findingStreakTwoWeek ?? "Currently in"} ${currentStreak}-${t.daySingular ?? "day"} ${t.soberStreak ?? "sober streak"}.`,
    });
  } else if (currentStreak >= 7) {
    findings.push({
      icon: "✓",
      color: POSITIVE,
      text: `${t.findingStreakWeek ?? "Currently in"} ${currentStreak}-${t.daySingular ?? "day"} ${t.soberStreak ?? "sober streak"}.`,
    });
  }

  // 4. AUDIT elevated
  const auditScore = qScores?.find((q) => q.label === "AUDIT");
  if (auditScore && auditScore.score >= 16) {
    findings.push({
      icon: "⚠",
      color: URGENT,
      text: `${t.findingAuditElevated ?? "AUDIT score elevated"}: ${auditScore.score}/40 — ${t.likelyDependence ?? "indicates likely alcohol dependence"}.`,
    });
  }

  // 5. PHQ-9 elevated (without q9 — that's in Risk Events)
  const phq9Score = qScores?.find((q) => q.label === "PHQ-9");
  if (phq9Score && phq9Score.score >= 15) {
    findings.push({
      icon: "⚠",
      color: WARNING,
      text: `${t.findingPhq9Elevated ?? "PHQ-9 elevated"}: ${phq9Score.score}/27 — ${t.moderateDepression ?? "moderate to severe depression range"}.`,
    });
  }

  // 6. Polysubstance pattern
  const subDayMap = {};
  records.forEach((r) => {
    const subs = r.substances ?? [];
    if (subs.length >= 2) {
      const key = [...subs].sort().join("+");
      subDayMap[key] = (subDayMap[key] ?? 0) + 1;
    }
  });
  const polyEntries = Object.entries(subDayMap).sort((a, b) => b[1] - a[1]);
  if (polyEntries.length > 0 && polyEntries[0][1] >= 3) {
    const [combo, count] = polyEntries[0];
    findings.push({
      icon: "⚠",
      color: WARNING,
      text: `${t.findingPolysubstance ?? "Polysubstance pattern"}: ${combo.replace("+", " + ")} (${count} ${t.days ?? "days"}).`,
    });
  }

  return findings.slice(0, 5);
}