"use client";
// src/app/dashboard/log/page.jsx
// Pure orchestration: load patient data, build context, manage filter/search
// state, lay out cards. All UI lives in @/components/dashboard/log.
import { useState, useMemo, useEffect } from "react";
import { useDashboardT } from "../LangContext";

import { BO, MU, SU, TX } from "@/components/dashboard/calendar/theme";
import { fmtDate } from "@/components/dashboard/calendar/helpers";
import {
  buildContext,
  computeEvents,
} from "@/components/dashboard/log/eventDetection";
import PeriodRibbon from "@/components/dashboard/log/PeriodRibbon";
import TimelineScrubber from "@/components/dashboard/log/TimelineScrubber";
import FilterChips from "@/components/dashboard/log/FilterChips";
import LogRow from "@/components/dashboard/log/LogRow";

export default function LogPage() {
  const t = useDashboardT();
  const [data, setData] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("patientData");
      setData(raw ? JSON.parse(raw) : null);
    } catch {
      setData(null);
    }
    setHydrated(true);
  }, []);

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [focusDate, setFocusDate] = useState(null);

  // Build context (milestones, relapses) from ascending-sorted full record list
  const ctx = useMemo(() => {
    if (!data?.records) return { milestones: {}, relapses: {} };
    const sortedAsc = [...data.records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );
    return buildContext(sortedAsc);
  }, [data]);

  // Records sorted descending for display
  const allRecords = useMemo(() => {
    if (!data?.records) return [];
    return [...data.records].sort((a, b) =>
      String(b.date ?? b.createdAt).localeCompare(
        String(a.date ?? a.createdAt),
      ),
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

  // Filter chip counts (always over the full list, not the filtered subset)
  const counts = useMemo(() => {
    const c = {
      all: recordsWithEvents.length,
      useDays: 0,
      soberDays: 0,
      highCravings: 0,
      notes: 0,
      sideEffects: 0,
      milestones: 0,
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

  // Apply filter + search
  const filtered = useMemo(() => {
    let recs = recordsWithEvents;
    if (activeFilter !== "all") {
      recs = recs.filter(({ rec, events }) => {
        if (activeFilter === "useDays") return events._isUse;
        if (activeFilter === "soberDays") return events._isSober;
        if (activeFilter === "highCravings") return rec.cravings >= 4;
        if (activeFilter === "notes") return !!rec.note?.trim();
        if (activeFilter === "sideEffects")
          return (rec.sideEffects ?? []).length > 0;
        if (activeFilter === "milestones")
          return events.some((e) => e.key === "milestone");
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      recs = recs.filter(
        ({ rec }) =>
          (rec.note ?? "").toLowerCase().includes(q) ||
          (rec.substances ?? []).some((s) => s.toLowerCase().includes(q)),
      );
    }
    return recs;
  }, [recordsWithEvents, activeFilter, search]);

  const handleJump = (ds) => {
    setFocusDate(ds);
    setActiveFilter("all");
    setSearch("");
    setTimeout(() => {
      const el = document.querySelector(`[data-date="${ds}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  if (!hydrated || !data)
    return (
      <div
        suppressHydrationWarning
        style={{ padding: 40, textAlign: "center", color: MU }}
      >
        {t.loading ?? "Loading…"}
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        maxWidth: 880,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <PeriodRibbon records={allRecords} t={t} />
      <TimelineScrubber
        records={allRecords}
        ctx={ctx}
        onJump={handleJump}
        t={t}
      />
      <FilterChips
        activeFilter={activeFilter}
        setFilter={setActiveFilter}
        counts={counts}
        t={t}
      />

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
            <LogRow
              key={fmtDate(rec.date ?? rec.createdAt) + i}
              rec={rec}
              events={events}
              t={t}
              focusDate={focusDate}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: SU,
            borderRadius: 12,
            border: `1px solid ${BO}`,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU }}>
            {t.noMatchingLogs ?? "No logs match the current filter."}
          </div>
        </div>
      )}
    </div>
  );
}