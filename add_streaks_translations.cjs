// add_streaks_translations.cjs
const fs = require("fs");
const path = require("path");

const FILE = path.resolve("src/translations/index.js");
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  soberStreaks:     { no: "Edru-perioder", en: "Sober Streaks", sv: "Nyktra perioder", da: "Ædrue perioder", de: "Nüchterne Strähnen", fr: "Périodes sobres", nl: "Nuchtere reeksen", it: "Serie di sobrietà", es: "Rachas de sobriedad", fi: "Selvät jaksot", pt: "Sequências sóbrias" },
  streaksSubtitle:  { no: "Pågående periode, lengste strekk, edru/brukt-oversikt", en: "Current run, longest stretch, sober/used heatmap", sv: "Pågående period, längsta sträcka, nykter/använt-karta", da: "Igangværende periode, længste stræk, ædru/brugt-oversigt", de: "Aktuelle Strähne, längster Zeitraum, nüchtern/Konsum-Übersicht", fr: "Période actuelle, plus longue série, carte sobre/usage", nl: "Huidige reeks, langste periode, nuchter/gebruikt-overzicht", it: "Serie attuale, periodo più lungo, mappa sobrio/uso", es: "Racha actual, más larga, mapa sobrio/uso", fi: "Nykyinen jakso, pisin jakso, selvä/käyttö-kartta", pt: "Sequência atual, mais longa, mapa sóbrio/uso" },
  currentStreak:    { no: "Pågående periode", en: "Current streak", sv: "Pågående", da: "Igangværende", de: "Aktuelle Strähne", fr: "Série actuelle", nl: "Huidige reeks", it: "Serie attuale", es: "Racha actual", fi: "Nykyinen jakso", pt: "Sequência atual" },
  longestStreak:    { no: "Lengste periode", en: "Longest streak", sv: "Längsta", da: "Længste", de: "Längste Strähne", fr: "Série la plus longue", nl: "Langste reeks", it: "Serie più lunga", es: "Racha más larga", fi: "Pisin jakso", pt: "Sequência mais longa" },
  soberDaysTotal:   { no: "Edru dager totalt", en: "Sober days total", sv: "Totalt nyktra dagar", da: "Ædrue dage i alt", de: "Nüchterne Tage gesamt", fr: "Jours sobres au total", nl: "Nuchtere dagen totaal", it: "Giorni sobri totali", es: "Días sobrios totales", fi: "Selvät päivät yhteensä", pt: "Total de dias sóbrios" },
  topStreaks:       { no: "Lengste perioder", en: "Top streaks", sv: "Längsta perioder", da: "Længste perioder", de: "Längste Strähnen", fr: "Plus longues séries", nl: "Langste reeksen", it: "Serie più lunghe", es: "Mejores rachas", fi: "Pisimmät jaksot", pt: "Maiores sequências" },
  ongoing:          { no: "pågår", en: "ongoing", sv: "pågående", da: "igangværende", de: "laufend", fr: "en cours", nl: "lopend", it: "in corso", es: "en curso", fi: "käynnissä", pt: "em curso" },
  used:             { no: "Brukt", en: "Used", sv: "Använt", da: "Brugt", de: "Konsumiert", fr: "Usage", nl: "Gebruikt", it: "Uso", es: "Consumo", fi: "Käytetty", pt: "Uso" },
};

const lines = src.split("\n");
function findLanguageBlocks(srcLines) {
  const blocks = [];
  for (let i = 0; i < srcLines.length; i++) {
    const m = srcLines[i].match(/^([ \t]*)['"]?([a-z]{2})['"]?\s*:\s*\{\s*$/);
    if (!m) continue;
    if (m[1].length > 2) continue;
    const lang = m[2];
    let depth = 0, close = -1;
    for (let j = i; j < srcLines.length; j++) {
      for (const ch of srcLines[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) { close = j; break; } }
      }
      if (close !== -1) break;
    }
    if (close !== -1) blocks.push({ lang, open: i, close, indent: m[1] });
  }
  return blocks;
}

const blocks = findLanguageBlocks(lines);
console.log(`📦 Found ${blocks.length} language blocks: ${blocks.map(b => b.lang).join(", ")}`);

let inserted = 0, already = 0;
for (const block of [...blocks].reverse()) {
  const innerIndent = block.indent + "  ";
  const blockBody = lines.slice(block.open, block.close + 1).join("\n");
  const insertions = [];

  for (const [key, langValues] of Object.entries(KEYS)) {
    const value = langValues[block.lang];
    if (value === undefined) continue;

    const keyRe = new RegExp(`^[ \\t]+['"]${key}['"]\\s*:`, "m");
    if (keyRe.test(blockBody)) { already++; continue; }

    const escaped = String(value).replace(/'/g, "\\'");
    insertions.push(`${innerIndent}'${key}': '${escaped}',`);
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
console.log(`✅ Inserted: ${inserted}, already present: ${already}`);