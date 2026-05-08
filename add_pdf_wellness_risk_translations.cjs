// add_pdf_wellness_risk_translations.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEYS = {
  flaggedEvents: {
    no: "Markerte hendelser", en: "Flagged events", sv: "Markerade händelser",
    da: "Markerede hændelser", de: "Markierte Ereignisse",
    fr: "Événements signalés", nl: "Gemarkeerde gebeurtenissen",
    it: "Eventi segnalati", es: "Eventos marcados",
    fi: "Merkityt tapahtumat", pt: "Eventos sinalizados",
  },
  noFlaggedEvents: {
    no: "Ingen markerte hendelser i denne perioden",
    en: "No flagged events in this period",
    sv: "Inga markerade händelser i denna period",
    da: "Ingen markerede hændelser i denne periode",
    de: "Keine markierten Ereignisse in diesem Zeitraum",
    fr: "Aucun événement signalé dans cette période",
    nl: "Geen gemarkeerde gebeurtenissen in deze periode",
    it: "Nessun evento segnalato in questo periodo",
    es: "Sin eventos marcados en este período",
    fi: "Ei merkittyjä tapahtumia tällä jaksolla",
    pt: "Sem eventos sinalizados neste período",
  },
  flagSuicidalIdeation: {
    no: "Selvmordstanker rapportert", en: "Suicidal ideation indicated",
    sv: "Självmordstankar rapporterade", da: "Selvmordstanker rapporteret",
    de: "Suizidale Gedanken angedeutet", fr: "Idées suicidaires signalées",
    nl: "Suïcidale gedachten gemeld", it: "Ideazione suicidaria rilevata",
    es: "Ideación suicida indicada", fi: "Itsemurha-ajatuksia raportoitu",
    pt: "Ideação suicida indicada",
  },
  flagPhq9q9: {
    no: "PHQ-9 spørsmål 9", en: "PHQ-9 question 9",
    sv: "PHQ-9 fråga 9", da: "PHQ-9 spørgsmål 9",
    de: "PHQ-9 Frage 9", fr: "PHQ-9 question 9",
    nl: "PHQ-9 vraag 9", it: "PHQ-9 domanda 9",
    es: "PHQ-9 pregunta 9", fi: "PHQ-9 kysymys 9",
    pt: "PHQ-9 pergunta 9",
  },
  flagHighCravings: {
    no: "Vedvarende sterkt sug", en: "Sustained high cravings",
    sv: "Långvarigt starkt sug", da: "Vedvarende stærk trang",
    de: "Anhaltend starkes Verlangen", fr: "Envies fortes prolongées",
    nl: "Aanhoudende hoge trek", it: "Desiderio elevato prolungato",
    es: "Antojos altos sostenidos", fi: "Pitkittynyt voimakas himo",
    pt: "Desejos elevados sustentados",
  },
  flagStreakBroken: {
    no: "Edru-periode brutt", en: "Sober streak broken",
    sv: "Nykter period bruten", da: "Ædru periode brudt",
    de: "Nüchterne Strähne gebrochen", fr: "Série sobre rompue",
    nl: "Nuchtere reeks onderbroken", it: "Serie sobria interrotta",
    es: "Racha sobria rota", fi: "Selvä jakso katkesi",
    pt: "Sequência sóbria quebrada",
  },
  flagLogGap: {
    no: "Logghull", en: "Logging gap",
    sv: "Loggningslucka", da: "Logføringshul",
    de: "Aufzeichnungslücke", fr: "Lacune dans le journal",
    nl: "Loggat", it: "Interruzione registro",
    es: "Brecha de registro", fi: "Kirjausvälit",
    pt: "Lacuna de registo",
  },
  flagNoRecentLog: {
    no: "Ingen ny logg", en: "No recent log",
    sv: "Ingen aktuell logg", da: "Ingen nylig log",
    de: "Kein aktueller Eintrag", fr: "Pas d'entrée récente",
    nl: "Geen recente log", it: "Nessun registro recente",
    es: "Sin registro reciente", fi: "Ei viimeaikaista kirjausta",
    pt: "Sem registo recente",
  },
  flagAuditHigh: {
    no: "AUDIT i skadelig område", en: "AUDIT in harmful range",
    sv: "AUDIT i skadligt intervall", da: "AUDIT i skadeligt område",
    de: "AUDIT im schädlichen Bereich", fr: "AUDIT dans la plage nocive",
    nl: "AUDIT in schadelijk bereik", it: "AUDIT in zona nociva",
    es: "AUDIT en rango nocivo", fi: "AUDIT haitallisella alueella",
    pt: "AUDIT em faixa nociva",
  },
  peak: {
    no: "topp", en: "peak", sv: "topp", da: "top",
    de: "Spitze", fr: "pic", nl: "piek", it: "picco",
    es: "pico", fi: "huippu", pt: "pico",
  },
  endedOn: {
    no: "endte", en: "ended", sv: "slutade", da: "endte",
    de: "endete", fr: "terminé", nl: "eindigde", it: "terminata",
    es: "terminó", fi: "päättyi", pt: "terminou",
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