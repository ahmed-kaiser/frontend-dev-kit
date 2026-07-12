import type { MixState, MixEndpoint } from "../types";
import { hexToRgb, rgbToHsl, hslToRgb, rgbToOklch, oklchToRgb } from "./colorModel";

/* ---------- constants ---------- */
export const SPACES = [
  { id: "oklch", label: "OKLCH" },
  { id: "srgb", label: "sRGB" },
  { id: "hsl", label: "HSL" },
];
export const STAGES = ["dark", "light", "checker"];
export const MIN_STEPS = 3;
export const MAX_STEPS = 16;

/* ---------- hex helpers ---------- */
const hx = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, "0");
export const rgbHex = (c: MixEndpoint): string => "#" + hx(c.r) + hx(c.g) + hx(c.b);

export function parseHex(text: string): MixEndpoint | null {
  const p = hexToRgb(text);
  return p ? { r: p.r, g: p.g, b: p.b } : null;
}

/** Perceived luminance (0–255) — used to pick readable label text over a swatch. */
export const luminance = (c: MixEndpoint): number => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;

/* ---------- factory ---------- */
export const freshState = (): MixState => ({
  from: { r: 108, g: 140, b: 255 }, // #6c8cff
  to: { r: 70, g: 209, b: 162 },    // #46d1a2
  space: "oklch",
  steps: 9,
  hueDir: "short",
  stage: "dark",
});

/* ---------- interpolation ---------- */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Interpolate an angle, taking either the short or long way around the wheel. */
function lerpHue(a: number, b: number, t: number, dir: string): number {
  let d = (((b - a) % 360) + 360) % 360; // forward distance 0–360
  if (dir === "short") { if (d > 180) d -= 360; }
  else if (d !== 0 && d <= 180) d -= 360; // long way
  return (((a + d * t) % 360) + 360) % 360;
}

export interface Swatch { i: number; t: number; r: number; g: number; b: number; hex: string; }

/** The blended scale — `steps` swatches from `from` to `to` in the chosen space. */
export function scale(S: MixState): Swatch[] {
  const n = Math.max(2, Math.round(S.steps));
  const out: Swatch[] = [];

  // endpoint reps in the mixing space, computed once
  const aHsl = rgbToHsl(S.from.r, S.from.g, S.from.b);
  const bHsl = rgbToHsl(S.to.r, S.to.g, S.to.b);
  const aLch = rgbToOklch(S.from.r, S.from.g, S.from.b);
  const bLch = rgbToOklch(S.to.r, S.to.g, S.to.b);

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let r: number, g: number, b: number;
    if (S.space === "srgb") {
      r = lerp(S.from.r, S.to.r, t);
      g = lerp(S.from.g, S.to.g, t);
      b = lerp(S.from.b, S.to.b, t);
    } else if (S.space === "hsl") {
      ({ r, g, b } = hslToRgb(
        lerpHue(aHsl.h, bHsl.h, t, S.hueDir),
        lerp(aHsl.s, bHsl.s, t),
        lerp(aHsl.l, bHsl.l, t),
      ));
    } else {
      ({ r, g, b } = oklchToRgb(
        lerp(aLch.l, bLch.l, t),
        lerp(aLch.c, bLch.c, t),
        lerpHue(aLch.h, bLch.h, t, S.hueDir),
      ));
    }
    out.push({ i, t, r, g, b, hex: rgbHex({ r, g, b }) });
  }
  return out;
}

/* ---------- code generation ---------- */
export function buildCSS(S: MixState): string {
  const sw = scale(S);
  return [":root {", ...sw.map((s) => `  --mix-${s.i}: ${s.hex};`), "}"].join("\n");
}

export function buildHTML(S: MixState): string {
  const sw = scale(S);
  return [
    '<div class="scale">',
    ...sw.map((s) => `  <span style="background: var(--mix-${s.i})"></span>`),
    "</div>",
  ].join("\n");
}
