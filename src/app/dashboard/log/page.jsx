// src/app/dashboard/log/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";

// Theme tokens
const A   = "var(--accent)";
const AD  = "var(--accent-strong)";
const AL  = "var(--accent-soft)";
const BG  = "var(--bg)";
const SU  = "var(--card)";
const BO  = "var(--card-border)";
const TX  = "var(--text)";
const MU  = "var(--text-muted)";

const SC = {
  alcohol: "#7986cb", cannabis: "#66bb6a", cocaine: "#ef5350",
  opioids: "#ab47bc", amphetamines: "#ff7043", benzodiazepines: "#26a69a",
  tobacco: "#8d6e63", prescription: "#42a5f5", mdma: "#ec407a",
  ecstasy: "#ec407a", ghb: "#00acc1", acid: "#9c27b0", other: "#bdbdbd",
};
const sc = (s) => SC[s] ?? "#bdbdbd";

// Mood-to-color (1=best, 5=worst)
const MOOD_COLORS = ["#22C55E", "#7AABDB", "#FBBF24", "#FB923C", "#EF4444"];

function pad(n) { return String(n).padStart(2, "0"); }
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}

// ── Compute event badges for a record ──────────────────────────────────────
// Returns array of {key, icon, color, label} for what's notable about this day.
function computeEvents(rec, ctx, t) {
  const events = [];
  const isUse = (rec.substances ?? []).length > 0;
  const isSober = !isUse;

  // Milestone: streak achievements (only on the day they were hit)
  if (ctx.milestoneOn === fmtDate(rec.date ?? rec.createdAt)) {
    events.push({
      key: "milestone",
      icon: "🎯",
      color: "#16A34A",
      label: `${ctx.milestoneLength}-${t.daySingular ?? "day"} ${t.milestone ?? "milestone"}`,
    });
  }

  // Relapse: first use day after a 7+ day sober streak
  if (ctx.relapseOn === fmtDate(rec.date ?? rec.createdAt)) {
    events.push({
      key: "relapse",
      icon: "⚠",
      color: "#DC2626",
      label: `${t.streakBroken ?? "Streak broken"} (${ctx.relapseAfter}d)`,
    });
  }

  // High cravings
  if (rec.cravings >= 4) {
    events.push({
      key: "highCravings",
      icon: "🔥",
      color: "#FB923C",
      label: t.highCravings ?? "High cravings",
    });
  }

  // Note
  if (rec.note?.trim()) {
    events.push({
      key: "note",
      icon: "💬",
      color: A.replace("var(--accent)", "#4a7ab5"),
      label: t.note ?? "Note",
    });
  }

  // Side effects
  if ((rec.sideEffects ?? []).length > 0) {
    events.push({
      key: "sideEffects",
      icon: "⚕",
      color: "#7C3AED",
      label: t.sideEffects ?? "Side effects",
    });
  }

  // Use vs sober (always tag, for filtering)
  events._isUse = isUse;
  events._isSober = isSober;

  return events;
}

// ── Compute context (milestones, relapses) across the full sorted record list ─
// We pre-compute which date a streak was achieved and which date a relapse
// happened, so per-record event computation is cheap and accurate.
function buildContext(allRecsAsc) {
  const milestones = {}; // date string -> milestone length achieved that day
  const relapses = {};   // date string -> length of streak that broke

  let streak = 0;
  const milestoneTargets = [7, 14, 30, 60, 90, 180, 365];
  const milestonesHit = new Set();

  allRecsAsc.forEach((r) => {
    const ds = fmtDate(r.date ?? r.createdAt);
    const isSober = !(r.substances?.length);

    if (isSober) {
      streak++;
      // Check if we crossed any milestone today
      milestoneTargets.forEach((target) => {
        if (streak === target && !milestonesHit.has(target)) {
          milestonesHit.add(target);
          milestones[ds] = target;
        }
      });
    } else {
      // Relapse: only flag if streak was 7+ days
      if (streak >= 7) {
        relapses[ds] = streak;
      }
      streak = 0;
      milestonesHit.clear(); // allow milestones to re-hit on a new run
    }
  });

  return { milestones, relapses };
}

