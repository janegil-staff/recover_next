// src/app/dashboard/page.jsx  — Calendar tab
"use client";
import { useState, useMemo } from "react";
import { useDashboardT } from "./LangContext";

const A="#4a7ab5",AD="#2d4a6e",AL="#dde8f4",BG="#eef2f7",SU="#ffffff",BO="#d0dcea",TX="#1a2c3d",MU="#7a9ab8";
const SC={alcohol:"#7986cb",cannabis:"#66bb6a",cocaine:"#ef5350",opioids:"#ab47bc",amphetamines:"#ff7043",benzodiazepines:"#26a69a",tobacco:"#8d6e63",prescription:"#42a5f5",mdma:"#ec407a",ecstasy:"#ec407a",ghb:"#00acc1",acid:"#9c27b0",other:"#bdbdbd"};
const sc=s=>SC[s]??"#bdbdbd";
function pad(n){return String(n).padStart(2,"0");}
function fmtDate(d){const dt=new Date(d);return`${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function firstDow(y,m){return(new Date(y,m,1).getDay()+6)%7;}
const FREQ_SCORE={none:0,once:1,few_times:2,daily:3,multiple_daily:4};

function dayScore(rec){
  if(!rec)return null;
  const vals=[];
  if(rec.cravings!=null)  vals.push(rec.cravings);
  if(rec.mood!=null)      vals.push(6-rec.mood);
  if(rec.wellbeing!=null) vals.push(6-rec.wellbeing);
  if(rec.amount!=null)    vals.push(Math.min(5,(rec.amount/10)*5));
  if(rec.frequency!=null&&FREQ_SCORE[rec.frequency]!=null) vals.push(FREQ_SCORE[rec.frequency]);
  if(!vals.length)return null;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function dayBg(rec){
  const s=dayScore(rec);
  if(s==null)return"transparent";
  if(s<=1.5)return"#a8d5a2";
  if(s<=2.5)return"#f5c97a";
  if(s<=3.5)return"#f4a07a";
  return"#e87070";
}
function scoreTotal(o){if(!o)return null;return Object.values(o).reduce((a,b)=>typeof b==="number"&&Number.isFinite(b)?a+b:a,0);}
function qVal(rec, key, index) {
  if (rec[key] != null) return rec[key];
  if (rec[String(index)] != null) return rec[String(index)];
  return 0;
}

const QC=[
  {key:"latestGad7",     label:"GAD-7",               max:21, color:"#7C3AED", fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":"Severe"},
  {key:"latestPhq9",     label:"PHQ-9",               max:27, color:"#DC2626", fn:s=>s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":s<=19?"Mod-severe":"Severe"},
  {key:"latestAudit",    label:"AUDIT",               max:40, color:"#D97706", fn:s=>s<=7?"Low risk":s<=15?"Hazardous":s<=19?"Harmful":"Likely dep."},
  {key:"latestDast10",   label:"DAST-10",             max:10, color:"#059669", fn:s=>s===0?"No problem":s<=2?"Low":s<=5?"Moderate":s<=8?"Substantial":"Severe"},
  {key:"latestCage",     label:"CAGE",                max:4,  color:"#0284C7", fn:s=>s<=1?"Unlikely":s<=2?"Possible":"Likely dep."},
  {key:"latestReadiness",label:"Readiness to change", max:30, color:"#0891B2", fn:s=>s<=10?"Not ready":s<=20?"Considering":"Ready"},
];

const Q_DETAILS = {
  latestGad7: {
    label: "GAD-7 · Anxiety",
    max: 21,
    color: "#7C3AED",
    sev: s => s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":"Severe",
    questions: [
      { key:"feelingNervous",    label:"Feeling nervous, anxious or on edge" },
      { key:"noWorryingControl", label:"Not being able to stop or control worrying" },
      { key:"worrying",          label:"Worrying too much about different things" },
      { key:"troubleRelaxing",   label:"Trouble relaxing" },
      { key:"restless",          label:"Being so restless that it is hard to sit still" },
      { key:"easilyAnnoyed",     label:"Becoming easily annoyed or irritable" },
      { key:"afraid",            label:"Feeling afraid as if something awful might happen" },
    ],
  },
  latestPhq9: {
    label: "PHQ-9 · Depression",
    max: 27,
    color: "#DC2626",
    sev: s => s<=4?"Minimal":s<=9?"Mild":s<=14?"Moderate":s<=19?"Mod-severe":"Severe",
    questions: [
      { key:"noPleasureDoingThings",  label:"Little interest or pleasure in doing things" },
      { key:"depressed",              label:"Feeling down, depressed, or hopeless" },
      { key:"stayingAsleep",          label:"Trouble falling or staying asleep, or sleeping too much" },
      { key:"noEnergy",               label:"Feeling tired or having little energy" },
      { key:"noAppetite",             label:"Poor appetite or overeating" },
      { key:"selfPity",               label:"Feeling bad about yourself — or that you are a failure" },
      { key:"troubleConcentration",   label:"Trouble concentrating on things" },
      { key:"slowMovingSpeeking",     label:"Moving or speaking so slowly that other people could have noticed" },
      { key:"suicidal",               label:"Thoughts that you would be better off dead or of hurting yourself" },
    ],
  },
  latestAudit: {
    label: "AUDIT · Alcohol Use",
    max: 40,
    color: "#D97706",
    sev: s => s<=7?"Low risk":s<=15?"Hazardous":s<=19?"Harmful":"Likely dependent",
    questions: [
      { key:"frequency",         label:"How often do you have a drink containing alcohol?" },
      { key:"typicalAmount",     label:"How many units on a typical day when drinking?" },
      { key:"frequencyHeavy",    label:"How often do you have 6 or more units on one occasion?" },
      { key:"unableToStop",      label:"How often have you found you were unable to stop drinking once started?" },
      { key:"failedExpected",    label:"How often have you failed to do what was normally expected due to drinking?" },
      { key:"morningDrink",      label:"How often have you needed a drink in the morning?" },
      { key:"guilt",             label:"How often have you had a feeling of guilt after drinking?" },
      { key:"memoryLoss",        label:"How often have you been unable to remember the night before due to drinking?" },
      { key:"injured",           label:"Have you or someone else been injured as a result of your drinking?" },
      { key:"concernedByOthers", label:"Has a relative, doctor or other person been concerned about your drinking?" },
    ],
  },
  latestDast10: {
    label: "DAST-10 · Drug Use",
    max: 10,
    color: "#059669",
    sev: s => s===0?"No problem":s<=2?"Low":s<=5?"Moderate":s<=8?"Substantial":"Severe",
    questions: [
      { key:"usedDrugs",           label:"Have you used drugs other than those required for medical reasons?" },
      { key:"abusedPrescription",  label:"Do you abuse more than one drug at a time?" },
      { key:"unableToStop",        label:"Are you always able to stop using drugs when you want to?" },
      { key:"blackouts",           label:"Have you had blackouts or flashbacks as a result of drug use?" },
      { key:"guiltAboutDrugUse",   label:"Do you ever feel bad or guilty about your drug use?" },
      { key:"spouseComplains",     label:"Does your spouse/partner or parents ever complain about your involvement with drugs?" },
      { key:"neglectedFamily",     label:"Have you neglected your family due to use of drugs?" },
      { key:"illegalActivities",   label:"Have you engaged in illegal activities in order to obtain drugs?" },
      { key:"withdrawal",          label:"Have you ever experienced withdrawal symptoms when you stopped taking drugs?" },
      { key:"medicalProblems",     label:"Have you had medical problems as a result of drug use?" },
    ],
  },
  latestCage: {
    label: "CAGE · Alcohol Screening",
    max: 4,
    color: "#0284C7",
    sev: s => s<=1?"Unlikely":s<=2?"Possible":"Likely dependent",
    questions: [
      { key:"cutDown",    label:"Have you ever felt you should Cut down on your drinking?" },
      { key:"annoyed",    label:"Have people Annoyed you by criticising your drinking?" },
      { key:"guilty",     label:"Have you ever felt bad or Guilty about your drinking?" },
      { key:"eyeOpener",  label:"Have you ever had a drink first thing in the morning (Eye opener)?" },
    ],
  },
  latestReadiness: {
    label: "Readiness to Change",
    max: 30,
    color: "#0891B2",
    sev: s => s<=10?"Not ready":s<=20?"Considering":"Ready",
    questions: [
      { key:"q1",  label:"I don't think I drink too much." },
      { key:"q2",  label:"I am trying to drink less than I used to." },
      { key:"q3",  label:"I enjoy my drinking but sometimes I drink too much." },
      { key:"q4",  label:"Sometimes I think I should cut down on my drinking." },
      { key:"q5",  label:"It's a waste of time thinking about my drinking." },
      { key:"q6",  label:"I have just recently changed my drinking habits." },
      { key:"q7",  label:"Anyone can talk about wanting to do something about drinking — I am actually doing something about it." },
      { key:"q8",  label:"I am at the stage where I should think about drinking less alcohol." },
      { key:"q9",  label:"My drinking is a problem sometimes." },
      { key:"q10", label:"There is no need for me to think about changing my drinking." },
    ],
  },
};

const SCORE_LABELS = ["Not at all","Several days","More than half the days","Nearly every day"];

// ── Monthly Trends (no chart) ───────────────────────────────────────────────
const TREND_SERIES = [
  { key: "cravings",  label: "Cravings",  color: "#f4a07a", max: 5, icon: "🔥" },
  { key: "mood",      label: "Mood",      color: "#4a7ab5", max: 5, icon: "😊" },
  { key: "wellbeing", label: "Wellbeing", color: "#66bb6a", max: 5, icon: "💙" },
];

function MonthlyTrendsCard({ monthRecs, t }) {
  const avgs = useMemo(() => {
    const out = {};
    TREND_SERIES.forEach(({ key }) => {
      const vals = monthRecs.map(r => r[key]).filter(v => v != null);
      out[key] = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    });
    return out;
  }, [monthRecs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TREND_SERIES.map(s => {
        const avg = avgs[s.key];
        const pct = avg != null ? (avg / s.max) * 100 : 0;
        return (
          <div key={s.key}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: TX }}>{t[s.key] ?? s.label}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: avg != null ? s.color : MU }}>
                {avg != null ? avg.toFixed(1) : "—"}
                {avg != null && <span style={{ fontSize: 10, fontWeight: 500, color: MU }}> / {s.max}</span>}
              </span>
            </div>
            <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 3, transition: "width .4s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Questionnaire modal ─────────────────────────────────────────────────────
function QuestionnaireModal({ qKey, data, onClose }) {
  const def = Q_DETAILS[qKey];
  if (!def || !data[qKey]) return null;
  const rec = data[qKey];
  const total = scoreTotal(rec);
  const sev = def.sev(total);
  const pct = Math.min(100, (total / def.max) * 100);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,30,50,0.6)",backdropFilter:"blur(5px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:SU,borderRadius:20,width:"100%",maxWidth:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 28px 70px rgba(45,74,110,0.3)",border:`1px solid ${BO}`}}>
        <div style={{background:`linear-gradient(135deg,${def.color},${def.color}cc)`,borderRadius:"20px 20px 0 0",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:1}}>
          <div>
            <div style={{color:"rgba(255,255,255,0.7)",fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:2}}>Questionnaire</div>
            <div style={{color:"#fff",fontSize:17,fontWeight:700}}>{def.label}</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",color:"#fff",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
        </div>
        <div style={{padding:18,display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:def.color+"10",border:`1px solid ${def.color}30`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:16}}>
            <div style={{flex:1}}>
              <div style={{height:6,background:"#e8eef5",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                <div style={{width:`${pct}%`,height:"100%",background:def.color,borderRadius:3,transition:"width .4s ease"}}/>
              </div>
              <div style={{fontSize:11,color:def.color,fontWeight:700}}>{sev}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:28,fontWeight:800,color:def.color,lineHeight:1}}>{total}</div>
              <div style={{fontSize:10,color:MU,fontWeight:600}}>/ {def.max}</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {def.questions.map(({key,label},qi)=>{
              const val = qVal(rec, key, qi);
              const scoreColor = val===0?"#4caf50":val===1?"#ff9800":val===2?"#ff5722":"#f44336";
              return(
                <div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${BG}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:TX,fontWeight:500,lineHeight:1.4}}>{label}</div>
                    <div style={{fontSize:10,color:MU,marginTop:2}}>{SCORE_LABELS[val] ?? "—"}</div>
                  </div>
                  <div style={{width:26,height:26,borderRadius:"50%",background:scoreColor,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0}}>{val}</div>
                </div>
              );
            })}
          </div>
          {rec.date && (
            <div style={{fontSize:10,color:MU,textAlign:"right"}}>Recorded: {rec.date}</div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [qModal,setQModal]=useState(null);

  const months = t.months ?? ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const weekdays = t.weekdays ?? ["M","T","W","T","F","S","S"];
  const cravingLegend = [
    ["#a8d5a2", t.scoreNone??"Low (1–1.5)"],
    ["#f5c97a", t.scoreLow??"Moderate (1.5–2.5)"],
    ["#f4a07a", t.scoreModerate??"High (2.5–3.5)"],
    ["#e87070", t.scoreHeavy??"Very high (>3.5)"],
  ];

  const recMap=useMemo(()=>{
    if(!data)return{};
    const m={};(data.records??[]).forEach(r=>{m[fmtDate(r.date??r.createdAt)]=r;});return m;
  },[data]);

  const monthRecs=useMemo(()=>{
    if(!data)return[];
    const prefix=`${month.y}-${pad(month.m+1)}`;
    return(data.records??[]).filter(r=>fmtDate(r.date??r.createdAt).startsWith(prefix));
  },[data,month]);

  const monthSubCounts=useMemo(()=>{
    const c={};
    monthRecs.forEach(r=>(r.substances??[]).forEach(s=>{c[s]=(c[s]??0)+1;}));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[monthRecs]);

  // Medications logged this month (from daily entries)
  const monthMedCounts=useMemo(()=>{
    const c={};
    monthRecs.forEach(r=>(r.medicationsTaken??[]).forEach(med=>{
      const name=typeof med==="object"?(med.name??med.id??"Unknown"):String(med);
      c[name]=(c[name]??0)+1;
    }));
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[monthRecs]);

  // Profile medications (prescribed)
  const profileMeds=useMemo(()=>{
    return (data?.medicines??data?.medications??[]).map(m=>
      typeof m==="object"?(m.name??m.id??String(m)):String(m)
    ).filter(Boolean);
  },[data]);

  if(!data)return<div style={{padding:40,textAlign:"center",color:MU}}>{t.loading??"Loading…"}</div>;

  const{y,m}=month;
  const days=daysInMonth(y,m);
  const firstDay=firstDow(y,m);
  const todayStr=fmtDate(new Date());

  return(
    <div>
      <style>{`
        .cal-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch;max-width:900px;margin:0 auto}
        @media(max-width:720px){
          .cal-grid{grid-template-columns:1fr}
        }
      `}</style>

      {/* Row 1: Calendar + Questionnaires */}
      <div className="cal-grid">

        {/* ── Calendar card ── */}
        <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,boxShadow:"0 2px 10px rgba(74,122,181,0.07)",overflow:"hidden"}}>
          {/* Month nav */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px 8px"}}>
            <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m-1);return{y:d.getFullYear(),m:d.getMonth()};})} style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>‹</button>
            <span style={{fontSize:11,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase"}}>{months[m]} {y}</span>
            <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m+1);return{y:d.getFullYear(),m:d.getMonth()};})} style={{background:"none",border:`1px solid ${BO}`,borderRadius:6,width:26,height:26,cursor:"pointer",color:MU,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>›</button>
          </div>
          {/* Weekday headers */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px",gap:2}}>
            {weekdays.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,fontWeight:700,color:MU,paddingBottom:3}}>{d}</div>)}
          </div>
          {/* Day cells */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 10px 10px",gap:2}}>
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:days}).map((_,i)=>{
              const day=i+1;
              const ds=`${y}-${pad(m+1)}-${pad(day)}`;
              const rec=recMap[ds];
              const isToday=ds===todayStr;
              const highCravings = rec?.cravings >= 4;
              const tookMeds = (rec?.medicationsTaken?.length ?? 0) > 0;
              const hasNote = !!rec?.note?.trim();
              return(
                <div key={day} onClick={()=>rec&&setModalDate(ds)}
                  style={{borderRadius:6,padding:"4px 1px",textAlign:"center",cursor:rec?"pointer":"default",minHeight:30,
                    background:dayBg(rec),
                    border:isToday?`2px solid ${A}`:`1px solid ${rec?"transparent":BO}`,
                    transition:"all .1s",position:"relative"}}>
                  <div style={{fontSize:10,fontWeight:isToday?700:400,color:rec?TX:MU,lineHeight:1}}>{day}</div>
                  {tookMeds&&(
                    <img
                      src="/ico_medicine.png"
                      alt="medication taken"
                      style={{position:"absolute",top:-4,right:-4,width:13,height:13,objectFit:"contain"}}
                    />
                  )}
                  {highCravings&&(
                    <span style={{position:"absolute",bottom:-4,left:-4,fontSize:13,lineHeight:1}}>🔥</span>
                  )}
                  {hasNote&&(
                    <svg viewBox="0 0 20 20" style={{position:"absolute",bottom:-4,right:-4,width:13,height:13}} fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="2" width="16" height="12" rx="3" fill="#4a7ab5"/>
                      <path d="M5 16 L8 13 H2 Q2 16 5 16Z" fill="#4a7ab5"/>
                      <rect x="5" y="5.5" width="10" height="1.5" rx="0.75" fill="white" opacity="0.9"/>
                      <rect x="5" y="8.5" width="7" height="1.5" rx="0.75" fill="white" opacity="0.9"/>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monthly substances */}
          <div style={{borderTop:`1px solid ${BO}`,padding:"10px 14px"}}>
            <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>
              {t.substancesThisMonth??"Substances"} — {months[m]}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {monthSubCounts.length===0
                ? <span style={{fontSize:12,color:MU}}>{t.noSubstances??"No substances logged this month"}</span>
                : (()=>{
                    const max=monthSubCounts[0][1];
                    return monthSubCounts.map(([s,n])=>(
                      <div key={s}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:sc(s),flexShrink:0}}/>
                            <span style={{fontSize:13,color:TX,textTransform:"capitalize",fontWeight:500}}>{s}</span>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:sc(s)}}>{n} {t.days??"days"}</span>
                        </div>
                        <div style={{height:5,background:BG,borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${(n/max)*100}%`,height:"100%",background:sc(s),borderRadius:3,transition:"width .4s ease"}}/>
                        </div>
                      </div>
                    ));
                  })()
              }
            </div>
          </div>

          {/* Medications */}
          <div style={{borderTop:`1px solid ${BO}`,padding:"10px 14px"}}>
            <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>
              {t.myMedications??"Medications"} — {months[m]}
            </div>
            {profileMeds.length>0&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:9,fontWeight:700,color:MU,letterSpacing:0.8,textTransform:"uppercase",marginBottom:6}}>
                  {t.prescribed??"Prescribed"}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {profileMeds.map(name=>(
                    <span key={name} style={{background:AL,color:AD,border:`1px solid ${BO}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,textTransform:"capitalize"}}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <div style={{fontSize:9,fontWeight:700,color:MU,letterSpacing:0.8,textTransform:"uppercase",marginBottom:6}}>
                {t.takenThisMonth??"Taken this month"}
              </div>
              {monthMedCounts.length===0
                ? <span style={{fontSize:12,color:MU}}>{t.noMedsLogged??"No medications logged this month"}</span>
                : (()=>{
                    const max=monthMedCounts[0][1];
                    return monthMedCounts.map(([name,n])=>(
                      <div key={name} style={{marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:"#42a5f5",flexShrink:0}}/>
                            <span style={{fontSize:13,color:TX,textTransform:"capitalize",fontWeight:500}}>{name}</span>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:"#42a5f5"}}>{n} {t.days??"days"}</span>
                        </div>
                        <div style={{height:5,background:BG,borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:`${(n/max)*100}%`,height:"100%",background:"#42a5f5",borderRadius:3,transition:"width .4s ease"}}/>
                        </div>
                      </div>
                    ));
                  })()
              }
            </div>
          </div>
        </div>

        {/* ── Right column: combined Averages + Questionnaires card ── */}
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{background:SU,borderRadius:14,border:`1px solid ${BO}`,boxShadow:"0 2px 10px rgba(74,122,181,0.07)",overflow:"hidden",flex:1}}>

            {/* Monthly Averages section */}
            <div style={{padding:"12px 14px 10px"}}>
              <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>
                {t.monthlyTrends??"Monthly Averages"} — {months[m]}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12,padding:"6px 10px",background:AL,borderRadius:8}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:A,flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:AD}}>
                  {monthRecs.length} <span style={{fontWeight:500,color:MU}}>{t.daysLogged??"days logged"}</span>
                </span>
              </div>
              <MonthlyTrendsCard monthRecs={monthRecs} t={t}/>
            </div>

            {/* Divider */}
            <div style={{borderTop:`1px solid ${BO}`}}/>

            {/* Questionnaires section */}
            <div style={{padding:"12px 14px 4px"}}>
              <div style={{fontSize:10,fontWeight:700,color:A,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>
                {t.questionnaires??"Questionnaires"}
              </div>
            </div>
            <div style={{padding:"0 14px 12px",display:"flex",flexDirection:"column"}}>
              {QC.map((q,qi)=>{
                const total=scoreTotal(data[q.key]);
                return(
                  <div key={q.key} onClick={()=>data[q.key]&&setQModal(q.key)}
                    style={{padding:"9px 0",borderBottom:qi<QC.length-1?`1px solid ${BG}`:"none",cursor:data[q.key]?"pointer":"default",borderRadius:6,transition:"background .1s"}}
                    onMouseEnter={e=>{if(data[q.key])e.currentTarget.style.background=BG;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:total!=null?4:0}}>
                      <span style={{fontSize:12,color:TX,fontWeight:600}}>{q.label}</span>
                      {total!=null
                        ? <span style={{fontSize:11,color:q.color,fontWeight:700}}>{total}/{q.max}</span>
                        : <span style={{fontSize:11,color:MU}}>—</span>
                      }
                    </div>
                    {total!=null&&(
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,height:4,background:BG,borderRadius:2,overflow:"hidden"}}>
                            <div style={{width:`${Math.min(100,(total/q.max)*100)}%`,height:"100%",background:q.color,borderRadius:2}}/>
                          </div>
                          <span style={{fontSize:10,color:q.color,fontWeight:700,flexShrink:0,cursor:"pointer",textDecoration:"underline",textDecorationStyle:"dotted"}}
                            onClick={e=>{e.stopPropagation();data[q.key]&&setQModal(q.key);}}>
                            read more
                          </span>
                        </div>
                        <div style={{fontSize:10,color:q.color,fontWeight:600,marginTop:3}}>{q.fn(total)}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>{/* end right column */}

      </div>

      {modalDate&&recMap[modalDate]&&<DayModal date={modalDate} rec={recMap[modalDate]} onClose={()=>setModalDate(null)} t={t}/>}
      {qModal&&<QuestionnaireModal qKey={qModal} data={data} onClose={()=>setQModal(null)}/>}
    </div>
  );
}