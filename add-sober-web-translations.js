const fs = require("fs");

const FILE = "./src/translations/index.js";

const soberTranslations = {
  en: "Sober",
  no: "Edru",
  de: "Nüchtern",
  da: "Rusfri",
  sv: "Nykter",
  fi: "Raitis",
  fr: "Sobre",
  es: "Sobrio",
  it: "Sobrio",
  nl: "Nuchter",
  pl: "Trzeźwy",
  pt: "Sóbrio",
};

let text = fs.readFileSync(FILE, "utf8");

for (const [lang, label] of Object.entries(soberTranslations)) {
  const langBlockRegex = new RegExp(
    `(${lang}\\s*:\\s*\\{[\\s\\S]*?)(\\n\\s*alcohol\\s*:)`,
    "m"
  );

  if (!langBlockRegex.test(text)) {
    console.log(`Could not find ${lang} block with alcohol key`);
    continue;
  }

  text = text.replace(langBlockRegex, (match, beforeAlcohol, alcoholLine) => {
    if (/\n\s*sober\s*:/.test(beforeAlcohol)) {
      return beforeAlcohol.replace(
        /\n\s*sober\s*:\s*["'`][^"'`]*["'`]\s*,?/,
        `\n    sober: "${label}",`
      ) + alcoholLine;
    }

    return `${beforeAlcohol}\n    sober: "${label}",${alcoholLine}`;
  });

  console.log(`Updated ${lang}: ${label}`);
}

fs.writeFileSync(FILE, text, "utf8");
console.log("Done. Check git diff.");