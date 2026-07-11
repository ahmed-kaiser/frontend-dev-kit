import type { GradientState, GradientStop } from "../types";

/* ---------- constants ---------- */
export const TYPES = ["linear", "radial", "conic"];
export const RADIAL_SHAPES = ["circle", "ellipse"];
export const ANGLE_QUICK = [0, 45, 90, 135, 180, 225, 270, 315];

/* ---------- id + factories ---------- */
let _uid = 1;

export const mkStop = (over: Partial<GradientStop> = {}): GradientStop => ({
  id: _uid++, color: "#6c8cff", alpha: 100, pos: 0, ...over,
});

export const freshState = (): GradientState => ({
  type: "linear",
  angle: 90,
  radialShape: "circle",
  posX: 50,
  posY: 50,
  stops: [
    mkStop({ color: "#6c8cff", pos: 0 }),
    mkStop({ color: "#8a63ff", pos: 100 }),
  ],
  selected: 0,
});

/* ---------- color helpers ---------- */
export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Emit hex at full opacity (alpha 0–100), otherwise rgba(). */
export function rgba(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  const [r, g, b] = hexToRgb(hex);
  const a = Math.round((alpha / 100) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/* ---------- code generation ---------- */
export const stopStr = (s: GradientStop): string => `${rgba(s.color, s.alpha)} ${s.pos}%`;

/** Stops sorted by position, as a comma-separated color-stop list. */
export const sortedStops = (S: GradientState): GradientStop[] =>
  [...S.stops].sort((a, b) => a.pos - b.pos);

export function gradientValue(S: GradientState): string {
  const stops = sortedStops(S).map(stopStr).join(", ");
  if (S.type === "radial") return `radial-gradient(${S.radialShape} at ${S.posX}% ${S.posY}%, ${stops})`;
  if (S.type === "conic") return `conic-gradient(from ${S.angle}deg at ${S.posX}% ${S.posY}%, ${stops})`;
  return `linear-gradient(${S.angle}deg, ${stops})`;
}

/** Horizontal linear rendering of the stops, for the editor's gradient bar. */
export const barValue = (S: GradientState): string =>
  `linear-gradient(90deg, ${sortedStops(S).map(stopStr).join(", ")})`;

export function buildCSS(S: GradientState): string {
  return [".gradient {", `  background: ${gradientValue(S)};`, "}"].join("\n");
}

export function buildHTML(_S: GradientState): string {
  return '<div class="gradient"></div>';
}
