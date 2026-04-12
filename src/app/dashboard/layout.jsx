// src/app/dashboard/layout.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "./Nav";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("patientData");
    if (!raw) { router.push("/"); return; }
    setPatient(JSON.parse(raw));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}button{font-family:inherit}`}</style>
      <Nav patient={patient} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        {children}
      </div>
    </div>
  );
}
