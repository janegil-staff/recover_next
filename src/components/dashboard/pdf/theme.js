// Colors and page constants for the PDF modal and document.
export const A = "#4a7ab5";
export const AD = "#2d4a6e";
export const BO = "#d0dcea";
export const MU = "#7a9ab8";
export const SU = "#ffffff";
export const BG = "#eef2f7";

// PDF document RGB tuples (jsPDF uses 3-arg setColor)
export const NAVY = [45, 74, 110];
export const GRAY = [150, 170, 190];
export const LGRAY = [245, 247, 250];
export const DARK = [26, 44, 61];
export const WHITE = [255, 255, 255];

// Page geometry (A4 portrait, mm)
export const PAGE_W = 210;
export const PAGE_H = 297;
export const MARGIN_L = 14;
export const MARGIN_R = 14;
export const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
export const PAGE_BOTTOM = 272; // y at which we should call addPage

// Substance colors used in donut + list color squares
export const SC_COLORS = {
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