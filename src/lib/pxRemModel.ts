import type { PxRemState } from "../types";

/* ---------- constants ---------- */
export const STAGES = ["dark", "light", "checker"];

/** Common sizes for the quick conversion table (px). */
export const TABLE_PX = [4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

/* ---------- factory ---------- */
export const freshState = (): PxRemState => ({
  px: 16,
  root: 16,
  stage: "dark",
});

/* ---------- utils ---------- */
/** Trim to `dp` decimals, dropping trailing zeros: 1.500 -> "1.5", 2.00 -> "2". */
export const trim = (n: number, dp: number) => String(Number(n.toFixed(dp)));

/** rem for a px value under the given root (guards a zero/negative root). */
export const pxToRem = (px: number, root: number) => px / (root > 0 ? root : 16);
export const remToPx = (rem: number, root: number) => rem * (root > 0 ? root : 16);

export const remOf = (S: PxRemState) => pxToRem(S.px, S.root);

export interface TableRow { px: number; rem: string; }

export const tableRows = (S: PxRemState): TableRow[] =>
  TABLE_PX.map((px) => ({ px, rem: trim(pxToRem(px, S.root), 4) }));

/* =====================================================================
   Code generation
   ===================================================================== */
export function buildCSS(S: PxRemState): string {
  const rem = trim(remOf(S), 4);
  return [
    ":root {",
    `  font-size: ${trim(S.root, 3)}px;`,
    "}",
    "",
    ".element {",
    `  font-size: ${rem}rem; /* ${trim(S.px, 3)}px */`,
    "}",
  ].join("\n");
}

export function buildHTML(_S: PxRemState): string {
  return '<div class="element">Sized in rem</div>';
}
