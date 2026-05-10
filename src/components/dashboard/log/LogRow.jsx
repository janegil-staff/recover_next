"use client";
// Single day card in the log list.
//
// Three visual states:
//   • Collapsed (default) — date, score dots, badge row, optional note preview
//   • Milestone — gold banner across the top, gold border, gold accents
//   • Expanded — adds a detail grid (delegated to shared RecordDetailGrid)
//
// Expanded state opens automatically when a TimelineScrubber jump targets this date.
import { useState, useEffect } from "react";
import { AD, BG, BO, MU, SU } from "../calendar/theme";
import { fmtDate, sc } from "../calendar/helpers";
import { MOOD_COLORS } from "./constants";
import RecordDetailGrid from "../_shared/RecordDetailGrid";

// Hardcoded — the focused border stays this exact blue regardless of theme
// for visual consistency with the calendar's note SVG and chip colors.
const FOCUS_BLUE = "#4a7ab5";

// Milestone styling tokens — gold, used only when this card is a milestone day
const GOLD = "#d4a017";
const GOLD_SOFT = "rgba(212, 160, 23, 0.08)";
const GOLD_BORDER = "rgba(212, 160, 23, 0.45)";

function ScoreDot({ val }) {
  if (val == null) return <span style={{ fontSize: 11, color: MU }}>—</span>;
  const idx = Math.max(0, Math.min(4, val - 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: MOOD_COLORS[idx],
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: AD }}>{val}</span>
    </div>
  );
}

export default function LogRow({ rec, events, t, focusDate }) {
  const [open, setOpen] = useState(false);
  const ds = fmtDate(rec.date ?? rec.createdAt);
  const subs = rec.substances ?? [];

  const isFocused = focusDate === ds;
  useEffect(() => {
    if (isFocused) setOpen(true);
  }, [isFocused]);

  // Detect milestone — gives this card celebratory treatment
  const milestoneEvent = events.find((e) => e.key === "milestone");
  const isMilestone = !!milestoneEvent;

  const moodIdx =
    rec.mood != null ? Math.max(0, Math.min(4, rec.mood - 1)) : null;
  const stripeColor = events._isUse
    ? "#EF4444"
    : moodIdx != null
      ? MOOD_COLORS[moodIdx]
      : "#94A3B8";

  return (
    <div
      data-date={ds}
      style={{
        background: isMilestone
          ? `linear-gradient(135deg, ${GOLD_SOFT}, transparent)`
          : SU,
        borderRadius: isMilestone ? 12 : 10,
        border: isMilestone
          ? `2px solid ${GOLD_BORDER}`
          : `1px solid ${isFocused ? FOCUS_BLUE : BO}`,
        overflow: "hidden",
        boxShadow: isMilestone
          ? "0 4px 14px rgba(212, 160, 23, 0.18), var(--shadow-card)"
          : "var(--shadow-card)",
        scrollMarginTop: 80,
        transition: "border-color .15s",
        position: "relative",
      }}
    >
      {/* Milestone banner */}
      {isMilestone && (
        <div
          style={{
            background: `linear-gradient(90deg, ${GOLD}, #e8b528)`,
            color: "#fff",
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>🎯</span>
          <span>{milestoneEvent.label}</span>
        </div>
      )}

      {/* Collapsed header — clickable, toggles expansion */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: isMilestone ? "12px 14px" : "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {/* Vertical color stripe */}
        <div
          style={{
            width: isMilestone ? 5 : 4,
            alignSelf: "stretch",
            borderRadius: 2,
            background: isMilestone ? GOLD : stripeColor,
            flexShrink: 0,
          }}
        />

        {/* Date */}
        <div
          style={{
            fontSize: isMilestone ? 13 : 12,
            fontWeight: isMilestone ? 800 : 700,
            color: isMilestone ? GOLD : AD,
            minWidth: isMilestone ? 100 : 90,
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {isMilestone && <span style={{ fontSize: 13 }}>★</span>}
          {ds}
        </div>

        {/* Mood + cravings dots */}
        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.mood ?? "MOOD").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.mood} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.cravings ?? "CRAV").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.cravings} />
          </div>
        </div>

        {/* Badge strip — substance chips + event icons (skip milestone, in banner) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {events._isSober && (
            <span
              style={{
                fontSize: 9,
                color: "#16A34A",
                fontWeight: 700,
                background: "#22C55E22",
                border: "1px solid #22C55E44",
                borderRadius: 10,
                padding: "2px 7px",
              }}
            >
              {t.sober ?? "Sober"}
            </span>
          )}
          {subs.slice(0, 3).map((s) => (
            <span
              key={s}
              style={{
                fontSize: 9,
                color: sc(s),
                fontWeight: 700,
                textTransform: "capitalize",
                background: sc(s) + "18",
                borderRadius: 10,
                padding: "2px 7px",
              }}
            >
              {s}
            </span>
          ))}
          {subs.length > 3 && (
            <span style={{ fontSize: 9, color: MU }}>+{subs.length - 3}</span>
          )}
          {events
            .filter((e) => e.key !== "milestone")
            .map((e) => (
              <span
                key={e.key}
                title={e.label}
                style={{
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
                }}
              >
                <span>{e.icon}</span>
              </span>
            ))}
        </div>

        <span style={{ fontSize: 10, color: MU, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Inline note preview when collapsed — surfaces patient voice quickly */}
      {!open && rec.note?.trim() && (
        <div
          style={{
            padding: "0 14px 10px 32px",
            fontSize: 11,
            color: MU,
            fontStyle: "italic",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          "{rec.note.trim()}"
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div
          style={{
            padding: "0 14px 14px 14px",
            borderTop: `1px solid ${BG}`,
            marginTop: 4,
            paddingTop: 12,
          }}
        >
          {/* Full event labels (including milestone) */}
          {events.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {events.map((e) => (
                <span
                  key={e.key}
                  style={{
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
                  }}
                >
                  <span>{e.icon}</span>
                  <span>{e.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Detail grid — shared with DayModal */}
          <RecordDetailGrid rec={rec} t={t} layout="grid" />
        </div>
      )}
    </div>
  );
}
