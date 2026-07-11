import type {
  AppState, Breakpoint, DevicePreset, GridConfig, GridItem, Override,
} from "../types";

/* ---------- constants ---------- */
export const SCALARS = [
  "colGap", "rowGap", "gapUnit", "justifyItems", "alignItems",
  "justifyContent", "alignContent", "autoFlow", "autoRows", "autoCols",
] as const;

export const DEF: Record<string, string> = {
  justifyItems: "stretch", alignItems: "stretch",
  justifyContent: "start", alignContent: "start",
  autoFlow: "row", autoRows: "auto", autoCols: "auto",
};

export const ALIGN_ITEMS = ["start", "end", "center", "stretch"];
export const ALIGN_CONTENT = ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"];
export const SELF = ["auto", "start", "end", "center", "stretch"];
export const FLOW = ["row", "column", "row dense", "column dense"];
export const GAP_UNITS = ["px", "rem", "em", "%"];
export const TRACK_QUICK = ["1fr", "auto", "100px", "min-content", "minmax(80px,1fr)"];

export const PRESETS: DevicePreset[] = [
  { id: "fit", label: "Fit", ico: "⤢", w: null },
  { id: "375", label: "Mobile", ico: "▯", w: 375 },
  { id: "768", label: "Tablet", ico: "▭", w: 768 },
  { id: "1024", label: "Laptop", ico: "▬", w: 1024 },
  { id: "1440", label: "Desktop", ico: "▮", w: 1440 },
];

/* ---------- id + factories ---------- */
let _uid = 1;
let _bpId = 1;

export const mkItem = (): GridItem => ({
  id: _uid++, colStart: "auto", colEnd: "auto", rowStart: "auto", rowEnd: "auto",
  justifySelf: "auto", alignSelf: "auto",
});

export const baseCfg = (): GridConfig => ({
  columns: ["1fr", "1fr", "1fr"], rows: ["auto", "auto"],
  colGap: 10, rowGap: 10, gapUnit: "px",
  justifyItems: "stretch", alignItems: "stretch", justifyContent: "start", alignContent: "start",
  autoFlow: "row", autoRows: "auto", autoCols: "auto",
  items: [mkItem(), mkItem(), mkItem(), mkItem(), mkItem(), mkItem()],
});

export const freshState = (): AppState => ({
  mode: "mobile",
  breakpoints: [{ id: _bpId++, name: "Base", w: 0, cfg: baseCfg() }],
  activeBp: 0,
  selected: 0,
  previewW: null,
  device: "fit",
  showLabels: true,
  showLines: false,
});

export function makeBreakpoint(existing: Breakpoint[]): Breakpoint {
  const others = existing.slice(1);
  const used = new Set(others.map((b) => b.w));
  const cand =
    [768, 1024, 480, 1280, 640, 1440].find((w) => !used.has(w)) ??
    (Math.max(320, ...others.map((b) => b.w)) + 256);
  return { id: _bpId++, name: cand + "px", w: cand, ov: {} };
}

/* ---------- cascade resolution ---------- */
export const base = (S: AppState) => S.breakpoints[0];
export const others = (S: AppState) => S.breakpoints.slice(1);
export const orderedOthers = (S: AppState) =>
  others(S).slice().sort((a, b) => (S.mode === "mobile" ? a.w - b.w : b.w - a.w));
export const appliesAt = (S: AppState, l: Breakpoint, w: number) =>
  S.mode === "mobile" ? l.w <= w : l.w >= w;

export function applyOv(cfg: GridConfig, ov?: Override): void {
  if (!ov) return;
  for (const k of SCALARS) {
    if (k in ov) (cfg as any)[k] = (ov as any)[k];
  }
  if (ov.columns) cfg.columns = ov.columns.slice();
  if (ov.rows) cfg.rows = ov.rows.slice();
  if (ov.items) {
    for (const key in ov.items) {
      const id = Number(key);
      const it = cfg.items.find((x) => x.id === id);
      if (it) Object.assign(it, ov.items[id]);
    }
  }
}

export function resolveAt(S: AppState, w: number): GridConfig {
  const cfg = structuredClone(base(S).cfg!) as GridConfig;
  orderedOthers(S).forEach((l) => {
    if (appliesAt(S, l, w)) applyOv(cfg, l.ov);
  });
  return cfg;
}

export const resolveForLayer = (S: AppState, idx: number): GridConfig =>
  idx === 0 ? (structuredClone(base(S).cfg!) as GridConfig) : resolveAt(S, S.breakpoints[idx].w);

export function winningLayer(S: AppState, w: number): Breakpoint {
  const app = orderedOthers(S).filter((l) => appliesAt(S, l, w));
  return app.length ? app[app.length - 1] : base(S);
}

