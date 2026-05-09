const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  // Stat tiles
  wellness: { no: "Velvære", en: "Wellness", sv: "Välbefinnande", da: "Trivsel", de: "Wohlbefinden", fr: "Bien-être", nl: "Welzijn", it: "Benessere", es: "Bienestar", fi: "Hyvinvointi", pt: "Bem-estar" },
  useDaysShort: { no: "Bruksdager", en: "Use days", sv: "Använd. dagar", da: "Brugsdage", de: "Nutzungstage", fr: "Jours d'usage", nl: "Gebruiksdagen", it: "Giorni d'uso", es: "Días de uso", fi: "Käyttöpäivät", pt: "Dias de uso" },
  moodTrend: { no: "Stemnings-trend", en: "Mood trend", sv: "Humörtrend", da: "Humørtendens", de: "Stimmungstrend", fr: "Tendance humeur", nl: "Stemmingstrend", it: "Trend umore", es: "Tendencia ánimo", fi: "Mielialatrendi", pt: "Tendência humor" },
  // Key findings panel
  keyFindings: { no: "Hovedfunn", en: "Key findings", sv: "Viktiga fynd", da: "Hovedfund", de: "Wichtige Erkenntnisse", fr: "Points clés", nl: "Belangrijkste bevindingen", it: "Risultati chiave", es: "Hallazgos clave", fi: "Tärkeimmät havainnot", pt: "Principais achados" },
  findingHighRiskDay: { no: "er den mest risikofylte dagen", en: "is the highest-risk day", sv: "är den mest riskfyllda dagen", da: "er den mest risikofyldte dag", de: "ist der risikoreichste Tag", fr: "est le jour à plus haut risque", nl: "is de meest risicovolle dag", it: "è il giorno a maggior rischio", es: "es el día de mayor riesgo", fi: "on suurimman riskin päivä", pt: "é o dia de maior risco" },
  vsLower: { no: "mot", en: "vs", sv: "mot", da: "mod", de: "vs", fr: "contre", nl: "tegenover", it: "contro", es: "vs", fi: "vs", pt: "vs" },
  onOtherDays: { no: "andre dager", en: "on other days", sv: "andra dagar", da: "andre dage", de: "an anderen Tagen", fr: "les autres jours", nl: "op andere dagen", it: "altri giorni", es: "otros días", fi: "muina päivinä", pt: "noutros dias" },
  findingMoodImproving: { no: "Stemning bedrer seg", en: "Mood improving", sv: "Humör förbättras", da: "Humør bedres", de: "Stimmung verbessert sich", fr: "Humeur en amélioration", nl: "Stemming verbetert", it: "Umore in miglioramento", es: "Estado de ánimo mejorando", fi: "Mieliala paranee", pt: "Humor melhorando" },
  findingMoodDeclining: { no: "Stemning forverres", en: "Mood declining", sv: "Humör försämras", da: "Humør forværres", de: "Stimmung verschlechtert sich", fr: "Humeur en déclin", nl: "Stemming verslechtert", it: "Umore in declino", es: "Estado de ánimo empeorando", fi: "Mieliala laskussa", pt: "Humor declinando" },
  findingStreakMonth: { no: "Pasienten opprettholder", en: "Currently sustaining", sv: "Upprätthåller just nu", da: "Opretholder i øjeblikket", de: "Aktuell aufrechterhalten", fr: "Maintient actuellement", nl: "Onderhoudt momenteel", it: "Attualmente in", es: "Mantiene actualmente", fi: "Ylläpitää tällä hetkellä", pt: "Mantém atualmente" },
  findingStreakTwoWeek: { no: "Pasienten er i", en: "Currently in", sv: "Just nu i", da: "I øjeblikket i", de: "Aktuell in", fr: "Actuellement en", nl: "Momenteel in", it: "Attualmente in", es: "Actualmente en", fi: "Tällä hetkellä", pt: "Atualmente em" },
  findingStreakWeek: { no: "Pasienten er i", en: "Currently in", sv: "Just nu i", da: "I øjeblikket i", de: "Aktuell in", fr: "Actuellement en", nl: "Momenteel in", it: "Attualmente in", es: "Actualmente en", fi: "Tällä hetkellä", pt: "Atualmente em" },
  soberStreak: { no: "edru-periode", en: "sober streak", sv: "nykter period", da: "ædru periode", de: "nüchterne Phase", fr: "période sobre", nl: "nuchtere reeks", it: "periodo sobrio", es: "racha sobria", fi: "raitis jakso", pt: "período sóbrio" },
  findingAuditElevated: { no: "Forhøyet AUDIT-skår", en: "AUDIT score elevated", sv: "Förhöjd AUDIT-poäng", da: "Forhøjet AUDIT-score", de: "AUDIT-Wert erhöht", fr: "Score AUDIT élevé", nl: "AUDIT-score verhoogd", it: "Punteggio AUDIT elevato", es: "Puntuación AUDIT elevada", fi: "Kohonnut AUDIT-pistemäärä", pt: "Pontuação AUDIT elevada" },
  findingPhq9Elevated: { no: "PHQ-9 forhøyet", en: "PHQ-9 elevated", sv: "PHQ-9 förhöjt", da: "PHQ-9 forhøjet", de: "PHQ-9 erhöht", fr: "PHQ-9 élevé", nl: "PHQ-9 verhoogd", it: "PHQ-9 elevato", es: "PHQ-9 elevado", fi: "PHQ-9 kohonnut", pt: "PHQ-9 elevado" },
  moderateDepression: { no: "moderat til alvorlig depresjon-område", en: "moderate to severe depression range", sv: "moderat till svår depression-intervall", da: "moderat til svær depression-område", de: "moderate bis schwere Depression", fr: "dépression modérée à sévère", nl: "matige tot ernstige depressie-bereik", it: "depressione moderata a grave", es: "depresión moderada a grave", fi: "kohtalaisesta vaikeaan masennukseen", pt: "depressão moderada a grave" },
  findingPolysubstance: { no: "Polyfarmasi-mønster", en: "Polysubstance pattern", sv: "Polysubstansmönster", da: "Polysubstansmønster", de: "Polysubstanz-Muster", fr: "Schéma polysubstance", nl: "Polysubstantiepatroon", it: "Pattern polisostanza", es: "Patrón polisustancia", fi: "Monilääkekäyttö-malli", pt: "Padrão polissubstância" },
  // Lead-lag chart
  cravingsMoodLeadLag: { no: "Sug vs Stemning — Lead/Lag", en: "Cravings vs Mood — Lead/Lag", sv: "Sug vs Humör — Lead/Lag", da: "Sug vs Humør — Lead/Lag", de: "Verlangen vs Stimmung — Lead/Lag", fr: "Envies vs Humeur — Lead/Lag", nl: "Trek vs Stemming — Lead/Lag", it: "Desiderio vs Umore — Lead/Lag", es: "Antojos vs Ánimo — Lead/Lag", fi: "Himo vs Mieliala — Lead/Lag", pt: "Fissura vs Humor — Lead/Lag" },
  crossCorrelationAnalysis: { no: "Krysskorrelasjons-analyse på ±3 dagers forsinkelse", en: "Cross-correlation across ±3 day lags", sv: "Korskorrelation över ±3 dagars fördröjning", da: "Krydskorrelation over ±3 dages forsinkelse", de: "Kreuzkorrelation über ±3 Tage Verzögerung", fr: "Corrélation croisée sur des décalages de ±3 jours", nl: "Kruiscorrelatie over ±3 dagen vertraging", it: "Correlazione incrociata su ritardi di ±3 giorni", es: "Correlación cruzada sobre retrasos de ±3 días", fi: "Ristikorrelaatio ±3 päivän viiveellä", pt: "Correlação cruzada com desfasamentos de ±3 dias" },
  notEnoughDataForLeadLag: { no: "Ikke nok data for korrelasjons-analyse", en: "Not enough data for correlation analysis", sv: "Inte tillräckligt med data för korrelationsanalys", da: "Ikke nok data til korrelationsanalyse", de: "Nicht genug Daten für Korrelationsanalyse", fr: "Pas assez de données pour l'analyse de corrélation", nl: "Niet genoeg gegevens voor correlatieanalyse", it: "Dati insufficienti per analisi di correlazione", es: "Datos insuficientes para análisis de correlación", fi: "Liian vähän tietoa korrelaatioanalyysille", pt: "Dados insuficientes para análise de correlação" },
  leadLagAxisLabel: { no: "Dager stemning leder ←  →  Sug leder", en: "Days mood leads ←  →  Cravings lead", sv: "Dagar humör leder ←  →  Sug leder", da: "Dage humør leder ←  →  Sug leder", de: "Tage Stimmung führt ←  →  Verlangen führt", fr: "Jours humeur précède ←  →  Envies précèdent", nl: "Dagen stemming gaat voor ←  →  Trek gaat voor", it: "Giorni umore precede ←  →  Desiderio precede", es: "Días ánimo precede ←  →  Antojos preceden", fi: "Päiviä mieliala edellä ←  →  Himo edellä", pt: "Dias humor precede ←  →  Fissura precede" },
  insightLeadLagNoCorrelation: { no: "Ingen signifikant sammenheng mellom stemning og sug.", en: "No significant correlation between mood and cravings.", sv: "Ingen signifikant korrelation mellan humör och sug.", da: "Ingen signifikant sammenhæng mellem humør og sug.", de: "Keine signifikante Korrelation zwischen Stimmung und Verlangen.", fr: "Aucune corrélation significative entre humeur et envies.", nl: "Geen significante correlatie tussen stemming en trek.", it: "Nessuna correlazione significativa tra umore e desiderio.", es: "Sin correlación significativa entre ánimo y antojos.", fi: "Ei merkittävää yhteyttä mielialan ja himon välillä.", pt: "Sem correlação significativa entre humor e fissura." },
  insightLeadLagSameDay: { no: "Stemning og sug beveger seg sammen samme dag", en: "Mood and cravings move together same-day", sv: "Humör och sug rör sig tillsammans samma dag", da: "Humør og sug bevæger sig sammen samme dag", de: "Stimmung und Verlangen bewegen sich am selben Tag", fr: "Humeur et envies évoluent ensemble le même jour", nl: "Stemming en trek bewegen op dezelfde dag", it: "Umore e desiderio si muovono insieme nello stesso giorno", es: "Ánimo y antojos se mueven juntos el mismo día", fi: "Mieliala ja himo liikkuvat yhdessä samana päivänä", pt: "Humor e fissura movem-se juntos no mesmo dia" },
  insightLeadLagMoodLeads: { no: "Stemning forutsier sug", en: "Mood predicts cravings", sv: "Humör förutsäger sug", da: "Humør forudsiger sug", de: "Stimmung sagt Verlangen voraus", fr: "L'humeur prédit les envies", nl: "Stemming voorspelt trek", it: "L'umore predice il desiderio", es: "El ánimo predice los antojos", fi: "Mieliala ennustaa himoa", pt: "Humor prediz fissura" },
  insightLeadLagCravingsLeads: { no: "Sug går foran stemnings-endringer", en: "Cravings precede mood changes", sv: "Sug föregår humörförändringar", da: "Sug går forud for humørændringer", de: "Verlangen geht Stimmungsänderungen voraus", fr: "Les envies précèdent les changements d'humeur", nl: "Trek gaat vooraf aan stemmingsveranderingen", it: "Il desiderio precede i cambiamenti di umore", es: "Los antojos preceden a los cambios de ánimo", fi: "Himo edeltää mielialan muutoksia", pt: "Fissura precede mudanças de humor" },
  aheadOf: { no: "før", en: "ahead of", sv: "före", da: "forud for", de: "vor", fr: "avant", nl: "vooraf aan", it: "prima di", es: "antes de", fi: "ennen", pt: "antes de" },
  strong: { no: "sterk", en: "strong", sv: "stark", da: "stærk", de: "stark", fr: "forte", nl: "sterk", it: "forte", es: "fuerte", fi: "vahva", pt: "forte" },
  moderate: { no: "moderat", en: "moderate", sv: "måttlig", da: "moderat", de: "moderat", fr: "modérée", nl: "matig", it: "moderato", es: "moderada", fi: "kohtalainen", pt: "moderada" },
  weak: { no: "svak", en: "weak", sv: "svag", da: "svag", de: "schwach", fr: "faible", nl: "zwak", it: "debole", es: "débil", fi: "heikko", pt: "fraca" },
  // Comparison
  compareVsPrior: { no: "vs forrige periode", en: "vs prior period", sv: "vs föregående period", da: "vs forrige periode", de: "vs vorheriger Zeitraum", fr: "vs période précédente", nl: "vs vorige periode", it: "vs periodo precedente", es: "vs período anterior", fi: "vs edellinen jakso", pt: "vs período anterior" },
  thisVsPriorPeriod: { no: "Denne perioden mot forrige", en: "This period vs prior period", sv: "Denna period mot föregående", da: "Denne periode mod forrige", de: "Dieser Zeitraum vs vorheriger", fr: "Cette période vs précédente", nl: "Deze periode vs vorige", it: "Questo periodo vs precedente", es: "Este período vs anterior", fi: "Tämä jakso vs edellinen", pt: "Este período vs anterior" },
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