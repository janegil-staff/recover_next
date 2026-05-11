#!/usr/bin/env python3
"""
patch_monthly_trends.py
─────────────────────────────────────────────────────────────────────────────
Adds the `monthlyTrends` translation key to all 12 languages in
src/translations/index.js.

This patches the *active* translation file (`index.js`) only — does NOT
touch the `index copy*.js` files cluttering the folder.

Idempotent — running it twice does nothing the second time.
"""
import re
import sys
from pathlib import Path

PATH = Path("src/translations/index.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    sys.exit(1)

# Translations for "Monthly averages" — the card title shown above the
# MonthlyTrendsCard in the dashboard sidebar.
TRANSLATIONS = {
    "en": "Monthly averages",
    "no": "Månedlige gjennomsnitt",
    "sv": "Månadsgenomsnitt",
    "da": "Månedlige gennemsnit",
    "de": "Monatliche Durchschnitte",
    "fr": "Moyennes mensuelles",
    "nl": "Maandelijkse gemiddelden",
    "it": "Medie mensili",
    "es": "Promedios mensuales",
    "fi": "Kuukausikeskiarvot",
    "pt": "Médias mensais",
    "pl": "Średnie miesięczne",
}

src = PATH.read_text(encoding="utf-8")

# Anchor we use to identify each language block: the `noneThisMonth` line
# already exists in every language. We insert `monthlyTrends` right before it.
ANCHOR_RE = re.compile(r"^(\s*)'noneThisMonth':\s*'", re.MULTILINE)

# Quick exit if already patched
if "monthlyTrends" in src:
    print("✓ `monthlyTrends` already present — nothing to do.")
    sys.exit(0)

# To know WHICH language we're inserting into, we walk language headers.
# Each language block opens with a pattern like:   en: {     or   no: {
# We track which one we're currently inside.
LANG_HEADER_RE = re.compile(r"^\s*(\w{2}):\s*\{\s*$", re.MULTILINE)

# Build a list of (line_index, lang) pairs by walking the file
lines = src.splitlines(keepends=True)
lang_for_line = {}
current_lang = None
for i, line in enumerate(lines):
    m = LANG_HEADER_RE.match(line)
    if m and m.group(1) in TRANSLATIONS:
        current_lang = m.group(1)
    lang_for_line[i] = current_lang

# Insert `monthlyTrends` just before each `noneThisMonth` line
patched_count = 0
out_lines = []
for i, line in enumerate(lines):
    if "'noneThisMonth':" in line:
        lang = lang_for_line.get(i)
        if lang and lang in TRANSLATIONS:
            # Match the indentation of the noneThisMonth line
            indent_match = re.match(r"^(\s*)", line)
            indent = indent_match.group(1) if indent_match else "    "
            new_line = f"{indent}'monthlyTrends': '{TRANSLATIONS[lang]}',\n"
            out_lines.append(new_line)
            patched_count += 1
    out_lines.append(line)

if patched_count == 0:
    print("⚠ Could not find any `noneThisMonth` anchor lines — file structure may have changed.")
    sys.exit(1)

PATH.write_text("".join(out_lines), encoding="utf-8")
print(f"✓ Inserted `monthlyTrends` in {patched_count} language block(s).")
print(f"  Patched: {PATH}")