// ── Top ribbon — period highlights ─────────────────────────────────────────
function PeriodRibbon({ records, t }) {
  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const sortedAsc = [...records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt))
    );
    // Current streak from the end
    let current = 0;
    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      if (!(sortedAsc[i].substances?.length)) current++;
      else break;
    }
    // Last use day
    const lastUse = [...sortedAsc].reverse().find((r) => (r.substances?.length));
    // Best & worst by mood
    const withMood = sortedAsc.filter((r) => r.mood != null);
    const best = withMood.reduce((b, r) => (!b || r.mood < b.mood ? r : b), null);
    const worst = withMood.reduce((w, r) => (!w || r.mood > w.mood ? r : w), null);
    return {
      current,
      lastUse,
      best,
      worst,
      total: records.length,
    };
  }, [records]);

  if (!stats) return null;

  const items = [
    {
      label: t.streakNow ?? "Current streak",
      value: stats.current > 0 ? `${stats.current} ${t.daysPlural ?? "days"}` : "—",
      color: stats.current >= 7 ? "#16A34A" : stats.current > 0 ? "#7AABDB" : MU,
    },
    {
      label: t.lastUse ?? "Last use",
      value: stats.lastUse
        ? shortDate(stats.lastUse.date ?? stats.lastUse.createdAt)
        : (t.never ?? "Never"),
      color: stats.lastUse ? "#DC2626" : "#16A34A",
    },
    {
      label: t.bestDay ?? "Best day",
      value: stats.best ? shortDate(stats.best.date ?? stats.best.createdAt) : "—",
      color: "#16A34A",
    },
    {
      label: t.worstDay ?? "Worst day",
      value: stats.worst ? shortDate(stats.worst.date ?? stats.worst.createdAt) : "—",
      color: "#DC2626",
    },
    {
      label: t.totalLogs ?? "Total logs",
      value: String(stats.total),
      color: TX,
    },
  ];

  return (
    <div style={{
      background: SU,
      borderRadius: 12,
      border: `1px solid ${BO}`,
      padding: "12px 16px",
      marginBottom: 12,
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 10,
      }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 700, letterSpacing: 0.5,
              textTransform: "uppercase", marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: item.color, lineHeight: 1.1,
              fontVariantNumeric: "tabular-nums" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini timeline scrubber ─────────────────────────────────────────────────
function TimelineScrubber({ records, ctx, onJump, t }) {
  const days = useMemo(() => {
    const sortedAsc = [...records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt))
    );
    return sortedAsc.map((r) => {
      const ds = fmtDate(r.date ?? r.createdAt);
      const isUse = (r.substances ?? []).length > 0;
      const moodIdx = r.mood != null ? Math.max(0, Math.min(4, r.mood - 1)) : null;
      const color = isUse
        ? "#EF4444"
        : moodIdx != null
          ? MOOD_COLORS[moodIdx]
          : "#94A3B8";
      const hasMilestone = !!ctx.milestones[ds];
      const hasRelapse = !!ctx.relapses[ds];
      const hasNote = !!r.note?.trim();
      return { ds, color, hasMilestone, hasRelapse, hasNote, rec: r };
    });
  }, [records, ctx]);

  if (days.length === 0) return null;

  return (
    <div style={{
      background: SU,
      borderRadius: 12,
      border: `1px solid ${BO}`,
      padding: "12px 14px",
      marginBottom: 12,
      boxShadow: "var(--shadow-card)",
    }}>
      <div style={{ fontSize: 9, color: MU, fontWeight: 700, letterSpacing: 0.5,
        textTransform: "uppercase", marginBottom: 6 }}>
        {t.timeline ?? "Timeline"}
      </div>
      <div style={{ display: "flex", gap: 1, overflow: "hidden" }}>
        {days.map((d) => (
          <button
            key={d.ds}
            onClick={() => onJump?.(d.ds)}
            title={`${d.ds}${d.hasMilestone ? " · 🎯" : ""}${d.hasRelapse ? " · ⚠" : ""}${d.hasNote ? " · 💬" : ""}`}
            style={{
              flex: 1,
              minWidth: 4,
              maxWidth: 12,
              height: 24,
              background: d.color,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              position: "relative",
              padding: 0,
            }}
          >
            {d.hasMilestone && (
              <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                fontSize: 9, lineHeight: 1, pointerEvents: "none" }}>🎯</span>
            )}
            {d.hasRelapse && (
              <span style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
                fontSize: 9, lineHeight: 1, pointerEvents: "none" }}>⚠</span>
            )}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 9, color: MU, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 8, height: 8, background: "#22C55E", borderRadius: 2 }} />
          {t.sober ?? "Sober"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 8, height: 8, background: "#EF4444", borderRadius: 2 }} />
          {t.usedShort ?? "Used"}
        </span>
        <span>🎯 {t.milestone ?? "Milestone"}</span>
        <span>⚠ {t.streakBroken ?? "Streak broken"}</span>
      </div>
    </div>
  );
}

