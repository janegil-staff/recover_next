export function formatAnsweredDate(dateInput, lang = 'en') {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();

  if (isToday) {
    // pull from translations.js: t.today
    return lang === 'no' ? 'I dag' : 'Today';
  }

  // Locale-aware date, no time
  const localeMap = {
    no: 'nb-NO', en: 'en-US', nl: 'nl-NL', fr: 'fr-FR',
    de: 'de-DE', it: 'it-IT', sv: 'sv-SE', da: 'da-DK',
    fi: 'fi-FI', es: 'es-ES', pl: 'pl-PL', pt: 'pt-PT',
  };
  return d.toLocaleDateString(localeMap[lang] || 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}