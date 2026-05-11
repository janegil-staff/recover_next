#!/usr/bin/env python3
"""
patch_substance_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds substance-name translation keys to all 12 languages in
src/translations/index.js.

These are used by the OffscreenCharts substance radar (PDF export) and any
other place that does `t[substanceName] ?? capitalize(substanceName)`.

Idempotent — running it twice does nothing the second time, and adds only
the keys that aren't already present for each language.
"""
import re
import sys
from pathlib import Path

PATH = Path("src/translations/index.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    sys.exit(1)

# Substance translations across 12 languages.
# Keys are lowercase, matching how substances are stored in records.
SUBSTANCES = {
    "alcohol": {
        "en": "Alcohol",
        "no": "Alkohol",
        "sv": "Alkohol",
        "da": "Alkohol",
        "de": "Alkohol",
        "fr": "Alcool",
        "nl": "Alcohol",
        "it": "Alcol",
        "es": "Alcohol",
        "fi": "Alkoholi",
        "pt": "Álcool",
        "pl": "Alkohol",
    },
    "cannabis": {
        "en": "Cannabis",
        "no": "Cannabis",
        "sv": "Cannabis",
        "da": "Cannabis",
        "de": "Cannabis",
        "fr": "Cannabis",
        "nl": "Cannabis",
        "it": "Cannabis",
        "es": "Cannabis",
        "fi": "Kannabis",
        "pt": "Cannabis",
        "pl": "Marihuana",
    },
    "cocaine": {
        "en": "Cocaine",
        "no": "Kokain",
        "sv": "Kokain",
        "da": "Kokain",
        "de": "Kokain",
        "fr": "Cocaïne",
        "nl": "Cocaïne",
        "it": "Cocaina",
        "es": "Cocaína",
        "fi": "Kokaiini",
        "pt": "Cocaína",
        "pl": "Kokaina",
    },
    "heroin": {
        "en": "Heroin",
        "no": "Heroin",
        "sv": "Heroin",
        "da": "Heroin",
        "de": "Heroin",
        "fr": "Héroïne",
        "nl": "Heroïne",
        "it": "Eroina",
        "es": "Heroína",
        "fi": "Heroiini",
        "pt": "Heroína",
        "pl": "Heroina",
    },
    "amphetamine": {
        "en": "Amphetamine",
        "no": "Amfetamin",
        "sv": "Amfetamin",
        "da": "Amfetamin",
        "de": "Amphetamin",
        "fr": "Amphétamine",
        "nl": "Amfetamine",
        "it": "Anfetamina",
        "es": "Anfetamina",
        "fi": "Amfetamiini",
        "pt": "Anfetamina",
        "pl": "Amfetamina",
    },
    "methamphetamine": {
        "en": "Methamphetamine",
        "no": "Metamfetamin",
        "sv": "Metamfetamin",
        "da": "Metamfetamin",
        "de": "Methamphetamin",
        "fr": "Méthamphétamine",
        "nl": "Methamfetamine",
        "it": "Metanfetamina",
        "es": "Metanfetamina",
        "fi": "Metamfetamiini",
        "pt": "Metanfetamina",
        "pl": "Metamfetamina",
    },
    "mdma": {
        "en": "MDMA",
        "no": "MDMA",
        "sv": "MDMA",
        "da": "MDMA",
        "de": "MDMA",
        "fr": "MDMA",
        "nl": "MDMA",
        "it": "MDMA",
        "es": "MDMA",
        "fi": "MDMA",
        "pt": "MDMA",
        "pl": "MDMA",
    },
    "ecstasy": {
        "en": "Ecstasy",
        "no": "Ecstasy",
        "sv": "Ecstasy",
        "da": "Ecstasy",
        "de": "Ecstasy",
        "fr": "Ecstasy",
        "nl": "Ecstasy",
        "it": "Ecstasy",
        "es": "Éxtasis",
        "fi": "Ekstaasi",
        "pt": "Ecstasy",
        "pl": "Ekstazy",
    },
    "ketamine": {
        "en": "Ketamine",
        "no": "Ketamin",
        "sv": "Ketamin",
        "da": "Ketamin",
        "de": "Ketamin",
        "fr": "Kétamine",
        "nl": "Ketamine",
        "it": "Ketamina",
        "es": "Ketamina",
        "fi": "Ketamiini",
        "pt": "Cetamina",
        "pl": "Ketamina",
    },
    "lsd": {
        "en": "LSD",
        "no": "LSD",
        "sv": "LSD",
        "da": "LSD",
        "de": "LSD",
        "fr": "LSD",
        "nl": "LSD",
        "it": "LSD",
        "es": "LSD",
        "fi": "LSD",
        "pt": "LSD",
        "pl": "LSD",
    },
    "psilocybin": {
        "en": "Psilocybin",
        "no": "Psilocybin",
        "sv": "Psilocybin",
        "da": "Psilocybin",
        "de": "Psilocybin",
        "fr": "Psilocybine",
        "nl": "Psilocybine",
        "it": "Psilocibina",
        "es": "Psilocibina",
        "fi": "Psilosybiini",
        "pt": "Psilocibina",
        "pl": "Psylocybina",
    },
    "mushrooms": {
        "en": "Mushrooms",
        "no": "Sopp",
        "sv": "Svamp",
        "da": "Svampe",
        "de": "Pilze",
        "fr": "Champignons",
        "nl": "Paddo's",
        "it": "Funghi",
        "es": "Setas",
        "fi": "Sienet",
        "pt": "Cogumelos",
        "pl": "Grzyby",
    },
    "opioids": {
        "en": "Opioids",
        "no": "Opioider",
        "sv": "Opioider",
        "da": "Opioider",
        "de": "Opioide",
        "fr": "Opioïdes",
        "nl": "Opioïden",
        "it": "Oppioidi",
        "es": "Opioides",
        "fi": "Opioidit",
        "pt": "Opioides",
        "pl": "Opioidy",
    },
    "benzodiazepines": {
        "en": "Benzodiazepines",
        "no": "Benzodiazepiner",
        "sv": "Benzodiazepiner",
        "da": "Benzodiazepiner",
        "de": "Benzodiazepine",
        "fr": "Benzodiazépines",
        "nl": "Benzodiazepines",
        "it": "Benzodiazepine",
        "es": "Benzodiazepinas",
        "fi": "Bentsodiatsepiinit",
        "pt": "Benzodiazepinas",
        "pl": "Benzodiazepiny",
    },
    "nicotine": {
        "en": "Nicotine",
        "no": "Nikotin",
        "sv": "Nikotin",
        "da": "Nikotin",
        "de": "Nikotin",
        "fr": "Nicotine",
        "nl": "Nicotine",
        "it": "Nicotina",
        "es": "Nicotina",
        "fi": "Nikotiini",
        "pt": "Nicotina",
        "pl": "Nikotyna",
    },
    "tobacco": {
        "en": "Tobacco",
        "no": "Tobakk",
        "sv": "Tobak",
        "da": "Tobak",
        "de": "Tabak",
        "fr": "Tabac",
        "nl": "Tabak",
        "it": "Tabacco",
        "es": "Tabaco",
        "fi": "Tupakka",
        "pt": "Tabaco",
        "pl": "Tytoń",
    },
    "ghb": {
        "en": "GHB",
        "no": "GHB",
        "sv": "GHB",
        "da": "GHB",
        "de": "GHB",
        "fr": "GHB",
        "nl": "GHB",
        "it": "GHB",
        "es": "GHB",
        "fi": "GHB",
        "pt": "GHB",
        "pl": "GHB",
    },
    "inhalants": {
        "en": "Inhalants",
        "no": "Inhalanter",
        "sv": "Inhalanter",
        "da": "Inhalanter",
        "de": "Inhalantien",
        "fr": "Inhalants",
        "nl": "Inhalanten",
        "it": "Inalanti",
        "es": "Inhalantes",
        "fi": "Inhaloitavat aineet",
        "pt": "Inalantes",
        "pl": "Wziewne",
    },
}


def main():
    src = PATH.read_text(encoding="utf-8")

    # Anchor for inserting into each language block. We use 'noneThisMonth'
    # because it's present in all 12 languages (verified from earlier grep).
    ANCHOR = "'noneThisMonth':"

    # Walk language headers to know which block we're inside
    LANG_HEADER_RE = re.compile(r"^\s*(\w{2}):\s*\{\s*$", re.MULTILINE)
    SUPPORTED_LANGS = set(next(iter(SUBSTANCES.values())).keys())

    lines = src.splitlines(keepends=True)

    # Build lang-for-each-line map
    lang_for_line = {}
    current_lang = None
    for i, line in enumerate(lines):
        m = LANG_HEADER_RE.match(line)
        if m and m.group(1) in SUPPORTED_LANGS:
            current_lang = m.group(1)
        lang_for_line[i] = current_lang

    # For each language, figure out which substance keys are MISSING.
    # We do this by extracting each language block and checking for the key.
    # Cheaper than re-parsing: just search the language's block of text.
    # A block runs from one language header to the next.

    # Build (start_line, end_line, lang) tuples for each language block
    blocks = []
    header_lines = []
    for i, line in enumerate(lines):
        m = LANG_HEADER_RE.match(line)
        if m and m.group(1) in SUPPORTED_LANGS:
            header_lines.append((i, m.group(1)))
    for idx, (start, lang) in enumerate(header_lines):
        end = header_lines[idx + 1][0] if idx + 1 < len(header_lines) else len(lines)
        blocks.append((start, end, lang))

    # For each language block, compute the set of already-present substance keys
    block_existing = {}
    for start, end, lang in blocks:
        block_text = "".join(lines[start:end])
        existing = set()
        for sub_key in SUBSTANCES:
            # Match either bare or quoted key form, must be followed by colon
            if re.search(rf"['\"]?{re.escape(sub_key)}['\"]?\s*:", block_text):
                existing.add(sub_key)
        block_existing[lang] = existing

    # Insert missing keys before the noneThisMonth line within each block
    out_lines = []
    inserted_per_lang = {lang: 0 for lang in SUPPORTED_LANGS}

    for i, line in enumerate(lines):
        if ANCHOR in line:
            lang = lang_for_line.get(i)
            if lang and lang in SUPPORTED_LANGS:
                existing = block_existing.get(lang, set())
                missing = [k for k in SUBSTANCES if k not in existing]
                if missing:
                    indent_match = re.match(r"^(\s*)", line)
                    indent = indent_match.group(1) if indent_match else "    "
                    for sub_key in missing:
                        translation = SUBSTANCES[sub_key][lang]
                        # Escape single quotes in the translation
                        translation_escaped = translation.replace("'", "\\'")
                        new_line = f"{indent}'{sub_key}': '{translation_escaped}',\n"
                        out_lines.append(new_line)
                        inserted_per_lang[lang] += 1
        out_lines.append(line)

    if sum(inserted_per_lang.values()) == 0:
        print("✓ All substance translations already present — nothing to do.")
        return

    PATH.write_text("".join(out_lines), encoding="utf-8")

    print("✓ Substance translations patched.")
    print(f"  File: {PATH}")
    print()
    print("  Inserted per language:")
    for lang in sorted(inserted_per_lang):
        count = inserted_per_lang[lang]
        if count > 0:
            print(f"    {lang}: +{count} key(s)")
        else:
            print(f"    {lang}: (already complete)")


if __name__ == "__main__":
    main()