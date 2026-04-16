// Run from recover_next root: node patch_pdf_translations.mjs
import { readFileSync, writeFileSync } from "fs";

// Path to the translations JS file in drugs-web (Next.js dashboard)
const FILE = "./src/translations/index.js";

const NEW_KEYS = {
  patientReport:      "Patient Report",
  patient:            "Patient",
  weightBmi:          "Weight & BMI",
  heightLabel:        "Height",
  gender:             "Gender",
  spiderDiagrams:     "Spider Diagrams",
  recoveryProfile:    "Recovery Profile",
  substanceProfile:   "Substance Profile",
  questionnaireRadar: "Questionnaire Radar",
  daysUsed:           "Days used",
  avgAmount:          "Avg amount",
  scorePct:           "Score %",
  score:              "Score",
  substancesUsed:     "Substances",
};

let src = readFileSync(FILE, "utf8");

for (const [key, fallback] of Object.entries(NEW_KEYS)) {
  // Skip if key already exists
  if (new RegExp(`['"]${key}['"]\\s*:`).test(src)) {
    console.log(`  already exists: ${key}`);
    continue;
  }
  // Insert after the "en" block's first opening brace content by finding
  // a known stable key and inserting after it in every language block.
  // Strategy: append after `substances:` in each language block
  const insertAfter = /(\bsubstances\s*:\s*['"][^'"]*['"])/g;
  src = src.replace(insertAfter, `$1,\n      ${key}: '${fallback}'`);
  console.log(`  added: ${key}`);
}

writeFileSync(FILE, src);
console.log("\nDone — check your translations/index.js");
