// Dynamic script loader for jsPDF and html2canvas (loaded from CDN to keep
// bundle small) and the captureElement helper that html2canvas drives.
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function captureElement(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    const canvas = await window.html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("capture failed", id, e);
    return null;
  }
}

export const JSPDF_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
export const HTML2CANVAS_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";