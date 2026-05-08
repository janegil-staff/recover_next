// add_wellness_translations.cjs
const fs = require("fs");
const path = require("path");

const FILE = path.resolve("src/translations/index.js");
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  wellnessIndex:    { no: "Velværeindeks", en: "Wellness Index", sv: "Välbefinnandeindex", da: "Trivselsindeks", de: "Wohlbefindens-Index", fr: "Indice de bien-être", nl: "Welzijnsindex", it: "Indice di benessere", es: "Índice de bienestar", fi: "Hyvinvointi-indeksi", pt: "Índice de bem-estar" },
  last30Days:       { no: "Siste 30 dager", en: "Last 30 days", sv: "Senaste 30 dagar", da: "Sidste 30 dage", de: "Letzte 30 Tage", fr: "30 derniers jours", nl: "Laatste 30 dagen", it: "Ultimi 30 giorni", es: "Últimos 30 días", fi: "Viimeiset 30 päivää", pt: "Últimos 30 dias" },
  improving:        { no: "i bedring", en: "improving", sv: "förbättras", da: "i bedring", de: "verbessert sich", fr: "en amélioration", nl: "verbetert", it: "in miglioramento", es: "mejorando", fi: "paranee", pt: "a melhorar" },
  declining:        { no: "i forverring", en: "declining", sv: "försämras", da: "forværres", de: "verschlechtert sich", fr: "en déclin", nl: "verslechtert", it: "in peggioramento", es: "empeorando", fi: "huononee", pt: "a piorar" },
  stable:           { no: "stabil", en: "stable", sv: "stabil", da: "stabil", de: "stabil", fr: "stable", nl: "stabiel", it: "stabile", es: "estable", fi: "vakaa", pt: "estável" },
  tierThriving:     { no: "Sterk fremgang", en: "Thriving", sv: "Frodas", da: "I fremgang", de: "Erfolgreich", fr: "Florissant", nl: "Floreert", it: "Prospera", es: "Prosperando", fi: "Kukoistaa", pt: "A prosperar" },
  tierStable:       { no: "Stabil", en: "Stable", sv: "Stabil", da: "Stabil", de: "Stabil", fr: "Stable", nl: "Stabiel", it: "Stabile", es: "Estable", fi: "Vakaa", pt: "Estável" },
  tierWatch:        { no: "Følg opp", en: "Watch", sv: "Övervaka", da: "Følg op", de: "Beobachten", fr: "Surveiller", nl: "Opletten", it: "Osservare", es: "Vigilar", fi: "Seuraa", pt: "Observar" },
  tierAtRisk:       { no: "Risiko", en: "At risk", sv: "I riskzon", da: "I risiko", de: "Gefährdet", fr: "À risque", nl: "Risico", it: "A rischio", es: "En riesgo", fi: "Riskissä", pt: "Em risco" },
  tierCritical:     { no: "Kritisk", en: "Critical", sv: "Kritiskt", da: "Kritisk", de: "Kritisch", fr: "Critique", nl: "Kritiek", it: "Critico", es: "Crítico", fi: "Kriittinen", pt: "Crítico" },
  compSobriety:     { no: "Edruelighet", en: "Sobriety", sv: "Nykterhet", da: "Ædruelighed", de: "Nüchternheit", fr: "Sobriété", nl: "Nuchterheid", it: "Sobrietà", es: "Sobriedad", fi: "Selvyys", pt: "Sobriedade" },
  compCravings:     { no: "Sug", en: "Cravings", sv: "Sug", da: "Trang", de: "Verlangen", fr: "Envies", nl: "Trek", it: "Desiderio", es: "Antojos", fi: "Himo", pt: "Desejos" },
  compMoodWellbeing:{ no: "Humør og velvære", en: "Mood/Wellbeing", sv: "Humör/välbefinnande", da: "Humør/trivsel", de: "Stimmung/Wohlbefinden", fr: "Humeur/bien-être", nl: "Stemming/welzijn", it: "Umore/benessere", es: "Ánimo/bienestar", fi: "Mieliala/hyvinvointi", pt: "Humor/bem-estar" },
  compMentalHealth: { no: "Psykisk helse", en: "Mental health", sv: "Psykisk hälsa", da: "Mental sundhed", de: "Psychische Gesundheit", fr: "Santé mentale", nl: "Geestelijke gezondheid", it: "Salute mentale", es: "Salud mental", fi: "Mielenterveys", pt: "Saúde mental" },
  compEngagement:   { no: "Engasjement", en: "Engagement", sv: "Engagemang", da: "Engagement", de: "Engagement", fr: "Engagement", nl: "Betrokkenheid", it: "Coinvolgimento", es: "Compromiso", fi: "Sitoutuminen", pt: "Envolvimento" },
  attentionNeeded:  { no: "Følg opp", en: "Watch", sv: "Övervaka", da: "Følg op", de: "Beachten", fr: "Surveiller", nl: "Aandacht", it: "Osservare", es: "Atención", fi: "Huomioi", pt: "Atenção" },
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