#!/usr/bin/env node
// Diagnose which PDF translation keys are missing in which language blocks.
// Run from project root:
//   node check-pdf-translations.cjs
// Or:
//   TRANSLATIONS_PATH=src/translations/index.js node check-pdf-translations.cjs

const fs = require("fs");
const path = require("path");

const TRANSLATIONS_PATH =
  process.env.TRANSLATIONS_PATH ||
  path.join("src", "translations", "index.js");

const LANGS = ["no","en","nl","fr","de","it","sv","da","fi","es","pl","pt"];

const KEYS_TO_CHECK = [
  "patientReport","patient","age","gender","weight","weightBmi","bmi","heightLabel","kg",
  "monthSummary","daysLogged","avgMood","avgCravings","avgWellbeing","totalRecords",
  "soberStreak","streakNow","daySingular","daysPlural","longest","soberDays","useDays",
  "moodCravingsWellbeing","weightOverTime","spiderDiagrams","recoveryProfile",
  "substanceProfile","questionnaireRadar","score","scorePct","daysUsed","avgAmount",
  "questionnaires","questionnairesShort","noQuestionnaire",
  "substances","substancesUsed","substancesMonth","noSubstancesMonth","sober","days",
  "relevantAdvice","history","noData","date","mood","cravings","wellbeing","note","records",
  "dateRange","range1Month","range3Months","range6Months","range9Months","rangeAll",
];

const filePath = path.resolve(TRANSLATIONS_PATH);
if (!fs.existsSync(filePath)) {
  console.error(`✗ File not found: ${filePath}`);
  process.exit(1);
}
const src = fs.readFileSync(filePath, "utf8");

// Find each language block and extract its body (matching braces, string-aware).
function findBlock(s, lang) {
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
  if (depth !== 0) return { error: "unbalanced braces" };
  return { body: s.slice(start, i - 1) };
}

console.log(`Scanning ${TRANSLATIONS_PATH} for ${KEYS_TO_CHECK.length} PDF keys × ${LANGS.length} languages\n`);

const results = {};
let totalMissing = 0;

for (const lang of LANGS) {
  const block = findBlock(src, lang);
  if (!block) {
    results[lang] = { error: `LANGUAGE BLOCK NOT FOUND` };
    continue;
  }
  if (block.error) {
    results[lang] = { error: block.error };
    continue;
  }
  const missing = [];
  for (const key of KEYS_TO_CHECK) {
    const re = new RegExp(`(^|[\\s,{])(["']?)${key}\\2\\s*:`);
    if (!re.test(block.body)) missing.push(key);
  }
  results[lang] = { missing };
  totalMissing += missing.length;
}

if (totalMissing === 0) {
  console.log("✓ All keys present in all 12 languages.");
  process.exit(0);
}

for (const lang of LANGS) {
  const r = results[lang];
  if (r.error) {
    console.log(`✗ ${lang}: ${r.error}`);
  } else if (r.missing.length === 0) {
    console.log(`✓ ${lang}: complete`);
  } else {
    console.log(`✗ ${lang}: missing ${r.missing.length} keys → ${r.missing.join(", ")}`);
  }
}

console.log(`\nTotal missing: ${totalMissing}`);
process.exit(0);
