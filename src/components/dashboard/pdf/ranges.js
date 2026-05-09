// Date-range selector logic. Used by both the modal (selector buttons) and the
// PDF generator (period label). Keeping them in one place ensures they stay
// in sync.
//
// Convention: months=null means "all time" — no lower bound.
export const RANGE_OPTIONS = [
  { id: "1m", months: 1, labelKey: "range1Month", fallback: "Last 1 month" },
  { id: "3m", months: 3, labelKey: "range3Months", fallback: "Last 3 months" },
  { id: "6m", months: 6, labelKey: "range6Months", fallback: "Last 6 months" },
  { id: "9m", months: 9, labelKey: "range9Months", fallback: "Last 9 months" },
  { id: "all", months: null, labelKey: "rangeAll", fallback: "All time" },
];

// Returns { from: Date|null, to: Date } for a given range.
// from === null means no lower bound (all time).
export function rangeWindow(months) {
  const to = new Date();
  if (months == null) return { from: null, to };
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return { from, to };
}

export function formatRangeLabel(months, t) {
  const opt =
    RANGE_OPTIONS.find((o) => o.months === months) ?? RANGE_OPTIONS[4];
  return t[opt.labelKey] ?? opt.fallback;
}

// True if a record/questionnaire's date falls inside the window.
// If the item has no date and `from` is set (not all-time), exclude it.
export function inWindow(dateStr, from, to) {
  if (from == null) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}