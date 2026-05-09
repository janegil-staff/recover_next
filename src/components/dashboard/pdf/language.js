// Self-load translations as a fallback. If the caller passes a populated `t`
// prop, the modal uses that. Otherwise the modal looks for the active language
// (via localStorage, document.documentElement.lang, or default to 'no') and
// loads the translations dict directly. This way the PDF is correctly
// translated even when callers forget to pass the `t` prop.
import translationsDict from "@/translations";

export function detectLanguage() {
  if (typeof window === "undefined") return "no";

  // 1. localStorage / sessionStorage
  try {
    const stored =
      window.localStorage?.getItem("language") ||
      window.localStorage?.getItem("lang");
    if (stored && translationsDict[stored]) return stored;
  } catch (e) {
    /* private mode etc. */
  }

  // 2. <html lang="…">
  const htmlLang = document.documentElement?.lang;
  if (htmlLang && translationsDict[htmlLang]) return htmlLang;

  // 3. URL query (?language=de)
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("language") || params.get("lang");
    if (q && translationsDict[q]) return q;
  } catch (e) {
    /* no-op */
  }

  // 4. Default
  return "no";
}

export { translationsDict };