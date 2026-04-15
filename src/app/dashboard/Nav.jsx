// src/app/dashboard/Nav.jsx
"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useDashboardT } from "./LangContext";
import PdfExportModal from "./PdfExportModal";

const A="#4a7ab5",AD="#2d4a6e",BO="#d0dcea",MU="#7a9ab8",SU="#ffffff";

const ICONS = {
  "/dashboard":                "📅",
  "/dashboard/summary":        "📊",
  "/dashboard/log":            "📋",
  "/dashboard/questionnaires": "🧠",
  "/dashboard/medications":    "💊",
  "/dashboard/graphs":         "📈",
};

export default function Nav({ patient }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const t         = useDashboardT();
  const [showPdf, setShowPdf] = useState(false);

  const [data, setData] = useState(null);
  useEffect(() => {
    try { const r = sessionStorage.getItem("patientData"); if(r) setData(JSON.parse(r)); }
    catch {}
  }, []);

  const TABS = [
    { icon: "📅", label: t.calendar        ?? "Calendar",       href: "/dashboard" },
    { icon: "📊", label: t.monthSummary    ?? "Summary",        href: "/dashboard/summary" },
    { icon: "📋", label: t.history         ?? "Log",            href: "/dashboard/log" },
    { icon: "🧠", label: t.questionnaires  ?? "Questionnaires", href: "/dashboard/questionnaires" },
    { icon: "💊", label: t.medicationsTitle ?? "Medications",   href: "/dashboard/medications" },
    { icon: "📈", label: t.graphs          ?? "Graphs",         href: "/dashboard/graphs" },
  ];

  const logout = () => {
    sessionStorage.removeItem("patientData");
    router.push("/");
  };

  return (
    <>
      {/* ── Desktop top nav (hidden on mobile) ── */}
      <div style={{background:SU,borderBottom:`1px solid ${BO}`,position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 6px rgba(74,122,181,0.08)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",height:48}}>

          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Image src="/focus_logo.png" alt="Recover" width={32} height={32} style={{borderRadius:6}}/>
            <span style={{fontWeight:700,fontSize:14,color:AD}}>Recover</span>
            <span style={{color:BO}}>·</span>
            <span style={{fontSize:11,color:MU}}>Doctor view</span>
          </div>

          {/* Right side */}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {patient && [
              patient.age    && `${patient.age}y`,
              patient.gender,
              patient.height && `${patient.height}cm`,
            ].filter(Boolean).map(v=>(
              <span key={v} style={{background:"#dde8f4",color:AD,fontSize:10,fontWeight:600,borderRadius:20,padding:"2px 8px"}}>{v}</span>
            ))}

            {data && (
              <button onClick={()=>setShowPdf(true)} title="Export PDF report"
                suppressHydrationWarning
                style={{background:A,border:`1px solid ${A}`,borderRadius:7,color:"#fff",fontSize:11,fontWeight:600,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,transition:"opacity .15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                className="desktop-nav">
                ⬇ PDF
              </button>
            )}

            <button onClick={logout}
              style={{background:"none",border:`1px solid ${BO}`,borderRadius:7,color:MU,fontSize:11,fontWeight:600,padding:"5px 12px",cursor:"pointer",marginLeft:2,fontFamily:"inherit"}}>
              {t.signOut ?? "↩ Sign out"}
            </button>
          </div>
        </div>

        {/* Desktop tab bar */}
        <div className="desktop-nav" style={{display:"flex",padding:"0 20px",gap:4,overflowX:"auto"}}>
          {TABS.map(tab=>{
            const active=pathname===tab.href;
            return(
              <button key={tab.href} onClick={()=>router.push(tab.href)}
                style={{background:"none",border:"none",cursor:"pointer",padding:"8px 14px",fontSize:12,fontWeight:active?700:500,color:active?A:MU,fontFamily:"inherit",borderBottom:active?`2px solid ${A}`:"2px solid transparent",whiteSpace:"nowrap",transition:"all .15s"}}>
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .dashboard-content { padding-bottom: 72px !important; }
        }
        @media (min-width: 641px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>

      <div className="mobile-bottom-nav" style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:50,
        background:SU,borderTop:`1px solid ${BO}`,
        boxShadow:"0 -2px 12px rgba(74,122,181,0.10)",
        display:"none", // overridden by media query
        alignItems:"stretch",
        paddingBottom:"env(safe-area-inset-bottom)",
      }}>
        {TABS.map(tab=>{
          const active=pathname===tab.href;
          return(
            <button key={tab.href} onClick={()=>router.push(tab.href)}
              style={{
                flex:1,background:"none",border:"none",cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:2,padding:"8px 2px 6px",fontFamily:"inherit",
                color:active?A:MU,transition:"color .15s",
                borderTop:active?`2px solid ${A}`:"2px solid transparent",
              }}>
              <span style={{fontSize:18,lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:9,fontWeight:active?700:500,letterSpacing:0.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:52}}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* PDF button in bottom nav */}
        {data && (
          <button onClick={()=>setShowPdf(true)}
            suppressHydrationWarning
            style={{
              flex:1,background:"none",border:"none",cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:2,padding:"8px 2px 6px",fontFamily:"inherit",
              color:A,borderTop:"2px solid transparent",
            }}>
            <span style={{fontSize:18,lineHeight:1}}>⬇</span>
            <span style={{fontSize:9,fontWeight:600,letterSpacing:0.2}}>PDF</span>
          </button>
        )}
      </div>

      {showPdf && data && (
        <PdfExportModal data={data} t={t} onClose={()=>setShowPdf(false)}/>
      )}
    </>
  );
}