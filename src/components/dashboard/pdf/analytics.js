// Analytic helpers for the PDF: wellness score, risk events, key findings.
// These are pure functions — they take patient data and return statements
// to render. Reused from screen logic but standalone (no React).
import { fmtDate } from "./helpers";

// Helpers
function avg(arr, key) {
  const v = arr.map((r) => r[key]).filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function sumOfQuestionnaire(raw) {
  if (!raw) return null;
  return Object.values(raw).reduce(
    (s, v) => (typeof v === "number" ? s + v : s),
    0,
  );
}

// ── Wellness score (simplified version of dashboard calculation) ──
// Returns { score, tier, tierColor, weakest, strongest, components }
export function calculatePdfWellness(data, recs, t) {
  if (!recs.length) return null;

  const sober = recs.filter((r) => (r.substances ?? []).length === 0).length;
  const sobrietyPct = sober / recs.length;

  const cravingsAvg = avg(recs, "cravings");
  const moodAvg = avg(recs, "mood");
  const wellbeingAvg = avg(recs, "wellbeing");

  const phq9 = sumOfQuestionnaire(data.latestPhq9);
  const gad7 = sumOfQuestionnaire(data.latestGad7);

  const components = {
    sobriety: {
      label: t.compSobriety ?? "Sobriety",
      value: Math.round(sobrietyPct * 100),
      weight: 0.30,
    },
    cravings: {
      label: t.compLowCravings ?? "Low cravings",
      value: cravingsAvg != null
        ? Math.round((1 - cravingsAvg / 5) * 100)
        : 50,
      weight: 0.20,
    },
    mood: {
      label: t.compMoodWellbeing ?? "Mood/Wellbeing",
      value: moodAvg != null && wellbeingAvg != null
        ? Math.round(((moodAvg + wellbeingAvg) / 2 / 5) * 100)
        : 50,
      weight: 0.15,
    },
    mental: {
      label: t.compMentalWellness ?? "Mental wellness",
      value: phq9 != null && gad7 != null
        ? Math.round(100 - ((phq9 / 27 + gad7 / 21) / 2) * 100)
        : 50,
      weight: 0.25,
    },
    engagement: {
      label: t.compEngagement ?? "Engagement",
      value: Math.min(100, Math.round((recs.length / 30) * 100)),
      weight: 0.10,
    },
  };

  let score = 0;
  Object.values(components).forEach((c) => {
    score += c.value * c.weight;
  });
  score = Math.round(score);

  const sorted = Object.values(components).sort((a, b) => a.value - b.value);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  let tier, tierColor;
  if (score >= 75) {
    tier = t.tierThriving ?? "Thriving";
    tierColor = [22, 163, 74]; // green
  } else if (score >= 60) {
    tier = t.tierStable ?? "Stable";
    tierColor = [34, 197, 94]; // light green
  } else if (score >= 40) {
    tier = t.tierWatch ?? "Watch";
    tierColor = [217, 119, 6]; // amber
  } else if (score >= 25) {
    tier = t.tierAtRisk ?? "At risk";
    tierColor = [251, 146, 60]; // orange
  } else {
    tier = t.tierCritical ?? "Critical";
    tierColor = [220, 38, 38]; // red
  }

  return { score, tier, tierColor, weakest, strongest, components };
}

// ── Risk events — clinically urgent items requiring doctor attention ──
// Returns array of { severity: 'urgent'|'warning', label, detail }
export function detectRiskEvents(data, recs, t) {
  const events = [];

  // 1. PHQ-9 question 9 — suicidal ideation
  const phq9 = data.latestPhq9;
  if (phq9) {
    const q9 = phq9.q9 ?? phq9.question9 ?? phq9.item9
      ?? (Array.isArray(phq9) ? phq9[8] : null);
    if (q9 != null && Number(q9) >= 1) {
      events.push({
        severity: "urgent",
        label: t.flagSuicidalIdeation ?? "Suicidal ideation indicator",
        detail: `${t.flagPhq9q9 ?? "PHQ-9 question 9"}: ${q9}/3`,
      });
    }
  }

  // Sort recs ascending for streak/cravings analysis
  const sorted = [...recs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  // 2. Sustained high cravings — 3+ consecutive days ≥ 4
  let cravingsStreak = 0;
  let cravingsStart = null;
  let peakCravings = null;
  for (const r of sorted.slice(-30)) {
    if (r.cravings != null && r.cravings >= 4) {
      if (cravingsStreak === 0) cravingsStart = r.date ?? r.createdAt;
      cravingsStreak++;
      if (cravingsStreak >= 3 && (!peakCravings || cravingsStreak > peakCravings.length)) {
        peakCravings = {
          length: cravingsStreak,
          start: cravingsStart,
          end: r.date ?? r.createdAt,
        };
      }
    } else {
      cravingsStreak = 0;
      cravingsStart = null;
    }
  }
  if (peakCravings) {
    events.push({
      severity: "warning",
      label: t.flagHighCravings ?? "Sustained high cravings",
      detail: `${peakCravings.length} ${t.consecutiveDays ?? "consecutive days"} ≥ 4 (${fmtDate(peakCravings.start)} → ${fmtDate(peakCravings.end)})`,
    });
  }

  // 3. Broken sober streak (was 7+ days, then a use day in last 30)
  let runningStreak = 0;
  let brokenInfo = null;
  for (const r of sorted) {
    const isUse = (r.substances ?? []).length > 0;
    if (isUse) {
      if (runningStreak >= 7) {
        const breakDate = r.date ?? r.createdAt;
        const daysAgo = Math.floor(
          (Date.now() - new Date(breakDate)) / 86400000,
        );
        if (daysAgo <= 30) {
          brokenInfo = { length: runningStreak, breakDate, daysAgo };
        }
      }
      runningStreak = 0;
    } else {
      runningStreak++;
    }
  }
  if (brokenInfo) {
    events.push({
      severity: "warning",
      label: t.flagStreakBroken ?? "Recently broke a sober streak",
      detail: `${brokenInfo.length}-${t.daySingular ?? "day"} ${t.streak ?? "streak"} ${t.endedOn ?? "ended"} ${fmtDate(brokenInfo.breakDate)} (${brokenInfo.daysAgo} ${t.daysAgo ?? "days ago"})`,
    });
  }

  // 4. AUDIT ≥ 16 (likely alcohol dependence)
  const audit = sumOfQuestionnaire(data.latestAudit);
  if (audit != null && audit >= 16) {
    events.push({
      severity: "warning",
      label: t.flagAuditHigh ?? "AUDIT score elevated",
      detail: `${audit}/40 — ${t.likelyDependence ?? "indicates likely alcohol dependence"}`,
    });
  }

  // Sort: urgent first
  const order = { urgent: 0, warning: 1 };
  return events.sort((a, b) => order[a.severity] - order[b.severity]);
}

// ── Key findings — descriptive statements about the period ──
// Returns array of { tone: 'positive'|'warning'|'neutral', label, severity }
// 'severity' is for icon choice (✓, ⚠, etc.) Not the same as risk events.
export function detectKeyFindings(data, recs, t) {
  const findings = [];
  if (!recs.length) return findings;

  const sober = recs.filter((r) => (r.substances ?? []).length === 0).length;
  const total = recs.length;
  const soberPct = Math.round((sober / total) * 100);

  // 1. Sober rate
  if (soberPct < 50) {
    findings.push({
      tone: "warning",
      icon: "↓",
      text: `${t.findingSoberRateLow ?? "Sober rate"}: ${sober}/${total} ${t.days ?? "days"} (${soberPct}%) — ${t.belowHalf ?? "less than half"}`,
    });
  } else if (soberPct >= 80) {
    findings.push({
      tone: "positive",
      icon: "✓",
      text: `${t.findingSoberRateHigh ?? "Sober rate"}: ${sober}/${total} ${t.days ?? "days"} (${soberPct}%)`,
    });
  } else {
    findings.push({
      tone: "neutral",
      icon: "•",
      text: `${t.findingSoberRate ?? "Sober rate"}: ${sober}/${total} ${t.days ?? "days"} (${soberPct}%)`,
    });
  }

  // 2. PHQ-9 elevated
  const phq9 = sumOfQuestionnaire(data.latestPhq9);
  if (phq9 != null && phq9 >= 15) {
    findings.push({
      tone: "warning",
      icon: "⚠",
      text: `${t.findingPhq9Elevated ?? "PHQ-9 elevated"}: ${phq9}/27 — ${t.moderateDepression ?? "moderate-severe depression"}`,
    });
  } else if (phq9 != null && phq9 >= 10) {
    findings.push({
      tone: "warning",
      icon: "⚠",
      text: `PHQ-9: ${phq9}/27 — ${t.moderateRange ?? "moderate range"}`,
    });
  }

  // 3. DAST-10 elevated
  const dast = sumOfQuestionnaire(data.latestDast10);
  if (dast != null && dast >= 6) {
    findings.push({
      tone: "warning",
      icon: "⚠",
      text: `${t.findingDastHigh ?? "DAST-10 high"}: ${dast}/10 — ${t.severeAbuse ?? "severe abuse range"}`,
    });
  }

  // 4. AUDIT elevated
  const audit = sumOfQuestionnaire(data.latestAudit);
  if (audit != null && audit >= 8) {
    const label = audit >= 16
      ? (t.findingAuditHigh ?? "harmful drinking pattern")
      : (t.findingAuditModerate ?? "increased risk drinking");
    findings.push({
      tone: "warning",
      icon: "⚠",
      text: `AUDIT: ${audit}/40 — ${label}`,
    });
  }

  // 5. Polysubstance pattern
  const subDayMap = {};
  recs.forEach((r) => {
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
      tone: "warning",
      icon: "🔥",
      text: `${t.findingPolysubstance ?? "Polysubstance pattern"}: ${combo.replace(/\+/g, " + ")} (${count} ${t.days ?? "days"})`,
    });
  }

  // 6. Mood trend
  const sorted = [...recs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );
  const validMood = sorted.filter((r) => r.mood != null);
  if (validMood.length >= 4) {
    const half = Math.floor(validMood.length / 2);
    const firstAvg = validMood.slice(0, half).reduce((s, r) => s + r.mood, 0) / half;
    const secondAvg = validMood.slice(half).reduce((s, r) => s + r.mood, 0) / (validMood.length - half);
    const change = secondAvg - firstAvg;
    if (change >= 0.5) {
      findings.push({
        tone: "positive",
        icon: "↑",
        text: `${t.findingMoodImproving ?? "Mood improving"}: +${change.toFixed(1)} ${t.points ?? "points"}`,
      });
    } else if (change <= -0.5) {
      findings.push({
        tone: "warning",
        icon: "↓",
        text: `${t.findingMoodDeclining ?? "Mood declining"}: ${change.toFixed(1)} ${t.points ?? "points"}`,
      });
    }
  }

  return findings.slice(0, 6);
}

// ── Day-of-week analysis ──
// Returns { hardest, easiest, ranked: [{day, used, logged, pct}] }
export function analyzeDayOfWeek(recs, t) {
  const labels = t.weekdaysShort ?? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const buckets = labels.map((label) => ({ day: label, used: 0, logged: 0, pct: 0 }));
  recs.forEach((r) => {
    const d = new Date(r.date ?? r.createdAt);
    const idx = (d.getDay() + 6) % 7;
    buckets[idx].logged++;
    if ((r.substances ?? []).length > 0) buckets[idx].used++;
  });
  buckets.forEach((b) => {
    b.pct = b.logged ? Math.round((b.used / b.logged) * 100) : 0;
  });
  const withData = buckets.filter((b) => b.logged > 0);
  if (!withData.length) return { hardest: null, easiest: null, ranked: buckets };
  const ranked = [...withData].sort((a, b) => b.pct - a.pct);
  return { hardest: ranked[0], easiest: ranked[ranked.length - 1], ranked: buckets };
}