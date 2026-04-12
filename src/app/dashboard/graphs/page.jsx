// src/app/dashboard/graphs/page.jsx
"use client";
import { useState, useMemo } from "react";
import { useDashboardT } from "../LangContext";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

const A="#4a7ab5",AD="#2d4a6e",BG="#eef2f7",SU="#ffffff",BO="#d0dcea",TX="#1a2c3d",MU="#7a9ab8";
const SC={alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",tobacco:"#8d6e63",prescription:"#42a5f5",other:"#bdbdbd"};

function pad(n){return String(n).padStart(2,"0");}
function fmtDate(d){const dt=new Date(d);return`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;}
function shortDate(d){const dt=new Date(d);return`${pad(dt.getMonth()+1)}/${pad(dt.getDate())}`;}

function Card({title,subtitle,children}){
  return(
    <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:20,boxShadow:"0 2px 8px rgba(74,122,181,0.06)",marginBottom:16}}>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:AD}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:MU,marginTop:2}}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:SU,border:`1px solid ${BO}`,borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(45,74,110,0.12)"}}>
      <div style={{fontSize:11,fontWeight:700,color:AD,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
          <span style={{fontSize:11,color:TX}}>{p.name}:</span>
          <span style={{fontSize:11,fontWeight:700,color:AD}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function GraphsPage(){
  const t=useDashboardT();

  const [data]=useState(()=>{
    if(typeof window==="undefined")return null;
    try{const raw=sessionStorage.getItem("patientData");return raw?JSON.parse(raw):null;}
    catch{return null;}
  });

  const [range,setRange]=useState(30);

  const rangeLabel={
    7:`Last 7 ${t.days??"days"}`,
    30:`Last 30 ${t.days??"days"}`,
    90:`Last 90 ${t.days??"days"}`,
    365:`All time`,
  };

  const records=useMemo(()=>{
    if(!data)return[];
    const cutoff=new Date();
    cutoff.setDate(cutoff.getDate()-range);
    return[...(data.records??[])]
      .filter(r=>new Date(r.date??r.createdAt)>=cutoff)
      .sort((a,b)=>(a.date??a.createdAt).localeCompare(b.date??b.createdAt));
  },[data,range]);

  const moodData=useMemo(()=>records.map(r=>({
    date:shortDate(r.date??r.createdAt),
    mood:r.mood??null,
    cravings:r.cravings??null,
    wellbeing:r.wellbeing??null,
  })),[records]);

  const substanceData=useMemo(()=>{
    const weeks={};
    records.forEach(r=>{
      const d=new Date(r.date??r.createdAt);
      const day=d.getDay();
      const diff=d.getDate()-(day===0?6:day-1);
      const mon=new Date(d);mon.setDate(diff);
      const key=`${pad(mon.getMonth()+1)}/${pad(mon.getDate())}`;
      if(!weeks[key])weeks[key]={week:key};
      (r.substances??[]).forEach(s=>{weeks[key][s]=(weeks[key][s]??0)+1;});
    });
    return Object.values(weeks);
  },[records]);

  const allSubs=useMemo(()=>{
    const s=new Set();
    records.forEach(r=>(r.substances??[]).forEach(x=>s.add(x)));
    return[...s];
  },[records]);

  const weightData=useMemo(()=>records
    .filter(r=>r.weight)
    .map(r=>({date:shortDate(r.date??r.createdAt),weight:r.weight}))
  ,[records]);

  const qScores=useMemo(()=>{
    if(!data)return[];
    return[
      {key:"latestGad7",  label:"GAD-7",    max:21,color:"#7C3AED"},
      {key:"latestPhq9",  label:"PHQ-9",    max:27,color:"#DC2626"},
      {key:"latestAudit", label:"AUDIT",    max:40,color:"#D97706"},
      {key:"latestDast10",label:"DAST-10",  max:10,color:"#059669"},
      {key:"latestCage",  label:"CAGE",     max:4, color:"#0284C7"},
      {key:"latestReadiness",label:"Readiness",max:30,color:"#0891B2"},
    ].map(q=>{
      const raw=data[q.key];
      if(!raw)return{...q,score:null,pct:0};
      const score=Object.values(raw).reduce((a,b)=>typeof b==="number"?a+b:a,0);
      return{...q,score,pct:Math.round((score/q.max)*100)};
    });
  },[data]);

  if(!data)return<div style={{padding:40,textAlign:"center",color:MU}}>{t.loading??"Loading…"}</div>;

  return(
    <div>
      {/* Range selector */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <span style={{fontSize:11,fontWeight:700,color:MU,letterSpacing:0.5}}>{(t.graphs??"RANGE").toUpperCase()}:</span>
        {[7,30,90,365].map(r=>(
          <button key={r} onClick={()=>setRange(r)}
            style={{background:range===r?A:SU,color:range===r?"#fff":MU,border:`1px solid ${range===r?A:BO}`,borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
            {rangeLabel[r]}
          </button>
        ))}
        <span style={{fontSize:11,color:MU,marginLeft:4}}>({records.length} entries)</span>
      </div>

      {records.length===0&&(
        <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:40,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>📭</div>
          <div style={{fontSize:13,color:MU}}>{t.noData??"No records in this time range"}</div>
        </div>
      )}

      {/* Mood / Cravings / Wellbeing */}
      {moodData.some(d=>d.mood!=null||d.cravings!=null||d.wellbeing!=null)&&(
        <Card title={t.moodCravingsWellbeing??"Mood, Cravings & Wellbeing"} subtitle="1–5">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={moodData} margin={{top:4,right:10,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={BO} vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false} interval={Math.ceil(moodData.length/8)}/>
              <YAxis domain={[0,5]} tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false} ticks={[1,2,3,4,5]}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
              <ReferenceLine y={3} stroke={BO} strokeDasharray="4 4"/>
              <Line type="monotone" dataKey="mood"      name={t.mood??"Mood"}      stroke={A}       strokeWidth={2} dot={{r:3,fill:A}}        connectNulls activeDot={{r:5}}/>
              <Line type="monotone" dataKey="cravings"  name={t.cravings??"Cravings"}  stroke="#f4a07a" strokeWidth={2} dot={{r:3,fill:"#f4a07a"}} connectNulls activeDot={{r:5}}/>
              <Line type="monotone" dataKey="wellbeing" name={t.wellbeing??"Wellbeing"} stroke="#9c27b0" strokeWidth={2} dot={{r:3,fill:"#9c27b0"}} connectNulls activeDot={{r:5}}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Substance use */}
      {substanceData.length>0&&allSubs.length>0&&(
        <Card title={t.substancesByWeek??"Substance Use"} subtitle={`${t.days??"days"} / week`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={substanceData} margin={{top:4,right:10,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={BO} vertical={false}/>
              <XAxis dataKey="week" tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}}/>
              {allSubs.map(s=>(
                <Bar key={s} dataKey={s} name={s.charAt(0).toUpperCase()+s.slice(1)} fill={SC[s]??"#bdbdbd"} radius={[3,3,0,0]} maxBarSize={32}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Weight trend */}
      {weightData.length>1&&(
        <Card title={t.weightOverTime??"Weight Trend"} subtitle={t.kg??"kg"}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData} margin={{top:4,right:10,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={BO} vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false} interval={Math.ceil(weightData.length/6)}/>
              <YAxis tick={{fontSize:10,fill:MU}} tickLine={false} axisLine={false} domain={[d=>Math.floor(d-2),d=>Math.ceil(d+2)]}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="weight" name={`${t.weight??"Weight"} (${t.kg??"kg"})`} stroke={AD} strokeWidth={2.5} dot={{r:4,fill:AD}} activeDot={{r:6}}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Questionnaire scores */}
      <Card title={t.questionnaireScores??"Questionnaire Scores"} subtitle="% of max">
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {qScores.map(q=>(
            <div key={q.key}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:q.color}}/>
                  <span style={{fontSize:12,fontWeight:600,color:TX}}>{q.label}</span>
                </div>
                {q.score!=null
                  ?<span style={{fontSize:12,fontWeight:700,color:q.color}}>{q.score} / {q.max} ({q.pct}%)</span>
                  :<span style={{fontSize:11,color:MU,fontStyle:"italic"}}>{t.noQuestionnaire??"Not completed"}</span>
                }
              </div>
              <div style={{height:10,background:BG,borderRadius:5,overflow:"hidden",border:`1px solid ${BO}`}}>
                <div style={{width:`${q.pct}%`,height:"100%",background:`linear-gradient(90deg,${q.color}99,${q.color})`,borderRadius:5,transition:"width .8s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}