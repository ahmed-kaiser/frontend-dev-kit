import type { ShapePoint, ShapeState } from "../types";

/* ---------- constants ---------- */
export const TYPES = ["polygon", "circle", "ellipse", "inset"];
export const STAGES = ["dark", "light", "checker", "custom"];

/** Polygon presets — vertex lists as [x%, y%] pairs. */
export const PRESETS: { label: string; pts: [number, number][] }[] = [
  { label: "Triangle", pts: [[50, 0], [100, 100], [0, 100]] },
  { label: "Trapezoid", pts: [[25, 0], [75, 0], [100, 100], [0, 100]] },
  { label: "Rhombus", pts: [[50, 0], [100, 50], [50, 100], [0, 50]] },
  { label: "Parallelogram", pts: [[25, 0], [100, 0], [75, 100], [0, 100]] },
  { label: "Pentagon", pts: [[50, 0], [100, 38], [82, 100], [18, 100], [0, 38]] },
  { label: "Hexagon", pts: [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]] },
  { label: "Star", pts: [[50, 0], [61, 35], [98, 35], [68, 57], [79, 91], [50, 70], [21, 91], [32, 57], [2, 35], [39, 35]] },
  { label: "Arrow", pts: [[0, 20], [60, 20], [60, 0], [100, 50], [60, 100], [60, 80], [0, 80]] },
  { label: "Chevron", pts: [[75, 0], [100, 50], [75, 100], [0, 100], [25, 50], [0, 0]] },
  { label: "Message", pts: [[0, 0], [100, 0], [100, 75], [75, 75], [75, 100], [50, 75], [0, 75]] },
];

const toPoints = (pts: [number, number][]): ShapePoint[] => pts.map(([x, y]) => ({ x, y }));

/* ---------- factory ---------- */
export const freshState = (): ShapeState => ({
  type: "polygon",
  points: toPoints(PRESETS[5].pts), // hexagon
  selected: 0,
  circleR: 50, circleX: 50, circleY: 50,
  ellipseRX: 50, ellipseRY: 35, ellipseX: 50, ellipseY: 50,
  insetT: 10, insetR: 10, insetB: 10, insetL: 10, insetRound: 0,
  width: 260,
  height: 260,
  bg: "#6c8cff",
  bgAlpha: 100,
  showGuides: true,
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

/* ---------- clip-path value ---------- */
const p = (n: number) => `${Math.round(n)}%`;

export function clipPath(S: ShapeState): string {
  switch (S.type) {
    case "circle":
      return `circle(${p(S.circleR)} at ${p(S.circleX)} ${p(S.circleY)})`;
    case "ellipse":
      return `ellipse(${p(S.ellipseRX)} ${p(S.ellipseRY)} at ${p(S.ellipseX)} ${p(S.ellipseY)})`;
    case "inset": {
      const base = `inset(${p(S.insetT)} ${p(S.insetR)} ${p(S.insetB)} ${p(S.insetL)}`;
      return S.insetRound > 0 ? `${base} round ${Math.round(S.insetRound)}px)` : `${base})`;
    }
    default:
      return `polygon(${S.points.map((pt) => `${p(pt.x)} ${p(pt.y)}`).join(", ")})`;
  }
}

/* ---------- code generation ---------- */
export function buildCSS(S: ShapeState): string {
  const clip = clipPath(S);
  return [
    ".shape {",
    `  width: ${S.width}px;`,
    `  height: ${S.height}px;`,
    `  background: ${rgba(S.bg, S.bgAlpha)};`,
    `  -webkit-clip-path: ${clip};`,
    `  clip-path: ${clip};`,
    "}",
  ].join("\n");
}

export function buildHTML(_S: ShapeState): string {
  return '<div class="shape"></div>';
}
