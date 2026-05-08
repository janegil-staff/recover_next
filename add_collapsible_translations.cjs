// add_collapsible_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  noneThisMonth: {
    no: "ingen denne måneden", en: "none this month",
    sv: "inga denna månad", da: "ingen denne måned",
    de: "keine in diesem Monat", fr: "aucun ce mois",
    nl: "geen deze maand", it: "nessuno questo mese",
    es: "ninguno este mes", fi: "ei tässä kuussa",
    pt: "nenhum este mês",
  },
  prescribed: {
    no: "foreskrevet", en: "prescribed", sv: "föreskrivna",
    da: "ordineret", de: "verordnet", fr: "prescrits",
    nl: "voorgeschreven", it: "prescritti", es: "recetados",
    fi: "määrätty", pt: "prescritos",
  },
  takenLower: {
    no: "tatt", en: "taken", sv: "tagna", da: "taget",
    de: "eingenommen", fr: "pris", nl: "ingenomen",
    it: "presi", es: "tomados", fi: "otettu", pt: "tomados",
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