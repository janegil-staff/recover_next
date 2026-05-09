// Theme tokens and chart colors for the graphs page.
// Centralizes all the var() lookups and hardcoded chart palettes.

export const TX_VAR = "var(--text)";
export const MU_VAR = "var(--text-muted)";
export const AD_VAR = "var(--accent-strong)";
export const SU_VAR = "var(--card)";
export const BO_VAR = "var(--card-border)";

// Recharts can't read CSS variables directly — needs concrete colors per theme.
// Page picks light/dark based on ThemeContext and passes the right object as `c`.
export const CHART_COLORS = {
  light: {
    accent: "#4a7ab5",
    accentStrong: "#2d4a6e",
    text: "#1a2c3d",
    muted: "#7a9ab8",
    grid: "#d0dcea",
    surface: "#ffffff",
    border: "#d0dcea",
  },
  dark: {
    accent: "#7aabdb",
    accentStrong: "#a8c8e8",
    text: "#e2e8f0",
    muted: "#94a8be",
    grid: "#2a3a52",
    surface: "#1a2535",
    border: "#2a3a52",
  },
};

// Substance color palette — matches log/calendar pages
export const SC = {
  alcohol: "#7986cb",
  cannabis: "#66bb6a",
  cocaine: "#ef5350",
  opioids: "#ab47bc",
  amphetamines: "#ff7043",
  benzodiazepines: "#26a69a",
  tobacco: "#8d6e63",
  prescription: "#42a5f5",
  mdma: "#ec407a",
  ecstasy: "#ec407a",
  ghb: "#00acc1",
  acid: "#9c27b0",
  other: "#bdbdbd",
};