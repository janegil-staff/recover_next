"use client";
// Reusable collapsible card. State persists in sessionStorage per id so
// reopening the dashboard preserves what the doctor had open within a session.
import { useState, useEffect } from "react";
import { BO, MU, SU } from "@/components/dashboard/calendar/theme";

export default function Collapsible({
  id,
  title,
  badge = null,
  defaultOpen = false,
  children,
}) {
  const storageKey = `dash-collapse:${id}`;
  const [open, setOpen] = useState(defaultOpen);
  const [hydrated, setHydrated] = useState(false);

  // Load saved state once after mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored !== null) setOpen(stored === "1");
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      try {
        sessionStorage.setItem(storageKey, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid color-mix(in srgb, ${BO} 65%, transparent)`,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <button
        onClick={toggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 16px", 
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              color: MU,
              fontWeight: 700,
              transition: "transform .2s ease",
              display: "inline-block",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              width: 10,
            }}
          >
            ▸
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            {title}
          </span>
          {badge != null && (
            <span
              style={{
                fontSize: 10,
                color: MU,
                fontWeight: 600,
                marginLeft: 4,
                fontStyle: "italic",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </button>

      {/* Body — render only after hydration to avoid SSR mismatch */}
      {hydrated && open && (
        <div
          style={{
            padding: "0 16px 14px 16px",
            borderTop: `1px solid ${BO}`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}