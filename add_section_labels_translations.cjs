// add_streak_comparison_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  lifetimeBest: {
    no: "Personlig rekord", en: "Lifetime best", sv: "Personligt rekord",
    da: "Personlig rekord", de: "Persönlicher Rekord", fr: "Record personnel",
    nl: "Persoonlijk record", it: "Record personale", es: "Récord personal",
    fi: "Henkilökohtainen ennätys", pt: "Recorde pessoal",
  },
  avgStreak: {
    no: "Snitt periode", en: "Average streak", sv: "Genomsnittlig period",
    da: "Gennemsnitlig periode", de: "Durchschnittliche Strähne",
    fr: "Série moyenne", nl: "Gemiddelde reeks", it: "Serie media",
    es: "Racha media", fi: "Keskimääräinen jakso", pt: "Sequência média",
  },
  streakContextNewBest: {
    no: "Ny personlig rekord", en: "New personal best", sv: "Nytt personligt rekord",
    da: "Ny personlig rekord", de: "Neuer persönlicher Rekord",
    fr: "Nouveau record personnel", nl: "Nieuw persoonlijk record",
    it: "Nuovo record personale", es: "Nuevo récord personal",
    fi: "Uusi henkilökohtainen ennätys", pt: "Novo recorde pessoal",
  },
  streakContextNearBest: {
    no: "Nærmer seg rekorden", en: "Approaching personal best",
    sv: "Närmar sig rekordet", da: "Nærmer sig rekorden",
    de: "Nähert sich dem Rekord", fr: "Proche du record personnel",
    nl: "Nadert persoonlijk record", it: "Vicino al record personale",
    es: "Cerca del récord personal", fi: "Lähellä ennätystä",
    pt: "A aproximar-se do recorde",
  },
  streakContextAboveAvg: {
    no: "Over snittet", en: "Above average", sv: "Över genomsnittet",
    da: "Over gennemsnit", de: "Über Durchschnitt",
    fr: "Au-dessus de la moyenne", nl: "Boven gemiddeld",
    it: "Sopra la media", es: "Por encima del promedio",
    fi: "Yli keskiarvon", pt: "Acima da média",
  },
  streakContextBuildingUp: {
    no: "Bygger seg opp", en: "Building up", sv: "Bygger upp",
    da: "Bygger op", de: "Im Aufbau", fr: "En progression",
    nl: "Bouwt op", it: "In costruzione", es: "Progresando",
    fi: "Rakentumassa", pt: "A construir",
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