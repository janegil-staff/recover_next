#!/usr/bin/env node
/**
 * patch-download-i18n.cjs
 *
 * Idempotent: inserts the download-landing (/last-ned) i18n keys into all 12
 * per-language JSON files for Qup Recover.
 *
 * Usage:
 *   node patch-download-i18n.cjs [localesDir]      (default ./locales)
 *   node patch-download-i18n.cjs <dir> --force     (overwrite existing values)
 *
 * Re-running is a no-op unless --force: only missing keys are added per file,
 * so it's safe to run repeatedly and won't clobber manual tweaks.
 */

const fs = require("fs");
const path = require("path");

const LANGS = [
  "no",
  "en",
  "nl",
  "fr",
  "de",
  "it",
  "sv",
  "da",
  "fi",
  "es",
  "pl",
  "pt",
];

// Per-language values for each key. Keep them short; these render on a small
// centered landing page.
const STRINGS = {
  dlTitle: {
    no: "Last ned Qup Recover",
    en: "Download Qup Recover",
    nl: "Download Qup Recover",
    fr: "Télécharger Qup Recover",
    de: "Qup Recover herunterladen",
    it: "Scarica Qup Recover",
    sv: "Ladda ner Qup Recover",
    da: "Download Qup Recover",
    fi: "Lataa Qup Recover",
    es: "Descarga Qup Recover",
    pl: "Pobierz Qup Recover",
    pt: "Baixe o Qup Recover",
  },
  dlSubtitle: {
    no: "Følg din egen restitusjon og fremgang. Tilgjengelig på iOS og Android.",
    en: "Track your recovery and progress. Available on iOS and Android.",
    nl: "Volg je herstel en voortgang. Beschikbaar op iOS en Android.",
    fr: "Suivez votre récupération et vos progrès. Disponible sur iOS et Android.",
    de: "Verfolge deine Erholung und Fortschritte. Verfügbar für iOS und Android.",
    it: "Monitora il tuo recupero e i tuoi progressi. Disponibile su iOS e Android.",
    sv: "Följ din återhämtning och dina framsteg. Finns för iOS och Android.",
    da: "Følg din restitution og fremgang. Tilgængelig på iOS og Android.",
    fi: "Seuraa palautumistasi ja edistymistäsi. Saatavilla iOS:lle ja Androidille.",
    es: "Sigue tu recuperación y progreso. Disponible en iOS y Android.",
    pl: "Śledź swoją regenerację i postępy. Dostępne na iOS i Android.",
    pt: "Acompanhe a sua recuperação e o seu progresso. Disponível para iOS e Android.",
  },
  dlRedirecting: {
    no: "Sender deg til riktig app-butikk …",
    en: "Sending you to the right app store …",
    nl: "Je wordt naar de juiste appstore gestuurd …",
    fr: "Redirection vers la bonne boutique d'applications …",
    de: "Du wirst zum richtigen App-Store weitergeleitet …",
    it: "Ti stiamo reindirizzando allo store giusto …",
    sv: "Skickar dig till rätt appbutik …",
    da: "Sender dig til den rette app-butik …",
    fi: "Sinut ohjataan oikeaan sovelluskauppaan …",
    es: "Te estamos enviando a la tienda de apps correcta …",
    pl: "Przekierowujemy Cię do właściwego sklepu z aplikacjami …",
    pt: "A redirecioná-lo para a loja de aplicações correta …",
  },
  dlChoose: {
    no: "Velg din plattform:",
    en: "Choose your platform:",
    nl: "Kies je platform:",
    fr: "Choisissez votre plateforme :",
    de: "Wähle deine Plattform:",
    it: "Scegli la tua piattaforma:",
    sv: "Välj din plattform:",
    da: "Vælg din platform:",
    fi: "Valitse alustasi:",
    es: "Elige tu plataforma:",
    pl: "Wybierz swoją platformę:",
    pt: "Escolha a sua plataforma:",
  },
  dlAppStore: {
    no: "Last ned på App Store",
    en: "Download on the App Store",
    nl: "Downloaden in de App Store",
    fr: "Télécharger dans l'App Store",
    de: "Im App Store laden",
    it: "Scarica su App Store",
    sv: "Ladda ner i App Store",
    da: "Hent i App Store",
    fi: "Lataa App Storesta",
    es: "Descargar en el App Store",
    pl: "Pobierz w App Store",
    pt: "Descarregar na App Store",
  },
  dlGooglePlay: {
    no: "Få den på Google Play",
    en: "Get it on Google Play",
    nl: "Ontdek het op Google Play",
    fr: "Disponible sur Google Play",
    de: "Jetzt bei Google Play",
    it: "Disponibile su Google Play",
    sv: "Hämta på Google Play",
    da: "Hent den på Google Play",
    fi: "Lataa Google Playstä",
    es: "Disponible en Google Play",
    pl: "Pobierz z Google Play",
    pt: "Disponível no Google Play",
  },
  dlFallbackNote: {
    no: "Ble du ikke sendt videre? Trykk på knappen for din enhet.",
    en: "Not redirected? Tap the button for your device.",
    nl: "Niet doorgestuurd? Tik op de knop voor je apparaat.",
    fr: "Pas redirigé ? Appuyez sur le bouton correspondant à votre appareil.",
    de: "Nicht weitergeleitet? Tippe auf die Schaltfläche für dein Gerät.",
    it: "Non sei stato reindirizzato? Tocca il pulsante per il tuo dispositivo.",
    sv: "Inte omdirigerad? Tryck på knappen för din enhet.",
    da: "Blev du ikke sendt videre? Tryk på knappen for din enhed.",
    fi: "Eikö ohjaus toiminut? Napauta laitteesi painiketta.",
    es: "¿No te redirigió? Toca el botón de tu dispositivo.",
    pl: "Nie przekierowano? Naciśnij przycisk dla swojego urządzenia.",
    pt: "Não foi redirecionado? Toque no botão do seu dispositivo.",
  },
};

