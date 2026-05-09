// Pure logic: detect milestones, relapses, and per-record events for the log page.
// No React — easy to test in isolation.

import { fmtDate } from "../calendar/helpers";

const MILESTONE_TARGETS = [7, 14, 30, 60, 90, 180, 365];

// Walk the full record list (ascending) once and pre-compute:
//   • milestones[date] = streak length achieved that day (e.g. 7, 14, 30…)
//   • relapses[date]   = length of streak that broke that day (only if 7+)
// Per-record event computation then becomes a cheap lookup.
export function buildContext(allRecsAsc) {
  const milestones = {};
  const relapses = {};

  let streak = 0;
  const milestonesHit = new Set();

  allRecsAsc.forEach((r) => {
    const ds = fmtDate(r.date ?? r.createdAt);
    const isSober = !r.substances?.length;

    if (isSober) {
      streak++;
      MILESTONE_TARGETS.forEach((target) => {
        if (streak === target && !milestonesHit.has(target)) {
          milestonesHit.add(target);
          milestones[ds] = target;
        }
      });
    } else {
      // Relapse: only flag if streak was 7+ days
      if (streak >= 7) relapses[ds] = streak;
      streak = 0;
      milestonesHit.clear(); // allow milestones to re-hit on a new run
    }
  });

  return { milestones, relapses };
}

// Compute the array of event badges for a single record.
// `recCtx` is { milestoneOn, milestoneLength, relapseOn, relapseAfter } —
// already extracted from the global context for this specific date.
export function computeEvents(rec, recCtx, t) {
  const events = [];
  const isUse = (rec.substances ?? []).length > 0;
  const isSober = !isUse;

  if (recCtx.milestoneOn === fmtDate(rec.date ?? rec.createdAt)) {
    events.push({
      key: "milestone",
      icon: "🎯",
      color: "#16A34A",
      label: `${recCtx.milestoneLength}-${t.daySingular ?? "day"} ${t.milestone ?? "milestone"}`,
    });
  }

  if (recCtx.relapseOn === fmtDate(rec.date ?? rec.createdAt)) {
    events.push({
      key: "relapse",
      icon: "⚠",
      color: "#DC2626",
      label: `${t.streakBroken ?? "Streak broken"} (${recCtx.relapseAfter}d)`,
    });
  }

  if (rec.cravings >= 4) {
    events.push({
      key: "highCravings",
      icon: "🔥",
      color: "#FB923C",
      label: t.highCravings ?? "High cravings",
    });
  }

  if (rec.note?.trim()) {
    events.push({
      key: "note",
      icon: "💬",
      // Hardcoded — the note badge stays this exact blue across light/dark
      // for visual consistency with the calendar's note SVG icon.
      color: "#4a7ab5",
      label: t.note ?? "Note",
    });
  }

  if ((rec.sideEffects ?? []).length > 0) {
    events.push({
      key: "sideEffects",
      icon: "⚕",
      color: "#7C3AED",
      label: t.sideEffects ?? "Side effects",
    });
  }

  // Tag use/sober status on the array itself for cheap downstream filtering
  events._isUse = isUse;
  events._isSober = isSober;

  return events;
}
