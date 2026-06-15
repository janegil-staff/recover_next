const fs = require("fs");

const FILE = "./src/translations/index.js";

const sober = {
  en: "Sober",
  no: "Rusfri",
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

for (const [lang, value] of Object.entries(sober)) {
  const regex = new RegExp(
    `(${lang}\\s*:\\s*\\{[\\s\\S]*?)(\\n\\s*alcohol\\s*:)`,
    "m"
  );

  if (!regex.test(text)) {
    console.log(`❌ Could not patch ${lang}`);
    continue;
  }

  text = text.replace(regex, (match, beforeAlcohol, alcoholLine) => {
    if (beforeAlcohol.includes("sober:")) {
      console.log(`✓ ${lang} already has sober`);
      return match;
    }

    console.log(`✅ Added sober to ${lang}: ${value}`);
    return `${beforeAlcohol}\n    sober: "${value}",${alcoholLine}`;
  });
}

fs.writeFileSync(FILE, text, "utf8");

console.log("Done. Check git diff.");