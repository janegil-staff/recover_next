// src/app/dashboard/layout.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "./Nav";
import { DashboardLangProvider } from "./LangContext";

export default function DashboardLayout({ children }) {
  const router  = useRouter();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) { router.push("/"); return; }
    setPatient(JSON.parse(raw));
  }, [router]);

  return (
    <DashboardLangProvider>
      <div style={{ minHeight: "100vh", background: "#eef2f7" }}>
        <Nav patient={patient} />
        {/* dashboard-content class gets padding-bottom:72px on mobile via Nav's <style> */}
        <main className="dashboard-content" style={{ padding: "20px 20px" }}>
          {children}
        </main>
      </div>
    </DashboardLangProvider>
  );
}