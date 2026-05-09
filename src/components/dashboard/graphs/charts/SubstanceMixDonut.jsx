"use client";
// Donut showing days per substance + sober days. Center number = days logged.
// Insight surfaces the dominant pattern (mostly sober / polysubstance / etc).
import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Insight } from "./Card";
import { SC } from "../theme";

export default function SubstanceMixDonut({ records, c, t }) {
  const data = useMemo(() => {
    const stats = {};
    let soberDays = 0;
    records.forEach((r) => {
      const subs = r.substances ?? [];
      if (subs.length === 0) {
        soberDays += 1;
        return;
      }
      subs.forEach((s) => {
        if (!stats[s]) stats[s] = { days: 0, totalAmount: 0 };
        stats[s].days += 1;
        stats[s].totalAmount += Number(r.amount) || 0;
      });
    });
    const entries = Object.entries(stats)
      .sort((a, b) => b[1].days - a[1].days)
      .map(([name, v]) => ({ name, days: v.days, amount: v.totalAmount }));
    if (soberDays > 0)
      entries.unshift({ name: "sober", days: soberDays, amount: 0 });
    return entries;
  }, [records]);

  const totalUniqueDays = records.length;
  const isEmpty = data.length === 0;

  const sliceColor = (name) => {
    if (name === "sober") return "#94A3B8";
    if (name === "empty") return "#E8EEF5";
    return SC[name] ?? SC.other;
  };
  const labelOf = (name) => {
    if (name === "sober") return t.sober ?? "Sober";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Insight: dominant pattern
  let insightText = null,
    insightTone = "neutral";
  if (!isEmpty) {
    const sober = data.find((d) => d.name === "sober");
    const substances = data.filter((d) => d.name !== "sober");
    const soberPct = sober
      ? Math.round((sober.days / totalUniqueDays) * 100)
      : 0;
    if (soberPct >= 80) {
      insightText = `${soberPct}% ${
        t.insightMostlySober ?? "of days were sober — strong recovery period"
      }.`;
      insightTone = "positive";
    } else if (soberPct >= 50) {
      insightText = `${soberPct}% ${
        t.insightMajoritySober ?? "of days were sober"
      }. ${
        substances[0]
          ? `${labelOf(substances[0].name)}: ${substances[0].days}d`
          : ""
      }.`;
      insightTone = "neutral";
    } else if (substances.length >= 2) {
      insightText = `${
        t.insightPolysubstance ?? "Polysubstance pattern"
      }: ${substances
        .slice(0, 2)
        .map((s) => labelOf(s.name))
        .join(" + ")} ${
        t.appearMostFrequently ?? "appear most frequently"
      }.`;
      insightTone = "warning";
    } else if (substances[0]) {
      insightText = `${labelOf(substances[0].name)}: ${substances[0].days} ${
        t.daysOfUse ?? "days of use"
      } (${Math.round((substances[0].days / totalUniqueDays) * 100)}%).`;
      insightTone = "warning";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <div style={{ width: "100%", height: 200, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={isEmpty ? [{ name: "empty", days: 1 }] : data}
              dataKey="days"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              paddingAngle={data.length > 1 ? 2 : 0}
              labelLine={false}
              isAnimationActive={false}
            >
              {(isEmpty ? [{ name: "empty" }] : data).map((entry, i) => (
                <Cell
                  key={`${entry.name}-${i}`}
                  fill={sliceColor(entry.name)}
                />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                formatter={(value, name, props) => {
                  const amt = props?.payload?.amount ?? 0;
                  const isSober = name === "sober";
                  const detail = isSober
                    ? `${value} ${t.days ?? "days"}`
                    : `${value} ${t.days ?? "days"} · ${amt} ${
                        t.totalAmount ?? "total amount"
                      }`;
                  return [detail, labelOf(name)];
                }}
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: `1px solid ${c.border}`,
                  background: c.surface,
                  color: c.text,
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {!isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: c.accentStrong,
                lineHeight: 1,
              }}
            >
              {totalUniqueDays}
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: c.muted,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                marginTop: 3,
              }}
            >
              {t.daysLogged ?? "days"}
            </div>
          </div>
        )}
      </div>

      {!isEmpty ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4px 12px",
            padding: "8px 4px 0",
            fontSize: 11,
          }}
        >
          {data.map((d) => {
            const pct =
              totalUniqueDays > 0
                ? Math.round((d.days / totalUniqueDays) * 100)
                : 0;
            return (
              <div
                key={d.name}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: sliceColor(d.name),
                  }}
                />
                <span
                  style={{
                    color: c.text,
                    fontWeight: 600,
                    flex: 1,
                    textTransform: "capitalize",
                  }}
                >
                  {labelOf(d.name)}
                </span>
                <span
                  style={{
                    color: c.muted,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {d.days}d · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: c.muted,
            fontSize: 11,
            fontStyle: "italic",
            padding: "8px 0",
          }}
        >
          {t.noSubstances ?? "No data"}
        </div>
      )}

      <Insight text={insightText} tone={insightTone} />
    </div>
  );
}