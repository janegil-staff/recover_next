// src/app/dashboard/LangContext.jsx
"use client";
import { createContext, useContext, useState } from "react";
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
  const [t] = useState(() => getTranslations(getDocLang()));
  return <Ctx.Provider value={t}>{children}</Ctx.Provider>;
}

export function useDashboardT() {
  return useContext(Ctx) ?? getTranslations("en");
}