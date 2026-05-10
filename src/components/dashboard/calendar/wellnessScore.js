// Pure score-computation logic for the Wellness Index card.
// No React — easy to unit-test independently.
//
// Inputs: full patient `data`, selected `month` ({y,m}), translation map `t`
// Output: { scoreNow, scorePrev, change, components, weakest,
//           daysSinceLog, latestVsTypical, latestInMonth }

// ── Component score functions ──────────────────────────────────────────────

function sobrietyScore(recs) {
  if (recs.length === 0) return null;
  const soberDays = recs.filter((r) => !r.substances?.length).length;
  const pct = (soberDays / recs.length) * 100;
  // Streak bonus — up to +10 for a sustained sober streak (caps at 14 days)
  let streak = 0;
  for (let i = recs.length - 1; i >= 0; i--) {
    if (!recs[i].substances?.length) streak++;
    else break;
  }
  const streakBonus = Math.min(streak / 14, 1) * 10;
  return Math.min(100, pct + streakBonus);
}

function cravingsScore(recs) {
  const vals = recs.map((r) => r.cravings).filter((v) => v != null);
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  // Cravings: 1 = best (low), 5 = worst (high). Invert so a high value
  // produces a low (bad) score.
  return Math.max(0, Math.min(100, ((5 - avg) / 4) * 100));
}

function moodWellbeingScore(recs) {
  const moods = recs.map((r) => r.mood).filter((v) => v != null);
  const wells = recs.map((r) => r.wellbeing).filter((v) => v != null);
  if (moods.length === 0 && wells.length === 0) return null;
  const moodAvg = moods.length
    ? moods.reduce((a, b) => a + b, 0) / moods.length
    : null;
  const wellAvg = wells.length
    ? wells.reduce((a, b) => a + b, 0) / wells.length
    : null;
  const combined = [moodAvg, wellAvg].filter((v) => v != null);
  const avg = combined.reduce((a, b) => a + b, 0) / combined.length;
  // Mood and wellbeing are 1 = worst, 5 = best. Map directly so higher
  // averages produce higher scores: 1 → 0, 3 → 50, 5 → 100.
  return Math.max(0, Math.min(100, ((avg - 1) / 4) * 100));
}

function mentalHealthScore(data, windowEnd) {
  const phq9 = data.latestPhq9;
  const gad7 = data.latestGad7;
  const cutoff = new Date(windowEnd);
  cutoff.setDate(cutoff.getDate() - 90);
  const isRecent = (q) => {
    if (!q || !q.date) return false;
    const d = new Date(q.date);
    return d >= cutoff && d <= windowEnd;
  };
  const phq9Total = isRecent(phq9)
    ? Object.values(phq9).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      )
    : null;
  const gad7Total = isRecent(gad7)
    ? Object.values(gad7).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      )
    : null;
  if (phq9Total == null && gad7Total == null) return null;
  const parts = [];
  if (phq9Total != null) parts.push(((27 - phq9Total) / 27) * 100);
  if (gad7Total != null) parts.push(((21 - gad7Total) / 21) * 100);
  return Math.max(
    0,
    Math.min(100, parts.reduce((a, b) => a + b, 0) / parts.length),
  );
}

function engagementScore(recs, windowDays) {
  // `windowDays` is the denominator — for the current (in-progress) month
  // the caller passes elapsed-days-so-far, not the full month length, so
  // engagement doesn't artificially read low just because the month isn't over.
  if (windowDays <= 0) return null;
  const pct = (recs.length / windowDays) * 100;
  return Math.max(0, Math.min(100, pct));
}

// ── Main entry ─────────────────────────────────────────────────────────────

