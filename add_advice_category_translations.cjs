const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  categoryMood: { no: "Humør", en: "Mood", sv: "Humör", da: "Humør", de: "Stimmung", fr: "Humeur", nl: "Stemming", it: "Umore", es: "Ánimo", fi: "Mieliala", pt: "Humor" },
  categoryRecovery: { no: "Bedring", en: "Recovery", sv: "Återhämtning", da: "Bedring", de: "Genesung", fr: "Rétablissement", nl: "Herstel", it: "Recupero", es: "Recuperación", fi: "Toipuminen", pt: "Recuperação" },
  categoryWellbeing: { no: "Velvære", en: "Wellbeing", sv: "Välbefinnande", da: "Trivsel", de: "Wohlbefinden", fr: "Bien-être", nl: "Welzijn", it: "Benessere", es: "Bienestar", fi: "Hyvinvointi", pt: "Bem-estar" },
  categoryMedication: { no: "Medisin", en: "Medication", sv: "Medicin", da: "Medicin", de: "Medikation", fr: "Médication", nl: "Medicatie", it: "Farmaci", es: "Medicación", fi: "Lääkitys", pt: "Medicação" },
  categorySleep: { no: "Søvn", en: "Sleep", sv: "Sömn", da: "Søvn", de: "Schlaf", fr: "Sommeil", nl: "Slaap", it: "Sonno", es: "Sueño", fi: "Uni", pt: "Sono" },
  categoryCravings: { no: "Sug", en: "Cravings", sv: "Sug", da: "Trang", de: "Verlangen", fr: "Envies", nl: "Trek", it: "Desiderio", es: "Antojos", fi: "Himo", pt: "Fissura" },
};

const lines = src.split("\n");
function findBlocks(L) {
  const blocks = [];
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^([ \t]*)['"]?([a-z]{2})['"]?\s*:\s*\{\s*$/);
    if (!m || m[1].length > 2) continue;
    let depth = 0, close = -1;
    for (let j = i; j < L.length; j++) {
      for (const ch of L[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) { close = j; break; } }
      }
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