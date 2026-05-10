// add_weight_weekly_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  measurement: { no: "måling", en: "measurement", sv: "mätning", da: "måling", de: "Messung", fr: "mesure", nl: "meting", it: "misurazione", es: "medición", fi: "mittaus", pt: "medição" },
  measurements: { no: "målinger", en: "measurements", sv: "mätningar", da: "målinger", de: "Messungen", fr: "mesures", nl: "metingen", it: "misurazioni", es: "mediciones", fi: "mittausta", pt: "medições" },
  weeklyAveragesKg: { no: "Ukentlige snitt (kg)", en: "Weekly averages (kg)", sv: "Veckosnitt (kg)", da: "Ugentlige snit (kg)", de: "Wochendurchschnitt (kg)", fr: "Moyennes hebdo (kg)", nl: "Weekgemiddelden (kg)", it: "Medie settimanali (kg)", es: "Promedios semanales (kg)", fi: "Viikkokeskiarvot (kg)", pt: "Médias semanais (kg)" },
};

const lines = src.split("\n");
function findBlocks(L) {
  const blocks = [];
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^([ \t]*)['"]?([a-z]{2})['"]?\s*:\s*\{\s*$/);
    if (!m || m[1].length > 2) continue;
    let depth = 0, close = -1;
    for (let j = i; j < L.length; j++) {
      for (const ch of L[j]) { if (ch === "{") depth++; else if (ch === "}") { depth--; if (depth === 0) { close = j; break; } } }
      if (close !== -1) break;
    }
    if (close !== -1) blocks.push({ lang: m[2], open: i, close, indent: m[1] });
  }
  return blocks;
}
let inserted = 0, already = 0;
for (const block of [...findBlocks(lines)].reverse()) {
  const innerIndent = block.indent + "  ";
  const body = lines.slice(block.open, block.close + 1).join("\n");
  const insertions = [];
  for (const [key, langValues] of Object.entries(KEYS)) {
    const value = langValues[block.lang];
    if (!value) continue;
    if (new RegExp(`['"]${key}['"]\\s*:`).test(body)) { already++; continue; }
    insertions.push(`${innerIndent}'${key}': '${String(value).replace(/'/g, "\\'")}',`);
    inserted++;
  }
  if (!insertions.length) continue;
  const prevLine = lines[block.close - 1];
  if (prevLine && !/,\s*$/.test(prevLine.trim()) && prevLine.trim() !== "{") {
    lines[block.close - 1] = prevLine.replace(/(\S)\s*$/, "$1,");
  }
  lines.splice(block.close, 0, ...insertions);
}
fs.writeFileSync(FILE, lines.join("\n"));
console.log(`✅ Inserted: ${inserted}, already: ${already}`);