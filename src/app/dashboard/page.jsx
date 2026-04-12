// src/app/dashboard/page.jsx  — Calendar tab
"use client";
import { useState, useMemo } from "react";
import { useDashboardT } from "./LangContext";

const A="#4a7ab5",AD="#2d4a6e",AL="#dde8f4",BG="#eef2f7",SU="#ffffff",BO="#d0dcea",TX="#1a2c3d",MU="#7a9ab8";
const SC={alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",tobacco:"#8d6e63",prescription:"#42a5f5",other:"#bdbdbd"};
const sc=s=>SC[s]??"#bdbdbd";
function pad(n){return String(n).padStart(2,"0");}
function fmtDate(d){const dt=new Date(d);return`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function firstDow(y,m){return(new Date(y,m,1).getDay()+6)%7;}
function cravingBg(n){if(n==null)return"transparent";if(n<=1)return"#a8d5a2";if(n<=2)return"#f5c97a";if(n<=3)return"#f4a07a";return"#e87070";}

function Section({title,children}){return(<div><div style={{fontSize:10,fontWeight:700,color:MU,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{title}</div>{children}</div>);}
function Pill({label,val,color}){return(<div style={{background:color+"18",border:`1px solid ${color}33`,borderRadius:10,padding:"8px 14px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color}}>{val}</div><div style={{fontSize:9,color:MU,fontWeight:600,marginTop:1}}>{label.toUpperCase()}</div></div>);}

function DayModal({date,rec,onClose,t}){
  if(!rec)return null;
  const subs=rec.substances??[];
  const effects=rec.sideEffects??[];
  const meds=rec.medicationsTaken??[];
  const freqLabel={once:t.freqOnceDaily??"Once",few_times:t.freqFewTimes??"Few times",daily:t.freqDaily??"Several times",multiple_daily:t.freqMultipleDaily??"Many times"};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,30,50,0.6)",backdropFilter:"blur(5px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:SU,borderRadius:20,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 28px 70px rgba(45,74,110,0.3)",border:`1px solid ${BO}`}}>
        <div style={{background:`linear-gradient(135deg,${A},${AD})`,borderRadius:"20px 20px 0 0",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:1}}>
          <div>
            <div style={{color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:2}}>{t.dailyLog??"Daily log"}</div>
            <div style={{color:"#fff",fontSize:17,fontWeight:700}}>{date}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
        </div>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[{label:t.mood??"Mood",val:rec.mood,icon:"😊",max:5,color:"#4a7ab5"},{label:t.cravings??"Cravings",val:rec.cravings,icon:"🔥",max:5,color:"#f4a07a"},{label:t.wellbeing??"Wellbeing",val:rec.wellbeing,icon:"💙",max:5,color:"#9c27b0"}].map(s=>(
              <div key={s.label} style={{background:BG,borderRadius:12,padding:"11px 6px",textAlign:"center",border:`1px solid ${BO}`}}>
                <div style={{fontSize:18,marginBottom:3}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:800,lineHeight:1,color:s.val!=null?AD:MU}}>{s.val!=null?s.val:"—"}</div>
                <div style={{fontSize:9,color:MU,fontWeight:700,letterSpacing:0.4,marginTop:2}}>{s.label.toUpperCase()} / {s.max}</div>
                <div style={{height:3,background:"#e8eef5",borderRadius:2,marginTop:5,overflow:"hidden"}}><div style={{width:s.val!=null?`${(s.val/s.max)*100}%`:"0%",height:"100%",background:s.color,borderRadius:2}}/></div>
              </div>
            ))}
          </div>
          <Section title={t.frequency??"Frequency & Amount"}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <Pill label={t.frequency??"Frequency"} val={rec.frequency?(freqLabel[rec.frequency]??rec.frequency):"—"} color={A}/>
              <Pill label={t.amount??"Amount"} val={rec.amount!=null?rec.amount:"—"} color={AD}/>
            </div>
          </Section>
          <Section title={t.substances??"Substances"}>
            {subs.length>0?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{subs.map(s=><span key={s} style={{background:sc(s)+"22",color:sc(s),border:`1px solid ${sc(s)}44`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:600,textTransform:"capitalize"}}>{s}</span>)}</div>:<span style={{fontSize:12,color:MU}}>—</span>}
          </Section>
          <Section title={t.medicationsTitle??"Medications"}>
            {meds.length>0
              ?<div style={{display:"flex",flexDirection:"column",gap:6}}>{meds.map((med,i)=>{
                const name=typeof med==="object"?(med.name??med.id??"Unknown"):String(med);
                const dose=typeof med==="object"?(med.dosage??med.dose??null):null;
                return(<div key={i} style={{background:BG,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${BO}`}}><div style={{fontSize:12,fontWeight:600,color:TX,textTransform:"capitalize"}}>{name}</div>{dose!=null&&<span style={{fontSize:10,background:AL,color:AD,borderRadius:20,padding:"2px 8px",fontWeight:600}}>{dose}</span>}</div>);
              })}</div>
              :<span style={{fontSize:12,color:MU}}>—</span>}
          </Section>
          <Section title={t.sideEffects??"Side effects"}>
            {effects.length>0?<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{effects.map(e=><span key={e} style={{background:"#fff3e0",color:"#e65100",border:"1px solid #ffcc8055",borderRadius:20,padding:"5px 13px",fontSize:12}}>{e}</span>)}</div>:<span style={{fontSize:12,color:MU}}>—</span>}
          </Section>
          <Section title={t.weight??"Weight"}>
            {rec.weight?<div style={{display:"flex",alignItems:"baseline",gap:5}}><span style={{fontSize:26,fontWeight:800,color:AD}}>{rec.weight}</span><span style={{fontSize:13,color:MU}}>{t.kg??"kg"}</span></div>:<span style={{fontSize:12,color:MU}}>—</span>}
          </Section>
          <Section title={t.note??"Note"}>
            {rec.note?<div style={{background:AL,borderRadius:10,padding:"12px 14px",fontSize:13,color:TX,borderLeft:`3px solid ${A}`,fontStyle:"italic",lineHeight:1.7}}>"{rec.note}"</div>:<span style={{fontSize:12,color:MU}}>—</span>}
          </Section>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const t = useDashboardT();

  const [data] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("patientData");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [month,setMonth]=useState(()=>{const n=new Date();return{y:n.getFullYear(),m:n.getMonth()};});
  const [modalDate,setModalDate]=useState(null);

  const months = t.months ?? ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const weekdays = t.weekdays ?? ["M","T","W","T","F","S","S"];

  const cravingLegend = [
    ["#a8d5a2", t.scoreNone??"None"],
    ["#f5c97a", t.scoreLow??"Low"],
    ["#f4a07a", t.scoreModerate??"Moderate"],
    ["#e87070", t.scoreHeavy??"High"],
  ];

  const recMap=useMemo(()=>{
    if(!data)return{};
    const m={};(data.records??[]).forEach(r=>{m[fmtDate(r.date??r.createdAt)]=r;});return m;
  },[data]);

  if(!data)return<div style={{padding:40,textAlign:"center",color:MU}}>{t.loading??"Loading…"}</div>;

  const{y,m}=month;
  const days=daysInMonth(y,m);
  const firstDay=firstDow(y,m);
  const todayStr=fmtDate(new Date());

  return(
    <div>
      <style>{`.cal-grid{display:grid;grid-template-columns:340px 1fr;gap:16px;align-items:start}@media(max-width:660px){.cal-grid{grid-template-columns:1fr}}`}</style>
      <div className="cal-grid">
        <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,boxShadow:"0 2px 10px rgba(74,122,181,0.07)",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
            <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m-1);return{y:d.getFullYear(),m:d.getMonth()};})} style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>‹</button>
            <span style={{fontSize:11,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase"}}>{months[m]} {y}</span>
            <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m+1);return{y:d.getFullYear(),m:d.getMonth()};})} style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px",gap:2}}>
            {weekdays.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:MU,paddingBottom:3}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px 10px",gap:2}}>
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:days}).map((_,i)=>{
              const day=i+1;
              const ds=`${y}-${pad(m+1)}-${pad(day)}`;
              const rec=recMap[ds];
              const isToday=ds===todayStr;
              const subs=rec?.substances??[];
              return(
                <div key={day} onClick={()=>rec&&setModalDate(ds)}
                  style={{borderRadius:6,padding:"4px 1px",textAlign:"center",cursor:rec?"pointer":"default",minHeight:30,background:cravingBg(rec?.cravings),border:isToday?`2px solid ${A}`:`1px solid ${rec?"transparent":BO}`,transition:"all .1s"}}>
                  <div style={{fontSize:10,fontWeight:isToday?700:400,color:rec?TX:MU,lineHeight:1}}>{day}</div>
                  {subs.length>0&&<div style={{display:"flex",gap:1,justifyContent:"center",marginTop:2}}>{subs.slice(0,3).map((s,si)=><div key={si} style={{width:3,height:3,borderRadius:"50%",background:sc(s)}}/>)}</div>}
                </div>
              );
            })}
          </div>
          <div style={{borderTop:`1px solid ${BO}`,padding:"8px 14px",display:"flex",flexWrap:"wrap",gap:10}}>
            {cravingLegend.map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                <span style={{fontSize:9,color:MU}}>{l} {t.cravings??"cravings"}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{fontSize:11,fontWeight:700,color:MU,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{t.recentEntries??"Recent entries"}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[...(data.records??[])].sort((a,b)=>(b.date??b.createdAt).localeCompare(a.date??a.createdAt)).slice(0,15).map((r,i)=>{
              const ds=fmtDate(r.date??r.createdAt);
              return(
                <div key={i} onClick={()=>setModalDate(ds)} style={{background:SU,borderRadius:10,border:`1px solid ${BO}`,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",boxShadow:"0 1px 4px rgba(74,122,181,0.05)"}}>
                  <div style={{width:30,height:30,borderRadius:8,background:cravingBg(r.cravings),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:13}}>
                    {r.mood>=4?"😄":r.mood>=3?"🙂":r.mood<=2?"😕":"😐"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:700,color:AD,marginBottom:2}}>{ds}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {(r.substances??[]).map(s=><span key={s} style={{fontSize:9,color:sc(s),fontWeight:600,textTransform:"capitalize"}}>{s}</span>)}
                      {!(r.substances??[]).length&&<span style={{fontSize:9,color:MU}}>{t.noSubstancesLogged??"No substances logged"}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,flexShrink:0}}>
                    {r.mood!=null&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:AD}}>{r.mood}</div><div style={{fontSize:8,color:MU}}>{(t.mood??"MOOD").toUpperCase()}</div></div>}
                    {r.cravings!=null&&<div style={{textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:AD}}>{r.cravings}</div><div style={{fontSize:8,color:MU}}>{(t.cravings??"CRAV").slice(0,4).toUpperCase()}</div></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {modalDate&&recMap[modalDate]&&<DayModal date={modalDate} rec={recMap[modalDate]} onClose={()=>setModalDate(null)} t={t}/>}
    </div>
  );
}