import type { ShadowAppState, ShadowLayer } from "../types";

/* ---------- constants ---------- */
export const STAGES = ["dark", "light", "checker", "custom"];

/* ---------- id + factories ---------- */
let _uid = 1;

export const mkLayer = (over: Partial<ShadowLayer> = {}): ShadowLayer => ({
  id: _uid++, on: true, inset: false, x: 0, y: 8, blur: 24, spread: 0, color: "#000000", alpha: 35,
  ...over,
});

export const freshState = (): ShadowAppState => ({
  layers: [mkLayer()],
  selected: 0,
  boxColor: "#1d212c",
  boxAlpha: 100,
  border: false,
  borderWidth: 1,
  borderColor: "#ffffff",
  borderAlpha: 100,
  radius: 16,
  size: 180,
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

export const colorStr = (l: ShadowLayer): string => rgba(l.color, l.alpha);

/* ---------- code generation ---------- */
export function shadowStr(l: ShadowLayer): string {
  const parts: string[] = [];
  if (l.inset) parts.push("inset");
  parts.push(`${l.x}px`, `${l.y}px`, `${l.blur}px`);
  if (l.spread !== 0) parts.push(`${l.spread}px`);
  parts.push(colorStr(l));
  return parts.join(" ");
}

/** Full box-shadow value (enabled layers joined in paint order). */
export function boxShadowValue(S: ShadowAppState): string {
  return S.layers.filter((l) => l.on).map(shadowStr).join(", ");
}

export function buildCSS(S: ShadowAppState): string {
  const shadows = S.layers.filter((l) => l.on).map(shadowStr);
  const L: string[] = [
    ".box {",
    `  width: ${S.size}px;`,
    `  height: ${S.size}px;`,
    `  border-radius: ${S.radius}px;`,
    `  background: ${rgba(S.boxColor, S.boxAlpha)};`,
  ];
  if (S.border) L.push(`  border: ${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)};`);
  if (shadows.length <= 1) {
    L.push(`  box-shadow: ${shadows[0] ?? "none"};`);
  } else {
    L.push("  box-shadow:", ...shadows.map((s, i) => `    ${s}${i < shadows.length - 1 ? "," : ";"}`));
  }
  L.push("}");
  return L.join("\n");
}

export function buildHTML(_S: ShadowAppState): string {
  return '<div class="box"></div>';
}
