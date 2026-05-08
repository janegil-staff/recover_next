// add_graphs_translations.cjs
const fs = require("fs");
const path = require("path");

const FILE = path.resolve("src/translations/index.js");
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  // Card titles
  recoveryProfile:        { no: "Bedringsprofil", en: "Recovery Profile", sv: "Återhämtningsprofil", da: "Bedringsprofil", de: "Genesungsprofil", fr: "Profil de rétablissement", nl: "Herstelprofiel", it: "Profilo di recupero", es: "Perfil de recuperación", fi: "Toipumisprofiili", pt: "Perfil de recuperação" },
  substanceProfile:       { no: "Rusmiddelprofil", en: "Substance Profile", sv: "Substansprofil", da: "Stofprofil", de: "Substanzprofil", fr: "Profil des substances", nl: "Middelenprofiel", it: "Profilo delle sostanze", es: "Perfil de sustancias", fi: "Aineprofiili", pt: "Perfil de substâncias" },
  questionnaireRadar:     { no: "Spørreskjema-radar", en: "Questionnaire Radar", sv: "Frågeformulär-radar", da: "Spørgeskema-radar", de: "Fragebogen-Radar", fr: "Radar de questionnaires", nl: "Vragenlijst-radar", it: "Radar questionari", es: "Radar de cuestionarios", fi: "Kyselytutka", pt: "Radar de questionários" },
  substanceMix:           { no: "Rusmiddelfordeling", en: "Substance Mix", sv: "Substansblandning", da: "Stoffordeling", de: "Substanzmix", fr: "Mélange de substances", nl: "Middelenmix", it: "Mix di sostanze", es: "Mezcla de sustancias", fi: "Aineiden jakauma", pt: "Mistura de substâncias" },
  amountOverTime:         { no: "Mengde over tid", en: "Amount Over Time", sv: "Mängd över tid", da: "Mængde over tid", de: "Menge im Zeitverlauf", fr: "Quantité au fil du temps", nl: "Hoeveelheid in de tijd", it: "Quantità nel tempo", es: "Cantidad a lo largo del tiempo", fi: "Määrä ajan kuluessa", pt: "Quantidade ao longo do tempo" },
  dayOfWeekPattern:       { no: "Mønster per ukedag", en: "Day-of-Week Pattern", sv: "Mönster per veckodag", da: "Mønster pr. ugedag", de: "Wochentag-Muster", fr: "Schéma par jour de la semaine", nl: "Patroon per weekdag", it: "Schema per giorno della settimana", es: "Patrón por día de la semana", fi: "Viikonpäivämalli", pt: "Padrão por dia da semana" },
  moodCravingsWellbeing:  { no: "Humør, sug og velvære", en: "Mood, Cravings & Wellbeing", sv: "Humör, sug & välbefinnande", da: "Humør, trang & trivsel", de: "Stimmung, Verlangen & Wohlbefinden", fr: "Humeur, envies et bien-être", nl: "Stemming, trek & welzijn", it: "Umore, desiderio e benessere", es: "Ánimo, antojos y bienestar", fi: "Mieliala, himo ja hyvinvointi", pt: "Humor, desejos e bem-estar" },
  weightOverTime:         { no: "Vektutvikling", en: "Weight Trend", sv: "Vikttrend", da: "Vægtudvikling", de: "Gewichtsverlauf", fr: "Tendance du poids", nl: "Gewichtstrend", it: "Andamento del peso", es: "Tendencia del peso", fi: "Painokehitys", pt: "Tendência de peso" },

  // Card subtitles
  higherIsBetter:         { no: "Høyere = bedre på alle akser", en: "Higher = better across all axes", sv: "Högre = bättre på alla axlar", da: "Højere = bedre på alle akser", de: "Höher = besser auf allen Achsen", fr: "Plus élevé = mieux sur tous les axes", nl: "Hoger = beter op alle assen", it: "Più alto = meglio su tutti gli assi", es: "Más alto = mejor en todos los ejes", fi: "Korkeampi = parempi kaikilla akseleilla", pt: "Mais alto = melhor em todos os eixos" },
  daysAndAvgPerSubstance: { no: "Dager brukt og snittmengde per stoff", en: "Days used & avg amount per substance", sv: "Dagar och snittmängd per substans", da: "Dage brugt & gennemsnitlig mængde pr. stof", de: "Tage und Durchschnittsmenge pro Substanz", fr: "Jours et quantité moyenne par substance", nl: "Dagen en gem. hoeveelheid per middel", it: "Giorni e quantità media per sostanza", es: "Días y cantidad media por sustancia", fi: "Päivät ja keskimäärä per aine", pt: "Dias e média por substância" },
  percentOfMaxScore:      { no: "% av maksimal score", en: "% of maximum score", sv: "% av maxpoäng", da: "% af maks. score", de: "% des Maximalwerts", fr: "% du score maximum", nl: "% van maximale score", it: "% del punteggio massimo", es: "% de la puntuación máxima", fi: "% maksimipisteistä", pt: "% da pontuação máxima" },
  daysEachEffectLogged:   { no: "Dager hver bivirkning ble logget", en: "Days each effect was logged", sv: "Dagar varje biverkning loggades", da: "Dage hver bivirkning blev logget", de: "Tage, an denen jede Wirkung erfasst wurde", fr: "Jours où chaque effet a été enregistré", nl: "Dagen waarop elk effect is gelogd", it: "Giorni in cui ogni effetto è stato registrato", es: "Días que se registró cada efecto", fi: "Päivät, jolloin kukin sivuvaikutus kirjattiin", pt: "Dias em que cada efeito foi registado" },
  daysUsedPerSubstance:   { no: "Dager brukt per stoff", en: "Days used per substance", sv: "Dagar använda per substans", da: "Dage brugt pr. stof", de: "Tage pro Substanz", fr: "Jours par substance", nl: "Dagen per middel", it: "Giorni per sostanza", es: "Días por sustancia", fi: "Päivät per aine", pt: "Dias por substância" },
  dailyConsumption:       { no: "Daglig forbruk · 0 = edru", en: "Daily consumption · 0 = sober", sv: "Daglig konsumtion · 0 = nykter", da: "Dagligt forbrug · 0 = ædru", de: "Täglicher Konsum · 0 = nüchtern", fr: "Consommation quotidienne · 0 = sobre", nl: "Dagelijks gebruik · 0 = nuchter", it: "Consumo giornaliero · 0 = sobrio", es: "Consumo diario · 0 = sobrio", fi: "Päivittäinen kulutus · 0 = selvä", pt: "Consumo diário · 0 = sóbrio" },
  useRateByWeekday:       { no: "Brukshyppighet per ukedag", en: "Use rate by weekday", sv: "Användningsfrekvens per veckodag", da: "Brugshyppighed pr. ugedag", de: "Nutzungsrate pro Wochentag", fr: "Taux d'usage par jour", nl: "Gebruiksfrequentie per weekdag", it: "Frequenza per giorno", es: "Frecuencia por día de la semana", fi: "Käyttötiheys viikonpäivittäin", pt: "Frequência por dia da semana" },
  scaleOneToFive:         { no: "Skala 1–5", en: "Scale 1–5", sv: "Skala 1–5", da: "Skala 1–5", de: "Skala 1–5", fr: "Échelle 1–5", nl: "Schaal 1–5", it: "Scala 1–5", es: "Escala 1–5", fi: "Asteikko 1–5", pt: "Escala 1–5" },

  // Stats / labels
  totalAmount:            { no: "Total mengde", en: "Total amount", sv: "Total mängd", da: "Total mængde", de: "Gesamtmenge", fr: "Quantité totale", nl: "Totale hoeveelheid", it: "Quantità totale", es: "Cantidad total", fi: "Kokonaismäärä", pt: "Quantidade total" },
  avgPerUseDay:           { no: "Snitt / brukerdag", en: "Avg / use day", sv: "Snitt / användardag", da: "Gns. / brugsdag", de: "Ø / Konsumtag", fr: "Moy. / jour d'usage", nl: "Gem. / gebruiksdag", it: "Media / giorno di uso", es: "Med. / día de uso", fi: "Ka. / käyttöpäivä", pt: "Méd. / dia de uso" },
  peakDay:                { no: "Topp", en: "Peak", sv: "Topp", da: "Top", de: "Spitze", fr: "Pic", nl: "Piek", it: "Picco", es: "Pico", fi: "Huippu", pt: "Pico" },
  hardestDay:             { no: "Tyngste dag", en: "Hardest day", sv: "Tyngsta dagen", da: "Sværeste dag", de: "Schwierigster Tag", fr: "Jour le plus dur", nl: "Moeilijkste dag", it: "Giorno più difficile", es: "Día más difícil", fi: "Vaikein päivä", pt: "Dia mais difícil" },
  easiestDay:             { no: "Letteste dag", en: "Easiest day", sv: "Lättaste dagen", da: "Letteste dag", de: "Leichtester Tag", fr: "Jour le plus facile", nl: "Makkelijkste dag", it: "Giorno più facile", es: "Día más fácil", fi: "Helpoin päivä", pt: "Dia mais fácil" },
  useRate:                { no: "Brukshyppighet", en: "Use rate", sv: "Användningsfrekvens", da: "Brugshyppighed", de: "Nutzungsrate", fr: "Taux d'usage", nl: "Gebruiksfrequentie", it: "Frequenza d'uso", es: "Frecuencia de uso", fi: "Käyttötiheys", pt: "Frequência de uso" },
  count:                  { no: "Antall", en: "Count", sv: "Antal", da: "Antal", de: "Anzahl", fr: "Nombre", nl: "Aantal", it: "Conteggio", es: "Recuento", fi: "Määrä", pt: "Contagem" },
  day:                    { no: "dag", en: "day", sv: "dag", da: "dag", de: "Tag", fr: "jour", nl: "dag", it: "giorno", es: "día", fi: "päivä", pt: "dia" },
  score:                  { no: "Score", en: "Score", sv: "Poäng", da: "Score", de: "Punktzahl", fr: "Score", nl: "Score", it: "Punteggio", es: "Puntuación", fi: "Pisteet", pt: "Pontuação" },
  daysUsed:               { no: "Dager brukt", en: "Days used", sv: "Dagar använda", da: "Dage brugt", de: "Tage genutzt", fr: "Jours d'usage", nl: "Dagen gebruikt", it: "Giorni di uso", es: "Días de uso", fi: "Käyttöpäivät", pt: "Dias de uso" },
  avgAmount:              { no: "Snittmengde", en: "Avg amount", sv: "Snittmängd", da: "Gns. mængde", de: "Ø Menge", fr: "Quantité moy.", nl: "Gem. hoeveelheid", it: "Quantità media", es: "Cant. media", fi: "Keskim. määrä", pt: "Quant. média" },
  patientProfile:         { no: "Pasientprofil", en: "Patient profile", sv: "Patientprofil", da: "Patientprofil", de: "Patientenprofil", fr: "Profil patient", nl: "Patiëntprofiel", it: "Profilo paziente", es: "Perfil del paciente", fi: "Potilasprofiili", pt: "Perfil do paciente" },
  lowCravings:            { no: "Lavt sug", en: "Low cravings", sv: "Lågt sug", da: "Lav trang", de: "Geringes Verlangen", fr: "Faibles envies", nl: "Weinig trek", it: "Basso desiderio", es: "Antojos bajos", fi: "Vähäinen himo", pt: "Desejo baixo" },
  lowAmount:              { no: "Lav mengde", en: "Low amount", sv: "Liten mängd", da: "Lav mængde", de: "Geringe Menge", fr: "Faible quantité", nl: "Weinig hoeveelheid", it: "Bassa quantità", es: "Cantidad baja", fi: "Vähäinen määrä", pt: "Quantidade baixa" },
  soberDays:              { no: "Edru dager", en: "Sober days", sv: "Nyktra dagar", da: "Ædru dage", de: "Nüchterne Tage", fr: "Jours sobres", nl: "Nuchtere dagen", it: "Giorni sobri", es: "Días sobrios", fi: "Selvät päivät", pt: "Dias sóbrios" },

  // Range selector
  range:                  { no: "Periode", en: "Range", sv: "Period", da: "Periode", de: "Zeitraum", fr: "Période", nl: "Periode", it: "Intervallo", es: "Rango", fi: "Aikaväli", pt: "Período" },
  last:                   { no: "Siste", en: "Last", sv: "Senaste", da: "Sidste", de: "Letzte", fr: "Derniers", nl: "Laatste", it: "Ultimi", es: "Últimos", fi: "Viimeiset", pt: "Últimos" },
  allTime:                { no: "All tid", en: "All time", sv: "All tid", da: "Hele tiden", de: "Gesamt", fr: "Tout le temps", nl: "Altijd", it: "Sempre", es: "Todo el tiempo", fi: "Kaikki", pt: "Sempre" },
  entries:                { no: "oppføringer", en: "entries", sv: "poster", da: "indtastninger", de: "Einträge", fr: "entrées", nl: "items", it: "voci", es: "entradas", fi: "merkintää", pt: "entradas" },

  // Empty states
  notEnoughQuestionnaireData: { no: "Ikke nok spørreskjemadata", en: "Not enough questionnaire data", sv: "Inte tillräckligt med frågeformulärdata", da: "Ikke nok spørgeskemadata", de: "Nicht genügend Fragebogendaten", fr: "Pas assez de données de questionnaire", nl: "Niet genoeg vragenlijstgegevens", it: "Dati insufficienti dei questionari", es: "Datos de cuestionarios insuficientes", fi: "Kyselyaineistoa ei ole tarpeeksi", pt: "Dados de questionário insuficientes" },
  needThreeSubstances:    { no: "Trenger minst 3 stoffer for radar", en: "Need at least 3 substances for radar", sv: "Behöver minst 3 substanser för radar", da: "Skal bruge mindst 3 stoffer til radar", de: "Mindestens 3 Substanzen für Radar nötig", fr: "Au moins 3 substances requises pour le radar", nl: "Minstens 3 middelen nodig voor radar", it: "Servono almeno 3 sostanze per il radar", es: "Se necesitan al menos 3 sustancias para el radar", fi: "Tarvitaan vähintään 3 ainetta tutkaa varten", pt: "São necessárias pelo menos 3 substâncias para o radar" },
  noUseInRange:           { no: "Ingen rusbruk logget i denne perioden", en: "No substance use logged in this period", sv: "Ingen substansanvändning loggad denna period", da: "Ingen stofbrug logget i denne periode", de: "Keine Substanznutzung in diesem Zeitraum", fr: "Aucune consommation enregistrée sur cette période", nl: "Geen middelengebruik in deze periode", it: "Nessun uso di sostanze in questo periodo", es: "Sin consumo registrado en este periodo", fi: "Ei aineiden käyttöä tällä jaksolla", pt: "Sem consumo registado neste período" },
  noSideEffectsLogged:    { no: "Ingen bivirkninger logget i denne perioden", en: "No side effects logged in this period", sv: "Inga biverkningar loggade denna period", da: "Ingen bivirkninger logget i denne periode", de: "Keine Nebenwirkungen in diesem Zeitraum", fr: "Aucun effet secondaire enregistré sur cette période", nl: "Geen bijwerkingen in deze periode", it: "Nessun effetto collaterale in questo periodo", es: "Sin efectos secundarios en este periodo", fi: "Ei sivuvaikutuksia tällä jaksolla", pt: "Sem efeitos secundários neste período" },

  // Weekday short labels (array)
  weekdaysShort: {
    no: ["Man","Tir","Ons","Tor","Fre","Lør","Søn"],
    en: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    sv: ["Mån","Tis","Ons","Tor","Fre","Lör","Sön"],
    da: ["Man","Tir","Ons","Tor","Fre","Lør","Søn"],
    de: ["Mo","Di","Mi","Do","Fr","Sa","So"],
    fr: ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"],
    nl: ["Ma","Di","Wo","Do","Vr","Za","Zo"],
    it: ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"],
    es: ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"],
    fi: ["Ma","Ti","Ke","To","Pe","La","Su"],
    pt: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"],
  },

  readiness:              { no: "Endringsvilje", en: "Readiness", sv: "Förändringsvilja", da: "Forandringsparathed", de: "Veränderungsbereitschaft", fr: "Volonté de changer", nl: "Veranderingsbereidheid", it: "Disponibilità al cambiamento", es: "Disposición al cambio", fi: "Muutosvalmius", pt: "Disposição para mudar" },
};

