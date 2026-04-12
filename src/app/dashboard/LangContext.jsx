// src/app/dashboard/LangContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getTranslations, SUPPORTED_LANGS } from "../../context/LangContext";

const Ctx = createContext(null);

export function DashboardLangProvider({ children }) {
  const [t, setT] = useState(() => getTranslations("en"));

  useEffect(() => {
    // Same key the landing page writes: "focusapp_lang"
    const stored = localStorage.getItem("focusapp_lang");
    const lang = stored && SUPPORTED_LANGS.includes(stored) ? stored : "en";
    setT(getTranslations(lang));
  }, []);

  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useDashboardT() {
  return useContext(Ctx) ?? getTranslations("en");
}