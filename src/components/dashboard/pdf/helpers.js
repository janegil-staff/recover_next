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
  const m = String(raw).match(/(\d+)/);
  return m ? m[1] : String(raw);
}

export function avgOf(recs, field) {
  const v = recs.map((r) => r[field]).filter((x) => x != null);
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null;
}