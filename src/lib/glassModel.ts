import type { GlassState } from "../types";

/* ---------- constants ---------- */
export const SCENES = ["aurora", "sunset", "ocean", "candy", "lime", "dusk", "mesh", "photo", "text", "solid"];
export const BLUR_QUICK = [4, 8, 12, 20, 32];

/** Backdrop for the "text" scene sits behind actual type rendered in the preview. */
export const TEXT_FILLER =
  "Frosted glass over real text — read this line through the blur. ".repeat(16);

/** Vivid CSS backdrops behind the glass panel — busy on purpose so the frost reads. */
export const SCENE_BG: Record<string, string> = {
  aurora:
    "radial-gradient(120% 80% at 15% 10%, #3b82f6 0%, transparent 45%)," +
    "radial-gradient(120% 90% at 85% 25%, #22d3ee 0%, transparent 50%)," +
    "radial-gradient(120% 90% at 60% 95%, #a855f7 0%, transparent 55%)," +
    "linear-gradient(140deg, #0f172a, #1e293b)",
  sunset:
    "radial-gradient(100% 90% at 20% 100%, #f97316 0%, transparent 55%)," +
    "radial-gradient(100% 90% at 90% 15%, #ec4899 0%, transparent 50%)," +
    "linear-gradient(160deg, #7c3aed, #db2777 60%, #f59e0b)",
  ocean:
    "radial-gradient(90% 90% at 20% 20%, #22d3ee 0%, transparent 50%)," +
    "radial-gradient(90% 90% at 85% 85%, #2563eb 0%, transparent 55%)," +
    "linear-gradient(160deg, #0891b2, #0e7490 45%, #155e75)",
  candy:
    "radial-gradient(90% 90% at 15% 20%, #fb7185 0%, transparent 55%)," +
    "radial-gradient(90% 90% at 85% 80%, #c084fc 0%, transparent 55%)," +
    "linear-gradient(135deg, #f472b6, #fb923c)",
  lime:
    "radial-gradient(90% 90% at 80% 15%, #a3e635 0%, transparent 55%)," +
    "radial-gradient(90% 90% at 15% 90%, #34d399 0%, transparent 55%)," +
    "linear-gradient(150deg, #16a34a, #065f46 70%, #064e3b)",
  dusk:
    "radial-gradient(100% 90% at 80% 10%, #d946ef 0%, transparent 50%)," +
    "radial-gradient(100% 90% at 10% 90%, #6366f1 0%, transparent 55%)," +
    "linear-gradient(160deg, #312e81, #4c1d95 60%, #1e1b4b)",
  mesh:
    "conic-gradient(from 210deg at 30% 30%, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
  photo:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 22px, transparent 22px 44px)," +
    "radial-gradient(90% 90% at 80% 20%, #10b981 0%, transparent 55%)," +
    "linear-gradient(135deg, #0ea5e9, #6366f1 55%, #1e1b4b)",
  text:
    "linear-gradient(135deg, #7c3aed, #2563eb 55%, #0891b2)",
  solid: "",
};

/* ---------- factory ---------- */
export const freshState = (): GlassState => ({
  blur: 12,
  saturate: 160,
  brightness: 100,
  contrast: 100,
  tintColor: "#ffffff",
  tintAlpha: 14,
  border: true,
  borderWidth: 1,
  borderColor: "#ffffff",
  borderAlpha: 30,
  highlight: true,
  highlightAlpha: 45,
  shadow: true,
  shadowY: 12,
  shadowBlur: 40,
  shadowColor: "#0b1020",
  shadowAlpha: 35,
  radius: 20,
  width: 340,
  height: 220,
  scene: "aurora",
  sceneColor: "#334155",
  sceneAlpha: 100,
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

/** backdrop-filter value: blur always present; saturate/brightness/contrast only when non-neutral. */
export function filterValue(S: GlassState): string {
  const parts = [`blur(${S.blur}px)`];
  if (S.saturate !== 100) parts.push(`saturate(${S.saturate}%)`);
  if (S.brightness !== 100) parts.push(`brightness(${S.brightness}%)`);
  if (S.contrast !== 100) parts.push(`contrast(${S.contrast}%)`);
  return parts.join(" ");
}

/** Combined box-shadow: optional drop shadow + optional inset top-edge highlight. */
export function boxShadowValue(S: GlassState): string {
  const parts: string[] = [];
  if (S.shadow) parts.push(`0 ${S.shadowY}px ${S.shadowBlur}px ${rgba(S.shadowColor, S.shadowAlpha)}`);
  if (S.highlight) parts.push(`inset 0 1px 0 ${rgba("#ffffff", S.highlightAlpha)}`);
  return parts.join(", ");
}

export function buildCSS(S: GlassState): string {
  const filter = filterValue(S);
  const shadow = boxShadowValue(S);
  const L: string[] = [
    ".glass {",
    `  width: ${S.width}px;`,
    `  height: ${S.height}px;`,
    `  border-radius: ${S.radius}px;`,
    `  background: ${rgba(S.tintColor, S.tintAlpha)};`,
    `  backdrop-filter: ${filter};`,
    `  -webkit-backdrop-filter: ${filter};`,
  ];
  if (S.border) L.push(`  border: ${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)};`);
  if (shadow) L.push(`  box-shadow: ${shadow};`);
  L.push("}");
  return L.join("\n");
}

export function buildHTML(_S: GlassState): string {
  return '<div class="glass"></div>';
}
