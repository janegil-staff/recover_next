// add_read_more_translation.cjs
const fs = require("fs");
const FILE = "src/translations/index.js";
let src = fs.readFileSync(FILE, "utf8");

const KEY = "readMore";
const VALUES = {
  no: "Les mer",
  en: "Read more",
  sv: "Läs mer",
  da: "Læs mere",
  de: "Mehr lesen",
  fr: "Lire la suite",
  nl: "Lees meer",
  it: "Leggi di più",
  es: "Leer más",
  fi: "Lue lisää",
  pt: "Ler mais",
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

let inserted = 0;
for (const block of [...findBlocks(lines)].reverse()) {
  const value = VALUES[block.lang];
  if (!value) continue;
  const body = lines.slice(block.open, block.close + 1).join("\n");
  if (new RegExp(`['"]${KEY}['"]\\s*:`).test(body)) continue;
  const innerIndent = block.indent + "  ";
  const prevLine = lines[block.close - 1];
  if (prevLine && !/,\s*$/.test(prevLine.trim()) && prevLine.trim() !== "{") {
    lines[block.close - 1] = prevLine.replace(/(\S)\s*$/, "$1,");
  }
  lines.splice(block.close, 0, `${innerIndent}'${KEY}': '${value.replace(/'/g, "\\'")}',`);
  inserted++;
}

fs.writeFileSync(FILE, lines.join("\n"));
console.log(`✅ Inserted ${KEY} into ${inserted} block(s)`);