// Find every top-level language block by brace-counting
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

let inserted = 0;
let already = 0;

// Process from bottom to top so line numbers don't shift
for (const block of [...blocks].reverse()) {
  const innerIndent = block.indent + "  ";
  const blockBody = lines.slice(block.open, block.close + 1).join("\n");
  const insertions = [];

  for (const [key, langValues] of Object.entries(KEYS)) {
    const value = langValues[block.lang];
    if (value === undefined) continue;

    // Check if key already exists at top level of this block
    const keyRe = new RegExp(`^[ \\t]+['"]${key}['"]\\s*:`, "m");
    if (keyRe.test(blockBody)) { already++; continue; }

    if (Array.isArray(value)) {
      const arr = value.map(v => `'${v}'`).join(", ");
      insertions.push(`${innerIndent}'${key}': [${arr}],`);
    } else {
      const escaped = String(value).replace(/'/g, "\\'");
      insertions.push(`${innerIndent}'${key}': '${escaped}',`);
    }
    inserted++;
  }

  if (!insertions.length) continue;

  // Ensure line before close has trailing comma
  const prevLine = lines[block.close - 1];
  if (prevLine && !/,\s*$/.test(prevLine.trim()) && prevLine.trim() !== "{") {
    lines[block.close - 1] = prevLine.replace(/(\S)\s*$/, "$1,");
  }

  lines.splice(block.close, 0, ...insertions);
}

fs.writeFileSync(FILE, lines.join("\n"));
console.log(`✅ Inserted: ${inserted}, already present: ${already}`);