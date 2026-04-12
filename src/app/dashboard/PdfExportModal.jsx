// src/app/dashboard/PdfExportModal.jsx
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
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

// Load scripts dynamically
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
    const canvas=await window.html2canvas(el,{
      backgroundColor:"#ffffff",scale:2,useCORS:true,logging:false,
    });
    return canvas.toDataURL("image/png");
  }catch(e){console.warn("capture failed",id,e);return null;}
}

async function generatePDF({data,t,year,month,allTime,recs}){
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");

  // Give charts time to fully render
  await new Promise(r=>setTimeout(r,800));

  // Capture all charts
  const [moodImg,scoreRadarImg,substanceImg,weightImg,qRadarImg]=await Promise.all([
    captureElement("pdf-chart-mood"),
    captureElement("pdf-chart-score-radar"),
    captureElement("pdf-chart-substance"),
    captureElement("pdf-chart-weight"),
    captureElement("pdf-chart-q-radar"),
  ]);

  const JsPDF=window.jspdf.jsPDF;
  const doc=new JsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,ML=14,MR=14,CW=W-ML-MR;
  let y=0;

  const BLUE=[74,122,181],NAVY=[45,74,110],GRAY=[122,154,184];
  const LGRAY=[238,242,247],WHITE=[255,255,255],DARK=[26,44,61];

  function checkPage(need=10){if(y+need>272){doc.addPage();y=16;}}

  function sectionHeader(text){
    checkPage(12);
    doc.setFillColor(...BLUE);doc.rect(ML,y,CW,7,"F");
    doc.setTextColor(...WHITE);doc.setFontSize(9);doc.setFont("helvetica","bold");
    doc.text(text.toUpperCase(),ML+3,y+5);
    y+=10;doc.setTextColor(...DARK);
  }

  function row(label,value,shade=false){
    checkPage(7);
    if(shade){doc.setFillColor(...LGRAY);doc.rect(ML,y,CW,6,"F");}
    doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.setTextColor(...GRAY);doc.text(String(label),ML+2,y+4);
    doc.setTextColor(...DARK);doc.setFont("helvetica","bold");
    doc.text(String(value??"—"),ML+65,y+4);
    y+=6;
  }

  function addChart(imgData,label,h=58){
    if(!imgData){return;}
    checkPage(h+8);
    doc.setFontSize(8);doc.setFont("helvetica","italic");doc.setTextColor(...GRAY);
    if(label)doc.text(label,ML,y+3);
    const offsetY=label?5:0;
    doc.addImage(imgData,"PNG",ML,y+offsetY,CW,h);
    y+=h+offsetY+4;
  }

  const months=t.months??["January","February","March","April","May","June","July","August","September","October","November","December"];
  const periodLabel=allTime?(t.substancesAllTime??"All time"):`${months[month]} ${year}`;
  const allRecs=data.records??[];

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);doc.rect(0,0,W,22,"F");
  doc.setTextColor(...WHITE);doc.setFontSize(16);doc.setFont("helvetica","bold");
  doc.text("Recover",ML,12);
  doc.setFontSize(9);doc.setFont("helvetica","normal");
  doc.text(t.monthSummary??"Patient Report",ML,18);
  doc.text(periodLabel,W-MR,18,{align:"right"});
  doc.text(new Date().toLocaleDateString(),W-MR,13,{align:"right"});
  y=28;

  // ── Patient info ──────────────────────────────────────────────────────────
  sectionHeader("Patient");
  row(t.age??"Age",data.age??"—",false);
  row(t.female??"Gender",data.gender??"—",true);
  if(data.height)row("Height",`${data.height} cm`,false);
  y+=3;

  // ── Period stats ──────────────────────────────────────────────────────────
  sectionHeader(`${periodLabel} — ${t.monthSummary??"Stats"}`);
  row(t.daysLogged??"Days logged",recs.length,false);
  row(t.avgMood??"Avg mood",avgOf(recs,"mood"),true);
  row(t.avgCravings??"Avg cravings",avgOf(recs,"cravings"),false);
  row(t.avgWellbeing??"Avg wellbeing",avgOf(recs,"wellbeing"),true);
  row(t.totalRecords??"Total records",allRecs.length,false);
  y+=3;

  // ── Mood chart ────────────────────────────────────────────────────────────
  if(moodImg){
    sectionHeader(t.moodCravingsWellbeing??"Mood / Cravings / Wellbeing");
    addChart(moodImg,null,55);
  }

  // ── Score radar ───────────────────────────────────────────────────────────
  if(scoreRadarImg){
    sectionHeader(t.scoreBreakdown??"Score Distribution (Radar)");
    addChart(scoreRadarImg,null,65);
  }

  // ── Substance summary ─────────────────────────────────────────────────────
  const subCounts={};
  recs.forEach(r=>(r.substances??[]).forEach(s=>{subCounts[s]=(subCounts[s]??0)+1;}));
  const subEntries=Object.entries(subCounts).sort((a,b)=>b[1]-a[1]);
  sectionHeader(t.substancesMonth??"Substances");
  if(subEntries.length>0){
    subEntries.forEach(([s,n],i)=>row(s,`${n} ${t.days??"days"}`,i%2===1));
  }else{
    doc.setFontSize(9);doc.setTextColor(...GRAY);
    doc.text(t.noSubstancesMonth??"No substances logged",ML+2,y+4);y+=7;
  }
  y+=3;

  if(substanceImg){addChart(substanceImg,null,55);}

  // ── Weight ────────────────────────────────────────────────────────────────
  const weights=allRecs.filter(r=>r.weight).map(r=>({d:fmtDate(r.date??r.createdAt),w:r.weight}));
  const latestW=weights[weights.length-1];
  if(latestW){
    sectionHeader(t.weightBmi??"Weight & BMI");
    const bmi=latestW&&data.height?(latestW.w/((data.height/100)**2)).toFixed(1):null;
    row(t.weight??"Weight",`${latestW.w} ${t.kg??"kg"}`,false);
    if(bmi)row(t.bmi??"BMI",bmi,true);
    if(data.height)row("Height",`${data.height} cm`,false);
    y+=3;
    if(weightImg){addChart(weightImg,null,50);}
  }

  // ── Questionnaire scores ──────────────────────────────────────────────────
  sectionHeader(t.questionnaires??"Questionnaire Scores");
  const QC=[
    {key:"latestGad7",label:"GAD-7",max:21},
    {key:"latestPhq9",label:"PHQ-9",max:27},
    {key:"latestAudit",label:"AUDIT",max:40},
    {key:"latestDast10",label:"DAST-10",max:10},
    {key:"latestCage",label:"CAGE",max:4},
    {key:"latestReadiness",label:"Readiness",max:30},
  ];
  QC.forEach((q,i)=>{
    const raw=data[q.key];
    let val=t.noQuestionnaire??"Not completed";
    if(raw){const score=Object.values(raw).reduce((a,b)=>typeof b==="number"?a+b:a,0);val=`${score} / ${q.max}`;}
    row(q.label,val,i%2===1);
  });
  y+=3;
  if(qRadarImg){addChart(qRadarImg,null,70);}

  // ── Relevant advice ───────────────────────────────────────────────────────
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

  // ── Full log records ──────────────────────────────────────────────────────
  const sorted=[...recs].sort((a,b)=>(b.date??b.createdAt).localeCompare(a.date??a.createdAt));
  sectionHeader(t.history??"Log Records");
  if(sorted.length===0){
    doc.setFontSize(9);doc.setTextColor(...GRAY);
    doc.text(t.noData??"No records",ML+2,y+4);y+=7;
  }else{
    checkPage(8);
    doc.setFillColor(...NAVY);doc.rect(ML,y,CW,6,"F");
    doc.setTextColor(...WHITE);doc.setFontSize(8);doc.setFont("helvetica","bold");
    const cols=[
      {x:ML+1,  label:t.date??"Date"},
      {x:ML+24, label:t.mood??"Mood"},
      {x:ML+37, label:(t.cravings??"Crav").slice(0,4)},
      {x:ML+54, label:(t.wellbeing??"Well").slice(0,4)},
      {x:ML+71, label:t.substances??"Substances"},
      {x:ML+112,label:t.note??"Note"},
    ];
    cols.forEach(c=>doc.text(c.label.slice(0,10),c.x,y+4));
    y+=7;
    sorted.forEach((r,i)=>{
      checkPage(6);
      if(i%2===0){doc.setFillColor(...LGRAY);doc.rect(ML,y,CW,5.5,"F");}
      doc.setTextColor(...DARK);doc.setFont("helvetica","normal");doc.setFontSize(8);
      doc.text(fmtDate(r.date??r.createdAt),cols[0].x,y+4);
      doc.text(String(r.mood??"-"),cols[1].x,y+4);
      doc.text(String(r.cravings??"-"),cols[2].x,y+4);
      doc.text(String(r.wellbeing??"-"),cols[3].x,y+4);
      doc.text((r.substances??[]).join(", ").slice(0,22)||"—",cols[4].x,y+4);
      doc.text((r.note??"").slice(0,35),cols[5].x,y+4);
      y+=5.5;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pageCount=doc.getNumberOfPages();
  for(let p=1;p<=pageCount;p++){
    doc.setPage(p);doc.setFontSize(7);doc.setTextColor(...GRAY);
    doc.text(`KBB Medic AS · Recover · ${new Date().toLocaleDateString()}`,ML,290);
    doc.text(`${p} / ${pageCount}`,W-MR,290,{align:"right"});
  }

  const periodSlug=periodLabel.replace(/\s/g,"_");
  doc.save(`recover_${data.age??"patient"}_${periodSlug}.pdf`);
}

// ── Chart components rendered off-screen ──────────────────────────────────────
const SC_COLORS={alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",tobacco:"#8d6e63",prescription:"#42a5f5",other:"#bdbdbd"};

function OffscreenCharts({data,recs}){
  const allRecs=data.records??[];

  const moodData=recs.map(r=>({
    date:shortDate(r.date??r.createdAt),
    mood:r.mood??null,cravings:r.cravings??null,wellbeing:r.wellbeing??null,
  }));

  const scoreRadarData=[
    {subject:"Mood",     value:+avgOf(recs,"mood")||0,     fullMark:5},
    {subject:"Cravings", value:+avgOf(recs,"cravings")||0, fullMark:5},
    {subject:"Wellbeing",value:+avgOf(recs,"wellbeing")||0,fullMark:5},
  ];

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
  const substanceData=Object.values(weeks);
  const allSubs=[...new Set(recs.flatMap(r=>r.substances??[]))];

  const weightData=allRecs.filter(r=>r.weight).map(r=>({
    date:shortDate(r.date??r.createdAt),weight:r.weight,
  }));

  const QC=[
    {key:"latestGad7",label:"GAD-7",max:21},
    {key:"latestPhq9",label:"PHQ-9",max:27},
    {key:"latestAudit",label:"AUDIT",max:40},
    {key:"latestDast10",label:"DAST-10",max:10},
    {key:"latestCage",label:"CAGE",max:4},
    {key:"latestReadiness",label:"Readiness",max:30},
  ];
  const qRadarData=QC.map(q=>{
    const raw=data[q.key];
    const score=raw?Object.values(raw).reduce((a,b)=>typeof b==="number"?a+b:a,0):0;
    return{subject:q.label,value:Math.round((score/q.max)*100),fullMark:100};
  });

  const wrap={position:"fixed",left:"-9999px",top:"0px",zIndex:-1,background:"#fff"};

  return(
    <div style={wrap}>
      {/* Mood line */}
      <div id="pdf-chart-mood" style={{width:520,height:200,background:"#fff",padding:"8px"}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={moodData} margin={{top:8,right:16,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
            <XAxis dataKey="date" tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} interval={Math.max(0,Math.ceil(moodData.length/8)-1)}/>
            <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false}/>
            <Tooltip/>
            <Legend wrapperStyle={{fontSize:11,paddingTop:4}}/>
            <ReferenceLine y={3} stroke="#d0dcea" strokeDasharray="4 4"/>
            <Line type="monotone" dataKey="mood"      name="Mood"      stroke="#4a7ab5" strokeWidth={2} dot={{r:2,fill:"#4a7ab5"}} connectNulls/>
            <Line type="monotone" dataKey="cravings"  name="Cravings"  stroke="#f4a07a" strokeWidth={2} dot={{r:2,fill:"#f4a07a"}} connectNulls/>
            <Line type="monotone" dataKey="wellbeing" name="Wellbeing" stroke="#9c27b0" strokeWidth={2} dot={{r:2,fill:"#9c27b0"}} connectNulls/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score radar */}
      <div id="pdf-chart-score-radar" style={{width:340,height:280,background:"#fff",padding:"8px"}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={scoreRadarData} margin={{top:20,right:40,bottom:20,left:40}}>
            <PolarGrid stroke="#d0dcea"/>
            <PolarAngleAxis dataKey="subject" tick={{fontSize:13,fill:"#2d4a6e",fontWeight:700}}/>
            <PolarRadiusAxis angle={90} domain={[0,5]} tickCount={6} tick={{fontSize:9,fill:"#7a9ab8"}}/>
            <Radar name="Avg Score" dataKey="value" stroke="#4a7ab5" fill="#4a7ab5" fillOpacity={0.3} strokeWidth={2.5}/>
            <Legend wrapperStyle={{fontSize:11}}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Substance bar */}
      {substanceData.length>0&&allSubs.length>0&&(
        <div id="pdf-chart-substance" style={{width:520,height:200,background:"#fff",padding:"8px"}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={substanceData} margin={{top:8,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip/>
              <Legend wrapperStyle={{fontSize:11,paddingTop:4}}/>
              {allSubs.map(s=>(
                <Bar key={s} dataKey={s} name={s.charAt(0).toUpperCase()+s.slice(1)} fill={SC_COLORS[s]??"#bdbdbd"} radius={[3,3,0,0]} maxBarSize={30}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight line */}
      {weightData.length>1&&(
        <div id="pdf-chart-weight" style={{width:520,height:180,background:"#fff",padding:"8px"}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{top:8,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e8f0" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} interval={Math.max(0,Math.ceil(weightData.length/6)-1)}/>
              <YAxis tick={{fontSize:10,fill:"#7a9ab8"}} tickLine={false} axisLine={false} domain={[d=>Math.floor(d-2),d=>Math.ceil(d+2)]}/>
              <Tooltip/>
              <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#2d4a6e" strokeWidth={2.5} dot={{r:3,fill:"#2d4a6e"}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Questionnaire radar */}
      <div id="pdf-chart-q-radar" style={{width:380,height:300,background:"#fff",padding:"8px"}}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={qRadarData} margin={{top:20,right:50,bottom:20,left:50}}>
            <PolarGrid stroke="#d0dcea"/>
            <PolarAngleAxis dataKey="subject" tick={{fontSize:12,fill:"#2d4a6e",fontWeight:700}}/>
            <PolarRadiusAxis angle={90} domain={[0,100]} tickCount={6} tick={{fontSize:9,fill:"#7a9ab8"}} unit="%"/>
            <Radar name="Score %" dataKey="value" stroke="#4a7ab5" fill="#4a7ab5" fillOpacity={0.25} strokeWidth={2.5}/>
            <Legend wrapperStyle={{fontSize:11}}/>
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function PdfExportModal({data,t:tProp,onClose}){
  const t=tProp??{};
  const now=new Date();
  const [year,setYear]      =useState(now.getFullYear());
  const [month,setMonth]    =useState(now.getMonth());
  const [allTime,setAllTime]=useState(false);
  const [loading,setLoading]=useState(false);
  const [step,setStep]      =useState(""); // status message
  const [error,setError]    =useState("");
  const [showCharts,setShowCharts]=useState(false);

  const months=t.months??["January","February","March","April","May","June","July","August","September","October","November","December"];

  const recs=(data.records??[]).filter(r=>{
    if(allTime)return true;
    const d=new Date(r.date??r.createdAt);
    return d.getFullYear()===year&&d.getMonth()===month;
  });

  const handleGenerate=useCallback(async()=>{
    setLoading(true);setError("");setStep("Rendering charts…");
    setShowCharts(true);
    try{
      await new Promise(r=>setTimeout(r,900)); // wait for recharts paint
      setStep("Capturing diagrams…");
      await generatePDF({data,t,year,month,allTime,recs});
      setShowCharts(false);
      onClose();
    }catch(e){
      console.error(e);
      setError("Failed to generate PDF. Please try again.");
      setShowCharts(false);
      setStep("");
    }finally{setLoading(false);}
  },[data,t,year,month,allTime,recs,onClose]);

  const inputStyle={background:BG,border:`1px solid ${BO}`,borderRadius:8,padding:"7px 11px",fontSize:13,color:AD,fontFamily:"inherit",outline:"none",width:"100%"};

  return(
    <>
      {showCharts&&<OffscreenCharts data={data} recs={recs}/>}

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

            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:AD,fontWeight:600}}>
              <input type="checkbox" checked={allTime} onChange={e=>setAllTime(e.target.checked)} style={{width:16,height:16,cursor:"pointer",accentColor:A}}/>
              {t.substancesAllTime??"All time"}
            </label>

            {!allTime&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:0.8,marginBottom:5}}>MONTH</div>
                  <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={inputStyle}>
                    {months.map((m,i)=><option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:0.8,marginBottom:5}}>YEAR</div>
                  <select value={year} onChange={e=>setYear(Number(e.target.value))} style={inputStyle}>
                    {[now.getFullYear()-2,now.getFullYear()-1,now.getFullYear()].map(y=>(
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{background:BG,borderRadius:10,padding:"10px 14px",fontSize:11,color:MU,lineHeight:1.9}}>
              ✓ Patient info &nbsp;·&nbsp; ✓ {t.monthSummary??"Period stats"}<br/>
              ✓ 📈 Mood / Cravings / Wellbeing line chart<br/>
              ✓ 🕸 Score distribution radar<br/>
              ✓ {t.substancesMonth??"Substance summary"} + bar chart<br/>
              ✓ {t.weight??"Weight"} trend chart<br/>
              ✓ 🕸 {t.questionnaires??"Questionnaire"} radar<br/>
              ✓ {t.relevantAdvice??"Relevant advice"} &nbsp;·&nbsp; ✓ {t.history??"Full log"}
            </div>

            {step&&<div style={{fontSize:12,color:A,fontWeight:600,textAlign:"center"}}>{step}</div>}
            {error&&<div style={{fontSize:12,color:"#e53e3e",background:"#fff5f5",borderRadius:8,padding:"8px 12px"}}>{error}</div>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{background:`linear-gradient(135deg,${A},${AD})`,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:13,fontWeight:700,cursor:loading?"wait":"pointer",fontFamily:"inherit",opacity:loading?0.7:1,transition:"opacity .15s"}}
            >
              {loading?`⏳ ${step||"Generating…"}`:"⬇ Download PDF"}
            </button>

          </div>
        </div>
      </div>
    </>
  );
}