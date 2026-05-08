#!/usr/bin/env node
// Fix bad-English values for PDF keys across all 12 languages in src/translations/index.js.
//
// Some PDF keys (substancesUsed, score, scorePct, avgAmount, daysUsed,
// questionnaireRadar, substanceProfile, recoveryProfile, spiderDiagrams,
// gender, heightLabel, weightBmi, patient, patientReport) were copy-pasted
// as English into every language block. This script overwrites those values
// with the correct translation in each language.
//
// Idempotent: running again does nothing if values already match.
//
// Usage:
//   node fix-pdf-translations.cjs
//   TRANSLATIONS_PATH=src/translations/index.js node fix-pdf-translations.cjs

const fs = require("fs");
const path = require("path");

const TRANSLATIONS_PATH =
  process.env.TRANSLATIONS_PATH ||
  path.join("src", "translations", "index.js");

const FIXES = {
  no: {
    substancesUsed: "Rusmidler brukt", score: "Skår", scorePct: "Skår %",
    avgAmount: "Snitt mengde", daysUsed: "Dager brukt",
    questionnaireRadar: "Spørreskjemaer-radar", substanceProfile: "Stoffprofil",
    recoveryProfile: "Bedringsprofil", spiderDiagrams: "Edderkoppdiagrammer",
    gender: "Kjønn", heightLabel: "Høyde", weightBmi: "Vekt og KMI",
    patient: "Pasient", patientReport: "Pasientrapport",
  },
  en: {
    substancesUsed: "Substances", score: "Score", scorePct: "Score %",
    avgAmount: "Avg amount", daysUsed: "Days used",
    questionnaireRadar: "Questionnaire Radar", substanceProfile: "Substance Profile",
    recoveryProfile: "Recovery Profile", spiderDiagrams: "Spider Diagrams",
    gender: "Gender", heightLabel: "Height", weightBmi: "Weight & BMI",
    patient: "Patient", patientReport: "Patient Report",
  },
  nl: {
    substancesUsed: "Gebruikte middelen", score: "Score", scorePct: "Score %",
    avgAmount: "Gem. hoeveelheid", daysUsed: "Dagen gebruikt",
    questionnaireRadar: "Vragenlijst-radar", substanceProfile: "Middelenprofiel",
    recoveryProfile: "Herstelprofiel", spiderDiagrams: "Spinnendiagrammen",
    gender: "Geslacht", heightLabel: "Lengte", weightBmi: "Gewicht & BMI",
    patient: "Patiënt", patientReport: "Patiëntrapport",
  },
  fr: {
    substancesUsed: "Substances utilisées", score: "Score", scorePct: "Score %",
    avgAmount: "Quantité moy.", daysUsed: "Jours d'usage",
    questionnaireRadar: "Radar des questionnaires", substanceProfile: "Profil substance",
    recoveryProfile: "Profil de rétablissement", spiderDiagrams: "Diagrammes en toile",
    gender: "Genre", heightLabel: "Taille", weightBmi: "Poids & IMC",
    patient: "Patient", patientReport: "Rapport patient",
  },
  de: {
    substancesUsed: "Konsumierte Substanzen", score: "Wert", scorePct: "Wert %",
    avgAmount: "Ø Menge", daysUsed: "Konsumtage",
    questionnaireRadar: "Fragebogen-Radar", substanceProfile: "Substanzprofil",
    recoveryProfile: "Genesungsprofil", spiderDiagrams: "Spinnendiagramme",
    gender: "Geschlecht", heightLabel: "Größe", weightBmi: "Gewicht & BMI",
    patient: "Patient", patientReport: "Patientenbericht",
  },
  it: {
    substancesUsed: "Sostanze utilizzate", score: "Punteggio", scorePct: "Punteggio %",
    avgAmount: "Quantità media", daysUsed: "Giorni di uso",
    questionnaireRadar: "Radar questionari", substanceProfile: "Profilo sostanze",
    recoveryProfile: "Profilo di recupero", spiderDiagrams: "Diagrammi a ragno",
    gender: "Genere", heightLabel: "Altezza", weightBmi: "Peso e IMC",
    patient: "Paziente", patientReport: "Rapporto paziente",
  },
  sv: {
    substancesUsed: "Använda substanser", score: "Poäng", scorePct: "Poäng %",
    avgAmount: "Medelmängd", daysUsed: "Använda dagar",
    questionnaireRadar: "Frågeformulärsradar", substanceProfile: "Substansprofil",
    recoveryProfile: "Återhämtningsprofil", spiderDiagrams: "Spindeldiagram",
    gender: "Kön", heightLabel: "Längd", weightBmi: "Vikt & BMI",
    patient: "Patient", patientReport: "Patientrapport",
  },
  da: {
    substancesUsed: "Anvendte stoffer", score: "Score", scorePct: "Score %",
    avgAmount: "Gns. mængde", daysUsed: "Brugte dage",
    questionnaireRadar: "Spørgeskema-radar", substanceProfile: "Stofprofil",
    recoveryProfile: "Bedringsprofil", spiderDiagrams: "Spindelvævsdiagrammer",
    gender: "Køn", heightLabel: "Højde", weightBmi: "Vægt & BMI",
    patient: "Patient", patientReport: "Patientrapport",
  },
  fi: {
    substancesUsed: "Käytetyt aineet", score: "Pisteet", scorePct: "Pisteet %",
    avgAmount: "Keskim. määrä", daysUsed: "Käyttöpäivät",
    questionnaireRadar: "Kyselytutka", substanceProfile: "Aineprofiili",
    recoveryProfile: "Toipumisprofiili", spiderDiagrams: "Hämähäkkikaaviot",
    gender: "Sukupuoli", heightLabel: "Pituus", weightBmi: "Paino ja BMI",
    patient: "Potilas", patientReport: "Potilasraportti",
  },
  es: {
    substancesUsed: "Sustancias usadas", score: "Puntuación", scorePct: "Puntuación %",
    avgAmount: "Cantidad prom.", daysUsed: "Días de uso",
    questionnaireRadar: "Radar de cuestionarios", substanceProfile: "Perfil de sustancias",
    recoveryProfile: "Perfil de recuperación", spiderDiagrams: "Diagramas de araña",
    gender: "Género", heightLabel: "Altura", weightBmi: "Peso e IMC",
    patient: "Paciente", patientReport: "Informe del paciente",
  },
  pl: {
    substancesUsed: "Użyte substancje", score: "Wynik", scorePct: "Wynik %",
    avgAmount: "Śr. ilość", daysUsed: "Dni użycia",
    questionnaireRadar: "Radar kwestionariuszy", substanceProfile: "Profil substancji",
    recoveryProfile: "Profil zdrowienia", spiderDiagrams: "Diagramy radarowe",
    gender: "Płeć", heightLabel: "Wzrost", weightBmi: "Waga i BMI",
    patient: "Pacjent", patientReport: "Raport pacjenta",
  },
  pt: {
    substancesUsed: "Substâncias usadas", score: "Pontuação", scorePct: "Pontuação %",
    avgAmount: "Quantidade méd.", daysUsed: "Dias de uso",
    questionnaireRadar: "Radar de questionários", substanceProfile: "Perfil de substâncias",
    recoveryProfile: "Perfil de recuperação", spiderDiagrams: "Diagramas radar",
    gender: "Gênero", heightLabel: "Altura", weightBmi: "Peso e IMC",
    patient: "Paciente", patientReport: "Relatório do paciente",
  },
};

