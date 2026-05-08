// src/app/dashboard/PdfExportModal.jsx
"use client";
import { useState, useCallback, useMemo } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell,
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

const LOGO_B64="data:image/jpeg;base64,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";

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

  const [moodImg,recoveryRadarImg,substanceRadarImg,substanceBarImg,weightImg,qRadarImg,substanceMixImg]=await Promise.all([
    captureElement("pdf-chart-mood"),
    captureElement("pdf-chart-recovery-radar"),
    captureElement("pdf-chart-substance-radar"),
    captureElement("pdf-chart-substance"),
    captureElement("pdf-chart-weight"),
    captureElement("pdf-chart-q-radar"),
    captureElement("pdf-chart-substance-mix"),
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
  try{doc.addImage(LOGO_B64,"JPEG",ML,2,18,18);}catch(e){}
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

  // Period stats — full width
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

  // Layout: list on left half, donut on right half
  const subHalfCW = (CW - 8) / 2;
  const subDonutX = ML + subHalfCW + 8;
  const subListStartY = y;

  if(subEntries.length>0){
    // Single column list on the left half
    let listY = subListStartY;
    subEntries.forEach(([s,n],i)=>{
      if(i%2===1){doc.setFillColor(...LGRAY);doc.rect(ML,listY,subHalfCW,5.5,"F");}
      // Color square matching donut slice
      const color = SC_COLORS[s] ?? "#bdbdbd";
      const r = parseInt(color.slice(1,3),16);
      const g = parseInt(color.slice(3,5),16);
      const b = parseInt(color.slice(5,7),16);
      doc.setFillColor(r,g,b);
      doc.roundedRect(ML+2,listY+1.5,2.5,2.5,0.4,0.4,"F");
      // Substance name + count
      doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(...GRAY);
      doc.text(s,ML+7,listY+3.8);
      doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
      doc.text(`${n} ${t.days??"days"}`,ML+subHalfCW-2,listY+3.8,{align:"right"});
      listY+=5.5;
    });

    // Donut on the right half — sized to match list height
    if(substanceMixImg){
      const listH = listY - subListStartY;
      const donutH = Math.max(40, listH);
      doc.addImage(substanceMixImg,"PNG",subDonutX,subListStartY,subHalfCW,donutH);
      y = Math.max(listY, subListStartY + donutH);
    }else{
      y = listY;
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

  // Substance Mix donut data — days per substance + Sober slice
  const mixStats={};
  recs.forEach(r=>{
    const subs=r.substances??[];
    if(subs.length===0)return; // counted via existing soberDays above
    subs.forEach(s=>{
      if(!mixStats[s])mixStats[s]={days:0,amount:0};
      mixStats[s].days++;
      mixStats[s].amount+=Number(r.amount)||0;
    });
  });
  const mixEntries=Object.entries(mixStats)
    .sort((a,b)=>b[1].days-a[1].days)
    .map(([name,v])=>({name,days:v.days,amount:v.amount}));
  if(soberDays>0){mixEntries.unshift({name:"sober",days:soberDays,amount:0});}
  const mixTotal=mixEntries.reduce((s,d)=>s+d.days,0);
  const sliceColor=(name)=>name==="sober"?"#22C55E":(SC_COLORS[name]??"#bdbdbd");
  const sliceLabel=(name)=>name==="sober"?(t.sober??"Sober"):name.charAt(0).toUpperCase()+name.slice(1);

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

      {/* Substance Mix donut — sits next to substances list in the PDF */}
      {mixEntries.length>0&&(
        <div id="pdf-chart-substance-mix" style={{width:200,height:200,background:"#fff",padding:"4px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:190,height:190,position:"relative"}}>
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
                  paddingAngle={mixEntries.length>1?2:0}
                  labelLine={false}
                  isAnimationActive={false}
                >
                  {mixEntries.map((e,i)=>(
                    <Cell key={`${e.name}-${i}`} fill={sliceColor(e.name)}/>
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
              <div style={{fontSize:22,fontWeight:800,color:"#2d4a6e",lineHeight:1}}>{mixTotal}</div>
              <div style={{fontSize:9,fontWeight:700,color:"#7a9ab8",letterSpacing:0.6,textTransform:"uppercase",marginTop:3}}>{t.daysLogged??"days"}</div>
            </div>
          </div>
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