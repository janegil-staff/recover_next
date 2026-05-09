"use client";
// Per-weekday use rate. Reveals "Friday cravings spike"-style patterns.
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Insight } from "./Card";
import { MU_VAR } from "../theme";

export default function DayOfWeekPattern({ records, c, t }) {
  const data = useMemo(() => {
    const weekdayLabels = t.weekdaysShort ?? [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    const buckets = weekdayLabels.map((label) => ({
      day: label,
      logged: 0,
      used: 0,
      pct: 0,
    }));
    records.forEach((r) => {
      const d = new Date(r.date ?? r.createdAt);
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].logged++;
      if ((r.substances ?? []).length > 0) buckets[idx].used++;
    });
    buckets.forEach((b) => {
      b.pct = b.logged ? Math.round((b.used / b.logged) * 100) : 0;
    });
    return buckets;
  }, [records, t]);

  const totalLogged = data.reduce((s, d) => s + d.logged, 0);

  const ranked = useMemo(() => {
    const withData = data.filter((d) => d.logged > 0);
    if (withData.length === 0) return { hardest: null, easiest: null };
    const sorted = [...withData].sort((a, b) => b.pct - a.pct);
    return { hardest: sorted[0], easiest: sorted[sorted.length - 1] };
  }, [data]);

  const barColor = (pct) => {
    if (pct === 0) return "#22C55E";
    if (pct < 25) return "#7AABDB";
    if (pct < 50) return "#FBBF24";
    if (pct < 75) return "#FB923C";
    return "#EF4444";
  };

  if (totalLogged === 0) {
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
  if (ranked.hardest && ranked.easiest) {
    const gap = ranked.hardest.pct - ranked.easiest.pct;
    if (ranked.hardest.pct === 0) {
      insightText =
        t.insightAllSober ?? "No use detected on any weekday in this period.";
      insightTone = "positive";
    } else if (gap >= 40) {
      insightText = `${ranked.hardest.day} ${
        t.insightHardestVsEasiest ?? "is the highest-risk day"
      } (${ranked.hardest.pct}%). ${ranked.easiest.day}: ${ranked.easiest.pct}%.`;
      insightTone = "warning";
    } else if (ranked.hardest.pct >= 50) {
      insightText = `${ranked.hardest.day} ${
        t.insightHighRisk ?? "shows elevated use rate"
      } (${ranked.hardest.pct}%).`;
      insightTone = "warning";
    } else {
      insightText =
        t.insightConsistentPattern ??
        "Use rate is fairly consistent across weekdays.";
    }
  }

  return (
    <div>
      {ranked.hardest && ranked.hardest.pct > 0 && (
        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 auto", minWidth: 120 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: barColor(ranked.hardest.pct),
                lineHeight: 1.1,
              }}
            >
              {ranked.hardest.day} · {ranked.hardest.pct}%
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
              {t.hardestDay ?? "Hardest day"}
            </div>
          </div>
          {ranked.easiest && ranked.easiest !== ranked.hardest && (
            <div style={{ flex: "1 1 auto", minWidth: 120 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: barColor(ranked.easiest.pct),
                  lineHeight: 1.1,
                }}
              >
                {ranked.easiest.day} · {ranked.easiest.pct}%
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
                {t.easiestDay ?? "Easiest day"}
              </div>
            </div>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={c.grid}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: c.muted, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: c.muted }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: `1px solid ${c.border}`,
              background: c.surface,
              color: c.text,
            }}
            formatter={(v, name, props) => {
              const p = props?.payload;
              if (!p) return [`${v}%`, name];
              const detail = `${p.used}/${p.logged} ${t.days ?? "days"} · ${v}%`;
              return [detail, t.useRate ?? "Use rate"];
            }}
            cursor={{ fill: c.grid, opacity: 0.3 }}
          />
          <Bar
            dataKey="pct"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            label={{
              position: "top",
              fill: c.text,
              fontSize: 10,
              fontWeight: 700,
              formatter: (v) => (v > 0 ? `${v}%` : ""),
            }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.pct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}
