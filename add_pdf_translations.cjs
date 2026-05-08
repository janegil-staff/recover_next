// add_pdf_translations.cjs
const fs = require("fs");
const path = require("path");

const FILE = path.resolve("src/translations/index.js");
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  // PDF / modal labels
  patientReport:    { no: "Pasientrapport", en: "Patient Report", sv: "Patientrapport", da: "Patientrapport", de: "Patientenbericht", fr: "Rapport patient", nl: "Patiëntrapport", it: "Referto paziente", es: "Informe del paciente", fi: "Potilasraportti", pt: "Relatório do paciente" },
  patient:          { no: "Pasient", en: "Patient", sv: "Patient", da: "Patient", de: "Patient", fr: "Patient", nl: "Patiënt", it: "Paziente", es: "Paciente", fi: "Potilas", pt: "Paciente" },
  age:              { no: "Alder", en: "Age", sv: "Ålder", da: "Alder", de: "Alter", fr: "Âge", nl: "Leeftijd", it: "Età", es: "Edad", fi: "Ikä", pt: "Idade" },
  gender:           { no: "Kjønn", en: "Gender", sv: "Kön", da: "Køn", de: "Geschlecht", fr: "Genre", nl: "Geslacht", it: "Sesso", es: "Género", fi: "Sukupuoli", pt: "Género" },
  heightLabel:      { no: "Høyde", en: "Height", sv: "Längd", da: "Højde", de: "Größe", fr: "Taille", nl: "Lengte", it: "Altezza", es: "Altura", fi: "Pituus", pt: "Altura" },
  weight:           { no: "Vekt", en: "Weight", sv: "Vikt", da: "Vægt", de: "Gewicht", fr: "Poids", nl: "Gewicht", it: "Peso", es: "Peso", fi: "Paino", pt: "Peso" },
  bmi:              { no: "BMI", en: "BMI", sv: "BMI", da: "BMI", de: "BMI", fr: "IMC", nl: "BMI", it: "IMC", es: "IMC", fi: "BMI", pt: "IMC" },
  weightBmi:        { no: "Vekt og BMI", en: "Weight & BMI", sv: "Vikt och BMI", da: "Vægt og BMI", de: "Gewicht & BMI", fr: "Poids et IMC", nl: "Gewicht & BMI", it: "Peso e IMC", es: "Peso e IMC", fi: "Paino ja BMI", pt: "Peso e IMC" },
  kg:               { no: "kg", en: "kg", sv: "kg", da: "kg", de: "kg", fr: "kg", nl: "kg", it: "kg", es: "kg", fi: "kg", pt: "kg" },

  // Stats panel
  avgMood:          { no: "Snitt humør", en: "Avg mood", sv: "Snitt humör", da: "Gns. humør", de: "Ø Stimmung", fr: "Humeur moy.", nl: "Gem. stemming", it: "Umore medio", es: "Ánimo prom.", fi: "Mielialan ka.", pt: "Humor méd." },
  avgCravings:      { no: "Snitt sug", en: "Avg cravings", sv: "Snitt sug", da: "Gns. trang", de: "Ø Verlangen", fr: "Envies moy.", nl: "Gem. trek", it: "Desiderio medio", es: "Antojos prom.", fi: "Himon ka.", pt: "Desejos méd." },
  avgWellbeing:     { no: "Snitt velvære", en: "Avg wellbeing", sv: "Snitt välbefinnande", da: "Gns. trivsel", de: "Ø Wohlbefinden", fr: "Bien-être moy.", nl: "Gem. welzijn", it: "Benessere medio", es: "Bienestar prom.", fi: "Hyvinvoinnin ka.", pt: "Bem-estar méd." },
  totalRecords:     { no: "Totalt antall", en: "Total records", sv: "Totalt antal", da: "Total antal", de: "Einträge gesamt", fr: "Total entrées", nl: "Totaal records", it: "Record totali", es: "Total registros", fi: "Merkintöjä yht.", pt: "Total de registos" },

  // Sober streak panel
  soberStreak:      { no: "Edru-periode", en: "Sober streak", sv: "Nykter period", da: "Ædru periode", de: "Nüchterne Strähne", fr: "Période sobre", nl: "Nuchtere reeks", it: "Periodo sobrio", es: "Racha sobria", fi: "Selvä jakso", pt: "Sequência sóbria" },
  daySingular:      { no: "dag", en: "day", sv: "dag", da: "dag", de: "Tag", fr: "jour", nl: "dag", it: "giorno", es: "día", fi: "päivä", pt: "dia" },
  daysPlural:       { no: "dager", en: "days", sv: "dagar", da: "dage", de: "Tage", fr: "jours", nl: "dagen", it: "giorni", es: "días", fi: "päivää", pt: "dias" },
  streakNow:        { no: "på rad", en: "in a row", sv: "i rad", da: "i træk", de: "in Folge", fr: "d'affilée", nl: "achter elkaar", it: "di fila", es: "seguidos", fi: "putkeen", pt: "seguidos" },
  longest:          { no: "Lengste", en: "Longest", sv: "Längsta", da: "Længste", de: "Längste", fr: "Plus longue", nl: "Langste", it: "Più lunga", es: "Más larga", fi: "Pisin", pt: "Mais longa" },
  soberDays:        { no: "Edru", en: "Sober", sv: "Nyktra", da: "Ædru", de: "Nüchtern", fr: "Sobre", nl: "Nuchter", it: "Sobrio", es: "Sobrio", fi: "Selvä", pt: "Sóbrio" },
  useDays:          { no: "Brukt", en: "Use", sv: "Använt", da: "Brugt", de: "Konsum", fr: "Usage", nl: "Gebruikt", it: "Uso", es: "Consumo", fi: "Käyttö", pt: "Uso" },

  // Section titles
  spiderDiagrams:   { no: "Edderkoppdiagrammer", en: "Spider Diagrams", sv: "Spindeldiagram", da: "Spindeldiagrammer", de: "Spinnendiagramme", fr: "Diagrammes en araignée", nl: "Spinnendiagrammen", it: "Diagrammi a ragno", es: "Diagramas de araña", fi: "Hämähäkkikaaviot", pt: "Diagramas de aranha" },
  questionnaires:   { no: "Spørreskjemaer", en: "Questionnaires", sv: "Frågeformulär", da: "Spørgeskemaer", de: "Fragebögen", fr: "Questionnaires", nl: "Vragenlijsten", it: "Questionari", es: "Cuestionarios", fi: "Kyselyt", pt: "Questionários" },
  noQuestionnaire:  { no: "Ikke fullført", en: "Not completed", sv: "Ej slutförd", da: "Ikke gennemført", de: "Nicht ausgefüllt", fr: "Non rempli", nl: "Niet voltooid", it: "Non completato", es: "No completado", fi: "Ei täytetty", pt: "Não preenchido" },
  scorePct:         { no: "Score %", en: "Score %", sv: "Poäng %", da: "Score %", de: "Punkte %", fr: "Score %", nl: "Score %", it: "Punteggio %", es: "Puntuación %", fi: "Pisteet %", pt: "Pontuação %" },

  // Substances section
  substancesUsed:   { no: "Rusmidler", en: "Substances", sv: "Substanser", da: "Stoffer", de: "Substanzen", fr: "Substances", nl: "Middelen", it: "Sostanze", es: "Sustancias", fi: "Aineet", pt: "Substâncias" },
  noSubstancesMonth: { no: "Ingen rusmidler logget", en: "No substances logged", sv: "Inga substanser loggade", da: "Ingen stoffer logget", de: "Keine Substanzen erfasst", fr: "Aucune substance enregistrée", nl: "Geen middelen gelogd", it: "Nessuna sostanza registrata", es: "Sin sustancias registradas", fi: "Ei aineita kirjattu", pt: "Sem substâncias registadas" },
  substancesMonth:  { no: "Rusmiddelsammendrag", en: "Substance summary", sv: "Substanssammanfattning", da: "Stofsammendrag", de: "Substanz-Übersicht", fr: "Résumé des substances", nl: "Middelensamenvatting", it: "Riepilogo sostanze", es: "Resumen de sustancias", fi: "Aineyhteenveto", pt: "Resumo de substâncias" },

  // Other report sections
  relevantAdvice:   { no: "Relevante råd", en: "Relevant advice", sv: "Relevanta råd", da: "Relevante råd", de: "Relevante Hinweise", fr: "Conseils pertinents", nl: "Relevant advies", it: "Consigli rilevanti", es: "Consejos relevantes", fi: "Olennaiset neuvot", pt: "Conselhos relevantes" },
  history:          { no: "Loggføring", en: "Log Records", sv: "Loggposter", da: "Logføring", de: "Log-Einträge", fr: "Journal", nl: "Logregels", it: "Registro", es: "Registros", fi: "Kirjaukset", pt: "Registos" },

  // Modal UI
  exportPdfReport:  { no: "Eksporter PDF-rapport", en: "Export PDF Report", sv: "Exportera PDF-rapport", da: "Eksportér PDF-rapport", de: "PDF-Bericht exportieren", fr: "Exporter le rapport PDF", nl: "PDF-rapport exporteren", it: "Esporta rapporto PDF", es: "Exportar informe PDF", fi: "Vie PDF-raportti", pt: "Exportar relatório PDF" },
  downloadPdf:      { no: "Last ned PDF", en: "Download PDF", sv: "Ladda ner PDF", da: "Download PDF", de: "PDF herunterladen", fr: "Télécharger le PDF", nl: "PDF downloaden", it: "Scarica PDF", es: "Descargar PDF", fi: "Lataa PDF", pt: "Descarregar PDF" },
  generating:       { no: "Genererer…", en: "Generating…", sv: "Genererar…", da: "Genererer…", de: "Wird erstellt…", fr: "Génération…", nl: "Genereren…", it: "Generazione…", es: "Generando…", fi: "Luodaan…", pt: "A gerar…" },
  renderingCharts:  { no: "Tegner diagrammer…", en: "Rendering charts…", sv: "Renderar diagram…", da: "Tegner diagrammer…", de: "Diagramme werden erstellt…", fr: "Rendu des graphiques…", nl: "Grafieken renderen…", it: "Rendering dei grafici…", es: "Renderizando gráficos…", fi: "Renderöidään kaavioita…", pt: "A renderizar gráficos…" },
  capturingDiagrams: { no: "Fanger diagrammer…", en: "Capturing diagrams…", sv: "Fångar diagram…", da: "Fanger diagrammer…", de: "Diagramme werden erfasst…", fr: "Capture des diagrammes…", nl: "Diagrammen vastleggen…", it: "Acquisizione diagrammi…", es: "Capturando diagramas…", fi: "Kaavioita tallennetaan…", pt: "A capturar diagramas…" },
  pdfFailed:        { no: "Klarte ikke å generere PDF. Prøv igjen.", en: "Failed to generate PDF. Please try again.", sv: "Det gick inte att skapa PDF. Försök igen.", da: "Kunne ikke generere PDF. Prøv igen.", de: "PDF konnte nicht erstellt werden. Bitte erneut versuchen.", fr: "Échec de la génération du PDF. Réessayez.", nl: "PDF genereren mislukt. Probeer opnieuw.", it: "Generazione PDF non riuscita. Riprova.", es: "No se pudo generar el PDF. Inténtalo de nuevo.", fi: "PDF:n luominen epäonnistui. Yritä uudelleen.", pt: "Falha ao gerar PDF. Tente novamente." },

  dateRange:        { no: "Tidsrom", en: "Date range", sv: "Tidsperiod", da: "Tidsrum", de: "Zeitraum", fr: "Plage de dates", nl: "Datumbereik", it: "Intervallo date", es: "Rango de fechas", fi: "Aikaväli", pt: "Intervalo de datas" },
  records:          { no: "oppføringer", en: "records", sv: "poster", da: "indtastninger", de: "Einträge", fr: "entrées", nl: "records", it: "voci", es: "registros", fi: "merkintöjä", pt: "registos" },
  questionnairesShort: { no: "spørreskjemaer", en: "questionnaires", sv: "frågeformulär", da: "spørgeskemaer", de: "Fragebögen", fr: "questionnaires", nl: "vragenlijsten", it: "questionari", es: "cuestionarios", fi: "kyselyä", pt: "questionários" },
  monthSummary:     { no: "Periodestatistikk", en: "Period stats", sv: "Periodstatistik", da: "Periodestatistik", de: "Zeitraumstatistik", fr: "Stats de période", nl: "Periodestatistieken", it: "Statistiche periodo", es: "Estadísticas del período", fi: "Jakson tilastot", pt: "Estatísticas do período" },
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