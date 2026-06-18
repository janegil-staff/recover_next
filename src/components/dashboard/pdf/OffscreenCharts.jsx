"use client";
// Off-screen Recharts components rendered into the DOM at fixed positions
// (off the visible viewport via -9999px) so html2canvas can capture them
// as PNG snapshots for embedding in the PDF document.
//
// Each chart has a stable id ("pdf-chart-X") referenced in generatePdf.js.
// Order of rendering: this component is mounted just before generatePDF() is
// called, then unmounted after PDF download completes.
//
// NOTE: the mood/cravings/wellbeing line chart and the weight line chart
// here use WEEKLY AVERAGES rather than per-day values. The on-screen graphs
// page shows daily points with thinned X-axis labels — that looks fine
// interactively but reads as noise when printed. Weekly averaging gives a
// readable trend line at PDF resolution. See `weeklyAverages` below.
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SC_COLORS } from "./theme";
import { shortDate } from "./helpers";
// SOBER_DAY_FIX_2026-06-18 — single source of truth for sober detection and
// substance filtering (sober days store substances:["sober"], not []).
import { isSoberDay, realSubstances } from "@/components/dashboard/log/eventDetection";

// ── Weekly aggregation ─────────────────────────────────────────────────────
// Bucket records by ISO week (Monday-anchored) and average each bucket.
// Returns an array of { date, ...keys } sorted ascending by date, where
// `date` is the short label of the Monday that starts the week.
function weeklyAverages(records, keys) {
  const buckets = {};
  records.forEach((r) => {
    const raw = r.date ?? r.createdAt;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return;
    const dow = (d.getDay() + 6) % 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - dow);
    monday.setHours(0, 0, 0, 0);
    const wkKey = monday.toISOString().slice(0, 10);

    if (!buckets[wkKey]) {
      buckets[wkKey] = { _monday: monday, _sums: {}, _counts: {} };
    }
    keys.forEach((k) => {
      if (r[k] != null) {
        buckets[wkKey]._sums[k] = (buckets[wkKey]._sums[k] ?? 0) + r[k];
        buckets[wkKey]._counts[k] = (buckets[wkKey]._counts[k] ?? 0) + 1;
      }
    });
  });

  return Object.values(buckets)
    .sort((a, b) => a._monday - b._monday)
    .map((b) => {
      const out = { date: shortDate(b._monday) };
      keys.forEach((k) => {
        if (b._counts[k]) {
          out[k] = Math.round((b._sums[k] / b._counts[k]) * 10) / 10;
        } else {
          out[k] = null;
        }
      });
      return out;
    });
}

