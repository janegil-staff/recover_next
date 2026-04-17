// src/app/privacy/page.jsx
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Recover",
  description: "Privacy policy for the Recover app by Qup DA",
};

const sections = [
  {
    title: "Data We Collect",
    icon: "📋",
    content: [
      { label: "Email address", desc: "Used for account creation and authentication only." },
      { label: "Health data", desc: "Substances, mood, cravings, wellbeing, weight, side effects, and notes that you enter manually." },
      { label: "Account identifiers", desc: "An internal user ID to associate your data with your account." },
      { label: "Demographic data", desc: "Age, gender, and height — entered during registration to personalise your experience." },
    ],
  },
  {
    title: "How We Use Your Data",
    icon: "⚙️",
    content: [
      { label: "App functionality", desc: "To display your logs, charts, and progress over time." },
      { label: "Clinician sharing", desc: "To generate a temporary share code so you can share your data with your healthcare provider." },
      { label: "No advertising", desc: "We do not use your data for advertising, marketing, or analytics. We do not sell your data." },
      { label: "No third parties", desc: "Your data is never shared with third-party services, advertisers, or data brokers." },
    ],
  },
  {
    title: "Data Storage & Security",
    icon: "🔒",
    content: [
      { label: "Secure servers", desc: "Your data is stored on encrypted servers hosted on Digital Ocean." },
      { label: "Encryption in transit", desc: "All communication between the app and our servers uses HTTPS/TLS." },
      { label: "PIN protection", desc: "Your app is protected by a PIN code stored securely on your device." },
      { label: "Temporary sharing", desc: "Share codes expire after 10 minutes and grant read-only access." },
    ],
  },
  {
    title: "Your Rights",
    icon: "✅",
    content: [
      { label: "Delete your account", desc: "You can permanently delete your account and all associated data at any time from within the app settings." },
      { label: "Data access", desc: "You can export your data by contacting us at the email below." },
      { label: "GDPR", desc: "If you are located in the EU/EEA, you have the right to access, rectify, and erase your personal data under the General Data Protection Regulation." },
    ],
  },
  {
    title: "Children's Privacy",
    icon: "👶",
    content: [
      { label: "Age requirement", desc: "Recover is intended for users aged 18 and over. We do not knowingly collect data from children under 18." },
    ],
  },
  {
    title: "Changes to This Policy",
    icon: "📝",
    content: [
      { label: "Updates", desc: "We may update this policy from time to time. The latest version will always be available at this URL. Continued use of the app after changes constitutes acceptance." },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4f8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2d4a6e 0%, #4a7ab5 100%)",
        padding: "48px 24px 40px",
        textAlign: "center",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
            <img src="/focus_logo.png" alt="Recover" style={{ width: 48, height: 48, borderRadius: 12 }} />
            <span style={{ color: "#fff", fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>Recover</span>
          </div>
        </Link>
        <h1 style={{
          color: "#fff",
          fontSize: "clamp(28px, 5vw, 42px)",
          fontWeight: 700,
          margin: "0 0 12px",
          letterSpacing: "-0.5px",
        }}>
          Privacy Policy
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
          Last updated: April 2026
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "40px 24px 80px",
      }}>

        {/* Intro */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 24,
          borderLeft: "4px solid #4a7ab5",
          boxShadow: "0 2px 12px rgba(74,122,181,0.08)",
        }}>
          <p style={{ color: "#2d4a6e", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            Recover is developed by <strong>Qup DA / KBB Medic AS</strong> (org. 912 372 022, Norway).
            We are committed to protecting your privacy. This policy explains what data we collect,
            how we use it, and your rights. Your health data belongs to you.
          </p>
        </div>

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={si} style={{
            background: "#fff",
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 16,
            boxShadow: "0 2px 12px rgba(74,122,181,0.06)",
          }}>
            <h2 style={{
              color: "#2d4a6e",
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span>{section.icon}</span>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {section.content.map((item, ii) => (
                <div key={ii} style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4a7ab5",
                    flexShrink: 0,
                    marginTop: 8,
                  }} />
                  <div>
                    <span style={{ color: "#1a2c3d", fontWeight: 600, fontSize: 14 }}>
                      {item.label}
                    </span>
                    <span style={{ color: "#7a9ab8", fontSize: 14 }}> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div style={{
          background: "linear-gradient(135deg, #2d4a6e, #4a7ab5)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 16,
          textAlign: "center",
        }}>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            📬 Contact Us
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: "0 0 12px", lineHeight: 1.6 }}>
            For any privacy-related questions, data requests, or concerns:
          </p>
          <a href="mailto:post@kbbmedic.no" style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            background: "rgba(255,255,255,0.15)",
            padding: "8px 20px",
            borderRadius: 30,
            display: "inline-block",
          }}>
            post@kbbmedic.no
          </a>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: "16px 0 0" }}>
            Qup DA / KBB Medic AS · Org. 912 372 022 · Norway
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/" style={{
            color: "#4a7ab5",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}>
            ← Back to Recover
          </Link>
        </div>

      </div>
    </div>
  );
}
