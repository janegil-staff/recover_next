// src/app/dashboard/LangContext.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getTranslations, SUPPORTED_LANGS } from "../../context/LangContext";

const Ctx = createContext(null);

const STORAGE_KEY = "focusapp_lang";

function detectLang() {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {}
  const host = window.location.hostname;
  if (host.includes(".no")) return "no";
  const browser = navigator.language?.slice(0, 2);
  if (SUPPORTED_LANGS.includes(browser)) return browser;
  return "en";
}

export function DashboardLangProvider({ children }) {
  const [lang, setLang] = useState(() =>
    typeof window === "undefined" ? "en" : detectLang()
  );

  useEffect(() => {
    const detected = detectLang();
    if (detected !== lang) setLang(detected);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = getTranslations(lang);

  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useDashboardT() {
  return useContext(Ctx) ?? getTranslations("en");
}

// Re-export useLang from outer context so dashboard pages can import both
// hooks from a single place
export { useLang } from "../../context/LangContext";