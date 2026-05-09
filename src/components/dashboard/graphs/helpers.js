// Pure date/format helpers for the graphs page.
export function pad(n) {
  return String(n).padStart(2, "0");
}

export function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}

export function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}