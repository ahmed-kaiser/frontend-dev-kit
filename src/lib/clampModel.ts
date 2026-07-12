import type { ClampState } from "../types";

/* ---------- constants ---------- */
export const UNITS = ["rem", "px"];
export const STAGES = ["dark", "light", "checker"];

/* ---------- factory ---------- */
export const freshState = (): ClampState => ({
  minSize: 16,
  maxSize: 32,
  minVw: 320,
  maxVw: 1280,
  root: 16,
  unit: "rem",
  previewVw: 768,
  stage: "dark",
});

/* ---------- utils ---------- */
/** Trim to `dp` decimals, dropping trailing zeros: 2.500 -> "2.5", 3.00 -> "3". */
const trim = (n: number, dp: number) => String(Number(n.toFixed(dp)));

/* =====================================================================
   The fluid preferred term is the line through
   (minVw, minSize) and (maxVw, maxSize):

     value(vw) = slope * vw + interceptPx        [px]
     slope     = (maxSize - minSize) / (maxVw - minVw)

   In CSS the vw term uses the coefficient slope * 100 (since 1vw = 1% of
   the viewport), and the intercept is a fixed length. clamp() then bounds
   the line between minSize and maxSize.
   ===================================================================== */
export interface ClampParts {
  slope: number;       // px of value per px of viewport
  vwCoeff: number;     // coefficient of the vw term (slope * 100)
  interceptPx: number; // fixed length term (px)
  valid: boolean;      // false when the viewport range is zero-width
}

export function parts(S: ClampState): ClampParts {
  const span = S.maxVw - S.minVw;
  const valid = span !== 0;
  const slope = valid ? (S.maxSize - S.minSize) / span : 0;
  return {
    slope,
    vwCoeff: slope * 100,
    interceptPx: S.minSize - slope * S.minVw,
    valid,
  };
}

/** Format a px length in the state's output unit. */
export function fmtLen(px: number, S: ClampState): string {
  if (S.unit === "px") return trim(px, 3) + "px";
  return trim(px / S.root, 4) + "rem";
}

/** The full `clamp(min, intercept + Nvw, max)` string. */
export function clampValue(S: ClampState): string {
  const p = parts(S);
  const lo = fmtLen(Math.min(S.minSize, S.maxSize), S);
  const hi = fmtLen(Math.max(S.minSize, S.maxSize), S);
  if (!p.valid) return `clamp(${lo}, ${lo}, ${hi})`;

  const inter = fmtLen(p.interceptPx, S);
  const vw = trim(p.vwCoeff, 4) + "vw";
  // Keep "a + b" / "a - b" readable regardless of sign.
  const pref = p.vwCoeff < 0 ? `${inter} - ${vw.slice(1)}` : `${inter} + ${vw}`;
  return `clamp(${lo}, ${pref}, ${hi})`;
}

/** Resolved px value the browser would render at viewport width `vw`. */
export function resolvedAt(S: ClampState, vw: number): number {
  const p = parts(S);
  const lo = Math.min(S.minSize, S.maxSize);
  const hi = Math.max(S.minSize, S.maxSize);
  const val = p.valid ? p.interceptPx + p.slope * vw : S.minSize;
  return Math.min(hi, Math.max(lo, val));
}

/* True when the smaller size isn't the min bound — clamp still works, but
   the fluid term runs "backwards", which is usually a mistake worth flagging. */
export const descending = (S: ClampState) => S.minSize > S.maxSize;

/* =====================================================================
   Code generation
   ===================================================================== */
export function buildCSS(S: ClampState): string {
  return [
    ":root {",
    `  --fluid: ${clampValue(S)};`,
    "}",
    "",
    ".fluid {",
    "  font-size: var(--fluid);",
    "}",
  ].join("\n");
}

export function buildHTML(_S: ClampState): string {
  return '<p class="fluid">Fluid type that scales with the viewport.</p>';
}