const KEYS = Object.keys(STRINGS);

const force = process.argv.includes("--force");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const localesDir = path.resolve(args[0] || "src/lib/translations");

if (!fs.existsSync(localesDir)) {
  console.error(`✗ locales dir not found: ${localesDir}`);
  console.error(
    `  Pass the correct path: node ${path.basename(__filename)} <localesDir>`,
  );
  process.exit(1);
}

function detectIndent(raw) {
  const m = raw.match(/\n([ \t]+)["{]/);
  if (!m) return 2;
  return m[1].includes("\t") ? "\t" : m[1].length;
}

let filesTouched = 0;
let keysAdded = 0;
let missing = 0;

for (const lang of LANGS) {
  const file = path.join(localesDir, `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`! missing  ${lang}.json — skipped`);
    missing++;
    continue;
  }

  const raw = fs.readFileSync(file, "utf8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error(`✗ ${lang}.json is not valid JSON: ${e.message}`);
    process.exitCode = 1;
    continue;
  }

  let localAdded = 0;
  for (const key of KEYS) {
    const value = STRINGS[key][lang];
    if (value == null) continue; // safety: never write undefined
    if (!Object.prototype.hasOwnProperty.call(json, key) || force) {
      if (json[key] !== value) {
        json[key] = value;
        localAdded++;
      }
    }
  }

  if (localAdded > 0) {
    const indent = detectIndent(raw);
    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
    fs.writeFileSync(
      file,
      JSON.stringify(json, null, indent) + trailingNewline,
    );
    console.log(`✓ ${lang}.json — ${localAdded} key(s)`);
    filesTouched++;
    keysAdded += localAdded;
  }
}

console.log(
  `\nDone. ${keysAdded} key(s) across ${filesTouched} file(s); ${missing} missing.`,
);
