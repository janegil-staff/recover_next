// src/app/dashboard/questionnaires/page.jsx
"use client";
import { useState, useEffect } from "react";

const A="#4a7ab5",AD="#2d4a6e",BG="#eef2f7",SU="#ffffff",BO="#d0dcea",TX="#1a2c3d",MU="#7a9ab8";

const QC=[
  {key:"latestGad7",label:"GAD-7",subtitle:"Generalised Anxiety Disorder",max:21,color:"#7C3AED",
    fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":"Severe",
    ranges:[{label:"Minimal",range:"0–4",color:"#a8d5a2"},{label:"Mild",range:"5–9",color:"#f5c97a"},{label:"Moderate",range:"10–14",color:"#f4a07a"},{label:"Severe",range:"15–21",color:"#e87070"}]},
  {key:"latestPhq9",label:"PHQ-9",subtitle:"Patient Health Questionnaire (Depression)",max:27,color:"#DC2626",
    fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":s<=19?"Mod-severe":"Severe",
    ranges:[{label:"Minimal",range:"0–4",color:"#a8d5a2"},{label:"Mild",range:"5–9",color:"#f5c97a"},{label:"Moderate",range:"10–14",color:"#f4a07a"},{label:"Mod-severe",range:"15–19",color:"#e87070"},{label:"Severe",range:"20–27",color:"#c62828"}]},
  {key:"latestAudit",label:"AUDIT",subtitle:"Alcohol Use Disorders Identification Test",max:40,color:"#D97706",
    fn:s=>s<=7?"Low risk":s<=15?"Hazardous":s<=19?"Harmful":"Likely dep.",
    ranges:[{label:"Low risk",range:"0–7",color:"#a8d5a2"},{label:"Hazardous",range:"8–15",color:"#f5c97a"},{label:"Harmful",range:"16–19",color:"#f4a07a"},{label:"Likely dep.",range:"20+",color:"#e87070"}]},
  {key:"latestDast10",label:"DAST-10",subtitle:"Drug Abuse Screening Test",max:10,color:"#059669",
    fn:s=>s===0?"No problem":s<=2?"Low":s<=5?"Moderate":s<=8?"Substantial":"Severe",
    ranges:[{label:"No problem",range:"0",color:"#a8d5a2"},{label:"Low",range:"1–2",color:"#f5c97a"},{label:"Moderate",range:"3–5",color:"#f4a07a"},{label:"Substantial",range:"6–8",color:"#e87070"},{label:"Severe",range:"9–10",color:"#c62828"}]},
  {key:"latestCage",label:"CAGE",subtitle:"Alcohol Dependence Screening",max:4,color:"#0284C7",
    fn:s=>s<=1?"Unlikely dep.":s<=2?"Possible problem":"Likely dep.",
    ranges:[{label:"Unlikely",range:"0–1",color:"#a8d5a2"},{label:"Possible",range:"2",color:"#f5c97a"},{label:"Likely dep.",range:"3–4",color:"#e87070"}]},
  {key:"latestReadiness",label:"Readiness",subtitle:"Readiness to Change",max:30,color:"#0891B2",
    fn:s=>s<=10?"Not ready":s<=20?"Considering":"Ready",
    ranges:[{label:"Not ready",range:"0–10",color:"#e87070"},{label:"Considering",range:"11–20",color:"#f5c97a"},{label:"Ready",range:"21–30",color:"#a8d5a2"}]},
];

function scoreTotal(o){if(!o)return null;return Object.values(o).reduce((a,b)=>typeof b==="number"?a+b:a,0);}

export default function QuestionnairesPage() {
  const [data,setData]=useState(null);

  useEffect(()=>{
    const raw=sessionStorage.getItem("patientData");
    if(raw)setData(JSON.parse(raw));
  },[]);

  if(!data)return<div style={{padding:40,textAlign:"center",color:MU}}>Loading…</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:12,color:MU}}>Showing latest completed questionnaire scores.</div>
      {QC.map(q=>{
        const total=scoreTotal(data[q.key]);
        const rawData=data[q.key];
        const completedDate=rawData?.date;
        return(
          <div key={q.key} style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:18,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:AD}}>{q.label}</div>
                <div style={{fontSize:11,color:MU,marginTop:2}}>{q.subtitle}</div>
                {completedDate&&<div style={{fontSize:10,color:MU,marginTop:3}}>Completed: {completedDate}</div>}
              </div>
              {total!=null
                ?<div style={{textAlign:"right"}}>
                  <div style={{fontSize:24,fontWeight:800,color:q.color,lineHeight:1}}>{total}</div>
                  <div style={{fontSize:10,color:MU}}>/ {q.max}</div>
                  <div style={{fontSize:11,fontWeight:700,color:q.color,marginTop:2}}>{q.fn(total)}</div>
                </div>
                :<div style={{fontSize:12,color:MU,fontStyle:"italic"}}>Not completed</div>
              }
            </div>
            {/* Progress bar */}
            {total!=null&&(
              <div style={{marginBottom:12}}>
                <div style={{height:8,background:BG,borderRadius:4,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,(total/q.max)*100)}%`,height:"100%",background:q.color,borderRadius:4,transition:"width .6s ease"}}/>
                </div>
              </div>
            )}
            {/* Ranges legend */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {q.ranges.map(r=>(
                <div key={r.label} style={{display:"flex",alignItems:"center",gap:4,background:BG,borderRadius:20,padding:"3px 10px",border:`1px solid ${BO}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:r.color}}/>
                  <span style={{fontSize:10,color:TX,fontWeight:500}}>{r.label}</span>
                  <span style={{fontSize:10,color:MU}}>{r.range}</span>
                </div>
              ))}
            </div>
            {/* Raw answers if available */}
            {rawData&&Object.keys(rawData).filter(k=>k!=="date").length>0&&(
              <details style={{marginTop:12}}>
                <summary style={{fontSize:10,fontWeight:700,color:MU,cursor:"pointer",letterSpacing:0.5}}>SHOW ANSWERS</summary>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6,marginTop:8}}>
                  {Object.entries(rawData).filter(([k])=>k!=="date").map(([k,v])=>(
                    <div key={k} style={{background:BG,borderRadius:8,padding:"7px 10px",border:`1px solid ${BO}`}}>
                      <div style={{fontSize:9,color:MU,fontWeight:700,letterSpacing:0.4,marginBottom:2}}>{k.replace(/([A-Z])/g," $1").trim().toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:700,color:AD}}>{v}</div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
