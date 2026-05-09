"use client";
// PDF export modal. Range selector, summary preview, generate button.
// All PDF rendering, helpers, and offscreen chart components live in
// sibling files in this folder.
import { useState, useCallback, useMemo } from "react";
import { A, AD, BO, MU, SU, BG } from "./theme";
import { RANGE_OPTIONS, rangeWindow, inWindow } from "./ranges";
import { detectLanguage, translationsDict } from "./language";
import { generatePDF } from "./generatePdf";
import OffscreenCharts from "./OffscreenCharts";

export default function PdfExportModal({ data, t: tProp, onClose }) {
  // If caller passed a non-empty `t`, use it. Otherwise self-load.
  const t = useMemo(() => {
    if (tProp && Object.keys(tProp).length > 0) return tProp;
    const lang = detectLanguage();
    return translationsDict?.[lang] ?? translationsDict?.no ?? {};
  }, [tProp]);

  const [rangeId, setRangeId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  const rangeOption =
    RANGE_OPTIONS.find((o) => o.id === rangeId) ?? RANGE_OPTIONS[4];
  const rangeMonths = rangeOption.months;

  // Filter records by range
  const recs = useMemo(() => {
    const { from, to } = rangeWindow(rangeMonths);
    return (data.records ?? []).filter((r) =>
      inWindow(r.date ?? r.createdAt, from, to),
    );
  }, [data, rangeMonths]);

  // Filter questionnaires by range — uses each questionnaire's `date` field.
  // If a questionnaire has no date and we're not on "all time", it's excluded
  // (otherwise stale data would leak into a "last 1 month" report).
  const filteredQuestionnaires = useMemo(() => {
    const { from, to } = rangeWindow(rangeMonths);
    const QC = [
      { key: "latestGad7", label: "GAD-7", max: 21 },
      { key: "latestPhq9", label: "PHQ-9", max: 27 },
      { key: "latestAudit", label: "AUDIT", max: 40 },
      { key: "latestDast10", label: "DAST-10", max: 10 },
      { key: "latestCage", label: "CAGE", max: 4 },
      { key: "latestReadiness", label: "Readiness", max: 30 },
    ];
    return QC.map((q) => {
      const raw = data[q.key];
      if (!raw) return { ...q, score: null };
      if (!inWindow(raw.date, from, to)) return { ...q, score: null };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      return { ...q, score };
    });
  }, [data, rangeMonths]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    setStep(t.renderingCharts ?? "Rendering charts…");
    setShowCharts(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStep(t.capturingDiagrams ?? "Capturing diagrams…");
      await generatePDF({ data, t, rangeMonths, recs, filteredQuestionnaires });
      setShowCharts(false);
      onClose();
    } catch (e) {
      console.error(e);
      setError(t.pdfFailed ?? "Failed to generate PDF. Please try again.");
      setShowCharts(false);
      setStep("");
    } finally {
      setLoading(false);
    }
  }, [data, t, rangeMonths, recs, filteredQuestionnaires, onClose]);

  return (
    <>
      {showCharts && (
        <OffscreenCharts
          data={data}
          recs={recs}
          filteredQuestionnaires={filteredQuestionnaires}
          t={t}
        />
      )}

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,30,50,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: SU,
            borderRadius: 18,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 24px 60px rgba(45,74,110,0.25)",
            border: `1px solid ${BO}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg,${A},${AD})`,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 10, fontWeight: 700,
                letterSpacing: 1.2, textTransform: "uppercase",
              }}>
                Recover
              </div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                ⬇ {t.exportPdfReport ?? "Export PDF Report"}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none", borderRadius: 8,
                width: 30, height: 30,
                cursor: "pointer", color: "#fff",
                fontSize: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Range selector */}
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, color: MU,
                letterSpacing: 0.8, marginBottom: 8,
              }}>
                {(t.dateRange ?? "DATE RANGE").toUpperCase()}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {RANGE_OPTIONS.map((opt) => {
                  const active = rangeId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setRangeId(opt.id)}
                      style={{
                        flex: "1 1 auto",
                        background: active ? A : BG,
                        color: active ? "#fff" : AD,
                        border: `1px solid ${active ? A : BO}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 12,
                        fontWeight: active ? 700 : 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t[opt.labelKey] ?? opt.fallback}
                    </button>
                  );
                })}
              </div>
              <div style={{
                fontSize: 11, color: MU,
                marginTop: 8, textAlign: "center",
              }}>
                {recs.length} {t.records ?? "records"} ·{" "}
                {filteredQuestionnaires.filter((q) => q.score != null).length}{" "}
                {t.questionnairesShort ?? "questionnaires"}
              </div>
            </div>

            <div style={{
              background: BG, borderRadius: 10,
              padding: "10px 14px",
              fontSize: 11, color: MU, lineHeight: 1.9,
            }}>
              ✓ Patient info &nbsp;·&nbsp; ✓ {t.monthSummary ?? "Period stats"}
              <br />
              ✓ 📈 Mood / Cravings / Wellbeing line chart
              <br />
              ✓ 🕸 Recovery Profile radar
              <br />
              ✓ 🕸 Substance Profile radar
              <br />✓ 🕸 {t.questionnaires ?? "Questionnaire"} radar
              <br />✓ {t.substancesMonth ?? "Substance summary"} + donut chart
              <br />✓ {t.weight ?? "Weight"} trend chart
              <br />✓ {t.relevantAdvice ?? "Relevant advice"} &nbsp;·&nbsp; ✓{" "}
              {t.history ?? "Full log"}
            </div>

            {step && (
              <div style={{
                fontSize: 12, color: A, fontWeight: 600, textAlign: "center",
              }}>
                {step}
              </div>
            )}
            {error && (
              <div style={{
                fontSize: 12, color: "#e53e3e", background: "#fff5f5",
                borderRadius: 8, padding: "8px 12px",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg,${A},${AD})`,
                color: "#fff", border: "none",
                borderRadius: 10, padding: "13px",
                fontSize: 13, fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                transition: "opacity .15s",
              }}
            >
              {loading
                ? `⏳ ${step || (t.generating ?? "Generating…")}`
                : `⬇ ${t.downloadPdf ?? "Download PDF"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}