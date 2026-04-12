"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const A = "#4a7ab5", AD = "#2d4a6e", AL = "#dde8f4";
const BG = "#eef2f7", SU = "#ffffff", BO = "#d0dcea";
const TX = "#1a2c3d", MU = "#7a9ab8";

const SC = {
  alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",
  opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",
  tobacco:"#8d6e63",prescription:"#42a5f5",other:"#bdbdbd",
};
const sc = s => SC[s] ?? "#bdbdbd";

function pad(n) { return String(n).padStart(2,"0"); }
function fmtDate(d) { const dt=new Date(d); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`; }
function daysInMonth(y,m) { return new Date(y,m+1,0).getDate(); }
function firstDow(y,m) { return (new Date(y,m,1).getDay()+6)%7; }
function cravingBg(n) {
  if(n==null)return"transparent";
  if(n<=0)return"#a8d5a2";if(n<=2)return"#f5c97a";if(n<=3)return"#f4a07a";return"#e87070";
}
function scoreTotal(o){if(!o)return null;return Object.values(o).reduce((a,b)=>typeof b==="number"?a+b:a,0);}

const QC=[
  {key:"latestGad7",label:"GAD-7",max:21,color:"#7C3AED",fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":"Severe"},
  {key:"latestPhq9",label:"PHQ-9",max:27,color:"#DC2626",fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":s<=19?"Mod-severe":"Severe"},
  {key:"latestAudit",label:"AUDIT",max:40,color:"#D97706",fn:s=>s<=7?"Low risk":s<=15?"Hazardous":s<=19?"Harmful":"Likely dep."},
  {key:"latestDast10",label:"DAST-10",max:10,color:"#059669",fn:s=>s===0?"No problem":s<=2?"Low":s<=5?"Moderate":s<=8?"Substantial":"Severe"},
  {key:"latestCage",label:"CAGE",max:4,color:"#0284C7",fn:s=>s<=1?"Unlikely":s<=2?"Possible":"Likely dep."},
  {key:"latestReadiness",label:"Readiness",max:30,color:"#0891B2",fn:s=>s<=10?"Not ready":s<=20?"Considering":"Ready"},
];
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];


// ── Day Detail Modal ──────────────────────────────────────────────────────────
function DayModal({ date, rec, onClose }) {
  if (!rec) return null;
  const subs      = rec.substances ?? [];
  const effects   = rec.sideEffects ?? [];
  const acuteMeds = rec.medicationsTaken ?? [];
  const freqLabel = { once:"Once", few_times:"Few times", daily:"Several times", multiple_daily:"Many times" };

  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,background:"rgba(15,30,50,0.6)",
      backdropFilter:"blur(5px)",zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:SU,borderRadius:20,width:"100%",maxWidth:500,
        maxHeight:"90vh",overflowY:"auto",
        boxShadow:"0 28px 70px rgba(45,74,110,0.3)",
        border:`1px solid ${BO}`,
      }}>
        {/* Header */}
        <div style={{
          background:`linear-gradient(135deg,${A},${AD})`,
          borderRadius:"20px 20px 0 0",padding:"16px 20px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          position:"sticky",top:0,zIndex:1,
        }}>
          <div>
            <div style={{color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:2}}>Daily log</div>
            <div style={{color:"#fff",fontSize:17,fontWeight:700}}>{date}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <div style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>

          {/* Mood / Cravings / Wellbeing — always shown */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[
              {label:"Mood",      val:rec.mood,    icon:"😊", max:5, color:"#4a7ab5"},
              {label:"Cravings",  val:rec.cravings, icon:"🔥", max:5, color:"#f4a07a"},
              {label:"Wellbeing", val:rec.wellbeing,    icon:"💙", max:5, color:"#9c27b0"},
            ].map(s=>(
              <div key={s.label} style={{background:BG,borderRadius:12,padding:"11px 6px",textAlign:"center",border:`1px solid ${BO}`}}>
                <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:800,lineHeight:1,color:s.val!=null?AD:MU}}>{s.val!=null?s.val:"—"}</div>
                <div style={{fontSize:9,color:MU,fontWeight:700,letterSpacing:0.4,marginTop:2}}>{s.label.toUpperCase()} / {s.max}</div>
                <div style={{height:3,background:"#e8eef5",borderRadius:2,marginTop:5,overflow:"hidden"}}>
                  <div style={{width:s.val!=null?`${(s.val/s.max)*100}%`:"0%",height:"100%",background:s.color,borderRadius:2}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Frequency & Amount — always shown */}
          <Section title="Frequency & Amount / Dosage">
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Pill label="Frequency"      val={rec.frequency ? (freqLabel[rec.frequency]??rec.frequency) : "—"} color={A}/>
              <Pill label="Amount/Dosage"  val={rec.amount!=null ? rec.amount : "—"}                             color={AD}/>
            </div>
          </Section>

          {/* Substances — always shown */}
          <Section title="Substances used">
            {subs.length>0
              ? <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {subs.map(s=>(
                    <span key={s} style={{background:sc(s)+"22",color:sc(s),border:`1px solid ${sc(s)}44`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,textTransform:"capitalize"}}>{s}</span>
                  ))}
                </div>
              : <span style={{fontSize:12,color:MU}}>—</span>
            }
          </Section>

          {/* Medication — always shown */}
          <Section title="Medication taken today">
            {acuteMeds.length>0
              ? <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {acuteMeds.map((med,i)=>{
                    const name  = typeof med==="object" ? (med.name??med.id??"Unknown") : String(med);
                    const dose  = typeof med==="object" ? (med.dosage??med.dose??null) : null;
                    const times = typeof med==="object" ? (med.times??null) : null;
                    return(
                      <div key={i} style={{background:BG,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${BO}`}}>
                        <div style={{fontSize:12,fontWeight:600,color:TX,textTransform:"capitalize"}}>{name}</div>
                        <div style={{display:"flex",gap:6}}>
                          {dose!=null && <span style={{fontSize:10,background:AL,color:AD,borderRadius:20,padding:"2px 8px",fontWeight:600}}>{dose}</span>}
                          {times!=null && <span style={{fontSize:10,background:"#e8f5e9",color:"#2e7d32",borderRadius:20,padding:"2px 8px",fontWeight:600}}>{times}×</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              : <span style={{fontSize:12,color:MU}}>—</span>
            }
          </Section>

          {/* Side effects — always shown */}
          <Section title="Side effects">
            {effects.length>0
              ? <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {effects.map(e=>(
                    <span key={e} style={{background:"#fff3e0",color:"#e65100",border:"1px solid #ffcc8055",borderRadius:20,padding:"5px 13px",fontSize:12}}>{e}</span>
                  ))}
                </div>
              : <span style={{fontSize:12,color:MU}}>—</span>
            }
          </Section>

          {/* Weight — always shown */}
          <Section title="Weight">
            {rec.weight
              ? <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                  <span style={{fontSize:26,fontWeight:800,color:AD}}>{rec.weight}</span>
                  <span style={{fontSize:13,color:MU}}>kg</span>
                </div>
              : <span style={{fontSize:12,color:MU}}>—</span>
            }
          </Section>

          {/* Note — always shown */}
          <Section title="Note">
            {rec.note
              ? <div style={{background:AL,borderRadius:10,padding:"12px 14px",fontSize:13,color:TX,borderLeft:`3px solid ${A}`,fontStyle:"italic",lineHeight:1.7}}>"{rec.note}"</div>
              : <span style={{fontSize:12,color:MU}}>—</span>
            }
          </Section>

        </div>
      </div>
    </div>
  );
}


