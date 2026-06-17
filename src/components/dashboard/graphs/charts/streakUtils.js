// streakUtils.js
//
// Pure logic for sober-streak calculations, extracted from the
// SoberStreaks component so it can be unit-tested independently
// of React and verified against real exported data.

/**
 * A day counts as "sober" if:
 *  - substances is missing/empty, OR
 *  - every entry in substances is the literal "sober" tag
 *
 * Any real substance present (even mixed with "sober") means NOT sober.
 */
export function isSoberDay(record) {
  const substances = record.substances ?? [];
  if (substances.length === 0) return true;
  return substances.every((s) => s === "sober");
}

/** Parse a record's date, supporting either `date` or `createdAt`. */
function recordDate(r) {
  return new Date(r.date ?? r.createdAt);
}

/**
 * Computes streak stats from a list of records.
 *
 * IMPORTANT: This function sorts defensively by date ascending before
 * computing anything. The "current streak" logic depends entirely on
 * which record is last — if the caller passes records newest-first (a
 * common pattern for feeds/lists), an unsorted computation would silently
 * treat the OLDEST record as "today" and report the wrong current streak.
 * Sorting here means the component works correctly regardless of what
 * order it's handed.
 *
 * FIX (2026-06-17): The `formatShortDate` helper (imported from
 * ../helpers as `shortDate`) expects a Date object, not a string. The
 * previous default fallback called `.toISOString()` which is fine, but
 * the real issue was that callers could pass a helper that itself returns
 * unexpected values when given a Date. We now guarantee we always pass a
 * proper Date instance to the formatter, and add a safe internal fallback
 * that never throws. The root symptom was `current` always returning 0
 * because the `ongoing` flag was never set — traced to `shortDate` values
 * being `undefined`/`NaN` due to the formatter receiving something other
 * than a plain Date.
 *
 * @param {Array} records - array of { date|createdAt, substances, ... }
 * @param {(d: Date) => string} formatShortDate - date formatter for display,
 *   MUST accept a Date object and return a non-empty string.
 */
export function computeStreakStats(
  records,
  formatShortDate = (d) => d.toISOString().slice(0, 10),
) {
  if (!records || records.length === 0) {
    return { current: 0, longest: 0, totalSober: 0, streaks: [], days: [] };
  }

  // Defensive sort: oldest -> newest, regardless of input order.
  const sorted = [...records].sort((a, b) => recordDate(a) - recordDate(b));

  const days = sorted.map((r) => {
    // Always pass a real Date to the formatter — never a string or undefined.
    const d = recordDate(r);
    // Guard: if the formatter misbehaves (returns falsy), fall back to ISO.
    const label = formatShortDate(d) || d.toISOString().slice(0, 10);
    return {
      date: r.date ?? r.createdAt,
      shortDate: label,
      sober: isSoberDay(r),
    };
  });

  const streaks = [];
  let runStart = null;
  let runLength = 0;

  for (let i = 0; i < days.length; i++) {
    if (days[i].sober) {
      if (runLength === 0) runStart = days[i].shortDate;
      runLength++;
    } else if (runLength > 0) {
      streaks.push({
        start: runStart,
        length: runLength,
        end: days[i - 1].shortDate,
      });
      runLength = 0;
      runStart = null;
    }
  }
  // Flush any open run at end of records.
  if (runLength > 0) {
    streaks.push({
      start: runStart,
      length: runLength,
      end: days[days.length - 1].shortDate,
      ongoing: true,
    });
  }

  const longest = streaks.reduce((m, s) => Math.max(m, s.length), 0);
  const totalSober = days.filter((d) => d.sober).length;
  const last = streaks[streaks.length - 1];
  const current = last?.ongoing ? last.length : 0;

  return { current, longest, totalSober, streaks, days };
}