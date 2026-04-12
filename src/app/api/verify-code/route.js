// src/app/api/verify-code/route.js
import { NextResponse } from "next/server";

const API = process.env.API_URL ?? "http://localhost:5050";

export async function POST(req) {
  const { code } = await req.json();

  console.log("[verify-code] code:", code, "API:", API);

  if (!/^\d{6}$/.test(code?.trim())) {
    return NextResponse.json({ valid: false, message: "Invalid code format" });
  }

  const url = `${API}/api/patient/share/${code.trim()}`;
  console.log("[verify-code] fetching:", url);

  try {
    const res  = await fetch(url);
    const text = await res.text();
    console.log("[verify-code] status:", res.status, "body:", text.slice(0, 300));

    let json;
    try { json = JSON.parse(text); } catch { 
      return NextResponse.json({ valid: false, message: "Bad response from API" });
    }

    if (!json?.success || !json?.data) {
      return NextResponse.json({ valid: false, message: json?.message ?? "Not found" });
    }

    return NextResponse.json({ valid: true, patient: json.data });
  } catch (e) {
    console.error("[verify-code] fetch error:", e.message);
    return NextResponse.json({ valid: false, message: e.message });
  }
}