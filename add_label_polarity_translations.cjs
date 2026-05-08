// add_label_polarity_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  compLowCravings: {
    no: "Lavt sug", en: "Low cravings", sv: "Lågt sug", da: "Lav trang",
    de: "Geringes Verlangen", fr: "Faibles envies", nl: "Weinig trek",
    it: "Basso desiderio", es: "Antojos bajos", fi: "Vähäinen himo",
    pt: "Desejo baixo",
  },
  compMentalWellness: {
    no: "Psykisk velvære", en: "Mental wellness", sv: "Psykiskt välbefinnande",
    da: "Mental trivsel", de: "Psychisches Wohlbefinden",
    fr: "Bien-être mental", nl: "Mentaal welzijn", it: "Benessere mentale",
    es: "Bienestar mental", fi: "Henkinen hyvinvointi", pt: "Bem-estar mental",
  },
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
    insertions.push(`${innerIndent}'${key}': '${value.replace(/'/g, "\\'")}',`);
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