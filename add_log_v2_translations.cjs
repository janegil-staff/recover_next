// add_log_v2_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  // Period ribbon
  lastUse:           { no: "Sist brukt", en: "Last use", sv: "Senast använt", da: "Sidst brugt", de: "Letzter Konsum", fr: "Dernier usage", nl: "Laatste gebruik", it: "Ultimo uso", es: "Último uso", fi: "Viimeisin käyttö", pt: "Último uso" },
  bestDay:           { no: "Beste dag", en: "Best day", sv: "Bästa dag", da: "Bedste dag", de: "Bester Tag", fr: "Meilleur jour", nl: "Beste dag", it: "Giorno migliore", es: "Mejor día", fi: "Paras päivä", pt: "Melhor dia" },
  worstDay:          { no: "Verste dag", en: "Worst day", sv: "Sämsta dag", da: "Værste dag", de: "Schlechtester Tag", fr: "Pire jour", nl: "Slechtste dag", it: "Giorno peggiore", es: "Peor día", fi: "Huonoin päivä", pt: "Pior dia" },
  totalLogs:         { no: "Antall logger", en: "Total logs", sv: "Antal loggar", da: "Antal logs", de: "Einträge gesamt", fr: "Total des entrées", nl: "Totaal logs", it: "Totale registri", es: "Registros totales", fi: "Kirjauksia yht.", pt: "Total de registos" },
  never:             { no: "Aldri", en: "Never", sv: "Aldrig", da: "Aldrig", de: "Nie", fr: "Jamais", nl: "Nooit", it: "Mai", es: "Nunca", fi: "Ei koskaan", pt: "Nunca" },

  // Timeline & filters
  timeline:          { no: "Tidslinje", en: "Timeline", sv: "Tidslinje", da: "Tidslinje", de: "Zeitleiste", fr: "Chronologie", nl: "Tijdlijn", it: "Cronologia", es: "Línea de tiempo", fi: "Aikajana", pt: "Linha do tempo" },
  usedShort:         { no: "Brukt", en: "Used", sv: "Använt", da: "Brugt", de: "Konsumiert", fr: "Usage", nl: "Gebruikt", it: "Uso", es: "Consumo", fi: "Käytetty", pt: "Uso" },

  filterAll:         { no: "Alle", en: "All", sv: "Alla", da: "Alle", de: "Alle", fr: "Tous", nl: "Alle", it: "Tutti", es: "Todos", fi: "Kaikki", pt: "Todos" },
  filterUseDays:     { no: "Brukerdager", en: "Use days", sv: "Användardagar", da: "Brugsdage", de: "Konsumtage", fr: "Jours d'usage", nl: "Gebruiksdagen", it: "Giorni di uso", es: "Días de uso", fi: "Käyttöpäivät", pt: "Dias de uso" },
  filterSoberDays:   { no: "Edru dager", en: "Sober days", sv: "Nyktra dagar", da: "Ædrue dage", de: "Nüchterne Tage", fr: "Jours sobres", nl: "Nuchtere dagen", it: "Giorni sobri", es: "Días sobrios", fi: "Selvät päivät", pt: "Dias sóbrios" },
  filterHighCravings:{ no: "Sug ≥4", en: "Cravings ≥4", sv: "Sug ≥4", da: "Trang ≥4", de: "Verlangen ≥4", fr: "Envies ≥4", nl: "Trek ≥4", it: "Desiderio ≥4", es: "Antojos ≥4", fi: "Himo ≥4", pt: "Desejos ≥4" },
  filterNotes:       { no: "Med notat", en: "With notes", sv: "Med anteckningar", da: "Med noter", de: "Mit Notizen", fr: "Avec notes", nl: "Met notities", it: "Con note", es: "Con notas", fi: "Muistiinpanoja", pt: "Com notas" },
  filterSideEffects: { no: "Bivirkninger", en: "Side effects", sv: "Biverkningar", da: "Bivirkninger", de: "Nebenwirkungen", fr: "Effets secondaires", nl: "Bijwerkingen", it: "Effetti collaterali", es: "Efectos secundarios", fi: "Sivuvaikutukset", pt: "Efeitos secundários" },
  filterMilestones:  { no: "Milepæler", en: "Milestones", sv: "Milstolpar", da: "Milepæle", de: "Meilensteine", fr: "Étapes", nl: "Mijlpalen", it: "Traguardi", es: "Hitos", fi: "Virstanpylväät", pt: "Marcos" },

  // Events
  milestone:         { no: "milepæl", en: "milestone", sv: "milstolpe", da: "milepæl", de: "Meilenstein", fr: "étape", nl: "mijlpaal", it: "traguardo", es: "hito", fi: "virstanpylväs", pt: "marco" },
  streakBroken:      { no: "Periode brutt", en: "Streak broken", sv: "Period bruten", da: "Periode brudt", de: "Strähne gebrochen", fr: "Série rompue", nl: "Reeks onderbroken", it: "Serie interrotta", es: "Racha rota", fi: "Putki katkesi", pt: "Sequência quebrada" },

  // Search
  searchNotes:       { no: "Søk i notater eller stoffer", en: "Search notes or substances", sv: "Sök i anteckningar eller substanser", da: "Søg i noter eller stoffer", de: "In Notizen oder Substanzen suchen", fr: "Rechercher dans les notes ou substances", nl: "Zoek in notities of middelen", it: "Cerca in note o sostanze", es: "Buscar en notas o sustancias", fi: "Hae muistiinpanoista tai aineista", pt: "Pesquisar em notas ou substâncias" },
  noMatchingLogs:    { no: "Ingen logger matcher filteret", en: "No logs match the current filter.", sv: "Inga loggar matchar filtret", da: "Ingen logs matcher filteret", de: "Keine Einträge passen zum Filter", fr: "Aucune entrée ne correspond au filtre", nl: "Geen logs voldoen aan het filter", it: "Nessun registro corrisponde al filtro", es: "Ningún registro coincide con el filtro", fi: "Mikään kirjaus ei vastaa suodatinta", pt: "Nenhum registo corresponde ao filtro" },

  // Detail labels
  scores:            { no: "Verdier", en: "Scores", sv: "Värden", da: "Værdier", de: "Werte", fr: "Valeurs", nl: "Waarden", it: "Valori", es: "Valores", fi: "Arvot", pt: "Valores" },
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