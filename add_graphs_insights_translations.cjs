// add_graphs_insights_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  sectionBigPicture: { no: "Helhetsbildet", en: "Big picture", sv: "Helhetsbild", da: "Det store billede", de: "Gesamtbild", fr: "Vue d'ensemble", nl: "Grote beeld", it: "Quadro generale", es: "Panorama general", fi: "Kokonaiskuva", pt: "Visão geral" },
  sectionDayByDay: { no: "Dag for dag", en: "Day-by-day", sv: "Dag för dag", da: "Dag for dag", de: "Tag für Tag", fr: "Jour par jour", nl: "Dag voor dag", it: "Giorno per giorno", es: "Día a día", fi: "Päivä päivältä", pt: "Dia a dia" },
  sectionClinical: { no: "Klinisk", en: "Clinical", sv: "Kliniskt", da: "Klinisk", de: "Klinisch", fr: "Clinique", nl: "Klinisch", it: "Clinico", es: "Clínico", fi: "Kliininen", pt: "Clínico" },
  sectionProfile: { no: "Pasientprofil", en: "Patient profile", sv: "Patientprofil", da: "Patientprofil", de: "Patientenprofil", fr: "Profil du patient", nl: "Patiëntprofiel", it: "Profilo paziente", es: "Perfil del paciente", fi: "Potilasprofiili", pt: "Perfil do paciente" },
  sectionTrends: { no: "Trender", en: "Trends", sv: "Trender", da: "Tendenser", de: "Trends", fr: "Tendances", nl: "Trends", it: "Tendenze", es: "Tendencias", fi: "Trendit", pt: "Tendências" },
  strongestArea: { no: "sterkeste område", en: "strongest area", sv: "starkaste område", da: "stærkeste område", de: "stärkster Bereich", fr: "domaine le plus fort", nl: "sterkste gebied", it: "area più forte", es: "área más fuerte", fi: "vahvin alue", pt: "área mais forte" },
  weakestArea: { no: "trenger oppmerksomhet", en: "needs attention", sv: "behöver uppmärksamhet", da: "kræver opmærksomhed", de: "braucht Aufmerksamkeit", fr: "nécessite de l'attention", nl: "vereist aandacht", it: "richiede attenzione", es: "requiere atención", fi: "vaatii huomiota", pt: "requer atenção" },
  insightStreakMonth: { no: "Pasienten er i en 30+ dagers streak — viktig milepæl.", en: "Currently sustaining a 30+ day streak — major milestone.", sv: "Just nu en 30+ dagars streak — viktig milstolpe.", da: "I gang med en 30+ dages streak — vigtig milepæl.", de: "Aktuell ein 30+ Tage Streak — wichtiger Meilenstein.", fr: "Streak de 30+ jours en cours — étape majeure.", nl: "Momenteel een 30+ dagen streak — belangrijke mijlpaal.", it: "Streak di 30+ giorni in corso — pietra miliare.", es: "Racha de 30+ días en curso — hito importante.", fi: "Käynnissä 30+ päivän putki — merkittävä virstanpylväs.", pt: "Sequência atual de 30+ dias — marco importante." },
  insightStreakTwoWeek: { no: "Pasienten er i en 2-ukers+ edru-periode — vedvarende fremgang.", en: "Currently in a 2-week+ sober run — sustained progress.", sv: "I 2-veckors+ nykter period — bestående framsteg.", da: "I gang med en 2-ugers+ ædru periode — vedvarende fremskridt.", de: "Aktuell in einer 2-Wochen+ nüchternen Phase — anhaltender Fortschritt.", fr: "Période sobre de 2+ semaines — progrès soutenus.", nl: "Momenteel een 2-weken+ nuchtere periode — duurzame vooruitgang.", it: "Periodo sobrio di 2+ settimane — progresso sostenuto.", es: "Periodo sobrio de 2+ semanas — progreso sostenido.", fi: "Käynnissä 2+ viikon raitis jakso — jatkuvaa edistystä.", pt: "Período sóbrio de 2+ semanas — progresso sustentado." },
  insightStreakWeek: { no: "Pasienten er i en ukes streak — bygger momentum.", en: "One-week streak in progress — building momentum.", sv: "En vecka streak pågår — bygger fart.", da: "En uges streak i gang — bygger momentum.", de: "Eine Woche Streak läuft — Schwung gewinnt.", fr: "Streak d'une semaine en cours — gain de momentum.", nl: "Een-week streak gaande — momentum opbouwen.", it: "Streak di una settimana in corso — costruendo slancio.", es: "Racha de una semana en curso — ganando impulso.", fi: "Viikon putki käynnissä — vauhtia keräten.", pt: "Sequência de uma semana em curso — ganhando impulso." },
  insightStreakNewBest: { no: "Pasienten er i sin lengste registrerte streak.", en: "Currently in patient's longest recorded streak.", sv: "I patientens längsta noterade streak.", da: "I patientens længste registrerede streak.", de: "Aktuell der längste aufgezeichnete Streak des Patienten.", fr: "Plus longue streak enregistrée du patient.", nl: "Huidig de langste geregistreerde streak van de patiënt.", it: "Streak più lungo mai registrato del paziente.", es: "Racha más larga registrada del paciente.", fi: "Potilaan pisin tallennettu putki.", pt: "Maior sequência registada do paciente." },
  insightStreakBroken: { no: "Brøt nylig en lengre streak — tett oppfølging anbefales.", en: "Recently broke a longer streak — close support recommended.", sv: "Bröt nyligen en längre streak — tät uppföljning rekommenderas.", da: "Brød for nylig en længere streak — tæt opfølgning anbefales.", de: "Längeren Streak kürzlich unterbrochen — enge Unterstützung empfohlen.", fr: "A récemment rompu une longue streak — soutien rapproché recommandé.", nl: "Onlangs een langere streak gebroken — nauwe ondersteuning aanbevolen.", it: "Streak più lungo interrotto di recente — supporto stretto raccomandato.", es: "Rompió recientemente una racha más larga — se recomienda apoyo cercano.", fi: "Pitkä putki katkesi äskettäin — tiivis tuki suositeltavaa.", pt: "Quebrou recentemente uma sequência mais longa — suporte próximo recomendado." },
  insightHardestVsEasiest: { no: "er den mest risikofylte dagen", en: "is the highest-risk day", sv: "är den mest riskfyllda dagen", da: "er den mest risikofyldte dag", de: "ist der risikoreichste Tag", fr: "est le jour à plus haut risque", nl: "is de meest risicovolle dag", it: "è il giorno a maggior rischio", es: "es el día de mayor riesgo", fi: "on suurimman riskin päivä", pt: "é o dia de maior risco" },
  insightHighRisk: { no: "viser forhøyet bruksrate", en: "shows elevated use rate", sv: "visar förhöjd användningsfrekvens", da: "viser forhøjet brugsrate", de: "zeigt erhöhte Nutzungsrate", fr: "montre un taux d'usage élevé", nl: "toont verhoogd gebruikspercentage", it: "mostra un tasso di uso elevato", es: "muestra una tasa de uso elevada", fi: "osoittaa kohonneen käyttöasteen", pt: "mostra taxa de uso elevada" },
  insightAllSober: { no: "Ingen bruk registrert på noen ukedag i denne perioden.", en: "No use detected on any weekday in this period.", sv: "Ingen användning upptäckt på någon veckodag denna period.", da: "Ingen brug opdaget på nogen ugedag i denne periode.", de: "Keine Nutzung an Wochentagen in diesem Zeitraum.", fr: "Aucun usage détecté en semaine sur cette période.", nl: "Geen gebruik gedetecteerd op enige weekdag in deze periode.", it: "Nessun uso rilevato in nessun giorno feriale in questo periodo.", es: "No se detectó uso en ningún día de semana en este periodo.", fi: "Ei käyttöä havaittu millään viikonpäivällä tällä jaksolla.", pt: "Nenhum uso detetado em nenhum dia da semana neste período." },
  insightConsistentPattern: { no: "Bruksrate er ganske konsistent på tvers av ukedager.", en: "Use rate is fairly consistent across weekdays.", sv: "Användningsfrekvens är ganska konsekvent över veckodagar.", da: "Brugsraten er rimelig konsistent på tværs af ugedage.", de: "Nutzungsrate ist über Wochentage hinweg ziemlich konsistent.", fr: "Taux d'usage assez constant sur les jours de la semaine.", nl: "Gebruikspercentage is redelijk consistent over weekdagen.", it: "Il tasso di uso è abbastanza costante nei giorni feriali.", es: "La tasa de uso es bastante constante entre días de la semana.", fi: "Käyttöaste on melko yhdenmukainen viikonpäivien välillä.", pt: "Taxa de uso é razoavelmente consistente entre dias da semana." },
  insightTopSideEffect: { no: "er den hyppigst rapporterte", en: "is the most reported", sv: "är den mest rapporterade", da: "er den hyppigst rapporterede", de: "ist die am häufigsten gemeldete", fr: "est l'effet le plus rapporté", nl: "is de meest gerapporteerde", it: "è il più segnalato", es: "es el más reportado", fi: "on yleisimmin raportoitu", pt: "é o mais reportado" },
  ofAllReports: { no: "av alle rapporter", en: "of all reports", sv: "av alla rapporter", da: "af alle rapporter", de: "aller Meldungen", fr: "de tous les signalements", nl: "van alle meldingen", it: "di tutte le segnalazioni", es: "de todos los reportes", fi: "kaikista raporteista", pt: "de todos os relatos" },
  ofMax: { no: "av maks", en: "of max", sv: "av max", da: "af maks", de: "des Maximums", fr: "du max", nl: "van max", it: "del massimo", es: "del máximo", fi: "maksimista", pt: "do máximo" },
  elevatedScore: { no: "forhøyet", en: "elevated", sv: "förhöjd", da: "forhøjet", de: "erhöht", fr: "élevé", nl: "verhoogd", it: "elevato", es: "elevado", fi: "kohonnut", pt: "elevado" },
  withinRange: { no: "innenfor typisk område", en: "within typical range", sv: "inom typiskt område", da: "inden for typisk område", de: "im typischen Bereich", fr: "dans la plage typique", nl: "binnen typisch bereik", it: "nell'intervallo tipico", es: "dentro del rango típico", fi: "tyypillisellä alueella", pt: "dentro do intervalo típico" },
  insightMostlySober: { no: "av dagene var edru — sterk bedringsperiode", en: "of days were sober — strong recovery period", sv: "av dagarna var nyktra — stark återhämtning", da: "af dagene var ædru — stærk bedringsperiode", de: "der Tage waren nüchtern — starke Erholungsphase", fr: "des jours étaient sobres — forte période de récupération", nl: "van de dagen was nuchter — sterke herstelperiode", it: "dei giorni erano sobri — forte periodo di recupero", es: "de días fueron sobrios — fuerte periodo de recuperación", fi: "päivistä oli raittiita — vahva toipumisjakso", pt: "dos dias foram sóbrios — forte período de recuperação" },
  insightMajoritySober: { no: "av dagene var edru", en: "of days were sober", sv: "av dagarna var nyktra", da: "af dagene var ædru", de: "der Tage waren nüchtern", fr: "des jours étaient sobres", nl: "van de dagen was nuchter", it: "dei giorni erano sobri", es: "de días fueron sobrios", fi: "päivistä oli raittiita", pt: "dos dias foram sóbrios" },
  insightPolysubstance: { no: "Polyfarmasi-mønster", en: "Polysubstance pattern", sv: "Polysubstansmönster", da: "Polysubstansmønster", de: "Polysubstanz-Muster", fr: "Schéma polysubstance", nl: "Polysubstantiepatroon", it: "Pattern polisostanza", es: "Patrón polisustancia", fi: "Monilääkekäyttö-malli", pt: "Padrão polissubstância" },
  appearMostFrequently: { no: "vises hyppigst", en: "appear most frequently", sv: "visas oftast", da: "vises hyppigst", de: "treten am häufigsten auf", fr: "apparaissent le plus fréquemment", nl: "verschijnen het vaakst", it: "appaiono più frequentemente", es: "aparecen con más frecuencia", fi: "esiintyvät useimmin", pt: "aparecem com mais frequência" },
  daysOfUse: { no: "dager med bruk", en: "days of use", sv: "dagar med användning", da: "dage med brug", de: "Nutzungstage", fr: "jours d'usage", nl: "gebruiksdagen", it: "giorni di uso", es: "días de uso", fi: "käyttöpäivää", pt: "dias de uso" },
  insightMoodImproving: { no: "Stemning bedrer seg", en: "Mood improving", sv: "Humör förbättras", da: "Humør bedres", de: "Stimmung verbessert sich", fr: "Humeur en amélioration", nl: "Stemming verbetert", it: "Umore in miglioramento", es: "Estado de ánimo mejorando", fi: "Mieliala paranee", pt: "Humor melhorando" },
  insightMoodDeclining: { no: "Stemning forverres", en: "Mood declining", sv: "Humör försämras", da: "Humør forværres", de: "Stimmung verschlechtert sich", fr: "Humeur en déclin", nl: "Stemming verslechtert", it: "Umore in declino", es: "Estado de ánimo empeorando", fi: "Mieliala laskussa", pt: "Humor declinando" },
  insightMoodStable: { no: "Stemning stabil gjennom perioden.", en: "Mood stable across the period.", sv: "Humör stabilt under perioden.", da: "Humør stabilt gennem perioden.", de: "Stimmung im Zeitraum stabil.", fr: "Humeur stable sur la période.", nl: "Stemming stabiel gedurende de periode.", it: "Umore stabile nel periodo.", es: "Estado de ánimo estable durante el periodo.", fi: "Mieliala vakaa jakson aikana.", pt: "Humor estável no período." },
  insightWeightStable: { no: "Vekt stabil gjennom perioden.", en: "Weight stable across the period.", sv: "Vikt stabil under perioden.", da: "Vægt stabil gennem perioden.", de: "Gewicht im Zeitraum stabil.", fr: "Poids stable sur la période.", nl: "Gewicht stabiel gedurende de periode.", it: "Peso stabile nel periodo.", es: "Peso estable durante el periodo.", fi: "Paino vakaa jakson aikana.", pt: "Peso estável no período." },
  points: { no: "poeng", en: "points", sv: "poäng", da: "point", de: "Punkte", fr: "points", nl: "punten", it: "punti", es: "puntos", fi: "pistettä", pt: "pontos" },
  overPeriod: { no: "i perioden", en: "over period", sv: "över perioden", da: "i perioden", de: "über den Zeitraum", fr: "sur la période", nl: "over de periode", it: "nel periodo", es: "en el periodo", fi: "jakson aikana", pt: "no período" },
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