export default function OffscreenCharts({
  data,
  recs,
  filteredQuestionnaires,
  t,
}) {
  const allRecs = data.records ?? [];

  // Weekly-averaged mood/cravings/wellbeing
  const moodData = weeklyAverages(recs, ["mood", "cravings", "wellbeing"]);

  const avg = (key) => {
    const v = recs.map((r) => r[key]).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const avgMood = avg("mood");
  const avgWellbeing = avg("wellbeing");
  const avgCravings = avg("cravings");
  const avgAmount = avg("amount");
  // SOBER_DAY_FIX_2026-06-18 — sober days store substances:["sober"], so the
  // old `!r.substances?.length` check counted them as use → axis collapsed to 0.
  const soberDays = recs.filter((r) => isSoberDay(r)).length;
  const soberPct = recs.length ? (soberDays / recs.length) * 5 : 0;

  // Recovery radar — subject labels now go through translations so the PDF
  // matches the user's selected language. Falls back to English if a key
  // isn't defined.
  const recoveryRadarData = [
    {
      subject: t.mood ?? "Mood",
      value: +(avgMood ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.wellbeing ?? "Wellbeing",
      value: +(avgWellbeing ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.lowCravings ?? "Low cravings",
      value: avgCravings != null ? +Math.max(0, 5 - avgCravings).toFixed(1) : 5,
      fullMark: 5,
    },
    {
      subject: t.lowAmount ?? "Low amount",
      value:
        avgAmount != null
          ? +Math.max(0, 5 - (avgAmount / 10) * 5).toFixed(1)
          : 5,
      fullMark: 5,
    },
    {
      subject: t.soberDays ?? "Sober days",
      value: +soberPct.toFixed(1),
      fullMark: 5,
    },
  ];

  // SOBER_DAY_FIX_2026-06-18 — exclude the "sober" tag from substance
  // aggregation via realSubstances(); otherwise "sober" shows up as its own
  // axis on the Substance Profile radar (and a slice in the donut below).
  const subMap = {};
  recs.forEach((r) =>
    realSubstances(r).forEach((s) => {
      if (!subMap[s]) subMap[s] = { count: 0, totalAmt: 0 };
      subMap[s].count++;
      subMap[s].totalAmt += r.amount ?? 0;
    }),
  );
  const subEntries = Object.entries(subMap);
  const maxCount = subEntries.length
    ? Math.max(...subEntries.map(([, v]) => v.count))
    : 1;
  // Substance radar — try a translation for each substance name first,
  // then fall back to a capitalized version of the raw value.
  const substanceRadarData = subEntries.map(([s, v]) => ({
    subject: t[s] ?? s.charAt(0).toUpperCase() + s.slice(1),
    days: v.count,
    avgAmount: Math.round((v.totalAmt / v.count) * 10) / 10,
    fullMark: maxCount,
  }));

  // Weekly-averaged weight
  const weightData = weeklyAverages(
    recs.filter((r) => r.weight),
    ["weight"],
  );

  // Substance Mix donut data — count only REAL substances per day (excluding
  // the "sober" tag), then prepend a single "sober" slice for sober days.
  const mixStats = {};
  recs.forEach((r) => {
    const subs = realSubstances(r);
    if (subs.length === 0) return;
    subs.forEach((s) => {
      if (!mixStats[s]) mixStats[s] = { days: 0, amount: 0 };
      mixStats[s].days++;
      mixStats[s].amount += Number(r.amount) || 0;
    });
  });
  const mixEntries = Object.entries(mixStats)
    .sort((a, b) => b[1].days - a[1].days)
    .map(([name, v]) => ({ name, days: v.days, amount: v.amount }));
  // DONUT_SOBER_SLICE_2026-06-18 — append sober at the END, not unshift to the
  // front. With startAngle=90/endAngle=-270 (full clockwise circle) + paddingAngle,
  // Recharts can collapse the FIRST segment (pinned exactly to the start angle)
  // to a hairline, so the grey sober slice was invisible in the captured PNG.
  // Placing it last keeps it off the start-angle seam.
  if (soberDays > 0) {
    mixEntries.push({ name: "sober", days: soberDays, amount: 0 });
  }
  const mixTotal = recs.length;
  const sliceColor = (name) =>
    name === "sober" ? "#94A3B8" : (SC_COLORS[name] ?? "#bdbdbd");

  const qRadarData = filteredQuestionnaires.map((q) => ({
    subject: q.label,
    value: q.score != null ? Math.round((q.score / q.max) * 100) : 0,
    fullMark: 100,
  }));

  const wrap = {
    position: "fixed",
    left: "-9999px",
    top: "0px",
    zIndex: -1,
    background: "#fff",
  };

  return (
    <div style={wrap}>
      <div
        id="pdf-chart-mood"
        style={{
          width: Math.max(520, moodData.length * 60),
          height: 220,
          background: "#fff",
          padding: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={moodData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e0e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#7a9ab8" }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(0, Math.ceil(moodData.length / 10) - 1)}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: "#7a9ab8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <ReferenceLine y={3} stroke="#d0dcea" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="mood"
              name={t.mood ?? "Mood"}
              stroke="#4a7ab5"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4a7ab5", strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="cravings"
              name={t.cravings ?? "Cravings"}
              stroke="#f4a07a"
              strokeWidth={2}
              dot={{ r: 3, fill: "#f4a07a", strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="wellbeing"
              name={t.wellbeing ?? "Wellbeing"}
              stroke="#66bb6a"
              strokeWidth={2}
              dot={{ r: 3, fill: "#66bb6a", strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div
        id="pdf-chart-recovery-radar"
        style={{ width: 320, height: 280, background: "#fff", padding: "8px" }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2d4a6e",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {t.recoveryProfile ?? "Recovery Profile"}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart
            data={recoveryRadarData}
            margin={{ top: 16, right: 44, bottom: 16, left: 44 }}
          >
            <PolarGrid stroke="#d0dcea" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#2d4a6e", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tickCount={6}
              tick={{ fontSize: 8, fill: "#7a9ab8" }}
            />
            <Radar
              name={t.score ?? "Score"}
              dataKey="value"
              stroke="#66bb6a"
              fill="#66bb6a"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {substanceRadarData.length >= 3 && (
        <div
          id="pdf-chart-substance-radar"
          style={{
            width: 320,
            height: 280,
            background: "#fff",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#2d4a6e",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t.substanceProfile ?? "Substance Profile"}
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart
              data={substanceRadarData}
              margin={{ top: 16, right: 44, bottom: 16, left: 44 }}
            >
              <PolarGrid stroke="#d0dcea" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: "#2d4a6e", fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                tickCount={4}
                tick={{ fontSize: 8, fill: "#7a9ab8" }}
              />
              <Radar
                name={t.daysUsed ?? "Days used"}
                dataKey="days"
                stroke="#4a7ab5"
                fill="#4a7ab5"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name={t.avgAmount ?? "Avg amount"}
                dataKey="avgAmount"
                stroke="#ec407a"
                fill="#ec407a"
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div
        id="pdf-chart-q-radar"
        style={{ width: 380, height: 300, background: "#fff", padding: "8px" }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2d4a6e",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {t.questionnaireRadar ?? "Questionnaire Radar"}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart
            data={qRadarData}
            margin={{ top: 16, right: 50, bottom: 16, left: 50 }}
          >
            <PolarGrid stroke="#d0dcea" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#2d4a6e", fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6}
              tick={{ fontSize: 9, fill: "#7a9ab8" }}
              unit="%"
            />
            <Radar
              name={t.scorePct ?? "Score %"}
              dataKey="value"
              stroke="#4a7ab5"
              fill="#4a7ab5"
              fillOpacity={0.25}
              strokeWidth={2.5}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {mixEntries.length > 0 && (
        <div
          id="pdf-chart-substance-mix"
          style={{
            width: 200,
            height: 200,
            background: "#fff",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 190, height: 190, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mixEntries}
                  dataKey="days"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={88}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={mixEntries.length > 1 ? 2 : 0}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {mixEntries.map((e, i) => (
                    <Cell key={`${e.name}-${i}`} fill={sliceColor(e.name)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
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
                  color: "#2d4a6e",
                  lineHeight: 1,
                }}
              >
                {mixTotal}
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#7a9ab8",
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {t.daysLogged ?? "days"}
              </div>
            </div>
          </div>
        </div>
      )}

      {weightData.length > 1 && (
        <div
          id="pdf-chart-weight"
          style={{
            width: Math.max(520, weightData.length * 60),
            height: 180,
            background: "#fff",
            padding: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.ceil(weightData.length / 8) - 1)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
                domain={[(d) => Math.floor(d - 2), (d) => Math.ceil(d + 2)]}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                name={`${t.weight ?? "Weight"} (${t.kg ?? "kg"})`}
                stroke="#2d4a6e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#2d4a6e", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}