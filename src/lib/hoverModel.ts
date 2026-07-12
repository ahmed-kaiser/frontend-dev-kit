import type { HoverState } from "../types";

/* ---------- constants ---------- */
export const STAGES = ["dark", "light", "checker"];

export const EASINGS = [
  { label: "ease", value: "ease" },
  { label: "in", value: "ease-in" },
  { label: "out", value: "ease-out" },
  { label: "in-out", value: "ease-in-out" },
  { label: "linear", value: "linear" },
  { label: "back", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
];

/* ---------- factory ---------- */
export const freshState = (): HoverState => ({
  label: "Hover me",
  width: 0,
  padX: 26, padY: 14,
  radius: 10,
  fontSize: 15, fontWeight: 650,
  bg: "#6c8cff", bgAlpha: 100,
  color: "#ffffff", colorAlpha: 100,
  border: false, borderWidth: 2, borderColor: "#6c8cff", borderAlpha: 100,
  shadow: true, shadowY: 6, shadowBlur: 16, shadowSpread: -4, shadowColor: "#6c8cff", shadowAlpha: 45,

  duration: 220, delay: 0, easing: "ease",

  hoverTransform: true, hScale: 1, hRotate: 0, hTx: 0, hTy: -4,
  hoverBg: true, hBg: "#5a78ea", hBgAlpha: 100,
  hoverColor: false, hColor: "#ffffff", hColorAlpha: 100,
  hoverShadow: true, hShadowY: 16, hShadowBlur: 30, hShadowSpread: -6, hShadowColor: "#6c8cff", hShadowAlpha: 55,
  hoverBorder: false, hBorderWidth: 2, hBorderColor: "#ffffff", hBorderAlpha: 100,
  hoverOpacity: false, hOpacity: 70,
  hoverFilter: false, hBrightness: 110, hBlur: 0,

  forceHover: false,
  stage: "dark",
});

/* ---------- color / value helpers ---------- */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6) || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Hex at full opacity, otherwise rgba(). */
export function rgba(hex: string, alpha: number): string {
  if (alpha >= 100) return hex;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Number((alpha / 100).toFixed(3))})`;
}

const round = (n: number, dp = 3) => Number(n.toFixed(dp));

function shadowVal(y: number, blur: number, spread: number, color: string, alpha: number): string {
  const sp = spread !== 0 ? ` ${spread}px` : "";
  return `0 ${y}px ${blur}px${sp} ${rgba(color, alpha)}`;
}

function transformVal(S: HoverState): string {
  const parts: string[] = [];
  if (S.hTx !== 0 || S.hTy !== 0) parts.push(`translate(${S.hTx}px, ${S.hTy}px)`);
  if (S.hScale !== 1) parts.push(`scale(${round(S.hScale)})`);
  if (S.hRotate !== 0) parts.push(`rotate(${S.hRotate}deg)`);
  return parts.length ? parts.join(" ") : "none";
}

function filterVal(brightness: number, blur: number): string {
  const parts: string[] = [];
  if (brightness !== 100) parts.push(`brightness(${brightness}%)`);
  if (blur > 0) parts.push(`blur(${blur}px)`);
  return parts.length ? parts.join(" ") : "none";
}

/** The transition shorthand covering exactly the enabled hover changes. */
export function transitionValue(S: HoverState): string {
  const props: string[] = [];
  if (S.hoverTransform) props.push("transform");
  if (S.hoverBg) props.push("background-color");
  if (S.hoverColor) props.push("color");
  if (S.hoverShadow) props.push("box-shadow");
  if (S.hoverBorder) props.push("border");
  if (S.hoverOpacity) props.push("opacity");
  if (S.hoverFilter) props.push("filter");
  if (!props.length) return "";
  const tail = `${S.duration}ms ${S.easing}${S.delay ? ` ${S.delay}ms` : ""}`;
  return props.map((p) => `${p} ${tail}`).join(", ");
}

/* ---------- declaration builders (selector-agnostic) ---------- */
function baseDecls(S: HoverState): string[] {
  const L: string[] = [
    "display: inline-flex;",
    "align-items: center;",
    "justify-content: center;",
  ];
  if (S.width > 0) L.push(`width: ${S.width}px;`);
  L.push(`padding: ${S.padY}px ${S.padX}px;`);
  L.push(`border-radius: ${S.radius}px;`);
  L.push(`font-size: ${S.fontSize}px;`);
  L.push(`font-weight: ${S.fontWeight};`);
  L.push(`background: ${rgba(S.bg, S.bgAlpha)};`);
  L.push(`color: ${rgba(S.color, S.colorAlpha)};`);
  L.push(S.border ? `border: ${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)};` : "border: none;");
  // A base box-shadow is needed whenever the hover changes it, so the shadow can animate.
  if (S.shadow) L.push(`box-shadow: ${shadowVal(S.shadowY, S.shadowBlur, S.shadowSpread, S.shadowColor, S.shadowAlpha)};`);
  else if (S.hoverShadow) L.push("box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);");
  // Likewise a base transform gives the hover transform a value to interpolate from.
  if (S.hoverTransform) L.push("transform: none;");
  L.push("cursor: pointer;");
  const t = transitionValue(S);
  if (t) L.push(`transition: ${t};`);
  return L;
}

function hoverDecls(S: HoverState): string[] {
  const L: string[] = [];
  if (S.hoverTransform) L.push(`transform: ${transformVal(S)};`);
  if (S.hoverBg) L.push(`background: ${rgba(S.hBg, S.hBgAlpha)};`);
  if (S.hoverColor) L.push(`color: ${rgba(S.hColor, S.hColorAlpha)};`);
  if (S.hoverShadow) L.push(`box-shadow: ${shadowVal(S.hShadowY, S.hShadowBlur, S.hShadowSpread, S.hShadowColor, S.hShadowAlpha)};`);
  if (S.hoverBorder) L.push(`border: ${S.hBorderWidth}px solid ${rgba(S.hBorderColor, S.hBorderAlpha)};`);
  if (S.hoverOpacity) L.push(`opacity: ${round(S.hOpacity / 100, 2)};`);
  if (S.hoverFilter) L.push(`filter: ${filterVal(S.hBrightness, S.hBlur)};`);
  return L;
}

const ind = (lines: string[]) => lines.map((l) => "  " + l);

/* ---------- presets ---------- */
/** Clear every hover change back to a neutral baseline before a preset sets its own. */
function off(d: HoverState) {
  d.hoverTransform = d.hoverBg = d.hoverColor = d.hoverShadow =
    d.hoverBorder = d.hoverOpacity = d.hoverFilter = false;
  d.hScale = 1; d.hRotate = 0; d.hTx = 0; d.hTy = 0;
}

export const PRESETS: { id: string; label: string; apply: (d: HoverState) => void }[] = [
  { id: "lift", label: "Lift", apply: (d) => {
    off(d);
    d.hoverTransform = true; d.hTy = -6;
    d.hoverShadow = true; d.hShadowY = 16; d.hShadowBlur = 32; d.hShadowSpread = -6; d.hShadowColor = "#000000"; d.hShadowAlpha = 38;
    d.duration = 220; d.easing = "ease";
  } },
  { id: "grow", label: "Grow", apply: (d) => {
    off(d);
    d.hoverTransform = true; d.hScale = 1.06;
    d.duration = 200; d.easing = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  } },
  { id: "glow", label: "Glow", apply: (d) => {
    off(d);
    d.hoverShadow = true; d.hShadowY = 0; d.hShadowBlur = 26; d.hShadowSpread = 0; d.hShadowColor = d.bg; d.hShadowAlpha = 65;
    d.duration = 260; d.easing = "ease-out";
  } },
  { id: "swap", label: "Swap", apply: (d) => {
    off(d);
    d.hoverBg = true; d.hBg = d.color; d.hBgAlpha = 100;
    d.hoverColor = true; d.hColor = d.bg; d.hColorAlpha = 100;
    d.duration = 200; d.easing = "ease";
  } },
  { id: "sink", label: "Sink", apply: (d) => {
    off(d);
    d.hoverTransform = true; d.hTy = 2;
    d.hoverFilter = true; d.hBrightness = 90; d.hBlur = 0;
    d.duration = 150; d.easing = "ease-in";
  } },
  { id: "fade", label: "Fade", apply: (d) => {
    off(d);
    d.hoverOpacity = true; d.hOpacity = 60;
    d.duration = 200; d.easing = "ease";
  } },
];

/* ---------- code generation ---------- */
export function buildCSS(S: HoverState): string {
  const out = [".btn {", ...ind(baseDecls(S)), "}"];
  const hover = hoverDecls(S);
  if (hover.length) out.push("", ".btn:hover {", ...ind(hover), "}");
  return out.join("\n");
}

/** Preview stylesheet: scoped to `sel`, with `.force` mirroring `:hover` for the pin toggle. */
export function previewCSS(S: HoverState, sel: string): string {
  const out = [`${sel} {`, ...ind(baseDecls(S)), "}"];
  const hover = hoverDecls(S);
  if (hover.length) out.push(`${sel}:hover,\n${sel}.force {`, ...ind(hover), "}");
  return out.join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildHTML(S: HoverState): string {
  return `<button class="btn">${esc(S.label) || "Hover me"}</button>`;
}
