// Pure helper functions for the calendar dashboard.
// No React, no hooks — safe to import anywhere and easy to test.

import { SC, FREQ_SCORE, SCORE_COLORS } from "./constants";

// Resolve substance color, falling back to neutral gray for unknown substances
export const sc = (s) => SC[s] ?? "#bdbdbd";

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

// Day-of-week with Monday as 0 (so the calendar starts on Monday)
export function firstDow(y, m) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

// Composite "how bad was today" score, 0–5 (lower = better).
// Used to color the calendar day cell.
export function dayScore(rec) {
  if (!rec) return null;
  const vals = [];
  if (rec.cravings != null) vals.push(rec.cravings);
  if (rec.mood != null) vals.push(6 - rec.mood);
  if (rec.wellbeing != null) vals.push(6 - rec.wellbeing);
  if (rec.amount != null) vals.push(Math.min(5, (rec.amount / 10) * 5));
  if (rec.frequency != null && FREQ_SCORE[rec.frequency] != null)
    vals.push(FREQ_SCORE[rec.frequency]);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// Map a record to its background color via dayScore + SCORE_COLORS bucket.
export function dayBg(rec) {
  const s = dayScore(rec);
  if (s == null) return "transparent";
  const bucket = Math.max(0, Math.min(5, Math.round(s)));
  return SCORE_COLORS[bucket];
}

// Sum all numeric fields in a questionnaire record (skips date/string fields)
export function scoreTotal(o) {
  if (!o) return null;
  return Object.values(o).reduce(
    (a, b) => (typeof b === "number" && Number.isFinite(b) ? a + b : a),
    0,
  );
}

// Look up a question's answer — falls back to numeric index for older records
// that stored answers as { "0": 2, "1": 3, ... } instead of named keys.
export function qVal(rec, key, index) {
  if (rec[key] != null) return rec[key];
  if (rec[String(index)] != null) return rec[String(index)];
  return 0;
}

export function isSoberDay(rec) {
  if (!rec) return false;
  const subs = (rec.substances ?? []).filter(s => s !== "sober");
  return subs.length === 0;
}