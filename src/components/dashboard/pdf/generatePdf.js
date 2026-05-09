// Main PDF document generator. Orchestrates jsPDF doc creation, captures
// charts via html2canvas, and assembles the document page-by-page.
//
// Inputs:
//   - data: full patient data object
//   - t: translation dictionary
//   - rangeMonths: months for the period (null = all time)
//   - recs: pre-filtered records for the range
//   - filteredQuestionnaires: pre-filtered questionnaires
import {
  loadScript,
  captureElement,
  JSPDF_CDN,
  HTML2CANVAS_CDN,
} from "./loadScripts";
import {
  NAVY,
  GRAY,
  LGRAY,
  DARK,
  WHITE,
  PAGE_W,
  MARGIN_L,
  MARGIN_R,
  CONTENT_W,
  PAGE_BOTTOM,
  SC_COLORS,
} from "./theme";
import { fmtDate, parseAdviceId, avgOf } from "./helpers";
import { formatRangeLabel } from "./ranges";
import { LOGO_B64 } from "./logo";

export async function generatePDF({
  data,
  t,
  rangeMonths,
  recs,
  filteredQuestionnaires,
}) {
  await loadScript(JSPDF_CDN);
  await loadScript(HTML2CANVAS_CDN);
  await new Promise((r) => setTimeout(r, 800));

  const [
    moodImg,
    recoveryRadarImg,
    substanceRadarImg,
    weightImg,
    qRadarImg,
    substanceMixImg,
  ] = await Promise.all([
    captureElement("pdf-chart-mood"),
    captureElement("pdf-chart-recovery-radar"),
    captureElement("pdf-chart-substance-radar"),
    captureElement("pdf-chart-weight"),
    captureElement("pdf-chart-q-radar"),
    captureElement("pdf-chart-substance-mix"),
  ]);

  const JsPDF = window.jspdf.jsPDF;
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ML = MARGIN_L;
  const MR = MARGIN_R;
  const CW = CONTENT_W;
  const W = PAGE_W;
  let y = 0;

  function checkPage(need = 10) {
    if (y + need > PAGE_BOTTOM) {
      doc.addPage();
      y = 16;
    }
  }

  function sectionHeader(text) {
    checkPage(10);
    y += 4;
    doc.setDrawColor(200, 212, 226);
    doc.setLineWidth(0.3);
    doc.line(ML, y, W - MR, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(), ML, y);
    y += 5;
    doc.setTextColor(...DARK);
  }

  function colHeader(text, x, atY) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(), x, atY);
    doc.setTextColor(...DARK);
  }

  function row(label, value, shade = false) {
    checkPage(7);
    if (shade) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, y, CW, 6, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(String(label), ML + 2, y + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(value ?? "—"), ML + 60, y + 4);
    y += 6;
  }

  function addChart(imgData, label, h = 55) {
    if (!imgData) return;
    checkPage(h + 6);
    if (label) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GRAY);
      doc.text(label, ML, y + 3);
      y += 5;
    }
    doc.addImage(imgData, "PNG", ML, y, CW, h);
    y += h + 3;
  }

  function addChartPair(img1, img2, h = 62) {
    if (!img1 && !img2) return;
    checkPage(h + 6);
    const half = (CW - 4) / 2;
    if (img1) doc.addImage(img1, "PNG", ML, y, half, h);
    if (img2) doc.addImage(img2, "PNG", ML + half + 4, y, half, h);
    y += h + 3;
  }

  const periodLabel = formatRangeLabel(rangeMonths, t);
  const allRecs = data.records ?? [];

  // ── Header ──
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 22, "F");
  try {
    doc.addImage(LOGO_B64, "JPEG", ML, 2, 18, 18);
  } catch (e) {}
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Recover", ML + 21, 11);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(t.patientReport ?? "Patient Report", ML + 21, 17);
  doc.text(periodLabel, W - MR, 11, { align: "right" });
  doc.text(new Date().toLocaleDateString(), W - MR, 17, { align: "right" });
  y = 28;

  // ── Patient info + Weight/BMI side by side ──
  const patientWeight = data.weight && data.weight > 0 ? data.weight : null;
  const bmi =
    patientWeight && data.height
      ? (patientWeight / (data.height / 100) ** 2).toFixed(1)
      : null;

  checkPage(10);
  y += 4;
  doc.setDrawColor(200, 212, 226);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);
  y += 4;
  const halfCW = (CW - 8) / 2;
  const rightX = ML + halfCW + 8;
  colHeader(t.patient ?? "Patient", ML, y);
  colHeader(t.weightBmi ?? "Weight & BMI", rightX, y);
  y += 5;
  const startY = y;

  const patRows = [
    [t.age ?? "Age", data.age ?? "—"],
    [t.gender ?? "Gender", data.gender ?? "—"],
  ];
  let ly = startY;
  patRows.forEach(([l, v], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, ly, halfCW, 5, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(l, ML + 2, ly + 3.5);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(v), ML + 28, ly + 3.5);
    ly += 5;
  });

  let ry = startY;
  const wRows = [
    [
      t.weight ?? "Weight",
      patientWeight ? `${patientWeight} ${t.kg ?? "kg"}` : "—",
    ],
    [t.bmi ?? "BMI", bmi ?? "—"],
    [t.heightLabel ?? "Height", data.height ? `${data.height} cm` : "—"],
  ];
  wRows.forEach(([l, v], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(rightX, ry, halfCW, 5, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(l, rightX + 2, ry + 3.5);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(v), rightX + 28, ry + 3.5);
    ry += 5;
  });

  y = Math.max(ly, ry) + 3;

  // ── Period stats + Sober streak panel side by side ──
  sectionHeader(periodLabel);

  const halfStatsCW = (CW - 8) / 2;
  const streakX = ML + halfStatsCW + 8;
  const statsStartY = y;

  function statRow(label, value, atY, shade = false) {
    if (shade) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, atY, halfStatsCW, 6, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(String(label), ML + 2, atY + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(value ?? "—"), ML + halfStatsCW - 2, atY + 4, {
      align: "right",
    });
  }

  let statY = statsStartY;
  const statsRows = [
    [t.daysLogged ?? "Days logged", recs.length, false],
    [t.avgMood ?? "Avg mood", avgOf(recs, "mood"), true],
    [t.avgCravings ?? "Avg cravings", avgOf(recs, "cravings"), false],
    [t.avgWellbeing ?? "Avg wellbeing", avgOf(recs, "wellbeing"), true],
    [t.totalRecords ?? "Total records", allRecs.length, false],
  ];
  statsRows.forEach(([l, v, shade]) => {
    statRow(l, v, statY, shade);
    statY += 6;
  });

  // Sober streak metrics
  const sortedAsc = [...recs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );
  let soberCount = 0,
    useCount = 0,
    longest = 0,
    running = 0,
    current = 0;
  sortedAsc.forEach((r) => {
    const isSober = (r.substances ?? []).length === 0;
    if (isSober) {
      soberCount++;
      running++;
      if (running > longest) longest = running;
    } else {
      useCount++;
      running = 0;
    }
  });
  for (let i = sortedAsc.length - 1; i >= 0; i--) {
    if ((sortedAsc[i].substances ?? []).length === 0) current++;
    else break;
  }

  const panelStartY = statsStartY;
  const panelH = statY - statsStartY;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GRAY);
  doc.text(
    (t.soberStreak ?? "SOBER STREAK").toUpperCase(),
    streakX,
    statsStartY - 5,
  );

  doc.setFillColor(245, 250, 247);
  doc.setDrawColor(34, 197, 94, 60);
  doc.roundedRect(streakX, panelStartY, halfStatsCW, panelH, 2, 2, "F");

  const bigY = panelStartY + 12;
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94);
  doc.text(String(current), streakX + halfStatsCW / 2, bigY, {
    align: "center",
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const dayLabel =
    current === 1 ? (t.daySingular ?? "day") : (t.daysPlural ?? "days");
  doc.text(
    `${dayLabel} ${t.streakNow ?? "in a row"}`,
    streakX + halfStatsCW / 2,
    bigY + 4,
    { align: "center" },
  );

  const supY = panelStartY + panelH - 6;
  const colW = halfStatsCW / 3;
  const subStats = [
    [String(longest), t.longest ?? "Longest"],
    [String(soberCount), t.soberDays ?? "Sober"],
    [String(useCount), t.useDays ?? "Use"],
  ];
  subStats.forEach(([num, label], i) => {
    const cx = streakX + colW * i + colW / 2;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(num, cx, supY - 2, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(label, cx, supY + 2, { align: "center" });
  });

  y = Math.max(statY, panelStartY + panelH);
  y += 3;

  // ── Charts ──
  if (moodImg) {
    sectionHeader(t.moodCravingsWellbeing ?? "Mood / Cravings / Wellbeing");
    addChart(moodImg, null, 55);
  }

  if (weightImg) {
    sectionHeader(t.weightOverTime ?? "Weight Trend");
    addChart(weightImg, null, 50);
  }

  if (recoveryRadarImg || substanceRadarImg) {
    checkPage(80);
    sectionHeader(t.spiderDiagrams ?? "Spider Diagrams");
    addChartPair(recoveryRadarImg, substanceRadarImg, 68);
  }

  // ── Questionnaires ──
  sectionHeader(t.questionnaires ?? "Questionnaires");
  checkPage(75);
  const qStartY = y;
  const halfQ = (CW - 8) / 2;
  const qRightX = ML + halfQ + 8;

  if (qRadarImg) {
    doc.addImage(qRadarImg, "PNG", ML, qStartY, halfQ, 62);
  }

  let qy = qStartY + 2;
  filteredQuestionnaires.forEach((q, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(qRightX, qy, halfQ, 5.5, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(q.label, qRightX + 2, qy + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(
      q.score != null ? `${q.score} / ${q.max}` : (t.noQuestionnaire ?? "—"),
      qRightX + halfQ - 28,
      qy + 4,
      { align: "right" },
    );
    qy += 5.5;
  });

  y = Math.max(qStartY + 66, qy) + 4;

  // ── Substances list + donut ──
  const subCounts = {};
  recs.forEach((r) =>
    (r.substances ?? []).forEach((s) => {
      subCounts[s] = (subCounts[s] ?? 0) + 1;
    }),
  );
  const subEntries = Object.entries(subCounts).sort((a, b) => b[1] - a[1]);
  const soberDaysCount = recs.filter((r) => !r.substances?.length).length;
  if (soberDaysCount > 0) {
    subEntries.unshift(["sober", soberDaysCount]);
  }

  checkPage(80);
  sectionHeader(`${t.substancesUsed ?? "Substances"} — ${periodLabel}`);

  const subHalfCW = (CW - 8) / 2;
  const subDonutX = ML + subHalfCW + 8;
  const subListStartY = y;

  if (subEntries.length > 0) {
    let listY = subListStartY;
    subEntries.forEach(([s, n], i) => {
      if (i % 2 === 1) {
        doc.setFillColor(...LGRAY);
        doc.rect(ML, listY, subHalfCW, 5.5, "F");
      }
      const color = s === "sober" ? "#94A3B8" : (SC_COLORS[s] ?? "#bdbdbd");
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.roundedRect(ML + 2, listY + 1.5, 2.5, 2.5, 0.4, 0.4, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(s, ML + 7, listY + 3.8);
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.text(`${n} ${t.days ?? "days"}`, ML + subHalfCW - 2, listY + 3.8, {
        align: "right",
      });
      listY += 5.5;
    });

    if (substanceMixImg) {
      const listH = listY - subListStartY;
      const donutH = Math.max(40, listH);
      doc.addImage(
        substanceMixImg,
        "PNG",
        subDonutX,
        subListStartY,
        subHalfCW,
        donutH,
      );
      y = Math.max(listY, subListStartY + donutH);
    } else {
      y = listY;
    }
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(t.noSubstancesMonth ?? "No substances logged", ML + 2, y + 4);
    y += 7;
  }
  y += 3;

  // ── Relevant advice ──
  const adviceIds = [...new Set(data.relevantAdvice ?? [])];
  if (adviceIds.length > 0) {
    sectionHeader(t.relevantAdvice ?? "Relevant Advice");
    adviceIds.forEach((id, i) => {
      const nid = parseAdviceId(id);
      const title = t[`advice_${nid}_title`] ?? `Advice ${nid}`;
      const body = t[`advice_${nid}_body`] ?? "";
      checkPage(16);
      const fc = i % 2 === 0 ? LGRAY : WHITE;
      doc.setFillColor(...fc);
      doc.rect(ML, y, CW, body ? 15 : 7, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(`${i + 1}. ${title}`, ML + 2, y + 5);
      if (body) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        const lines = doc.splitTextToSize(body, CW - 4);
        doc.text(lines.slice(0, 2), ML + 4, y + 10);
        y += 16;
      } else {
        y += 8;
      }
    });
    y += 3;
  }

  // ── Full log (always starts on a new page) ──
  doc.addPage();
  y = 16;
  const sorted = [...recs].sort((a, b) =>
    (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt),
  );
  sectionHeader(t.history ?? "Log Records");
  if (sorted.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(t.noData ?? "No records", ML + 2, y + 4);
    y += 7;
  } else {
    checkPage(8);
    doc.setDrawColor(200, 212, 226);
    doc.setLineWidth(0.3);
    doc.line(ML, y, W - MR, y);
    y += 1;
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const cols = [
      { x: ML + 1, label: t.date ?? "Date" },
      { x: ML + 22, label: t.mood ?? "Mood" },
      { x: ML + 34, label: (t.cravings ?? "Crav").slice(0, 4) },
      { x: ML + 48, label: (t.wellbeing ?? "Well").slice(0, 4) },
      { x: ML + 62, label: t.substances ?? "Substances" },
      { x: ML + 108, label: t.note ?? "Note" },
    ];
    cols.forEach((c) => doc.text(c.label.slice(0, 10), c.x, y + 3));
    y += 5;
    sorted.forEach((r, i) => {
      checkPage(6);
      if (i % 2 === 0) {
        doc.setFillColor(...LGRAY);
        doc.rect(ML, y, CW, 5.5, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(fmtDate(r.date ?? r.createdAt), cols[0].x, y + 4);
      doc.text(String(r.mood ?? "-"), cols[1].x, y + 4);
      doc.text(String(r.cravings ?? "-"), cols[2].x, y + 4);
      doc.text(String(r.wellbeing ?? "-"), cols[3].x, y + 4);
      doc.text(
        (r.substances ?? []).join(", ").slice(0, 24) || (t.sober ?? "Sober"),
        cols[4].x,
        y + 4,
      );
      doc.text((r.note ?? "").slice(0, 38), cols[5].x, y + 4);
      y += 5.5;
    });
  }

  // ── Page footer (page numbers) ──
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`QUP DA · Recover · ${new Date().toLocaleDateString()}`, ML, 290);
    doc.text(`${p} / ${pageCount}`, W - MR, 290, { align: "right" });
  }

  const periodSlug = periodLabel.replace(/\s/g, "_");
  doc.save(`recover_${data.age ?? "patient"}_${periodSlug}.pdf`);
}
