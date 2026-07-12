import type { RadiusState } from "../types";

/* ---------- constants ---------- */
export const UNITS = ["px", "%", "rem", "em"];
export const STAGES = ["dark", "light", "checker", "custom"];
export const CORNERS = ["tl", "tr", "br", "bl"] as const;
export type CornerKey = (typeof CORNERS)[number];
export const CORNER_LABELS: Record<CornerKey, string> = {
  tl: "Top-left",
  tr: "Top-right",
  br: "Bottom-right",
  bl: "Bottom-left",
};

/** Max slider value (and drag clamp ceiling) for a given unit. */
export function unitMax(unit: string): number {
  switch (unit) {
    case "%": return 100;
    case "rem":
    case "em": return 20;
    default: return 300; // px
  }
}

/** Slider / drag step for a given unit. */
export function unitStep(unit: string): number {
  return unit === "rem" || unit === "em" ? 0.5 : 1;
}

/* ---------- factory ---------- */
export const freshState = (): RadiusState => ({
  corners: {
    tl: { x: 24, y: 24 },
    tr: { x: 24, y: 24 },
    br: { x: 24, y: 24 },
    bl: { x: 24, y: 24 },
  },
  unit: "px",
  elliptical: false,
  linked: true,
  width: 240,
  height: 240,
  bg: "#5b8cff",
  bgAlpha: 100,
  showHandles: true,
  stage: "dark",
  stageColor: "#2a3b57",
  stageAlpha: 100,
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

/* ---------- value generation ---------- */
/** Format a single radius component; zero is unitless. */
function fmt(n: number, unit: string): string {
  if (n === 0) return "0";
  const v = Math.round(n * 100) / 100;
  return `${v}${unit}`;
}

/** Collapse four corner values (TL TR BR BL) using CSS shorthand rules. */
function collapse(vals: [string, string, string, string]): string {
  const [a, b, c, d] = vals;
  if (a === b && b === c && c === d) return a;      // 1 value
  if (a === c && b === d) return `${a} ${b}`;       // 2 values
  if (b === d) return `${a} ${b} ${c}`;             // 3 values
  return `${a} ${b} ${c} ${d}`;                     // 4 values
}

/** The full `border-radius` value (with optional `/` elliptical form). */
export function radiusValue(S: RadiusState): string {
  const c = S.corners;
  const h = collapse([
    fmt(c.tl.x, S.unit), fmt(c.tr.x, S.unit), fmt(c.br.x, S.unit), fmt(c.bl.x, S.unit),
  ]);
  if (!S.elliptical) return h;
  const v = collapse([
    fmt(c.tl.y, S.unit), fmt(c.tr.y, S.unit), fmt(c.br.y, S.unit), fmt(c.bl.y, S.unit),
  ]);
  return h === v ? h : `${h} / ${v}`;
}

/* ---------- code generation ---------- */
export function buildCSS(S: RadiusState): string {
  return [
    ".box {",
    `  width: ${S.width}px;`,
    `  height: ${S.height}px;`,
    `  background: ${rgba(S.bg, S.bgAlpha)};`,
    `  border-radius: ${radiusValue(S)};`,
    "}",
  ].join("\n");
}

export function buildHTML(_S: RadiusState): string {
  return '<div class="box"></div>';
}
