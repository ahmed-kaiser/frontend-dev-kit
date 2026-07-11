import type { ColorState } from "../types";

/* ---------- constants ---------- */
export const STAGES = ["checker", "dark", "light"];

/** Preset swatches for quick selection (hex). */
export const PRESETS = [
  "#6c8cff", "#8a63ff", "#e05a6d", "#e0b26b",
  "#46d1a2", "#4f6ef0", "#111827", "#f8fafc",
];

/* ---------- factory ---------- */
export const freshState = (): ColorState => ({
  r: 108, g: 140, b: 255, // #6c8cff, the app accent
  alpha: 100,
  stage: "checker",
});

/* ---------- small utils ---------- */
const clamp = (n: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, n));
/** Trim trailing zeros from a fixed-precision number: 0.50 -> "0.5", 62.00 -> "62". */
const trim = (n: number, dp: number) => String(Number(n.toFixed(dp)));

/* =====================================================================
   HEX  <->  sRGB (0–255)
   ===================================================================== */
export function hexToRgb(hex: string): { r: number; g: number; b: number; alpha?: number } | null {
  let h = hex.replace(/^#/, "").trim();
  if (/^[0-9a-fA-F]{3,4}$/.test(h)) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(h)) return null;
  const n = parseInt(h.slice(0, 6), 16);
  const out: { r: number; g: number; b: number; alpha?: number } = {
    r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255,
  };
  if (h.length === 8) out.alpha = Math.round((parseInt(h.slice(6, 8), 16) / 255) * 100);
  return out;
}

const hex2 = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, "0");

/** "#rrggbb", or "#rrggbbaa" when alpha < 100. */
export function toHex(S: ColorState): string {
  const base = "#" + hex2(S.r) + hex2(S.g) + hex2(S.b);
  if (S.alpha >= 100) return base;
  return base + hex2((S.alpha / 100) * 255);
}

/* =====================================================================
   sRGB  <->  HSL
   ===================================================================== */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

/* =====================================================================
   sRGB  <->  OKLCH  (via linear-light sRGB and OKLab)
   Coefficients from Björn Ottosson's OKLab specification.
   ===================================================================== */
const srgbToLinear = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const linearToSrgb = (c: number) => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return v * 255;
};

export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);

  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  let h = (Math.atan2(bb, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L * 100, c, h };
}

export function oklchToRgb(L: number, C: number, H: number): { r: number; g: number; b: number } {
  L /= 100;
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  return { r: clamp(linearToSrgb(lr)), g: clamp(linearToSrgb(lg)), b: clamp(linearToSrgb(lb)) };
}

/** True if the OKLCH color falls outside the sRGB gamut (before clamping). */
export function outOfGamut(L: number, C: number, H: number): boolean {
  L /= 100;
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr), b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  const eps = 0.001;
  return [lr, lg, lb].some((v) => v < -eps || v > 1 + eps);
}

/* =====================================================================
   Derived views + format strings
   ===================================================================== */
export const hsl = (S: ColorState) => rgbToHsl(S.r, S.g, S.b);
export const oklch = (S: ColorState) => rgbToOklch(S.r, S.g, S.b);
const alphaF = (S: ColorState) => Number((S.alpha / 100).toFixed(3));

export function toRgbStr(S: ColorState): string {
  const [r, g, b] = [S.r, S.g, S.b].map((n) => Math.round(n));
  return S.alpha >= 100 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${alphaF(S)})`;
}

export function toHslStr(S: ColorState): string {
  const { h, s, l } = hsl(S);
  const H = Math.round(h), Sr = Math.round(s), L = Math.round(l);
  return S.alpha >= 100 ? `hsl(${H}, ${Sr}%, ${L}%)` : `hsla(${H}, ${Sr}%, ${L}%, ${alphaF(S)})`;
}

export function toOklchStr(S: ColorState): string {
  const { l, c, h } = oklch(S);
  const core = `${trim(l, 2)}% ${trim(c, 4)} ${trim(h, 2)}`;
  return S.alpha >= 100 ? `oklch(${core})` : `oklch(${core} / ${alphaF(S)})`;
}

export interface FormatRow { key: string; label: string; value: string; }

export const formatRows = (S: ColorState): FormatRow[] => [
  { key: "hex", label: "HEX", value: toHex(S) },
  { key: "rgb", label: "RGB", value: toRgbStr(S) },
  { key: "hsl", label: "HSL", value: toHslStr(S) },
  { key: "oklch", label: "OKLCH", value: toOklchStr(S) },
];

/* Solid CSS color for previews (always includes alpha via rgba). */
export const cssColor = (S: ColorState): string =>
  `rgba(${Math.round(S.r)}, ${Math.round(S.g)}, ${Math.round(S.b)}, ${alphaF(S)})`;

/* =====================================================================
   Code generation
   ===================================================================== */
export function buildCSS(S: ColorState): string {
  return [
    ":root {",
    `  --color: ${toHex(S)};`,
    `  --color-rgb: ${toRgbStr(S)};`,
    `  --color-hsl: ${toHslStr(S)};`,
    `  --color-oklch: ${toOklchStr(S)};`,
    "}",
  ].join("\n");
}

export function buildHTML(_S: ColorState): string {
  return '<div class="swatch" style="background: var(--color)"></div>';
}
