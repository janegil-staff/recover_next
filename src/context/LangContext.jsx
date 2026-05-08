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

// ── Synchronously resolve initial language to avoid hydration mismatch ────────
// We read what the client will eventually pick BEFORE first render so SSR and
// first client render produce identical HTML.
function resolveInitialLang(defaultLang) {
  if (typeof window === 'undefined') return defaultLang ?? 'en';
  try {
    const stored = localStorage.getItem('focusapp_lang');
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {}
  return detectLang();
}

// ── Context ───────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

export function LangProvider({ children, defaultLang }) {
  // Start with defaultLang on server; client will swap on first render via the
  // useEffect below. We mark `hydrated` so consumers can avoid mismatched text.
  const [lang, setLangState] = useState(defaultLang ?? 'en');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const resolved = resolveInitialLang(defaultLang);
    setLangState(resolved);
    setHydrated(true);
  }, [defaultLang]);

  const setLang = (newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    try { localStorage.setItem('focusapp_lang', newLang); } catch {}
    setLangState(newLang);
  };

  const translations = getTranslations(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations, translations, hydrated }}>
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