// app/delete-account/page.js
// Next.js App Router page for https://recover-online.com/delete-account
// Drop this file into your recover-online.com Next.js project.
// If you use the Pages Router instead, see the alternate version in
// the comments at the bottom of this file.

import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Delete Account — Recover",
  description:
    "How to delete your Recover account and all associated data. Qup DA respects your right to data erasure under GDPR.",
};

export default function DeleteAccountPage() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header with logo */}
        <Link href="/" style={styles.brand}>
          <Image
            src="/focus_logo.png"
            alt="Recover"
            width={48}
            height={48}
            style={styles.logo}
          />
          <span style={styles.brandText}>Recover</span>
        </Link>

        <h1 style={styles.h1}>Delete Your Account</h1>
        <p style={styles.lastUpdated}>Last updated: April 2026</p>

        <p style={styles.intro}>
          Recover is developed by <strong>Qup DA</strong> (org. 912 372 022,
          Norway). You have the right to delete your account and all associated
          data at any time. This page explains how.
        </p>

        <section style={styles.section}>
          <h2 style={styles.h2}>📱 Delete From the App (Recommended)</h2>
          <p style={styles.p}>
            The fastest way to delete your account is from within the Recover
            app itself:
          </p>
          <ol style={styles.list}>
            <li>Open the Recover app</li>
            <li>
              Go to <strong>Profile → Settings</strong>
            </li>
            <li>
              Tap <strong>Delete account</strong>
            </li>
            <li>Confirm the deletion</li>
          </ol>
          <p style={styles.p}>
            Your account and all data are deleted immediately. No waiting
            period, no email confirmation required.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>📧 Delete by Email</h2>
          <p style={styles.p}>
            If you can no longer access the app — for example, if you lost your
            PIN or uninstalled the app — you can request deletion by email:
          </p>
          <p style={styles.contactBox}>
            Send a message to{" "}
            <a href="mailto:support@qupda.com" style={styles.link}>
              support@qupda.com
            </a>{" "}
            from the email address associated with your Recover account.
            Subject line: <em>Delete my account</em>.
          </p>
          <p style={styles.p}>
            We will verify your identity and complete the deletion within 30
            days. You will receive a confirmation email once it&apos;s done.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>🗑️ What Gets Deleted</h2>
          <p style={styles.p}>
            When you delete your account, the following data is permanently and
            irreversibly removed from our servers:
          </p>
          <ul style={styles.list}>
            <li>Your email address and authentication credentials</li>
            <li>Your PIN (stored locally on your device)</li>
            <li>
              All daily logs — substances, mood, cravings, wellbeing, weight,
              side effects, and notes
            </li>
            <li>
              All questionnaire responses — GAD-7, PHQ-9, AUDIT, DAST-10, CAGE,
              and Readiness to Change
            </li>
            <li>Your demographic data — age, gender, and height</li>
            <li>Any share codes you have generated</li>
            <li>Your user profile and account identifier</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>📆 Data Retention</h2>
          <ul style={styles.list}>
            <li>
              <strong>Active accounts:</strong> Data is retained only while your
              account is active.
            </li>
            <li>
              <strong>Deleted accounts:</strong> Removed immediately from our
              active databases. Encrypted backup snapshots are automatically
              purged within 30 days.
            </li>
            <li>
              <strong>Anonymised statistics:</strong> We may retain aggregate,
              non-identifying statistics (for example, total user counts by
              country). These contain no personal data and cannot be linked back
              to you.
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>✂️ Partial Deletion</h2>
          <p style={styles.p}>
            You don&apos;t have to delete your entire account to remove specific
            data. From within the app, you can:
          </p>
          <ul style={styles.list}>
            <li>
              Delete individual daily log entries —{" "}
              <strong>My Diary → tap an entry → Delete</strong>
            </li>
            <li>Delete individual questionnaire results</li>
            <li>Clear or retake any questionnaire</li>
          </ul>
          <p style={styles.p}>
            For larger data-deletion requests that can&apos;t be done in the
            app, contact{" "}
            <a href="mailto:support@qupda.com" style={styles.link}>
              support@qupda.com
            </a>
            .
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>⚖️ Your GDPR Rights</h2>
          <p style={styles.p}>
            If you are located in the EU or EEA, the General Data Protection
            Regulation (GDPR) gives you additional rights beyond account
            deletion, including the right to access, rectify, restrict, and
            export your personal data. To exercise any of these rights, contact{" "}
            <a href="mailto:support@qupda.com" style={styles.link}>
              support@qupda.com
            </a>
            .
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.h2}>📬 Contact</h2>
          <p style={styles.p}>
            Qup DA
            <br />
            Email:{" "}
            <a href="mailto:support@qupda.com" style={styles.link}>
              support@qupda.com
            </a>
            <br />
            Org. nr: 912 372 022 · Norway
            <br />
            Privacy policy:{" "}
            <Link href="/privacy" style={styles.link}>
              recover-online.com/privacy
            </Link>
          </p>
        </section>

        <div style={styles.backLink}>
          <Link href="/" style={styles.link}>
            ← Back to Recover
          </Link>
        </div>
      </div>
    </main>
  );
}

// ─── Styles (inline, matching your privacy page palette) ───────────────────
const styles = {
  main: {
    minHeight: "100vh",
    background: "#f0f4f8",
    padding: "40px 20px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    color: "#1a2c3d",
    lineHeight: 1.6,
  },
  container: {
    maxWidth: 760,
    margin: "0 auto",
    background: "#ffffff",
    padding: "48px 40px",
    borderRadius: 16,
    boxShadow: "0 2px 16px rgba(45, 74, 110, 0.08)",
  },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "#2d4a6e",
    marginBottom: 24,
  },
  logo: {
    borderRadius: 10,
  },
  brandText: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2d4a6e",
  },
  h1: {
    fontSize: 32,
    fontWeight: 700,
    color: "#2d4a6e",
    marginTop: 8,
    marginBottom: 6,
  },
  lastUpdated: {
    fontSize: 14,
    color: "#5b7a96",
    marginBottom: 28,
  },
  intro: {
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2d4a6e",
    marginBottom: 12,
    marginTop: 24,
  },
  p: {
    fontSize: 15,
    marginBottom: 12,
  },
  list: {
    fontSize: 15,
    paddingLeft: 22,
    marginBottom: 12,
  },
  contactBox: {
    background: "#f0f4f8",
    border: "1px solid #d0dcea",
    borderRadius: 10,
    padding: "14px 18px",
    fontSize: 15,
    marginBottom: 12,
  },
  link: {
    color: "#4a7ab5",
    textDecoration: "none",
    fontWeight: 500,
  },
  backLink: {
    marginTop: 40,
    paddingTop: 24,
    borderTop: "1px solid #d0dcea",
    fontSize: 15,
  },
};