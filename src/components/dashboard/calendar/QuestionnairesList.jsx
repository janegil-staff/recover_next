"use client";
// Right-column list of questionnaires (GAD-7, PHQ-9, AUDIT, DAST-10, CAGE,
// Readiness). Each row shows total/max, severity, and bar; clicking opens
// the detail modal.
import { BG, MU, TX } from "./theme";
import { QC } from "./constants";
import { scoreTotal } from "./helpers";

export default function QuestionnairesList({ data, onOpen, t = {} }) {
  return (
    <div
      style={{
        padding: "0 14px 12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {QC.map((q, qi) => {
        const total = scoreTotal(data[q.key]);
        const hasData = data[q.key] != null;
        return (
          <div
            key={q.key}
            onClick={() => hasData && onOpen(q.key)}
            className={hasData ? "qrow" : ""}
            style={{
              padding: "9px 6px",
              borderBottom: qi < QC.length - 1 ? `1px solid ${BG}` : "none",
              cursor: hasData ? "pointer" : "default",
              borderRadius: 6,
              transition: "background .1s",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: total != null ? 4 : 0,
              }}
            >
              <span style={{ fontSize: 12, color: TX, fontWeight: 600 }}>
                {q.label}
              </span>
              {total != null ? (
                <span style={{ fontSize: 11, color: q.color, fontWeight: 700 }}>
                  {total}/{q.max}
                </span>
              ) : (
                <span style={{ fontSize: 11, color: MU }}>—</span>
              )}
            </div>
            {total != null && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      background: BG,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (total / q.max) * 100)}%`,
                        height: "100%",
                        background: q.color,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: q.color,
                      fontWeight: 700,
                      flexShrink: 0,
                      cursor: "pointer",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      hasData && onOpen(q.key);
                    }}
                  >
                    {t.readMore ?? "Read more"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: q.color,
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  {q.fn(total)}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
