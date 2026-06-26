// /app/download/page.jsx

import Script from "next/script";

export const metadata = {
  title: "Qup Recover – Download",
  description: "Download Qup Recover for iOS or Android.",
};

export default function DownloadPage() {
  return (
    <html>
      <body
        style={{
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
        }}
      >
        {/* TikTok MUST see these in the raw HTML */}
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

        <h1>Sender deg videre…</h1>
        <p>Vent litt, du blir snart sendt til riktig app‑butikk.</p>

        {/* Delay redirect so TikTok can scan the HTML */}
        <Script id="redirect-script">
          {`
            setTimeout(() => {
              const ua = navigator.userAgent.toLowerCase();
              const isAndroid = ua.includes("android");
              const isIOS = ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod");

              if (isAndroid) {
                window.location.href = "https://play.google.com/store/apps/details?id=com.qup.recover";
              } else if (isIOS) {
                window.location.href = "https://apps.apple.com/app/id6762452909";
              } else {
                window.location.href = "https://recover-online.com";
              }
            }, 1200);
          `}
        </Script>
      </body>
    </html>
  );
}
