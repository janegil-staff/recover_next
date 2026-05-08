// fix_misplaced_keys.cjs
const fs = require("fs");
const path = require("path");

const FILE = path.resolve("src/translations/index.js");
let src = fs.readFileSync(FILE, "utf8");

// Keys we need to relocate to top-level of each language block
const KEYS_TO_RELOCATE = ["sober", "highCravings", "note"];

// Per-language values to ensure are present at the top level after fix.
const VALUES = {
  sober: {
    no: "Edru", en: "Sober", nl: "Nuchter", fr: "Sobre",
    de: "Nüchtern", it: "Sobrio", sv: "Nykter", da: "Ædru",
    fi: "Selvä", es: "Sobrio", pt: "Sóbrio",
  },
  highCravings: {
    no: "Høyt sug", en: "High cravings", nl: "Hevige trek", fr: "Forte envie",
    de: "Starkes Verlangen", it: "Forte desiderio", sv: "Starkt sug",
    da: "Stærk trang", fi: "Voimakas himo", es: "Antojos fuertes",
    pt: "Desejo intenso",
  },
  note: {
    no: "Notat", en: "Note", nl: "Notitie", fr: "Note",
    de: "Notiz", it: "Nota", sv: "Anteckning", da: "Note",
    fi: "Muistiinpano", es: "Nota", pt: "Nota",
  },
};

const lines = src.split("\n");

// Find every top-level language block by brace-counting
function findLanguageBlocks() {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([ \t]*)['"]?([a-z]{2})['"]?\s*:\s*\{\s*$/);
    if (!m) continue;
    const indent = m[1];
    // Only top-level: indent must be 0 or 2 spaces (not deeper)
    if (indent.length > 2) continue;
    const lang = m[2];
    // Now brace-count to find close
    let depth = 0;
    let close = -1;
    for (let j = i; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) { close = j; break; }
        }
      }
      if (close !== -1) break;
    }
    if (close !== -1) blocks.push({ lang, open: i, close, indent });
  }
  return blocks;
}

const blocks = findLanguageBlocks();
console.log(`📦 Found ${blocks.length} language blocks: ${blocks.map(b => b.lang).join(", ")}`);

// Step 1: remove EVERY occurrence of these keys anywhere in the file
let removed = 0;
for (let i = 0; i < lines.length; i++) {
  for (const k of KEYS_TO_RELOCATE) {
    const re = new RegExp(`['"]${k}['"]\\s*:\\s*['"][^'"]*['"]\\s*,?\\s*$`);
    if (re.test(lines[i].trim())) {
      lines[i] = "__DELETE_ME__";
      removed++;
      break;
    }
  }
}
console.log(`🧹 Marked ${removed} misplaced key line(s) for removal.`);

// Step 2: rebuild blocks list using the modified line numbers (kept lines)
let cleaned = lines.filter((l) => l !== "__DELETE_ME__");
src = cleaned.join("\n");

// Re-find blocks in the cleaned source
const cleanedLines = src.split("\n");
const cleanBlocks = (() => {
  const blocks = [];
  for (let i = 0; i < cleanedLines.length; i++) {
    const m = cleanedLines[i].match(/^([ \t]*)['"]?([a-z]{2})['"]?\s*:\s*\{\s*$/);
    if (!m) continue;
    if (m[1].length > 2) continue;
    const lang = m[2];
    let depth = 0, close = -1;
    for (let j = i; j < cleanedLines.length; j++) {
      for (const ch of cleanedLines[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") { depth--; if (depth === 0) { close = j; break; } }
      }
      if (close !== -1) break;
    }
    if (close !== -1) blocks.push({ lang, open: i, close, indent: m[1] });
  }
  return blocks;
})();

// Step 3: insert keys at top level (just before each block's close brace)
let inserted = 0;
// Process from bottom to top so line numbers don't shift
for (const block of [...cleanBlocks].reverse()) {
  const blockIndent = block.indent;
  const innerIndent = blockIndent + "  ";
  const insertions = [];
  for (const key of KEYS_TO_RELOCATE) {
    const value = VALUES[key]?.[block.lang];
    if (!value) continue;
    insertions.push(`${innerIndent}'${key}': '${value}',`);
    inserted++;
  }
  if (!insertions.length) continue;

  // Look at the line BEFORE close — if it doesn't end with comma, add one
  const closeLine = block.close;
  const prevLine = cleanedLines[closeLine - 1];
  let prependFix = "";
  if (prevLine && !/,\s*$/.test(prevLine.trim()) && prevLine.trim() !== "{") {
    cleanedLines[closeLine - 1] = prevLine.replace(/(\S)\s*$/, "$1,");
  }

  // Insert before close
  cleanedLines.splice(closeLine, 0, ...insertions);
}

console.log(`✅ Inserted ${inserted} key(s) at top level of language blocks.`);

fs.writeFileSync(FILE, cleanedLines.join("\n"));
console.log(`💾 Wrote ${FILE}`);