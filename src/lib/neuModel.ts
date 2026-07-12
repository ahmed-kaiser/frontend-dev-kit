import type { NeuState } from "../types";

/* ---------- constants ---------- */
export const SHAPES = ["flat", "concave", "convex", "pressed"];
export const GRAD_ANGLE = 145; // light comes from the top-left

/** Base-surface presets (opaque). */
export const PRESETS = [
  "#e0e5ec", // classic light gray
  "#2c3038", // dark slate
  "#efeeee", // warm off-white
  "#dde1f0", // cool lavender
  "#c8d0e7", // periwinkle
  "#3a2f4d", // dark plum
];

/* ---------- factory ---------- */
export const freshState = (): NeuState => ({
  bg: "#e0e5ec",
  distance: 12,
  blur: 24,
  intensity: 18,
  radius: 28,
  shape: "flat",
  size: 200,
  stageTint: 0,
});

/* ---------- color helpers ---------- */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const clamp255 = (n: number) => Math.min(255, Math.max(0, Math.round(n)));
const hex2 = (n: number) => clamp255(n).toString(16).padStart(2, "0");

/** Shade a hex color by a percent: positive brightens, negative darkens (channel-proportional,
    the same multiplicative shade neumorphism generators use). */
export function shade(hex: string, percent: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (100 + percent) / 100;
  return "#" + hex2(r * f) + hex2(g * f) + hex2(b * f);
}

/* Derived light / dark shadow colors from the base + intensity. */
export const darkColor = (S: NeuState) => shade(S.bg, -S.intensity);
export const lightColor = (S: NeuState) => shade(S.bg, S.intensity);

/* ---------- value builders ---------- */
/** Element background: a solid base, or a subtle surface gradient for concave / convex. */
export function backgroundValue(S: NeuState): string {
  if (S.shape === "convex") return `linear-gradient(${GRAD_ANGLE}deg, ${shade(S.bg, 7)}, ${shade(S.bg, -7)})`;
  if (S.shape === "concave") return `linear-gradient(${GRAD_ANGLE}deg, ${shade(S.bg, -7)}, ${shade(S.bg, 7)})`;
  return S.bg;
}

/** The dual box-shadow — outset for raised shapes, inset for pressed. */
export function shadowValue(S: NeuState): string {
  const d = S.distance, b = S.blur;
  const dark = darkColor(S), light = lightColor(S);
  if (S.shape === "pressed") {
    return `inset ${d}px ${d}px ${b}px ${dark}, inset -${d}px -${d}px ${b}px ${light}`;
  }
  return `${d}px ${d}px ${b}px ${dark}, -${d}px -${d}px ${b}px ${light}`;
}

/* ---------- code generation ---------- */
export function buildCSS(S: NeuState): string {
  return [
    ".neu {",
    `  width: ${S.size}px;`,
    `  height: ${S.size}px;`,
    `  border-radius: ${S.radius}px;`,
    `  background: ${backgroundValue(S)};`,
    "  box-shadow:",
    `    ${shadowValue(S).replace(", ", ",\n    ")};`,
    "}",
  ].join("\n");
}

export function buildHTML(_S: NeuState): string {
  return '<div class="neu"></div>';
}
