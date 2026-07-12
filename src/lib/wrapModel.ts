import type { WrapState } from "../types";

/* ---------- constants ---------- */
export const STAGES = ["dark", "light", "checker"];
export const PAD = 20;              // element padding (px) — affects wrap width, so it's emitted
export const MIN_W = 120;
export const MAX_W = 900;

export const TEXT_WRAP = ["wrap", "nowrap", "balance", "pretty", "stable"];
export const WHITE_SPACE = ["normal", "nowrap", "pre", "pre-wrap", "pre-line"];
export const OVERFLOW_WRAP = ["normal", "break-word", "anywhere"];
export const HYPHENS = ["none", "auto"];
export const OVERFLOW = ["visible", "hidden", "auto", "scroll"];
export const TEXT_OVERFLOW = ["clip", "ellipsis"];
export const ALIGN = ["left", "center", "right", "justify"];

/** One-click property bundles for the common real-world cases. */
export const PRESETS: { label: string; patch: Partial<WrapState> }[] = [
  { label: "Balance", patch: { textWrap: "balance" } },
  { label: "Pretty", patch: { textWrap: "pretty" } },
  { label: "1-line ellipsis", patch: { textWrap: "nowrap", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", clamp: false } },
  { label: "Clamp 3 lines", patch: { clamp: true, lines: 3, textOverflow: "ellipsis" } },
];

const SAMPLE =
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs, " +
  "and typographers argue about widows and orphans at supercalifragilisticexpialidocious length.";

/* ---------- factory ---------- */
export const freshState = (): WrapState => ({
  text: SAMPLE,
  width: 360,
  textWrap: "wrap",
  whiteSpace: "normal",
  overflowWrap: "normal",
  hyphens: "none",
  clamp: false,
  lines: 3,
  overflow: "visible",
  textOverflow: "clip",
  fontSize: 18,
  lineHeight: 1.5,
  fontWeight: 400,
  align: "left",
  stage: "dark",
});

/* ---------- code generation ---------- */
export function buildCSS(S: WrapState): string {
  const L: string[] = [
    ".text {",
    `  max-width: ${S.width}px;`,
    `  padding: ${PAD}px;`,
    `  font-size: ${S.fontSize}px;`,
    `  line-height: ${S.lineHeight};`,
  ];
  if (S.fontWeight !== 400) L.push(`  font-weight: ${S.fontWeight};`);
  if (S.align !== "left") L.push(`  text-align: ${S.align};`);
  L.push(`  text-wrap: ${S.textWrap};`);
  if (S.whiteSpace !== "normal") L.push(`  white-space: ${S.whiteSpace};`);
  if (S.overflowWrap !== "normal") L.push(`  overflow-wrap: ${S.overflowWrap};`);
  if (S.hyphens !== "none") L.push(`  hyphens: ${S.hyphens};`);
  if (S.clamp) {
    L.push("  display: -webkit-box;");
    L.push("  -webkit-box-orient: vertical;");
    L.push(`  -webkit-line-clamp: ${S.lines};`);
    L.push(`  line-clamp: ${S.lines};`);
    L.push("  overflow: hidden;");
  } else if (S.overflow !== "visible") {
    L.push(`  overflow: ${S.overflow};`);
  }
  if (S.textOverflow !== "clip") L.push(`  text-overflow: ${S.textOverflow};`);
  L.push("}");
  return L.join("\n");
}

export function buildHTML(S: WrapState): string {
  return `<p class="text">${S.text}</p>`;
}
