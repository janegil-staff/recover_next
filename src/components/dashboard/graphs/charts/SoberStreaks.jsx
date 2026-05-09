"use client";
// Current run, longest stretch, sober/used heatmap, top streaks bar list.
// Most clinically meaningful chart on the page — patients hit milestones in days.
import { useMemo } from "react";
import { Insight } from "./Card";
import { MU_VAR } from "../theme";
import { shortDate } from "../helpers";

export default function SoberStreaks({ records, c, t }) {
  const stats = useMemo(() => {
    if (records.length === 0)
      return { current: 0, longest: 0, totalSober: 0, streaks: [], days: [] };

    const days = records.map((r) => ({
      date: r.date ?? r.createdAt,
      shortDate: shortDate(r.date ?? r.createdAt),
      sober: (r.substances ?? []).length === 0,
    }));

    const streaks = [];
    let runStart = null,
      runLength = 0;
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
  }, [records]);

  const topStreaks = useMemo(
    () => [...stats.streaks].sort((a, b) => b.length - a.length).slice(0, 5),
    [stats.streaks],
  );

  if (stats.days.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: MU_VAR,
          fontSize: 12,
          padding: 20,
        }}
      >
        {t.noData ?? "No data in range"}
      </div>
    );
  }

  // Insight logic
  let insightText = null,
    insightTone = "neutral";
  if (stats.current >= 30) {
    insightText =
      t.insightStreakMonth ??
      "Currently sustaining a 30+ day streak — major milestone.";
    insightTone = "positive";
  } else if (stats.current >= 14) {
    insightText =
      t.insightStreakTwoWeek ??
      "Currently in a 2-week+ sober run — sustained progress.";
    insightTone = "positive";
  } else if (stats.current >= 7) {
    insightText =
      t.insightStreakWeek ??
      "One-week streak in progress — building momentum.";
    insightTone = "positive";
  } else if (stats.current === stats.longest && stats.current > 0) {
    insightText =
      t.insightStreakNewBest ??
      "Currently in patient's longest recorded streak.";
    insightTone = "positive";
  } else if (stats.current === 0 && stats.longest > 7) {
    insightText =
      t.insightStreakBroken ??
      "Recently broke a longer streak — close support recommended.";
    insightTone = "warning";
  }

  const streakColor = (n) => {
    if (n >= 30) return "#16A34A";
    if (n >= 14) return "#22C55E";
    if (n >= 7) return "#7AABDB";
    if (n >= 3) return "#FBBF24";
    return "#FB923C";
  };

  return (
    <div>
      {/* Headline stats row */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: stats.current > 0 ? streakColor(stats.current) : c.muted,
              lineHeight: 1,
            }}
          >
            {stats.current}
          </div>
          <div
            style={{
              fontSize: 9,
              color: c.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {t.currentStreak ?? "Current streak"} · {t.days ?? "days"}
          </div>
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: stats.longest > 0 ? streakColor(stats.longest) : c.muted,
              lineHeight: 1,
            }}
          >
            {stats.longest}
          </div>
          <div
            style={{
              fontSize: 9,
              color: c.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {t.longestStreak ?? "Longest streak"} · {t.days ?? "days"}
          </div>
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 100 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: c.accentStrong,
              lineHeight: 1,
            }}
          >
            {stats.totalSober}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: c.muted,
                marginLeft: 4,
              }}
            >
              / {stats.days.length}
            </span>
          </div>
          <div
            style={{
              fontSize: 9,
              color: c.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            {t.soberDaysTotal ?? "Sober days total"}
          </div>
        </div>
      </div>

      {/* Heatmap strip */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            padding: "4px 0",
          }}
        >
          {stats.days.map((d, i) => (
            <div
              key={i}
              title={`${d.shortDate} — ${
                d.sober ? (t.sober ?? "Sober") : (t.used ?? "Used")
              }`}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: d.sober ? "#22C55E" : "#EF4444",
                opacity: d.sober ? 1 : 0.85,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 6,
            fontSize: 10,
            color: c.muted,
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: "#22C55E",
                borderRadius: 2,
              }}
            />
            {t.sober ?? "Sober"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                background: "#EF4444",
                borderRadius: 2,
                opacity: 0.85,
              }}
            />
            {t.used ?? "Used"}
          </div>
        </div>
      </div>

      {/* Top streaks bar list */}
      {topStreaks.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 9,
              color: c.muted,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t.topStreaks ?? "Top streaks"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {topStreaks.map((s, i) => {
              const pct =
                stats.longest > 0 ? (s.length / stats.longest) * 100 : 0;
              return (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: c.text,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.start} → {s.end}{" "}
                      {s.ongoing && (
                        <span
                          style={{
                            color: streakColor(s.length),
                            fontWeight: 700,
                          }}
                        >
                          · {t.ongoing ?? "ongoing"}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: streakColor(s.length),
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.length}{" "}
                      {s.length === 1 ? (t.day ?? "day") : (t.days ?? "days")}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: c.grid,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: streakColor(s.length),
                        borderRadius: 3,
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}