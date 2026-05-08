// src/app/dashboard/LangContext.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getTranslations, SUPPORTED_LANGS } from "../../context/LangContext";

const Ctx = createContext(null);

function getDocLang() {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("focusapp_lang");
  if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  if (SUPPORTED_LANGS.includes(browser)) return browser;
  return "en";
}

export function DashboardLangProvider({ children }) {
  const [lang, setLang] = useState("en"); // SSR-safe default
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("lang") ?? "en";
    setLang(stored);
    setHydrated(true);
  }, []);
  const [t] = useState(() => getTranslations(getDocLang()));
  if (!hydrated) return null;  
  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useDashboardT() {
  return useContext(Ctx) ?? getTranslations("en");
}
