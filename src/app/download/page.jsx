"use client";

import { useEffect } from "react";

export default function DownloadPage() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    const isAndroid = ua.includes("android");
    const isIOS =
      ua.includes("iphone") ||
      ua.includes("ipad") ||
      ua.includes("ipod");

    // Delay redirect so TikTok can scan the HTML
    setTimeout(() => {
      if (isAndroid) {
        window.location.href =
          "https://play.google.com/store/apps/details?id=com.qup.recover";
      } else if (isIOS) {
        window.location.href =
          "https://apps.apple.com/app/id6762452909";
      } else {
        window.location.href = "https://recover-online.com";
      }
    }, 1000);
  }, []);

  return (
    <html>
      <head>
        {/* TikTok MUST see these links */}
        <a
          href="https://apps.apple.com/app/id6762452909"
          style={{ display: "none" }}
        >
          iOS
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.qup.recover"
          style={{ display: "none" }}
        >
          Android
        </a>

        <title>Qup Recover – Download</title>
        <meta name="description" content="Download Qup Recover for iOS or Android." />
      </head>

      <body
        style={{
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1>Sender deg videre…</h1>
        <p>Vent litt, du blir snart sendt til riktig app‑butikk.</p>
      </body>
    </html>
  );
}