/* ---------- code generation ---------- */
export const gapStr = (c: GridConfig): string =>
  c.rowGap === c.colGap
    ? `${c.rowGap}${c.gapUnit}`
    : `${c.rowGap}${c.gapUnit} ${c.colGap}${c.gapUnit}`;

export function itemProps(it: GridItem): [string, string][] {
  const p: [string, string][] = [];
  if (it.colStart !== "auto" || it.colEnd !== "auto") p.push(["grid-column", `${it.colStart} / ${it.colEnd}`]);
  if (it.rowStart !== "auto" || it.rowEnd !== "auto") p.push(["grid-row", `${it.rowStart} / ${it.rowEnd}`]);
  if (it.justifySelf !== "auto") p.push(["justify-self", it.justifySelf]);
  if (it.alignSelf !== "auto") p.push(["align-self", it.alignSelf]);
  return p;
}

const CONTAINER_MAP: [keyof GridConfig, string][] = [
  ["justifyItems", "justify-items"], ["alignItems", "align-items"],
  ["justifyContent", "justify-content"], ["alignContent", "align-content"],
  ["autoFlow", "grid-auto-flow"], ["autoRows", "grid-auto-rows"], ["autoCols", "grid-auto-columns"],
];

export function buildCSS(S: AppState): string {
  const b = base(S).cfg!;
  const L: string[] = [];
  L.push(
    ".grid-container {",
    "  display: grid;",
    "  grid-template-columns: " + b.columns.join(" ") + ";",
    "  grid-template-rows: " + b.rows.join(" ") + ";",
    "  gap: " + gapStr(b) + ";",
  );
  CONTAINER_MAP.forEach(([k, css]) => {
    const v = b[k] as string;
    if (v !== DEF[k as string]) L.push(`  ${css}: ${v};`);
  });
  L.push("}");
  b.items.forEach((it, i) => {
    const ip = itemProps(it);
    if (ip.length) L.push("", `.grid-item-${i + 1} {`, ...ip.map(([p, v]) => `  ${p}: ${v};`), "}");
  });

  const idIndex: Record<number, number> = {};
  b.items.forEach((it, i) => (idIndex[it.id] = i));

  orderedOthers(S).forEach((bp) => {
    const ov = bp.ov || {};
    const res = resolveAt(S, bp.w);
    const block: string[] = [];
    const cprops: [string, string][] = [];
    if (ov.columns) cprops.push(["grid-template-columns", ov.columns.join(" ")]);
    if (ov.rows) cprops.push(["grid-template-rows", ov.rows.join(" ")]);
    if ("colGap" in ov || "rowGap" in ov || "gapUnit" in ov) cprops.push(["gap", gapStr(res)]);
    CONTAINER_MAP.forEach(([k, css]) => {
      if (k in ov) cprops.push([css, (ov as any)[k]]);
    });
    if (cprops.length) block.push("  .grid-container {", ...cprops.map(([p, v]) => `    ${p}: ${v};`), "  }");

    if (ov.items) {
      const itemBlocks: string[] = [];
      Object.keys(ov.items).forEach((key) => {
        const id = Number(key);
        const set = ov.items![id];
        const r = res.items.find((x) => x.id === id);
        if (!r) return;
        const ip: [string, string][] = [];
        if ("colStart" in set || "colEnd" in set) ip.push(["grid-column", `${r.colStart} / ${r.colEnd}`]);
        if ("rowStart" in set || "rowEnd" in set) ip.push(["grid-row", `${r.rowStart} / ${r.rowEnd}`]);
        if ("justifySelf" in set) ip.push(["justify-self", r.justifySelf]);
        if ("alignSelf" in set) ip.push(["align-self", r.alignSelf]);
        if (ip.length) itemBlocks.push(`  .grid-item-${idIndex[id] + 1} {`, ...ip.map(([p, v]) => `    ${p}: ${v};`), "  }");
      });
      if (itemBlocks.length) {
        if (block.length) block.push("");
        block.push(...itemBlocks);
      }
    }

    if (block.length) {
      const mq = S.mode === "mobile" ? `min-width: ${bp.w}px` : `max-width: ${bp.w}px`;
      L.push("", `@media (${mq}) {`, ...block, "}");
    }
  });
  return L.join("\n");
}

export function buildHTML(S: AppState): string {
  const items = base(S).cfg!.items;
  const L: string[] = ['<div class="grid-container">'];
  items.forEach((it, i) => {
    let placed = itemProps(it).length > 0;
    if (!placed) placed = others(S).some((b) => !!b.ov?.items && it.id in b.ov.items);
    L.push(`  <div class="${placed ? "grid-item grid-item-" + (i + 1) : "grid-item"}">${i + 1}</div>`);
  });
  L.push("</div>");
  return L.join("\n");
}