// ── Quick filter chips ─────────────────────────────────────────────────────
function FilterChips({ activeFilter, setFilter, counts, t }) {
  const chips = [
    { key: "all",          label: t.filterAll ?? "All",                 count: counts.all },
    { key: "useDays",      label: t.filterUseDays ?? "Use days",        count: counts.useDays,    color: "#DC2626" },
    { key: "soberDays",    label: t.filterSoberDays ?? "Sober days",    count: counts.soberDays,  color: "#16A34A" },
    { key: "highCravings", label: t.filterHighCravings ?? "Cravings ≥4",count: counts.highCravings, color: "#FB923C" },
    { key: "notes",        label: t.filterNotes ?? "With notes",        count: counts.notes,      color: "#4a7ab5" },
    { key: "sideEffects",  label: t.filterSideEffects ?? "Side effects",count: counts.sideEffects,color: "#7C3AED" },
    { key: "milestones",   label: t.filterMilestones ?? "Milestones",   count: counts.milestones, color: "#16A34A" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
      {chips.map((chip) => {
        const active = activeFilter === chip.key;
        const baseColor = chip.color ?? A;
        return (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            style={{
              background: active ? baseColor : SU,
              color: active ? "#fff" : (chip.color ?? AD),
              border: `1px solid ${active ? baseColor : BO}`,
              borderRadius: 18,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .12s",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {chip.label}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              opacity: active ? 0.85 : 0.6,
              fontVariantNumeric: "tabular-nums",
            }}>
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ScoreDot({ val, mu }) {
  if (val == null) return <span style={{ fontSize: 11, color: mu }}>—</span>;
  const idx = Math.max(0, Math.min(4, val - 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: MOOD_COLORS[idx] }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: AD }}>{val}</span>
    </div>
  );
}

// ── Day card with event badges ─────────────────────────────────────────────
function LogRow({ rec, events, ctx, t, focusDate }) {
  const [open, setOpen] = useState(false);
  const ds = fmtDate(rec.date ?? rec.createdAt);
  const subs = rec.substances ?? [];
  const effects = rec.sideEffects ?? [];
  const meds = rec.medicationsTaken ?? [];

  const isFocused = focusDate === ds;
  // When timeline scrubber jumps, expand the matching card
  useEffect(() => {
    if (isFocused) setOpen(true);
  }, [isFocused]);

  const moodIdx = rec.mood != null ? Math.max(0, Math.min(4, rec.mood - 1)) : null;
  const stripeColor = events._isUse ? "#EF4444" : (moodIdx != null ? MOOD_COLORS[moodIdx] : "#94A3B8");

  return (
    <div
      data-date={ds}
      style={{
        background: SU,
        borderRadius: 10,
        border: `1px solid ${isFocused ? A.replace("var(--accent)", "#4a7ab5") : BO}`,
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        scrollMarginTop: 80,
        transition: "border-color .15s",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: stripeColor, flexShrink: 0 }} />

        <div style={{ fontSize: 12, fontWeight: 700, color: AD, minWidth: 90, flexShrink: 0,
          fontVariantNumeric: "tabular-nums" }}>
          {ds}
        </div>

        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.mood ?? "MOOD").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.mood} mu={MU} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.cravings ?? "CRAV").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.cravings} mu={MU} />
          </div>
        </div>

        {/* Event badges */}
        <div style={{ flex: 1, display: "flex", gap: 4, flexWrap: "wrap", minWidth: 0 }}>
          {events.length === 0 && events._isSober && (
            <span style={{
              fontSize: 9, color: "#16A34A", fontWeight: 700,
              background: "#22C55E22", border: "1px solid #22C55E44",
              borderRadius: 10, padding: "2px 7px",
            }}>
              {t.sober ?? "Sober"}
            </span>
          )}
          {subs.slice(0, 3).map((s) => (
            <span key={s} style={{
              fontSize: 9, color: sc(s), fontWeight: 700, textTransform: "capitalize",
              background: sc(s) + "18", borderRadius: 10, padding: "2px 7px",
            }}>{s}</span>
          ))}
          {subs.length > 3 && (
            <span style={{ fontSize: 9, color: MU }}>+{subs.length - 3}</span>
          )}
          {events.map((e) => (
            <span key={e.key} title={e.label} style={{
              fontSize: 10,
              background: e.color + "18",
              border: `1px solid ${e.color}44`,
              color: e.color,
              borderRadius: 10,
              padding: "1px 6px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
            }}>
              <span>{e.icon}</span>
            </span>
          ))}
        </div>

        <span style={{ fontSize: 10, color: MU, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          padding: "0 14px 14px 14px",
          borderTop: `1px solid ${BG}`,
          marginTop: 4,
          paddingTop: 12,
        }}>
          {/* Event labels list */}
          {events.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {events.map((e) => (
                <span key={e.key} style={{
                  fontSize: 10,
                  background: e.color + "18",
                  border: `1px solid ${e.color}44`,
                  color: e.color,
                  borderRadius: 12,
                  padding: "2px 9px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <span>{e.icon}</span>
                  <span>{e.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Compact detail grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
            gap: 10,
          }}>
            {/* All scores */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                textTransform: "uppercase", marginBottom: 5 }}>
                {t.scores ?? "Scores"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { k: "mood", l: t.mood ?? "Mood" },
                  { k: "cravings", l: t.cravings ?? "Cravings" },
                  { k: "wellbeing", l: t.wellbeing ?? "Wellbeing" },
                ].map((s) => (
                  <div key={s.k} style={{ background: BG, borderRadius: 8, padding: "6px 9px",
                    textAlign: "center", minWidth: 50 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: rec[s.k] != null ? AD : MU,
                      lineHeight: 1 }}>
                      {rec[s.k] ?? "-"}
                    </div>
                    <div style={{ fontSize: 8, color: MU, marginTop: 2, textTransform: "uppercase",
                      letterSpacing: 0.5 }}>
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(rec.frequency || rec.amount != null) && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 5 }}>
                  {(t.frequency ?? "Frequency")} & {(t.amount ?? "Amount")}
                </div>
                <div style={{ fontSize: 12, color: TX }}>
                  {rec.frequency ?? "—"}{rec.amount != null ? ` · ${rec.amount}` : ""}
                </div>
              </div>
            )}

            {subs.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 5 }}>
                  {t.substances ?? "Substances"}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {subs.map((s) => (
                    <span key={s} style={{
                      background: sc(s) + "22", color: sc(s), border: `1px solid ${sc(s)}44`,
                      borderRadius: 16, padding: "2px 9px", fontSize: 11, fontWeight: 600,
                      textTransform: "capitalize",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {meds.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 5 }}>
                  {t.medicationsTitle ?? "Medications"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {meds.map((med, i) => {
                    const name = typeof med === "object" ? (med.name ?? med.id ?? "?") : String(med);
                    const dose = typeof med === "object" ? (med.dosage ?? med.dose ?? null) : null;
                    return (
                      <div key={i} style={{ fontSize: 11, color: TX, textTransform: "capitalize" }}>
                        {name}{dose && <span style={{ color: MU, marginLeft: 4 }}>({dose})</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {effects.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 5 }}>
                  {t.sideEffects ?? "Side effects"}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {effects.map((e) => (
                    <span key={e} style={{
                      background: "var(--warn-soft)", color: "var(--warn)",
                      border: "1px solid var(--warn-soft)", borderRadius: 16,
                      padding: "2px 9px", fontSize: 11,
                    }}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            {rec.weight != null && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                  textTransform: "uppercase", marginBottom: 5 }}>
                  {t.weight ?? "Weight"}
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: AD }}>
                  {rec.weight} {t.kg ?? "kg"}
                </span>
              </div>
            )}
          </div>

          {rec.note && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: MU, letterSpacing: 1,
                textTransform: "uppercase", marginBottom: 5 }}>
                {t.note ?? "Note"}
              </div>
              <div style={{
                background: AL, borderRadius: 8, padding: "8px 12px",
                fontSize: 12, color: TX, borderLeft: `3px solid var(--accent)`,
                fontStyle: "italic", lineHeight: 1.6,
              }}>
                "{rec.note}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogPage() {
  const t = useDashboardT();
  const [data, setData] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("patientData");
      setData(raw ? JSON.parse(raw) : null);
    } catch { setData(null); }
    setHydrated(true);
  }, []);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [focusDate, setFocusDate] = useState(null);

  // Build context (milestones, relapses) from ascending-sorted full record list
  const ctx = useMemo(() => {
    if (!data?.records) return { milestones: {}, relapses: {} };
    const sortedAsc = [...data.records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt))
    );
    return buildContext(sortedAsc);
  }, [data]);

  // All records sorted descending for display
  const allRecords = useMemo(() => {
    if (!data?.records) return [];
    return [...data.records].sort((a, b) =>
      String(b.date ?? b.createdAt).localeCompare(String(a.date ?? a.createdAt))
    );
  }, [data]);

  // Compute events for every record once, then filter
  const recordsWithEvents = useMemo(() => {
    return allRecords.map((rec) => {
      const ds = fmtDate(rec.date ?? rec.createdAt);
      const recCtx = {
        milestoneOn: ctx.milestones[ds] ? ds : null,
        milestoneLength: ctx.milestones[ds],
        relapseOn: ctx.relapses[ds] ? ds : null,
        relapseAfter: ctx.relapses[ds],
      };
      return { rec, events: computeEvents(rec, recCtx, t) };
    });
  }, [allRecords, ctx, t]);

  // Filter chip counts (always over the full list, not filtered)
  const counts = useMemo(() => {
    const c = {
      all: recordsWithEvents.length,
      useDays: 0, soberDays: 0, highCravings: 0,
      notes: 0, sideEffects: 0, milestones: 0,
    };
    recordsWithEvents.forEach(({ rec, events }) => {
      if (events._isUse) c.useDays++;
      if (events._isSober) c.soberDays++;
      if (rec.cravings >= 4) c.highCravings++;
      if (rec.note?.trim()) c.notes++;
      if ((rec.sideEffects ?? []).length > 0) c.sideEffects++;
      if (events.some((e) => e.key === "milestone")) c.milestones++;
    });
    return c;
  }, [recordsWithEvents]);

  // Apply filters
  const filtered = useMemo(() => {
    let recs = recordsWithEvents;
    if (activeFilter !== "all") {
      recs = recs.filter(({ rec, events }) => {
        if (activeFilter === "useDays") return events._isUse;
        if (activeFilter === "soberDays") return events._isSober;
        if (activeFilter === "highCravings") return rec.cravings >= 4;
        if (activeFilter === "notes") return !!rec.note?.trim();
        if (activeFilter === "sideEffects") return (rec.sideEffects ?? []).length > 0;
        if (activeFilter === "milestones") return events.some((e) => e.key === "milestone");
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      recs = recs.filter(({ rec }) =>
        (rec.note ?? "").toLowerCase().includes(q) ||
        (rec.substances ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return recs;
  }, [recordsWithEvents, activeFilter, search]);

  const handleJump = (ds) => {
    setFocusDate(ds);
    setActiveFilter("all");
    setSearch("");
    // Scroll the matching card into view after the next render
    setTimeout(() => {
      const el = document.querySelector(`[data-date="${ds}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  if (!hydrated || !data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0,
      maxWidth: 880, margin: "0 auto", width: "100%" }}>
      <PeriodRibbon records={allRecords} t={t} />
      <TimelineScrubber records={allRecords} ctx={ctx} onJump={handleJump} t={t} />
      <FilterChips activeFilter={activeFilter} setFilter={setActiveFilter} counts={counts} t={t} />

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍 ${t.searchNotes ?? "Search notes or substances"}…`}
          style={{
            width: "100%",
            background: SU,
            border: `1px solid ${BO}`,
            borderRadius: 8,
            padding: "9px 13px",
            fontSize: 13,
            color: TX,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {/* Day cards */}
      {filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(({ rec, events }, i) => (
            <LogRow key={fmtDate(rec.date ?? rec.createdAt) + i} rec={rec}
              events={events} ctx={ctx} t={t} focusDate={focusDate} />
          ))}
        </div>
      ) : (
        <div style={{
          background: SU, borderRadius: 12, border: `1px solid ${BO}`,
          padding: 40, textAlign: "center",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU }}>
            {t.noMatchingLogs ?? "No logs match the current filter."}
          </div>
        </div>
      )}
    </div>
  );
}