export function calculateWellness(data, month, t) {
  const allRecs = data?.records ?? [];
  if (allRecs.length === 0) return null;

  const sorted = [...allRecs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  const { y, m } = month;
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0, 23, 59, 59);
  const prevStart = new Date(y, m - 1, 1);
  const prevEnd = new Date(y, m, 0, 23, 59, 59);

  // For engagement, count elapsed days only when the selected month is the
  // current month — otherwise a fully-logged in-progress month would score
  // as if half the days were missing. Past months use their full length.
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m;
  const monthDays = isCurrentMonth ? today.getDate() : monthEnd.getDate();
  const prevDays = prevEnd.getDate();

  const inWindow = (r, from, to) => {
    const d = new Date(r.date ?? r.createdAt);
    return d >= from && d <= to;
  };

  const recsNow = sorted.filter((r) => inWindow(r, monthStart, monthEnd));
  const recsPrev = sorted.filter((r) => inWindow(r, prevStart, prevEnd));

  // Component scores with weights (sum to 1.0)
  const components = {
    sobriety: {
      weight: 0.3,
      now: sobrietyScore(recsNow),
      prev: sobrietyScore(recsPrev),
    },
    cravings: {
      weight: 0.2,
      now: cravingsScore(recsNow),
      prev: cravingsScore(recsPrev),
    },
    moodWellbeing: {
      weight: 0.15,
      now: moodWellbeingScore(recsNow),
      prev: moodWellbeingScore(recsPrev),
    },
    mentalHealth: {
      weight: 0.25,
      now: mentalHealthScore(data, monthEnd),
      prev: mentalHealthScore(data, prevEnd),
    },
    engagement: {
      weight: 0.1,
      now: engagementScore(recsNow, monthDays),
      prev: engagementScore(recsPrev, prevDays),
    },
  };

  // Weighted average over present (non-null) components.
  // Total weight is recomputed so missing components don't drag the score down.
  function weightedAvg(getter) {
    const present = Object.entries(components).filter(
      ([, c]) => getter(c) != null,
    );
    if (present.length === 0) return null;
    const totalWeight = present.reduce((s, [, c]) => s + c.weight, 0);
    const weighted = present.reduce((s, [, c]) => s + getter(c) * c.weight, 0);
    return weighted / totalWeight;
  }

  const scoreNow = weightedAvg((c) => c.now);
  const scorePrev = weightedAvg((c) => c.prev);
  const change =
    scoreNow != null && scorePrev != null ? scoreNow - scorePrev : null;
  const presentComponents = Object.entries(components)
    .filter(([, c]) => c.now != null)
    .sort(([, a], [, b]) => a.now - b.now);
  const weakest = presentComponents[0] ?? null;

  // Last-log info — uses the most recent log WITHIN the selected month so the
  // detail strip stays consistent with the score above it. Falls back to the
  // most recent log overall if the selected month has none (so the badge
  // doesn't disappear when scrubbing through historical empty months).
  const latestInMonth = recsNow.length ? recsNow[recsNow.length - 1] : null;
  const latestEver = sorted.length ? sorted[sorted.length - 1] : null;
  const latest = latestInMonth ?? latestEver;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const latestDate = latest ? new Date(latest.date ?? latest.createdAt) : null;
  if (latestDate) latestDate.setHours(0, 0, 0, 0);
  const daysSinceLog = latestDate
    ? Math.max(0, Math.round((todayMidnight - latestDate) / 86400000))
    : null;

  // Latest log vs typical — uses the resolved `latest` above, compared to a
  // baseline of all OTHER logs (excludes the chosen log so it doesn't pull
  // its own average toward itself).
  const baseline = sorted.filter((r) => r !== latest);
  const avg = (key) => {
    const v = baseline.map((r) => r[key]).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const latestVsTypical =
    latest && baseline.length > 0
      ? [
          {
            key: "mood",
            label: t.mood ?? "Mood",
            today: latest.mood,
            avg: avg("mood"),
            higherIsBetter: true,
            scale: 5,
          },
          {
            key: "cravings",
            label: t.cravings ?? "Cravings",
            today: latest.cravings,
            avg: avg("cravings"),
            higherIsBetter: false,
            scale: 5,
          },
          {
            key: "wellbeing",
            label: t.wellbeing ?? "Wellbeing",
            today: latest.wellbeing,
            avg: avg("wellbeing"),
            higherIsBetter: true,
            scale: 5,
          },
        ].filter((m) => m.today != null && m.avg != null)
      : [];

  return {
    scoreNow,
    scorePrev,
    change,
    components,
    weakest,
    daysSinceLog,
    latestVsTypical,
    latestInMonth,
  };
}