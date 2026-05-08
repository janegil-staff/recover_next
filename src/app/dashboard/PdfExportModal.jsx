// src/app/dashboard/PdfExportModal.jsx
"use client";
import { useState, useCallback, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ReferenceLine, ResponsiveContainer,
} from "recharts";

const A="#4a7ab5",AD="#2d4a6e",BO="#d0dcea",MU="#7a9ab8",SU="#ffffff",BG="#eef2f7";

function pad(n){return String(n).padStart(2,"0");}
function fmtDate(d){const dt=new Date(d);return`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;}
function shortDate(d){const dt=new Date(d);return`${pad(dt.getMonth()+1)}/${pad(dt.getDate())}`;}
function parseAdviceId(raw){const m=String(raw).match(/(\d+)/);return m?m[1]:String(raw);}
function avgOf(recs,field){const v=recs.map(r=>r[field]).filter(x=>x!=null);return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):null;}

// ── Range options ────────────────────────────────────────────────────────────
// months=null means "all time"
const RANGE_OPTIONS = [
  { id: "1m",  months: 1,    labelKey: "range1Month",  fallback: "Last 1 month" },
  { id: "3m",  months: 3,    labelKey: "range3Months", fallback: "Last 3 months" },
  { id: "6m",  months: 6,    labelKey: "range6Months", fallback: "Last 6 months" },
  { id: "9m",  months: 9,    labelKey: "range9Months", fallback: "Last 9 months" },
  { id: "all", months: null, labelKey: "rangeAll",     fallback: "All time" },
];

// Returns { from: Date|null, to: Date } for a given range.
// from === null means no lower bound (all time).
function rangeWindow(months) {
  const to = new Date();
  if (months == null) return { from: null, to };
  const from = new Date();
  from.setMonth(from.getMonth() - months);
  return { from, to };
}

function formatRangeLabel(months, t) {
  const opt = RANGE_OPTIONS.find(o => o.months === months) ?? RANGE_OPTIONS[4];
  return t[opt.labelKey] ?? opt.fallback;
}

// True if a record/questionnaire's date falls inside the window.
// If the item has no date and `from` is set (not all-time), exclude it.
function inWindow(dateStr, from, to) {
  if (from == null) return true; // all time
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= from && d <= to;
}

const SC_COLORS={
  alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",
  opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",
  tobacco:"#8d6e63",prescription:"#42a5f5",
  mdma:"#ec407a",ecstasy:"#ec407a",ghb:"#00acc1",acid:"#9c27b0",
  other:"#bdbdbd",
};

const LOGO_B64="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAJNAk0DASIAAhEBAxEB/8QAHQABAAEEAwEAAAAAAAAAAAAAAAECBQYIAwQHCf/EAGAQAAEDAwEEBQUICg4IBAQHAAEAAgMEBREGBxIhMQhBUWFxEyKBkbEUMkJScqHB0hUjM1ZigpKUstEWFxgkQ1N0dYSVosLT4TY3RlRVc5PiJzRjhSVEg7MmNUVkZfDx/8QAHAEBAAEFAQEAAAAAAAAAAAAAAAECAwQFBgcI/8QAPxEAAgEDAQQHBQgBBAIBBQAAAAECAwQRBRIhMUEGE1FhcZGhFSIysdEUM0JSU4HB4fAHIzRDYpLxFnKTsuL/2gAMAwEAAhEDEQA/ANykREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQH/9k=";

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return;}
    const s=document.createElement("script");
    s.src=src;s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });
}

async function captureElement(id){
  const el=document.getElementById(id);
  if(!el)return null;
  try{
    const canvas=await window.html2canvas(el,{backgroundColor:"#ffffff",scale:2,useCORS:true,logging:false});
    return canvas.toDataURL("image/png");
  }catch(e){console.warn("capture failed",id,e);return null;}
}

async function generatePDF({data,t,rangeMonths,recs,filteredQuestionnaires}){
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await new Promise(r=>setTimeout(r,800));

  const [moodImg,recoveryRadarImg,substanceRadarImg,substanceBarImg,weightImg,qRadarImg]=await Promise.all([
    captureElement("pdf-chart-mood"),
    captureElement("pdf-chart-recovery-radar"),
    captureElement("pdf-chart-substance-radar"),
    captureElement("pdf-chart-substance"),
    captureElement("pdf-chart-weight"),
    captureElement("pdf-chart-q-radar"),
  ]);

  const JsPDF=window.jspdf.jsPDF;
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,ML=14,MR=14,CW=W-ML-MR;
  let y=0;

  const NAVY=[45,74,110],GRAY=[150,170,190],LGRAY=[245,247,250],DARK=[26,44,61],WHITE=[255,255,255];

  function checkPage(need=10){if(y+need>272){doc.addPage();y=16;}}

  function sectionHeader(text){
    checkPage(10);
    y+=4;
    doc.setDrawColor(200,212,226);doc.setLineWidth(0.3);
    doc.line(ML,y,W-MR,y);
    y+=4;
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(),ML,y);
    y+=5;doc.setTextColor(...DARK);
  }

  function colHeader(text,x,atY){
    doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(),x,atY);
    doc.setTextColor(...DARK);
  }

  function row(label,value,shade=false){
    checkPage(7);
    if(shade){doc.setFillColor(...LGRAY);doc.rect(ML,y,CW,6,"F");}
    doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.setTextColor(...GRAY);doc.text(String(label),ML+2,y+4);
    doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
    doc.text(String(value??"—"),ML+60,y+4);
    y+=6;
  }

  function addChart(imgData,label,h=55){
    if(!imgData)return;
    checkPage(h+6);
    if(label){
      doc.setFontSize(7);doc.setFont("helvetica","italic");doc.setTextColor(...GRAY);
      doc.text(label,ML,y+3);y+=5;
    }
    doc.addImage(imgData,"PNG",ML,y,CW,h);
    y+=h+3;
  }

  function addChartPair(img1,img2,h=62){
    if(!img1&&!img2)return;
    checkPage(h+6);
    const half=(CW-4)/2;
    if(img1)doc.addImage(img1,"PNG",ML,y,half,h);
    if(img2)doc.addImage(img2,"PNG",ML+half+4,y,half,h);
    y+=h+3;
  }

  const periodLabel = formatRangeLabel(rangeMonths, t);
  const allRecs = data.records ?? [];

  // Header
  doc.setFillColor(...NAVY);doc.rect(0,0,W,22,"F");
  try{doc.addImage(LOGO_B64,"PNG",ML,2,18,18);}catch(e){}
  doc.setTextColor(...WHITE);doc.setFontSize(13);doc.setFont("helvetica","bold");
  doc.text("Recover",ML+21,11);
  doc.setFontSize(8);doc.setFont("helvetica","normal");
  doc.text(t.patientReport??"Patient Report",ML+21,17);
  doc.text(periodLabel,W-MR,11,{align:"right"});
  doc.text(new Date().toLocaleDateString(),W-MR,17,{align:"right"});
  y=28;

  // Patient info + Weight/BMI side by side
  const patientWeight = data.weight && data.weight > 0 ? data.weight : null;
  const bmi = patientWeight && data.height ? (patientWeight / ((data.height / 100) ** 2)).toFixed(1) : null;

  checkPage(10);
  y+=4;
  doc.setDrawColor(200,212,226);doc.setLineWidth(0.3);
  doc.line(ML,y,W-MR,y);
  y+=4;
  const halfCW=(CW-8)/2;
  const rightX=ML+halfCW+8;
  colHeader(t.patient??"Patient",ML,y);
  colHeader(t.weightBmi??"Weight & BMI",rightX,y);
  y+=5;
  const startY=y;

  const patRows=[
    [t.age??"Age",    data.age??"—"],
    [t.gender??"Gender", data.gender??"—"],
  ];
  let ly=startY;
  patRows.forEach(([l,v],i)=>{
    if(i%2===1){doc.setFillColor(...LGRAY);doc.rect(ML,ly,halfCW,5,"F");}
    doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
    doc.text(l,ML+2,ly+3.5);
    doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
    doc.text(String(v),ML+28,ly+3.5);
    ly+=5;
  });

  let ry=startY;
  const wRows=[
    [t.weight??"Weight", patientWeight?`${patientWeight} ${t.kg??"kg"}`:"—"],
    [t.bmi??"BMI",       bmi??"—"],
    [t.heightLabel??"Height", data.height?`${data.height} cm`:"—"],
  ];
  wRows.forEach(([l,v],i)=>{
    if(i%2===1){doc.setFillColor(...LGRAY);doc.rect(rightX,ry,halfCW,5,"F");}
    doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
    doc.text(l,rightX+2,ry+3.5);
    doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
    doc.text(String(v),rightX+28,ry+3.5);
    ry+=5;
  });

  y=Math.max(ly,ry)+3;

  // Period stats
  sectionHeader(periodLabel);
  row(t.daysLogged??"Days logged",   recs.length,         false);
  row(t.avgMood??"Avg mood",         avgOf(recs,"mood"),  true);
  row(t.avgCravings??"Avg cravings", avgOf(recs,"cravings"),false);
  row(t.avgWellbeing??"Avg wellbeing",avgOf(recs,"wellbeing"),true);
  row(t.totalRecords??"Total records",allRecs.length,     false);
  y+=3;

  if(moodImg){
    sectionHeader(t.moodCravingsWellbeing??"Mood / Cravings / Wellbeing");
    addChart(moodImg,null,55);
  }

  if(weightImg){
    sectionHeader(t.weightOverTime??"Weight Trend");
    addChart(weightImg,null,50);
  }

  if(recoveryRadarImg||substanceRadarImg){
    checkPage(80);
    sectionHeader(t.spiderDiagrams??"Spider Diagrams");
    addChartPair(recoveryRadarImg,substanceRadarImg,68);
  }

  // Questionnaires (filtered by range)
  sectionHeader(t.questionnaires??"Questionnaires");

  checkPage(75);
  const qStartY=y;
  const halfQ=(CW-8)/2;
  const qRightX=ML+halfQ+8;

  if(qRadarImg){
    doc.addImage(qRadarImg,"PNG",ML,qStartY,halfQ,62);
  }

  let qy=qStartY+2;
  filteredQuestionnaires.forEach((q,i)=>{
    if(i%2===1){doc.setFillColor(...LGRAY);doc.rect(qRightX,qy,halfQ,5.5,"F");}
    doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
    doc.text(q.label,qRightX+2,qy+4);
    doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
    doc.text(q.score!=null?`${q.score} / ${q.max}`:(t.noQuestionnaire??"—"),qRightX+halfQ-28,qy+4,{align:"right"});
    qy+=5.5;
  });

  y=Math.max(qStartY+66, qy)+4;

  const subCounts={};
  recs.forEach(r=>(r.substances??[]).forEach(s=>{subCounts[s]=(subCounts[s]??0)+1;}));
  const subEntries=Object.entries(subCounts).sort((a,b)=>b[1]-a[1]);
  checkPage(80);
  sectionHeader(`${t.substancesUsed??"Substances"} — ${periodLabel}`);
  if(subEntries.length>0){
    if(subEntries.length>4){
      const colW=(CW-8)/2;
      const mid=Math.ceil(subEntries.length/2);
      const left=subEntries.slice(0,mid);
      const right=subEntries.slice(mid);
      const maxRows=Math.max(left.length,right.length);
      for(let i=0;i<maxRows;i++){
        checkPage(6);
        if(i%2===1){doc.setFillColor(...LGRAY);doc.rect(ML,y,CW,5,"F");}
        if(left[i]){
          const [s,n]=left[i];
          doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
          doc.text(s,ML+2,y+3.5);
          doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
          doc.text(`${n} ${t.days??"days"}`,ML+colW-18,y+3.5);
        }
        if(right[i]){
          const [s,n]=right[i];
          const rx=ML+colW+8;
          doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
          doc.text(s,rx+2,y+3.5);
          doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
          doc.text(`${n} ${t.days??"days"}`,rx+colW-18,y+3.5);
        }
        y+=5;
      }
    }else{
      subEntries.forEach(([s,n],i)=>row(s,`${n} ${t.days??"days"}`,i%2===1));
    }
  }else{
    doc.setFontSize(9);doc.setTextColor(...GRAY);
    doc.text(t.noSubstancesMonth??"No substances logged",ML+2,y+4);y+=7;
  }
  y+=3;
  if(substanceBarImg){addChart(substanceBarImg,null,55);}

  y+=3;

  const adviceIds=[...new Set(data.relevantAdvice??[])];
  if(adviceIds.length>0){
    sectionHeader(t.relevantAdvice??"Relevant Advice");
    adviceIds.forEach((id,i)=>{
      const nid=parseAdviceId(id);
      const title=t[`advice_${nid}_title`]??`Advice ${nid}`;
      const body=t[`advice_${nid}_body`]??"";
      checkPage(16);
      const fc=i%2===0?LGRAY:WHITE;
      doc.setFillColor(...fc);doc.rect(ML,y,CW,body?15:7,"F");
      doc.setFontSize(9);doc.setFont("helvetica","bold");doc.setTextColor(...NAVY);
      doc.text(`${i+1}. ${title}`,ML+2,y+5);
      if(body){
        doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(...GRAY);
        const lines=doc.splitTextToSize(body,CW-4);
        doc.text(lines.slice(0,2),ML+4,y+10);
        y+=16;
      }else{y+=8;}
    });
    y+=3;
  }

  // Full log (already filtered to range via `recs`)
  const sorted=[...recs].sort((a,b)=>(b.date??b.createdAt).localeCompare(a.date??a.createdAt));
  sectionHeader(t.history??"Log Records");
  if(sorted.length===0){
    doc.setFontSize(9);doc.setTextColor(...GRAY);
    doc.text(t.noData??"No records",ML+2,y+4);y+=7;
  }else{
    checkPage(8);
    doc.setDrawColor(200,212,226);doc.setLineWidth(0.3);doc.line(ML,y,W-MR,y);
    y+=1;
    doc.setTextColor(...GRAY);doc.setFontSize(9);doc.setFont("helvetica","bold");
    const cols=[
      {x:ML+1,  label:t.date??"Date"},
      {x:ML+22, label:t.mood??"Mood"},
      {x:ML+34, label:(t.cravings??"Crav").slice(0,4)},
      {x:ML+48, label:(t.wellbeing??"Well").slice(0,4)},
      {x:ML+62, label:t.substances??"Substances"},
      {x:ML+108,label:t.note??"Note"},
    ];
    cols.forEach(c=>doc.text(c.label.slice(0,10),c.x,y+3));
    y+=5;
    sorted.forEach((r,i)=>{
      checkPage(6);
      if(i%2===0){doc.setFillColor(...LGRAY);doc.rect(ML,y,CW,5.5,"F");}
      doc.setTextColor(...DARK);doc.setFont("helvetica","normal");doc.setFontSize(9);
      doc.text(fmtDate(r.date??r.createdAt),cols[0].x,y+4);
      doc.text(String(r.mood??"-"),cols[1].x,y+4);
      doc.text(String(r.cravings??"-"),cols[2].x,y+4);
      doc.text(String(r.wellbeing??"-"),cols[3].x,y+4);
      doc.text((r.substances??[]).join(", ").slice(0,24)||"—",cols[4].x,y+4);
      doc.text((r.note??"").slice(0,38),cols[5].x,y+4);
      y+=5.5;
    });
  }

  const pageCount=doc.getNumberOfPages();
  for(let p=1;p<=pageCount;p++){
    doc.setPage(p);doc.setFontSize(7);doc.setTextColor(...GRAY);
    doc.text(`QUP DA · Recover · ${new Date().toLocaleDateString()}`,ML,290);
    doc.text(`${p} / ${pageCount}`,W-MR,290,{align:"right"});
  }

  const periodSlug=periodLabel.replace(/\s/g,"_");
  doc.save(`recover_${data.age??"patient"}_${periodSlug}.pdf`);
}

// ── Off-screen charts ─────────────────────────────────────────────────────────
function OffscreenCharts({data,recs,filteredQuestionnaires,t}){
  const allRecs=data.records??[];

  const moodData=recs.map(r=>({
    date:shortDate(r.date??r.createdAt),
    mood:r.mood??null,cravings:r.cravings??null,wellbeing:r.wellbeing??null,
  }));

  const avg=(key)=>{const v=recs.map(r=>r[key]).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null;};
  const avgMood=avg("mood"),avgWellbeing=avg("wellbeing"),avgCravings=avg("cravings"),avgAmount=avg("amount");
  const soberDays=recs.filter(r=>!r.substances?.length).length;
  const soberPct=recs.length?(soberDays/recs.length)*5:0;
  const recoveryRadarData=[
    {subject:"Mood",       value:+(avgMood??0).toFixed(1),                                   fullMark:5},
    {subject:"Wellbeing",  value:+(avgWellbeing??0).toFixed(1),                              fullMark:5},
    {subject:"Low craving",value:avgCravings!=null?+Math.max(0,5-avgCravings).toFixed(1):5,  fullMark:5},
    {subject:"Low amount", value:avgAmount!=null?+Math.max(0,5-(avgAmount/10)*5).toFixed(1):5,fullMark:5},
    {subject:"Sober days", value:+soberPct.toFixed(1),                                       fullMark:5},
  ];

  const subMap={};
  recs.forEach(r=>(r.substances??[]).forEach(s=>{
    if(!subMap[s])subMap[s]={count:0,totalAmt:0};
    subMap[s].count++;
    subMap[s].totalAmt+=r.amount??0;
  }));
  const subEntries=Object.entries(subMap);
  const maxCount=subEntries.length?Math.max(...subEntries.map(([,v])=>v.count)):1;
  const substanceRadarData=subEntries.map(([s,v])=>({
    subject:s.charAt(0).toUpperCase()+s.slice(1),
    days:v.count,
    avgAmount:Math.round((v.totalAmt/v.count)*10)/10,
    fullMark:maxCount,
  }));

  const allSubs=[...new Set(recs.flatMap(r=>r.substances??[]))];
  const weeks={};
  recs.forEach(r=>{
    const d=new Date(r.date??r.createdAt);
    const day=d.getDay();
    const diff=d.getDate()-(day===0?6:day-1);
    const mon=new Date(d);mon.setDate(diff);
    const key=`${pad(mon.getMonth()+1)}/${pad(mon.getDate())}`;
    if(!weeks[key])weeks[key]={week:key};
    (r.substances??[]).forEach(s=>{weeks[key][s]=(weeks[key][s]??0)+1;});
  });
  const substanceTimeData=Object.values(weeks);

  // Weight chart uses range-filtered records too (was previously using allRecs;
  // now it matches the requested range so doctor sees relevant weight trend)
  const weightData=recs.filter(r=>r.weight).map(r=>({
    date:shortDate(r.date??r.createdAt),weight:r.weight,
  }));

  // Questionnaire radar — only score those that fall within range
  const qRadarData=filteredQuestionnaires.map(q=>({
    subject:q.label,
    value:q.score!=null?Math.round((q.score/q.max)*100):0,
    fullMark:100,
  }));

  const wrap={position:"fixed",left:"-9999px",top:"0px",zIndex:-1,background:"#fff"};

  return(
    <div style={wrap}>
      <div id="pdf-chart-mood" style={{width:Math.max(520, moodData.length*28),height:220,background:"#fff",padding:"8px"}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={moodData} margin={{top:8,right:16,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
            <XAxis dataKey="date" tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} interval={Math.max(0,Math.ceil(moodData.length/10)-1)}/>
            <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false}/>
            <Tooltip/><Legend wrapperStyle={{fontSize:11,paddingTop:4}}/>
            <ReferenceLine y={3} stroke="#d0dcea" strokeDasharray="4 4"/>
            <Line type="monotone" dataKey="mood"      name={t.mood??"Mood"}               stroke="#4a7ab5" strokeWidth={2} dot={{r:3,fill:"#4a7ab5",strokeWidth:0}} connectNulls/>
            <Line type="monotone" dataKey="cravings"  name={t.cravings??"Cravings"}       stroke="#f4a07a" strokeWidth={2} dot={{r:3,fill:"#f4a07a",strokeWidth:0}} connectNulls/>
            <Line type="monotone" dataKey="wellbeing" name={t.wellbeing??"Wellbeing"}     stroke="#66bb6a" strokeWidth={2} dot={{r:3,fill:"#66bb6a",strokeWidth:0}} connectNulls/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div id="pdf-chart-recovery-radar" style={{width:320,height:280,background:"#fff",padding:"8px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#2d4a6e",textAlign:"center",marginBottom:4}}>{t.recoveryProfile??"Recovery Profile"}</div>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart data={recoveryRadarData} margin={{top:16,right:44,bottom:16,left:44}}>
            <PolarGrid stroke="#d0dcea"/>
            <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:"#2d4a6e",fontWeight:600}}/>
            <PolarRadiusAxis angle={90} domain={[0,5]} tickCount={6} tick={{fontSize:8,fill:"#7a9ab8"}}/>
            <Radar name={t.score??"Score"} dataKey="value" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.3} strokeWidth={2}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {substanceRadarData.length>=3&&(
        <div id="pdf-chart-substance-radar" style={{width:320,height:280,background:"#fff",padding:"8px"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#2d4a6e",textAlign:"center",marginBottom:4}}>{t.substanceProfile??"Substance Profile"}</div>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart data={substanceRadarData} margin={{top:16,right:44,bottom:16,left:44}}>
              <PolarGrid stroke="#d0dcea"/>
              <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:"#2d4a6e",fontWeight:600}}/>
              <PolarRadiusAxis angle={90} tickCount={4} tick={{fontSize:8,fill:"#7a9ab8"}}/>
              <Radar name={t.daysUsed??"Days used"}  dataKey="days"      stroke="#4a7ab5" fill="#4a7ab5" fillOpacity={0.2} strokeWidth={2}/>
              <Radar name={t.avgAmount??"Avg amount"} dataKey="avgAmount" stroke="#ec407a" fill="#ec407a" fillOpacity={0.2} strokeWidth={1.5}/>
              <Legend wrapperStyle={{fontSize:10}}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div id="pdf-chart-q-radar" style={{width:380,height:300,background:"#fff",padding:"8px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#2d4a6e",textAlign:"center",marginBottom:4}}>{t.questionnaireRadar??"Questionnaire Radar"}</div>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart data={qRadarData} margin={{top:16,right:50,bottom:16,left:50}}>
            <PolarGrid stroke="#d0dcea"/>
            <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:"#2d4a6e",fontWeight:700}}/>
            <PolarRadiusAxis angle={90} domain={[0,100]} tickCount={6} tick={{fontSize:9,fill:"#7a9ab8"}} unit="%"/>
            <Radar name={t.scorePct??"Score %"} dataKey="value" stroke="#4a7ab5" fill="#4a7ab5" fillOpacity={0.25} strokeWidth={2.5}/>
            <Legend wrapperStyle={{fontSize:11}}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {substanceTimeData.length>0&&allSubs.length>0&&(
        <div id="pdf-chart-substance" style={{width:700,height:260,background:"#fff",padding:"8px 8px 8px 0"}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={substanceTimeData} margin={{top:8,right:16,left:-10,bottom:0}} barCategoryGap="20%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:7,fill:"#7a9ab8"}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:7,fill:"#7a9ab8"}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip/><Legend wrapperStyle={{fontSize:8,paddingTop:4}}/>
              {allSubs.map(s=>(
                <Bar key={s} dataKey={s} name={s.charAt(0).toUpperCase()+s.slice(1)} fill={SC_COLORS[s]??"#bdbdbd"} radius={[3,3,0,0]} maxBarSize={32}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {weightData.length>1&&(
        <div id="pdf-chart-weight" style={{width:Math.max(520, weightData.length*28),height:180,background:"#fff",padding:"8px"}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{top:8,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} interval={Math.max(0,Math.ceil(weightData.length/8)-1)}/>
              <YAxis tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} domain={[d=>Math.floor(d-2),d=>Math.ceil(d+2)]}/>
              <Tooltip/>
              <Line type="monotone" dataKey="weight" name={`${t.weight??"Weight"} (${t.kg??"kg"})`} stroke="#2d4a6e" strokeWidth={2.5} dot={{r:3,fill:"#2d4a6e",strokeWidth:0}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function PdfExportModal({data,t:tProp,onClose}){
  const t=tProp??{};
  const [rangeId,setRangeId]=useState("all");
  const [loading,setLoading]=useState(false);
  const [step,setStep]      =useState("");
  const [error,setError]    =useState("");
  const [showCharts,setShowCharts]=useState(false);

  const rangeOption = RANGE_OPTIONS.find(o => o.id === rangeId) ?? RANGE_OPTIONS[4];
  const rangeMonths = rangeOption.months;

  // Filter records by range
  const recs = useMemo(() => {
    const { from, to } = rangeWindow(rangeMonths);
    return (data.records ?? []).filter(r => inWindow(r.date ?? r.createdAt, from, to));
  }, [data, rangeMonths]);

  // Filter questionnaires by range — uses each questionnaire's `date` field.
  // If a questionnaire has no date and we're not on "all time", it's excluded
  // (otherwise stale data would leak into a "last 1 month" report).
  const filteredQuestionnaires = useMemo(() => {
    const { from, to } = rangeWindow(rangeMonths);
    const QC=[
      {key:"latestGad7",     label:"GAD-7",     max:21},
      {key:"latestPhq9",     label:"PHQ-9",     max:27},
      {key:"latestAudit",    label:"AUDIT",     max:40},
      {key:"latestDast10",   label:"DAST-10",   max:10},
      {key:"latestCage",     label:"CAGE",      max:4},
      {key:"latestReadiness",label:"Readiness", max:30},
    ];
    return QC.map(q => {
      const raw = data[q.key];
      if (!raw) return { ...q, score: null };
      // Filter: only include if the questionnaire's date is in the window
      if (!inWindow(raw.date, from, to)) return { ...q, score: null };
      const score = Object.values(raw).reduce(
        (a, b) => (typeof b === "number" ? a + b : a),
        0,
      );
      return { ...q, score };
    });
  }, [data, rangeMonths]);

  const handleGenerate=useCallback(async()=>{
    setLoading(true);setError("");setStep("Rendering charts…");
    setShowCharts(true);
    try{
      await new Promise(r=>setTimeout(r,900));
      setStep("Capturing diagrams…");
      await generatePDF({data,t,rangeMonths,recs,filteredQuestionnaires});
      setShowCharts(false);
      onClose();
    }catch(e){
      console.error(e);
      setError("Failed to generate PDF. Please try again.");
      setShowCharts(false);setStep("");
    }finally{setLoading(false);}
  },[data,t,rangeMonths,recs,filteredQuestionnaires,onClose]);

  return(
    <>
      {showCharts&&<OffscreenCharts data={data} recs={recs} filteredQuestionnaires={filteredQuestionnaires} t={t}/>}

      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,30,50,0.55)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div onClick={e=>e.stopPropagation()} style={{background:SU,borderRadius:18,width:"100%",maxWidth:400,boxShadow:"0 24px 60px rgba(45,74,110,0.25)",border:`1px solid ${BO}`,overflow:"hidden"}}>

          <div style={{background:`linear-gradient(135deg,${A},${AD})`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase"}}>Recover</div>
              <div style={{color:"#fff",fontSize:16,fontWeight:700,marginTop:2}}>⬇ Export PDF Report</div>
            </div>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",color:"#fff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
          </div>

          <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
            {/* Range selector */}
            <div>
              <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:0.8,marginBottom:8}}>
                {(t.dateRange??"DATE RANGE").toUpperCase()}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {RANGE_OPTIONS.map(opt=>{
                  const active=rangeId===opt.id;
                  return(
                    <button
                      key={opt.id}
                      onClick={()=>setRangeId(opt.id)}
                      style={{
                        flex:"1 1 auto",
                        background:active?A:BG,
                        color:active?"#fff":AD,
                        border:`1px solid ${active?A:BO}`,
                        borderRadius:8,
                        padding:"8px 10px",
                        fontSize:12,
                        fontWeight:active?700:600,
                        cursor:"pointer",
                        fontFamily:"inherit",
                        transition:"all .15s",
                        whiteSpace:"nowrap",
                      }}
                    >
                      {t[opt.labelKey]??opt.fallback}
                    </button>
                  );
                })}
              </div>
              <div style={{fontSize:11,color:MU,marginTop:8,textAlign:"center"}}>
                {recs.length} {t.records??"records"} · {filteredQuestionnaires.filter(q=>q.score!=null).length} {t.questionnairesShort??"questionnaires"}
              </div>
            </div>

            <div style={{background:BG,borderRadius:10,padding:"10px 14px",fontSize:11,color:MU,lineHeight:1.9}}>
              ✓ Patient info &nbsp;·&nbsp; ✓ {t.monthSummary??"Period stats"}<br/>
              ✓ 📈 Mood / Cravings / Wellbeing line chart<br/>
              ✓ 🕸 Recovery Profile radar<br/>
              ✓ 🕸 Substance Profile radar<br/>
              ✓ 🕸 {t.questionnaires??"Questionnaire"} radar<br/>
              ✓ {t.substancesMonth??"Substance summary"} + bar chart<br/>
              ✓ {t.weight??"Weight"} trend chart<br/>
              ✓ {t.relevantAdvice??"Relevant advice"} &nbsp;·&nbsp; ✓ {t.history??"Full log"}
            </div>

            {step&&<div style={{fontSize:12,color:A,fontWeight:600,textAlign:"center"}}>{step}</div>}
            {error&&<div style={{fontSize:12,color:"#e53e3e",background:"#fff5f5",borderRadius:8,padding:"8px 12px"}}>{error}</div>}

            <button onClick={handleGenerate} disabled={loading}
              style={{background:`linear-gradient(135deg,${A},${AD})`,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:13,fontWeight:700,cursor:loading?"wait":"pointer",fontFamily:"inherit",opacity:loading?0.7:1,transition:"opacity .15s"}}>
              {loading?`⏳ ${step||"Generating…"}`:"⬇ Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}