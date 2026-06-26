"use client";

// app/last-ned/page.jsx
// LANDING_DOWNLOAD_V1 — consumer download page for Qup Recover.
// One URL for paid ads (e.g. recover-online.com/last-ned): detects the device
// and auto-redirects iOS → App Store, Android → Play. Both store buttons stay
// visible as a fallback (detection misfire / blocked redirect / desktop).
//
// Store targets:
//   iOS     → https://apps.apple.com/app/id6762452909
//   Android → https://play.google.com/store/apps/details?id=com.qupda.recover

import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import { getTranslations } from "@/translations";

const IOS_URL = "https://apps.apple.com/app/id6762452909";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.qupda.recover";
// DESKTOP_REDIRECT_V1 — non-mobile visitors are sent to the marketing site
// instead of being shown store buttons (they can't install a phone app on a
// desktop anyway). Must be the site ROOT, not /last-ned, to avoid a loop.
const DESKTOP_URL = "https://recover-online.com";

// DEVICE_DETECT_V1 — coarse UA sniff. Good enough for routing to a store;
// both buttons remain as a manual fallback so a wrong guess is harmless.
function detectPlatform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || navigator.vendor || "";
  // iPadOS 13+ reports as Mac; disambiguate via touch points.
  const isIPadOS =
    /Macintosh/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export default function DownloadPage() {
  const { lang } = useLang();
  const t = getTranslations(lang);

  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const p = detectPlatform();
    // Auto-redirect immediately on a known mobile platform.
    if (p === "ios") {
      setRedirecting(true);
      window.location.replace(IOS_URL);
    } else if (p === "android") {
      setRedirecting(true);
      window.location.replace(ANDROID_URL);
    } else {
      // Desktop / unknown → marketing site (can't install a phone app here).
      setRedirecting(true);
      window.location.replace(DESKTOP_URL);
    }
  }, []);

  const title = t.dlTitle ?? "Last ned Qup Recover";
  const subtitle =
    t.dlSubtitle ??
    "Følg din egen restitusjon og fremgang. Tilgjengelig på iOS og Android.";
  const redirectingText =
    t.dlRedirecting ?? "Sender deg til riktig app-butikk …";
  const appStoreLabel = t.dlAppStore ?? "Last ned på App Store";
  const playLabel = t.dlGooglePlay ?? "Få den på Google Play";
  const fallbackNote =
    t.dlFallbackNote ??
    "Ble du ikke sendt videre? Trykk på knappen for din enhet.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(120% 120% at 50% 0%, #eaf6f4 0%, #f7fbfa 55%, #ffffff 100%)",
        fontFamily:
          "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo / wordmark */}
        <img
          src="/logo.png"
          alt="Qup Recover"
          style={{
            width: 72,
            height: 72,
            objectFit: "contain",
            borderRadius: 18,
            margin: "0 auto 20px",
            display: "block",
            boxShadow: "0 8px 24px rgba(38,142,134,0.18)",
          }}
        />

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: 26,
            fontWeight: 800,
            color: "#1a3a38",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            fontSize: 15,
            lineHeight: 1.5,
            color: "#557672",
          }}
        >
          {subtitle}
        </p>

        {redirecting && (
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              fontWeight: 600,
              color: "#268E86",
            }}
          >
            {redirectingText}
          </p>
        )}

        {/* Store buttons — always rendered as a no-JS / blocked-redirect
            fallback. Every platform auto-redirects on mount, so this view is
            normally only seen briefly or when JS is disabled. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
          }}
        >
          <a
            href={IOS_URL}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              maxWidth: 320,
              padding: "14px 20px",
              borderRadius: 14,
              background: "#1a3a38",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(26,58,56,0.25)",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18 }}></span>
            {appStoreLabel}
          </a>

          <a
            href={ANDROID_URL}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              maxWidth: 320,
              padding: "14px 20px",
              borderRadius: 14,
              background: "#268E86",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(38,142,134,0.28)",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 18 }}>▶</span>
            {playLabel}
          </a>
        </div>

        <p
          style={{
            margin: "22px 0 0",
            fontSize: 12,
            lineHeight: 1.5,
            color: "#9bb4b1",
          }}
        >
          {fallbackNote}
        </p>
      </div>
    </main>
  );
}