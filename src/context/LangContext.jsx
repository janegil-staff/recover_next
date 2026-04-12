'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import LANG_MAP from '../translations';

// ── Supported languages ───────────────────────────────────────────────────────
export const SUPPORTED_LANGS = ['en', 'no', 'sv', 'da', 'de', 'fr', 'nl', 'it', 'es', 'fi', 'pt'];
export const LANG_LABELS = {
  en: 'English', no: 'Norsk', sv: 'Svenska', da: 'Dansk',
  de: 'Deutsch', fr: 'Français', nl: 'Nederlands',
  it: 'Italiano', es: 'Español', fi: 'Suomi', pt: 'Português',
};

// ── Merge lang with English base (en = fallback for missing keys) ─────────────
function getTranslations(lang) {
  const base     = LANG_MAP['en'] ?? {};
  const selected = LANG_MAP[lang] ?? base;
  return { ...base, ...selected };
}

// ── Detect language from domain (same pattern as kolskalendar) ────────────────
function detectLang() {
  if (typeof window === 'undefined') return 'en';
  const host = window.location.hostname;
  if (host.includes('focusapp.no'))  return 'no';
  if (host.includes('.no'))          return 'no';
  // Fallback: check browser language
  const browserLang = navigator.language?.slice(0, 2);
  return SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en';
}

// ── Context ───────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

export function LangProvider({ children, defaultLang }) {
  const [lang, setLangState] = useState(defaultLang ?? 'en');

  useEffect(() => {
    // 1. Check localStorage for user override
    const stored = localStorage.getItem('focusapp_lang');
    if (stored && SUPPORTED_LANGS.includes(stored)) {
      setLangState(stored);
      return;
    }
    // 2. Detect from domain / browser
    const detected = detectLang();
    setLangState(detected);
  }, []);

  const setLang = (newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    localStorage.setItem('focusapp_lang', newLang);
    setLangState(newLang);
  };

  const translations = getTranslations(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations, translations }}>
      {children}
    </LangContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}

// ── Server-side helper (for generateMetadata, RSC) ────────────────────────────
export function getServerTranslations(lang) {
  return getTranslations(lang ?? 'en');
}

// ── Direct export for simple usage (mirrors GlobalT pattern) ─────────────────
export { getTranslations };