"use client";

import { useEffect } from "react";

// app/download/page.jsx
const IOS_URL = "https://apps.apple.com/app/id6762452909";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.qupda.recover";
const DESKTOP_URL = "https://recover-online.com";

export default function DownloadPage() {
  useEffect(() => {
    const ua = (navigator.userAgent || "").toLowerCase();
    const isAndroid = ua.includes("android");
    const isIOS =
      /iphone|ipad|ipod/.test(ua) ||
      (ua.includes("macintosh") && navigator.maxTouchPoints > 1);

    if (isAndroid) window.location.replace(ANDROID_URL);
    else if (isIOS) window.location.replace(IOS_URL);
    else window.location.replace(DESKTOP_URL);
  }, []);

  return (
    <main
      style={{ fontFamily: "sans-serif", padding: 40, textAlign: "center" }}
    >
      <h1>Sender deg videre…</h1>
      <p>Vent litt, du blir snart sendt til riktig app-butikk.</p>
      <div style={{ marginTop: 24 }}>
        <a href={IOS_URL}>App Store</a>
        {"  ·  "}
        <a href={ANDROID_URL}>Google Play</a>
      </div>
    </main>
  );
}