"use client";
// Headline stat tiles for the top of the graphs page.
// Five at-a-glance numbers a doctor wants to see immediately:
// wellness, current streak, sober days, use days, mood trend.
import { useMemo } from "react";
import { MU_VAR, SU_VAR, BO_VAR } from "./theme";
import { calculateWellness } from "@/components/dashboard/calendar/wellnessScore";

const POSITIVE = "#16A34A";
const WARNING = "#D97706";
const NEUTRAL = "var(--accent-strong)";

export default function StatTilesRow({ data, records, t }) {
  const stats = useMemo(() => {
    if (!records.length) return null;

    // Wellness for current month
    const today = new Date();
    const currentMonth = { y: today.getFullYear(), m: today.getMonth() };
    const wellness = calculateWellness(data, currentMonth, t);
    const wellnessScore =
      wellness?.scoreNow != null ? Math.round(wellness.scoreNow) : null;

    // Current sober streak (count back from end)
    let currentStreak = 0;
    const sortedAsc = [...records].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );
    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      if ((sortedAsc[i].substances ?? []).length === 0) currentStreak++;
      else break;
    }

    // Sober vs use day counts
    const soberDays = records.filter(
      (r) => (r.substances ?? []).length === 0,
    ).length;
    const useDays = records.length - soberDays;

    // Mood trend: first half avg vs second half avg
    const validMood = sortedAsc.filter((r) => r.mood != null);
    let moodDelta = null;
    if (validMood.length >= 4) {
      const half = Math.floor(validMood.length / 2);
      const firstAvg =
        validMood.slice(0, half).reduce((s, r) => s + r.mood, 0) / half;
      const secondAvg =
        validMood.slice(half).reduce((s, r) => s + r.mood, 0) /
        (validMood.length - half);
      moodDelta = Math.round((secondAvg - firstAvg) * 10) / 10;
    }

    return {
      wellnessScore,
      currentStreak,
      soberDays,
      totalDays: records.length,
      useDays,
      moodDelta,
    };
  }, [data, records, t]);

  if (!stats) return null;

  const tiles = [
    {
      label: t.wellness ?? "Wellness",
      value: stats.wellnessScore != null ? stats.wellnessScore : "—",
      suffix: stats.wellnessScore != null ? "/100" : "",
      color:
        stats.wellnessScore == null
          ? MU_VAR
          : stats.wellnessScore >= 65
            ? POSITIVE
            : stats.wellnessScore >= 40
              ? NEUTRAL
              : WARNING,
    },
    {
      label: t.currentStreak ?? "Current streak",
      value: stats.currentStreak,
      suffix:
        stats.currentStreak === 1
          ? ` ${t.day ?? "day"}`
          : ` ${t.days ?? "days"}`,
      color: stats.currentStreak >= 7 ? POSITIVE : NEUTRAL,
    },
    {
      label: t.sober ?? "Sober",
      value: `${stats.soberDays}`,
      suffix: ` / ${stats.totalDays}`,
      color: POSITIVE,
    },
    {
      label: t.useDaysShort ?? "Use days",
      value: stats.useDays,
      suffix: "",
      color: stats.useDays === 0 ? POSITIVE : WARNING,
    },
    {
      label: t.moodTrend ?? "Mood trend",
      value:
        stats.moodDelta == null
          ? "—"
          : `${stats.moodDelta > 0 ? "↑" : stats.moodDelta < 0 ? "↓" : "→"} ${Math.abs(stats.moodDelta)}`,
      suffix: "",
      color:
        stats.moodDelta == null
          ? MU_VAR
          : stats.moodDelta >= 0.3
            ? POSITIVE
            : stats.moodDelta <= -0.3
              ? WARNING
              : NEUTRAL,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
        gap: 8,
        marginBottom: 16,
      }}
    >
      {tiles.map((tile, i) => (
        <div
          key={i}
          style={{
            background: SU_VAR,
            border: `1px solid ${BO_VAR}`,
            borderRadius: 12,
            padding: "10px 12px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: MU_VAR,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {tile.label}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: tile.color,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {tile.value}
            {tile.suffix && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: MU_VAR,
                  marginLeft: 2,
                }}
              >
                {tile.suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
