// add_last_log_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  lastLog: {
    no: "Sist logget", en: "Last log", sv: "Senaste logg", da: "Sidst logget",
    de: "Letzter Eintrag", fr: "Dernier journal", nl: "Laatste log",
    it: "Ultimo registro", es: "Último registro", fi: "Viimeisin kirjaus",
    pt: "Último registo",
  },
  logToday: {
    no: "Logget i dag", en: "Logged today", sv: "Loggat idag", da: "Logget i dag",
    de: "Heute eingetragen", fr: "Enregistré aujourd'hui", nl: "Vandaag gelogd",
    it: "Registrato oggi", es: "Registrado hoy", fi: "Kirjattu tänään",
    pt: "Registado hoje",
  },
  logYesterday: {
    no: "Logget i går", en: "Logged yesterday", sv: "Loggat igår", da: "Logget i går",
    de: "Gestern eingetragen", fr: "Enregistré hier", nl: "Gisteren gelogd",
    it: "Registrato ieri", es: "Registrado ayer", fi: "Kirjattu eilen",
    pt: "Registado ontem",
  },
  daysAgo: {
    no: "dager siden", en: "days ago", sv: "dagar sedan", da: "dage siden",
    de: "Tage her", fr: "jours", nl: "dagen geleden", it: "giorni fa",
    es: "días atrás", fi: "päivää sitten", pt: "dias atrás",
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