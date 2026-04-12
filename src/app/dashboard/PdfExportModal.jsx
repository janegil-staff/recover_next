// src/app/dashboard/PdfExportModal.jsx
// Generates a patient report PDF client-side using jsPDF (CDN loaded dynamically)
"use client";
import { useState, useCallback } from "react";

const A="#4a7ab5",AD="#2d4a6e",BO="#d0dcea",MU="#7a9ab8",SU="#ffffff",BG="#eef2f7";

function pad(n){return String(n).padStart(2,"0");}
function fmtDate(d){const dt=new Date(d);return`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;}

function avg(recs, field) {
  const vals = recs.map(r => r[field]).filter(v => v != null);
  if (!vals.length) return null;
  return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1);
}

function parseAdviceId(raw) {
  const m = String(raw).match(/(\d+)/);
  return m ? m[1] : String(raw);
}

// Load jsPDF from CDN once
let jsPDFPromise = null;
function loadJsPDF() {
  if (jsPDFPromise) return jsPDFPromise;
  jsPDFPromise = new Promise((resolve, reject) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return jsPDFPromise;
}

function generatePDF({ data, t, year, month, allTime }) {
  return loadJsPDF().then(JsPDF => {
    const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210, ML = 14, MR = 14, CW = W - ML - MR;
    let y = 0;

    const BLUE  = [74, 122, 181];
    const NAVY  = [45, 74, 110];
    const GRAY  = [122, 154, 184];
    const LGRAY = [238, 242, 247];
    const WHITE = [255, 255, 255];
    const DARK  = [26, 44, 61];

    function checkPage(need = 10) {
      if (y + need > 270) { doc.addPage(); y = 16; }
    }

    function sectionHeader(text) {
      checkPage(12);
      doc.setFillColor(...BLUE);
      doc.rect(ML, y, CW, 7, "F");
      doc.setTextColor(...WHITE);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(text.toUpperCase(), ML + 3, y + 5);
      y += 10;
      doc.setTextColor(...DARK);
    }

    function row(label, value, shade = false) {
      checkPage(7);
      if (shade) { doc.setFillColor(...LGRAY); doc.rect(ML, y, CW, 6, "F"); }
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(String(label), ML + 2, y + 4);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(String(value ?? "—"), ML + 60, y + 4);
      y += 6;
    }

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, 22, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Recover", ML, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(t.monthSummary ?? "Patient Report", ML, 18);

    const periodLabel = allTime
      ? (t.substancesAllTime ?? "All time")
      : `${(t.months ?? ["January","February","March","April","May","June","July","August","September","October","November","December"])[month]} ${year}`;
    doc.text(periodLabel, W - MR, 18, { align: "right" });
    doc.text(new Date().toLocaleDateString(), W - MR, 13, { align: "right" });
    y = 28;

    // ── Patient info ─────────────────────────────────────────────────────────
    sectionHeader(t.prescribedMeds ? (t.appName ?? "Patient") : "Patient");
    row(t.age ?? "Age",    data.age ?? "—",    false);
    row(t.female ?? "Gender", data.gender ?? "—", true);
    if (data.height) row("Height", `${data.height} cm`, false);
    y += 3;

    // ── Filter records ────────────────────────────────────────────────────────
    const allRecs = data.records ?? [];
    const recs = allTime
      ? allRecs
      : allRecs.filter(r => {
          const d = new Date(r.date ?? r.createdAt);
          return d.getFullYear() === year && d.getMonth() === month;
        });
    const sorted = [...recs].sort((a,b) => (b.date??b.createdAt).localeCompare(a.date??a.createdAt));

    // ── Period stats ──────────────────────────────────────────────────────────
    sectionHeader(periodLabel + " — " + (t.monthSummary ?? "Stats"));
    row(t.daysLogged   ?? "Days logged",   recs.length,       false);
    row(t.avgMood      ?? "Avg mood",      avg(recs,"mood"),  true);
    row(t.avgCravings  ?? "Avg cravings",  avg(recs,"cravings"), false);
    row(t.avgWellbeing ?? "Avg wellbeing", avg(recs,"wellbeing"), true);
    row(t.totalRecords ?? "Total records", allRecs.length,    false);
    y += 3;

    // ── Substance summary ─────────────────────────────────────────────────────
    const subCounts = {};
    recs.forEach(r => (r.substances ?? []).forEach(s => { subCounts[s] = (subCounts[s]??0)+1; }));
    const subEntries = Object.entries(subCounts).sort((a,b)=>b[1]-a[1]);

    sectionHeader(t.substancesMonth ?? "Substances");
    if (subEntries.length > 0) {
      subEntries.forEach(([s,n], i) => row(s, `${n} ${t.days??"days"}`, i%2===1));
    } else {
      doc.setFontSize(9); doc.setTextColor(...GRAY);
      doc.text(t.noSubstancesMonth ?? "No substances logged", ML+2, y+4);
      y += 7;
    }
    y += 3;

    // ── Questionnaire scores ──────────────────────────────────────────────────
    sectionHeader(t.questionnaires ?? "Questionnaire Scores");
    const QC = [
      {key:"latestGad7",  label:"GAD-7",    max:21},
      {key:"latestPhq9",  label:"PHQ-9",    max:27},
      {key:"latestAudit", label:"AUDIT",    max:40},
      {key:"latestDast10",label:"DAST-10",  max:10},
      {key:"latestCage",  label:"CAGE",     max:4},
      {key:"latestReadiness",label:"Readiness",max:30},
    ];
    QC.forEach((q, i) => {
      const raw = data[q.key];
      let val = t.noQuestionnaire ?? "Not completed";
      if (raw) {
        const score = Object.values(raw).reduce((a,b)=>typeof b==="number"?a+b:a, 0);
        val = `${score} / ${q.max}`;
      }
      row(q.label, val, i%2===1);
    });
    y += 3;

    // ── Relevant advice ───────────────────────────────────────────────────────
    const adviceIds = [...new Set(data.relevantAdvice ?? [])];
    if (adviceIds.length > 0) {
      sectionHeader(t.relevantAdvice ?? "Relevant Advice");
      adviceIds.forEach((id, i) => {
        const nid = parseAdviceId(id);
        const title = t[`advice_${nid}_title`] ?? `Advice ${nid}`;
        const body  = t[`advice_${nid}_body`]  ?? "";
        checkPage(14);
        const fillColor = i%2===0 ? LGRAY : WHITE; doc.setFillColor(...fillColor);
        doc.rect(ML, y, CW, body ? 14 : 7, "F");
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...NAVY);
        doc.text(`${i+1}. ${title}`, ML+2, y+5);
        if (body) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(...GRAY);
          const lines = doc.splitTextToSize(body, CW - 4);
          doc.text(lines.slice(0,2), ML+4, y+10);
          y += 15;
        } else {
          y += 8;
        }
      });
      y += 3;
    }

    // ── Full log records ──────────────────────────────────────────────────────
    sectionHeader(t.history ?? "Log Records");
    if (sorted.length === 0) {
      doc.setFontSize(9); doc.setTextColor(...GRAY);
      doc.text(t.noData ?? "No records", ML+2, y+4); y += 7;
    } else {
      // Table header
      checkPage(8);
      doc.setFillColor(...NAVY);
      doc.rect(ML, y, CW, 6, "F");
      doc.setTextColor(...WHITE);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const cols = [
        { x: ML+1,   w: 22, label: t.date ?? "Date" },
        { x: ML+24,  w: 12, label: t.mood ?? "Mood" },
        { x: ML+37,  w: 16, label: t.cravings ?? "Crav" },
        { x: ML+54,  w: 16, label: t.wellbeing ?? "Well" },
        { x: ML+71,  w: 40, label: t.substances ?? "Substances" },
        { x: ML+112, w: CW-112, label: t.note ?? "Note" },
      ];
      cols.forEach(c => doc.text(c.label.slice(0,10), c.x, y+4));
      y += 7;

      sorted.forEach((r, i) => {
        checkPage(6);
        if (i%2===0) { doc.setFillColor(...LGRAY); doc.rect(ML, y, CW, 5.5, "F"); }
        doc.setTextColor(...DARK);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(fmtDate(r.date??r.createdAt), cols[0].x, y+4);
        doc.text(String(r.mood??"-"),          cols[1].x, y+4);
        doc.text(String(r.cravings??"-"),      cols[2].x, y+4);
        doc.text(String(r.wellbeing??"-"),     cols[3].x, y+4);
        const subs = (r.substances??[]).join(", ").slice(0,20);
        doc.text(subs||"—",                    cols[4].x, y+4);
        const note = (r.note??"").slice(0,35);
        doc.text(note,                         cols[5].x, y+4);
        y += 5.5;
      });
    }

    // ── Footer on every page ──────────────────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(`KBB Medic AS · Recover · ${new Date().toLocaleDateString()}`, ML, 290);
      doc.text(`${p} / ${pageCount}`, W-MR, 290, { align: "right" });
    }

    const filename = `recover_${data.age ?? "patient"}_${periodLabel.replace(/\s/g,"_")}.pdf`;
    doc.save(filename);
  });
}

// ── Modal component ───────────────────────────────────────────────────────────
export default function PdfExportModal({ data, t: tProp, onClose }) {
  const t = tProp ?? {};
  const now = new Date();
  const [year,  setYear]    = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth());
  const [allTime, setAllTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const months = t.months ?? ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await generatePDF({ data, t, year, month, allTime });
      onClose();
    } catch(e) {
      console.error(e);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [data, t, year, month, allTime, onClose]);

  const inputStyle = {
    background: BG, border: `1px solid ${BO}`, borderRadius: 8,
    padding: "7px 11px", fontSize: 13, color: AD, fontFamily: "inherit",
    outline: "none", width: "100%",
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,30,50,0.55)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:SU,borderRadius:18,width:"100%",maxWidth:400,boxShadow:"0 24px 60px rgba(45,74,110,0.25)",border:`1px solid ${BO}`,overflow:"hidden"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${A},${AD})`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>Recover</div>
            <div style={{color:"#fff",fontSize:16,fontWeight:700,marginTop:2}}>📄 Export PDF Report</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
        </div>

        <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>

          {/* All time toggle */}
          <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:AD,fontWeight:600}}>
            <input type="checkbox" checked={allTime} onChange={e=>setAllTime(e.target.checked)}
              style={{width:16,height:16,cursor:"pointer",accentColor:A}}/>
            {t.substancesAllTime ?? "All time"}
          </label>

          {/* Month/year pickers */}
          {!allTime && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:0.8,marginBottom:5}}>MONTH</div>
                <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={inputStyle}>
                  {months.map((m,i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:0.8,marginBottom:5}}>YEAR</div>
                <select value={year} onChange={e=>setYear(Number(e.target.value))} style={inputStyle}>
                  {[now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* What's included */}
          <div style={{background:BG,borderRadius:10,padding:"10px 14px",fontSize:11,color:MU,lineHeight:1.8}}>
            ✓ {t.prescribedMeds ?? "Patient info"}<br/>
            ✓ {t.monthSummary ?? "Period stats"} (mood, cravings, wellbeing)<br/>
            ✓ {t.substancesMonth ?? "Substance summary"}<br/>
            ✓ {t.questionnaires ?? "Questionnaire scores"}<br/>
            ✓ {t.relevantAdvice ?? "Relevant advice"}<br/>
            ✓ {t.history ?? "Full log records"}
          </div>

          {error && <div style={{fontSize:12,color:"#e53e3e",background:"#fff5f5",borderRadius:8,padding:"8px 12px"}}>{error}</div>}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{background:`linear-gradient(135deg,${A},${AD})`,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:13,fontWeight:700,cursor:loading?"wait":"pointer",fontFamily:"inherit",opacity:loading?0.7:1,transition:"opacity .15s"}}
          >
            {loading ? "⏳ Generating…" : "⬇ Download PDF"}
          </button>

        </div>
      </div>
    </div>
  );
}