function Section({ title, children }) {
  return (
    <div>
      <div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:1,
        textTransform:"uppercase",marginBottom:8}}>{title}</div>
      {children}

    </div>
  );
}

function Pill({ label, val, color }) {
  return (
    <div style={{background:color+"18",border:`1px solid ${color}33`,
      borderRadius:10,padding:"8px 14px",textAlign:"center"}}>
      <div style={{fontSize:16,fontWeight:700,color}}>{val}</div>
      <div style={{fontSize:9,color:MU,fontWeight:600,marginTop:1}}>{label.toUpperCase()}</div>

    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [month,setMonth]=useState(()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth()};});
  const [sel,setSel]=useState(null);
  const [modalDate,setModalDate]=useState(null);
  const [view,setView]=useState("summary");

  useEffect(()=>{
    try{
      const raw=sessionStorage.getItem("patientData");
      if(!raw)throw new Error("No patient data — please enter your code again.");
      setData(JSON.parse(raw));
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  },[]);

  const logout=()=>{sessionStorage.removeItem("patientData");router.push("/");};

  const recMap=useMemo(()=>{
    if(!data)return{};
    const m={};
    (data.records??[]).forEach(r=>{m[fmtDate(r.date??r.createdAt)]=r;});
    return m;
  },[data]);

  const monthRecs=useMemo(()=>{
    if(!data)return[];
    return(data.records??[]).filter(r=>{const d=new Date(r.date??r.createdAt);return d.getFullYear()===month.y&&d.getMonth()===month.m;});
  },[data,month]);

  const subCounts=useMemo(()=>{
    const c={};monthRecs.forEach(r=>(r.substances??[]).forEach(s=>{c[s]=(c[s]??0)+1;}));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[monthRecs]);

  const allRecs=useMemo(()=>{
    if(!data)return[];
    return[...(data.records??[])].sort((a,b)=>(b.date??b.createdAt).localeCompare(a.date??a.createdAt));
  },[data]);

  const selRec=sel?recMap[sel]:null;
  const todayStr=fmtDate(new Date());
  const avgCraving=monthRecs.length?(monthRecs.reduce((a,r)=>a+(r.cravings??0),0)/monthRecs.length).toFixed(1):"—";
  const avgMood=monthRecs.length?(monthRecs.reduce((a,r)=>a+(r.mood??0),0)/monthRecs.length).toFixed(1):"—";

  if(loading)return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:32,height:32,border:`3px solid ${AL}`,borderTop:`3px solid ${A}`,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:MU,fontFamily:"system-ui",fontSize:12}}>Loading…</p>
    </div>
  );

  if(error)return(
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:SU,borderRadius:14,padding:28,textAlign:"center",maxWidth:340,border:`1px solid ${BO}`}}>
        <div style={{fontSize:32,marginBottom:10}}>⚠️</div>
        <p style={{color:AD,fontSize:14,fontWeight:600,marginBottom:16,fontFamily:"system-ui"}}>{error}</p>
        <button onClick={()=>router.push("/")} style={{background:A,color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"system-ui"}}>← Back</button>
      </div>
    </div>
  );

  const {y,m}=month;
  const days=daysInMonth(y,m);
  const firstDay=firstDow(y,m);

  return(
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .dbg{display:grid;grid-template-columns:320px 1fr;gap:16px;align-items:start;max-width:960px;margin:0 auto;padding:16px}
        .sbar{display:flex;flex-direction:column;gap:12px}
        @media(max-width:680px){
          .dbg{grid-template-columns:1fr}
          .cal-col{order:1}
          .sbar{order:2}
        }
      `}</style>

      {/* Top bar */}
      <div style={{background:SU,borderBottom:`1px solid ${BO}`,padding:"0 16px",height:48,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 6px rgba(74,122,181,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:26,height:26,background:`linear-gradient(135deg,${A},${AD})`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>💊</div>
          <span style={{fontWeight:700,fontSize:14,color:AD}}>Recover</span>
          <span style={{color:BO,fontSize:12}}>·</span>
          <span style={{fontSize:11,color:MU}}>Doctor view</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {[data.age&&`${data.age}y`,data.gender,data.height&&`${data.height}cm`].filter(Boolean).map(v=>(
            <span key={v} style={{background:AL,color:AD,fontSize:10,fontWeight:600,borderRadius:20,padding:"2px 8px"}}>{v}</span>
          ))}
          <button onClick={logout} style={{background:"none",border:`1px solid ${BO}`,borderRadius:7,color:MU,fontSize:11,fontWeight:600,padding:"5px 12px",cursor:"pointer",marginLeft:4}}>
            ↩ Sign out
          </button>
        </div>
      </div>

      <div className="dbg">

        {/* ── Calendar column ── */}
        <div className="cal-col" style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* Calendar card */}
          <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,boxShadow:"0 2px 10px rgba(74,122,181,0.07)",overflow:"hidden"}}>
            {/* Month nav */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
              <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m-1);return{y:d.getFullYear(),m:d.getMonth()}})}
                style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <span style={{fontSize:11,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase"}}>{MONTHS[m]} {y}</span>
              <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m+1);return{y:d.getFullYear(),m:d.getMonth()}})}
                style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>

            {/* Weekdays */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px",gap:2}}>
              {["M","T","W","T","F","S","S"].map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:MU,paddingBottom:3}}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px 10px",gap:2}}>
              {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:days}).map((_,i)=>{
                const day=i+1;
                const ds=`${y}-${pad(m+1)}-${pad(day)}`;
                const rec=recMap[ds];
                const isToday=ds===todayStr;
                const isSel=ds===sel;
                const subs=(rec?.substances??[]);
                return(
                  <div key={day} onClick={()=>{setSel(isSel?null:ds);if(rec)setModalDate(ds);}}
                    style={{borderRadius:6,padding:"4px 1px",textAlign:"center",cursor:"pointer",minHeight:30,
                      background:isSel?A:rec?cravingBg(rec.cravings):BG,
                      border:isToday?`2px solid ${A}`:`1px solid ${rec&&!isSel?"transparent":BO}`,
                      transition:"all .1s"}}>
                    <div style={{fontSize:10,fontWeight:isToday||isSel?700:400,color:isSel?"#fff":rec?TX:MU,lineHeight:1}}>{day}</div>
                    {subs.length>0&&!isSel&&(
                      <div style={{display:"flex",gap:1,justifyContent:"center",marginTop:2}}>
                        {subs.slice(0,3).map((s,si)=><div key={si} style={{width:3,height:3,borderRadius:"50%",background:sc(s)}}/>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{borderTop:`1px solid ${BG}`,padding:"8px 14px",display:"flex",flexWrap:"wrap",gap:10}}>
              {[["#a8d5a2","None"],["#f5c97a","Low"],["#f4a07a","Moderate"],["#e87070","High"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                  <span style={{fontSize:9,color:MU}}>{l}</span>
                </div>
              ))}
            </div>

            {/* View toggle */}
            <div style={{borderTop:`1px solid ${BO}`,display:"flex"}}>
              {["summary","log"].map(v=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{flex:1,padding:"9px 0",border:"none",cursor:"pointer",
                    fontSize:11,fontWeight:700,letterSpacing:0.4,textTransform:"capitalize",
                    background:view===v?`linear-gradient(135deg,${A},${AD})`:"none",
                    color:view===v?"#fff":MU,transition:"all .15s"}}>
                  {v==="summary"?"📊 Summary":"📋 Log"}
                </button>
              ))}
            </div>
          </div>



          {/* Log list */}
          {view==="log"&&(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {allRecs.slice(0,40).map((r,i)=>{
                const ds=fmtDate(r.date??r.createdAt);
                return(
                  <div key={i} style={{background:SU,borderRadius:10,border:`1px solid ${BO}`,padding:"10px 12px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:8,background:cravingBg(r.cravings),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>
                      {r.mood>=4?"😄":r.mood>=3?"🙂":r.mood<=2?"😕":"😐"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:AD,marginBottom:2}}>{ds}</div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {(r.substances??[]).map(s=><span key={s} style={{fontSize:9,color:sc(s),fontWeight:600,textTransform:"capitalize"}}>{s}</span>)}
                        {!(r.substances??[]).length&&<span style={{fontSize:9,color:MU}}>No substances</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:10,flexShrink:0}}>
                      {r.mood!=null&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:AD}}>{r.mood}</div><div style={{fontSize:8,color:MU}}>MOOD</div></div>}
                      {r.cravings!=null&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:AD}}>{r.cravings}</div><div style={{fontSize:8,color:MU}}>CRAV</div></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="sbar">

          {/* Month stats */}
          <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:14,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
            <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>{MONTHS[m]} {y}</div>
            {[
              {label:"Days logged",val:monthRecs.length,dot:"#a8d5a2"},
              {label:"Avg craving",val:avgCraving,dot:"#f4a07a"},
              {label:"Avg mood",val:avgMood,dot:A},
              {label:"Total records",val:(data.records??[]).length,dot:MU},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BG}`}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.dot,flexShrink:0}}/>
                  <span style={{fontSize:12,color:TX}}>{s.label}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:AD}}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Substances */}
          {subCounts.length>0&&(
            <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:14,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
              <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Substances this month</div>
              {subCounts.map(([s,n])=>(
                <div key={s} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${BG}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:sc(s),flexShrink:0}}/>
                    <span style={{fontSize:12,color:TX,textTransform:"capitalize"}}>{s}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:sc(s)}}>{n}d</span>
                </div>
              ))}
            </div>
          )}

          {/* Questionnaires */}
          <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:14,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
            <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Questionnaires</div>
            {QC.map(q=>{
              const total=scoreTotal(data[q.key]);
              return(
                <div key={q.key} style={{padding:"6px 0",borderBottom:`1px solid ${BG}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:total!=null?3:0}}>
                    <span style={{fontSize:11,color:TX,fontWeight:500}}>{q.label}</span>
                    {total!=null?<span style={{fontSize:10,color:q.color,fontWeight:700}}>{total}/{q.max}</span>:<span style={{fontSize:10,color:MU}}>—</span>}
                  </div>
                  {total!=null&&(
                    <>
                      <div style={{height:3,background:BG,borderRadius:2,overflow:"hidden"}}>
                        <div style={{width:`${Math.min(100,(total/q.max)*100)}%`,height:"100%",background:q.color,borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:9,color:q.color,fontWeight:600,marginTop:2}}>{q.fn(total)}</div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Medications */}
          {(data.medicines??[]).length>0&&(
            <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:14,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
              <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>Medications</div>
              {data.medicines.map((med,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:`1px solid ${BG}`}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:A,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:TX,textTransform:"capitalize",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{med.name??med.id}</div>
                    {med.dosage&&<div style={{fontSize:9,color:MU}}>{med.dosage}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weight */}
          {(()=>{
            const ws=(data.records??[]).filter(r=>r.weight).map(r=>({w:r.weight,d:fmtDate(r.date??r.createdAt)}));
            if(!ws.length)return null;
            const latest=ws[ws.length-1];
            const bmi=data.height?(latest.w/((data.height/100)**2)).toFixed(1):null;
            return(
              <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,padding:14,boxShadow:"0 2px 8px rgba(74,122,181,0.06)"}}>
                <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>Weight</div>
                <div style={{fontSize:24,fontWeight:700,color:AD}}>{latest.w} <span style={{fontSize:12,color:MU}}>kg</span></div>
                {bmi&&<div style={{fontSize:10,color:MU,marginTop:3}}>BMI <span style={{fontWeight:700,color:AD}}>{bmi}</span></div>}
                <div style={{fontSize:9,color:MU,marginTop:2}}>{latest.d}</div>
              </div>
            );
          })()}

          <div style={{fontSize:9,color:MU,textAlign:"center",lineHeight:1.6}}>
            Expires {new Date(data.expiresAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      {modalDate && recMap[modalDate] && (
        <DayModal
          date={modalDate}
          rec={recMap[modalDate]}
          onClose={()=>setModalDate(null)}
        />
      )}
    </div>
  );
}