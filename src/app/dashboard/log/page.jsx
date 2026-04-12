// src/app/dashboard/log/page.jsx
"use client";
import { useState, useMemo } from "react";
import { useDashboardT } from "../LangContext";

const A = "#4a7ab5",
  AD = "#2d4a6e",
  AL = "#dde8f4",
  BG = "#eef2f7",
  SU = "#ffffff",
  BO = "#d0dcea",
  TX = "#1a2c3d",
  MU = "#7a9ab8";
const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  other: "#bdbdbd",
};
const sc = (s) => SC[s] ?? "#bdbdbd";
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function cravingBg(n) {
  if (n == null) return "transparent";
  if (n <= 1) return "#a8d5a2";
  if (n <= 2) return "#f5c97a";
  if (n <= 3) return "#f4a07a";
  return "#e87070";
}

function ScoreDot({ val, color }) {
  if (val == null) return <span style={{ fontSize: 11, color: MU }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cravingBg(val),
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: AD }}>{val}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: MU,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function LogRow({ rec, t }) {
  const [open, setOpen] = useState(false);
  const ds = fmtDate(rec.date ?? rec.createdAt);
  const subs = rec.substances ?? [];
  const effects = rec.sideEffects ?? [];
  const meds = rec.medicationsTaken ?? [];
  const freqLabel = {
    once: t.freqOnceDaily ?? "Once",
    few_times: "Few times",
    daily: "Several times",
    multiple_daily: "Many times",
  };

  return (
    <div
      style={{
        background: SU,
        borderRadius: 10,
        border: `1px solid ${BO}`,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(74,122,181,0.05)",
      }}
    >
      {/* Compact row */}
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
        {/* Craving colour indicator */}
        <div
          style={{
            width: 4,
            alignSelf: "stretch",
            borderRadius: 2,
            background: cravingBg(rec.cravings),
            flexShrink: 0,
          }}
        />

        {/* Date */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: AD,
            minWidth: 90,
            flexShrink: 0,
          }}
        >
          {ds}
        </div>

        {/* Scores */}
        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.mood ?? "MOOD").toUpperCase()}
            </div>
            <ScoreDot val={rec.mood} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.cravings ?? "CRAV").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.cravings} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.wellbeing ?? "WELL").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={rec.wellbeing} />
          </div>
        </div>

        {/* Substance pills */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {subs.length > 0 ? (
            subs.map((s) => (
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
            ))
          ) : (
            <span style={{ fontSize: 10, color: MU }}>
              {t.noSubstancesLogged ?? "—"}
            </span>
          )}
        </div>

        {/* Note preview */}
        {rec.note && (
          <span
            style={{
              fontSize: 10,
              color: MU,
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            📝 {rec.note}
          </span>
        )}

        <span style={{ fontSize: 10, color: MU, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            padding: "0 14px 14px 14px",
            borderTop: `1px solid ${BG}`,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          {/* All scores */}
          <Section title={t.mood ?? "Scores"}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { k: "mood", l: t.mood ?? "Mood", c: "#4a7ab5" },
                { k: "cravings", l: t.cravings ?? "Cravings", c: "#f4a07a" },
                { k: "wellbeing", l: t.wellbeing ?? "Wellbeing", c: "#9c27b0" },
              ].map((s) => (
                <div
                  key={s.k}
                  style={{
                    background: BG,
                    borderRadius: 8,
                    padding: "7px 10px",
                    textAlign: "center",
                    minWidth: 60,
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: rec[s.k] != null ? AD : MU,
                      lineHeight: 1,
                    }}
                  >
                    {rec[s.k] ?? "-"}
                  </div>
                  <div style={{ fontSize: 9, color: MU, marginTop: 2 }}>
                    {s.l.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Frequency & amount */}
          {(rec.frequency || rec.amount != null) && (
            <Section
              title={`${t.frequency ?? "Frequency"} & ${t.amount ?? "Amount"}`}
            >
              <div style={{ fontSize: 12, color: TX }}>
                {rec.frequency
                  ? (freqLabel[rec.frequency] ?? rec.frequency)
                  : "—"}
              </div>
              {rec.amount != null && (
                <div style={{ fontSize: 12, color: TX }}>
                  {t.amount ?? "Amount"}: {rec.amount}
                </div>
              )}
            </Section>
          )}

          {/* Substances */}
          {subs.length > 0 && (
            <Section title={t.substances ?? "Substances"}>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {subs.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: sc(s) + "22",
                      color: sc(s),
                      border: `1px solid ${sc(s)}44`,
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Medications */}
          {meds.length > 0 && (
            <Section title={t.medicationsTitle ?? "Medications"}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {meds.map((med, i) => {
                  const name =
                    typeof med === "object"
                      ? (med.name ?? med.id ?? "?")
                      : String(med);
                  const dose =
                    typeof med === "object"
                      ? (med.dosage ?? med.dose ?? null)
                      : null;
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        color: TX,
                        textTransform: "capitalize",
                      }}
                    >
                      {name}
                      {dose && (
                        <span style={{ color: MU, marginLeft: 4 }}>
                          ({dose})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Side effects */}
          {effects.length > 0 && (
            <Section title={t.sideEffects ?? "Side effects"}>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {effects.map((e) => (
                  <span
                    key={e}
                    style={{
                      background: "#fff3e0",
                      color: "#e65100",
                      border: "1px solid #ffcc8055",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Weight */}
          {rec.weight && (
            <Section title={t.weight ?? "Weight"}>
              <span style={{ fontSize: 20, fontWeight: 800, color: AD }}>
                {rec.weight}
              </span>
              <span style={{ fontSize: 12, color: MU, marginLeft: 4 }}>
                {t.kg ?? "kg"}
              </span>
            </Section>
          )}

          {/* Note */}
          {rec.note && (
            <Section title={t.note ?? "Note"}>
              <div
                style={{
                  background: AL,
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: TX,
                  borderLeft: `3px solid ${A}`,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  gridColumn: "1 / -1",
                }}
              >
                "{rec.note}"
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

export default function LogPage() {
  const t = useDashboardT();

  const [data] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("patientData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // All substances seen across records
  const allSubs = useMemo(() => {
    const s = new Set();
    (data?.records ?? []).forEach((r) =>
      (r.substances ?? []).forEach((x) => s.add(x)),
    );
    return ["all", ...s];
  }, [data]);

  // Filtered + sorted records
  const records = useMemo(() => {
    let recs = [...(data?.records ?? [])];
    // Sort newest first
    recs.sort((a, b) =>
      (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt),
    );
    // Date range
    if (dateFrom)
      recs = recs.filter((r) => (r.date ?? r.createdAt) >= dateFrom);
    if (dateTo)
      recs = recs.filter(
        (r) => (r.date ?? r.createdAt) <= dateTo + "T23:59:59",
      );
    // Substance filter
    if (subFilter !== "all")
      recs = recs.filter((r) => (r.substances ?? []).includes(subFilter));
    // Note search
    if (search.trim())
      recs = recs.filter((r) =>
        (r.note ?? "").toLowerCase().includes(search.trim().toLowerCase()),
      );
    return recs;
  }, [data, dateFrom, dateTo, subFilter, search]);

  if (!data)
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU }}>
        {t.loading ?? "Loading…"}
      </div>
    );

  const inputStyle = {
    background: SU,
    border: `1px solid ${BO}`,
    borderRadius: 8,
    padding: "7px 11px",
    fontSize: 12,
    color: TX,
    fontFamily: "inherit",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Filters bar */}
      <div
        style={{
          background: SU,
          borderRadius: 12,
          border: `1px solid ${BO}`,
          padding: "12px 14px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        {/* Search notes */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍 ${t.note ?? "Search notes"}…`}
          style={{ ...inputStyle, flex: "1 1 160px", minWidth: 140 }}
        />

        {/* Date from */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: "0 0 auto",
          }}
        >
          <span style={{ fontSize: 11, color: MU, whiteSpace: "nowrap" }}>
            {t.date ?? "From"}:
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ ...inputStyle }}
          />
        </div>

        {/* Date to */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flex: "0 0 auto",
          }}
        >
          <span style={{ fontSize: 11, color: MU, whiteSpace: "nowrap" }}>
            {t.date ?? "To"}:
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ ...inputStyle }}
          />
        </div>

        {/* Substance filter */}
        <select
          value={subFilter}
          onChange={(e) => setSubFilter(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 auto", cursor: "pointer" }}
        >
          {allSubs.map((s) => (
            <option key={s} value={s}>
              {s === "all"
                ? (t.substancesAllTime ?? "All substances")
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* Clear */}
        {(search || dateFrom || dateTo || subFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setDateFrom("");
              setDateTo("");
              setSubFilter("all");
            }}
            style={{
              background: "none",
              border: `1px solid ${BO}`,
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 11,
              color: MU,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            ✕ {t.discard ?? "Clear"}
          </button>
        )}

        {/* Record count */}
        <span
          style={{
            fontSize: 11,
            color: MU,
            marginLeft: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {records.length} {t.totalRecords ?? "records"}
        </span>
      </div>

      {/* Log list */}
      {records.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {records.map((r, i) => (
            <LogRow key={i} rec={r} t={t} />
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
            {t.noData ?? "No records for this filter."}
          </div>
        </div>
      )}
    </div>
  );
}