const LANGS = Object.keys(FIXES);

const filePath = path.resolve(TRANSLATIONS_PATH);
if (!fs.existsSync(filePath)) {
  console.error(`✗ File not found: ${filePath}`);
  process.exit(1);
}

let src = fs.readFileSync(filePath, "utf8");
const original = src;

// Find a language block's body. Returns { bodyStart, bodyEnd } or null.
function findBlockRange(s, lang) {
  const openRe = new RegExp(`(^|\\n)([ \\t]*)["']?${lang}["']?\\s*:\\s*\\{`, "m");
  const m = openRe.exec(s);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1, i = start, inStr = null, esc = false;
  while (i < s.length && depth > 0) {
    const ch = s[i];
    if (esc) { esc = false; }
    else if (inStr) {
      if (ch === "\\") esc = true;
      else if (ch === inStr) inStr = null;
    } else {
      if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
      else if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    i++;
  }
  if (depth !== 0) return null;
  return { bodyStart: start, bodyEnd: i - 1 };
}

// Escape value for single-quoted JS string literal.
function esc(v) {
  return String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

// Within a substring of source code (the block body), replace any occurrence
// of `key: 'something'` or `key: "something"` with `key: '<newValue>'`.
// Returns updated text and a count of how many replacements happened.
// Note: replaces ALL duplicates within the block (the file has multiple
// duplicate definitions — we want the last one rendered to win, so we
// replace them all to keep the file consistent).
function replaceInBlock(blockBody, key, newValue) {
  const re = new RegExp(
    `((?:^|[\\s,{])(?:["']?)${key}\\1?\\s*:\\s*)(['"\`])((?:\\\\.|(?!\\2).)*?)\\2`,
    "g"
  );
  let count = 0;
  const out = blockBody.replace(re, (full, prefix, quote, oldVal) => {
    if (oldVal === newValue) return full; // already correct, idempotent
    count++;
    return `${prefix}'${esc(newValue)}'`;
  });
  return { out, count };
}

let totalChanges = 0;
const perLangCounts = {};

for (const lang of LANGS) {
  const range = findBlockRange(src, lang);
  if (!range) {
    console.warn(`  ⚠  Language block "${lang}" not found — skipping`);
    perLangCounts[lang] = 0;
    continue;
  }
  let body = src.slice(range.bodyStart, range.bodyEnd);
  let langChanges = 0;
  for (const [key, value] of Object.entries(FIXES[lang])) {
    const { out, count } = replaceInBlock(body, key, value);
    if (count > 0) {
      body = out;
      langChanges += count;
    }
  }
  if (langChanges > 0) {
    src = src.slice(0, range.bodyStart) + body + src.slice(range.bodyEnd);
  }
  perLangCounts[lang] = langChanges;
  totalChanges += langChanges;
}

if (src === original) {
  console.log(`✓ No changes needed — all values already correct in ${TRANSLATIONS_PATH}`);
  process.exit(0);
}

fs.writeFileSync(filePath, src, "utf8");
console.log(`✓ Patched ${TRANSLATIONS_PATH}`);
for (const lang of LANGS) {
  if (perLangCounts[lang] > 0) {
    console.log(`    ${lang}: ${perLangCounts[lang]} replacements`);
  }
}
console.log(`  Total: ${totalChanges} value replacements across ${LANGS.length} languages`);
