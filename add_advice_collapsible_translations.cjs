// add_advice_collapsible_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  noAdvice: {
    no: "Ingen råd hentet frem for denne pasienten ennå.",
    en: "No advice surfaced for this patient yet.",
    sv: "Inga råd har hämtats fram för denna patient ännu.",
    da: "Intet rådgivning fremhævet for denne patient endnu.",
    de: "Noch keine Hinweise für diesen Patienten angezeigt.",
    fr: "Aucun conseil n'a encore été affiché pour ce patient.",
    nl: "Nog geen advies getoond voor deze patiënt.",
    it: "Nessun consiglio presentato per questo paziente.",
    es: "Aún no se ha mostrado consejo para este paciente.",
    fi: "Tälle potilaalle ei ole vielä esitetty neuvoja.",
    pt: "Ainda não foi apresentado nenhum conselho para este paciente.",
  },
  noneSurfaced: {
    no: "ingen vist", en: "none surfaced",
    sv: "inga visade", da: "ingen vist",
    de: "keine angezeigt", fr: "aucun affiché",
    nl: "geen getoond", it: "nessuno mostrato",
    es: "ninguno mostrado", fi: "ei näytetty",
    pt: "nenhum apresentado",
  },
  items: {
    no: "stk", en: "items",
    sv: "st", da: "stk",
    de: "Stück", fr: "éléments",
    nl: "items", it: "elementi",
    es: "elementos", fi: "kpl",
    pt: "itens",
  },
  advice: {
    no: "Råd", en: "Advice",
    sv: "Råd", da: "Råd",
    de: "Hinweis", fr: "Conseil",
    nl: "Advies", it: "Consiglio",
    es: "Consejo", fi: "Neuvo",
    pt: "Conselho",
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