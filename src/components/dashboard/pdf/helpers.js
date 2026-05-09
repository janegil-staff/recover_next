// Generic helpers used across the PDF modules.
export function pad(n) {
  return String(n).padStart(2, "0");
}

export function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}
export function parseAdviceId(raw) {
  // Strip any category prefix from advice IDs — "m1"→"1", "s2"→"2",
  // "craving_3"→"3", "1"→"1". Translation keys are numeric only
  // (advice_1_title, advice_2_title, ...). Multiple prefixed IDs may
  // map to the same number — caller should dedupe AFTER parsing.
  const m = String(raw).match(/(\d+)/);
  return m ? m[1] : String(raw);
}

export function avgOf(recs, field) {
  const v = recs.map((r) => r[field]).filter((x) => x != null);
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null;
}

// Parse an advice ID into its category prefix and numeric topic ID.
// IDs look like "m1" (mood trigger #1), "r1" (recovery), "w2" (wellbeing),
// "med2" (medication), "s2" (sleep), or just "1" (no category).
// Returns { prefix: "m"|"r"|"w"|"med"|"s"|"" , nid: "1"|"2"|... }
export function parseAdviceFull(raw) {
  const str = String(raw).trim();
  const m = str.match(/^([a-zA-Z]+)?(\d+)/);
  if (!m) return { prefix: "", nid: str };
  return { prefix: (m[1] ?? "").toLowerCase(), nid: m[2] };
}

// Map prefix to category metadata (label key + color).
// Mirrors the mobile app's category badges.
export const ADVICE_CATEGORIES = {
  m: { labelKey: "categoryMood", fallback: "Mood", color: "#4a7ab5" },
  r: { labelKey: "categoryRecovery", fallback: "Recovery", color: "#059669" },
  w: { labelKey: "categoryWellbeing", fallback: "Wellbeing", color: "#9c27b0" },
  med: { labelKey: "categoryMedication", fallback: "Medication", color: "#0891B2" },
  s: { labelKey: "categorySleep", fallback: "Sleep", color: "#7c3aed" },
  c: { labelKey: "categoryCravings", fallback: "Cravings", color: "#f4a07a" },
};