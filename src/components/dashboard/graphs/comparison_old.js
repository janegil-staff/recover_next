// Helper to produce a "this period" + "prior period" record split.
// Pass the full data + range (in days) and get back two arrays of records:
// the current period and the equivalent prior period for comparison.
export function buildPeriodComparison(allRecords, range) {
  const cutoffNow = new Date();
  cutoffNow.setHours(0, 0, 0, 0);

  const cutoffStart = new Date(cutoffNow);
  cutoffStart.setDate(cutoffStart.getDate() - range);

  const cutoffPrior = new Date(cutoffStart);
  cutoffPrior.setDate(cutoffPrior.getDate() - range);

  const sorted = [...(allRecords ?? [])].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  const current = sorted.filter((r) => {
    const d = new Date(r.date ?? r.createdAt);
    return d >= cutoffStart && d <= cutoffNow;
  });
  const prior = sorted.filter((r) => {
    const d = new Date(r.date ?? r.createdAt);
    return d >= cutoffPrior && d < cutoffStart;
  });

  return { current, prior };
}

// Compute aggregate stats from a record array (used to compare two periods).
export function aggregateStats(records) {
  if (!records.length)
    return {
      total: 0,
      sober: 0,
      use: 0,
      moodAvg: null,
      cravingsAvg: null,
    };
  const sober = records.filter(
    (r) => (r.substances ?? []).length === 0,
  ).length;
  const use = records.length - sober;
  const moods = records.map((r) => r.mood).filter((v) => v != null);
  const cravings = records.map((r) => r.cravings).filter((v) => v != null);
  const moodAvg = moods.length
    ? Math.round((moods.reduce((s, v) => s + v, 0) / moods.length) * 10) / 10
    : null;
  const cravingsAvg = cravings.length
    ? Math.round(
        (cravings.reduce((s, v) => s + v, 0) / cravings.length) * 10,
      ) / 10
    : null;
  return { total: records.length, sober, use, moodAvg, cravingsAvg };
}