import type {
  FlexAppState, FlexBreakpoint, FlexConfig, FlexItem, FlexOverride, DevicePreset,
} from "../types";

/* ---------- constants ---------- */
export const SCALARS = [
  "direction", "wrap", "justifyContent", "alignItems", "alignContent",
  "rowGap", "colGap", "gapUnit",
] as const;

export const DEF: Record<string, string> = {
  direction: "row", wrap: "nowrap",
  justifyContent: "flex-start", alignItems: "stretch", alignContent: "stretch",
};

export const DIRECTIONS = ["row", "row-reverse", "column", "column-reverse"];
export const WRAPS = ["nowrap", "wrap", "wrap-reverse"];
export const JUSTIFY = ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];
export const ALIGN_ITEMS = ["stretch", "flex-start", "flex-end", "center", "baseline"];
export const ALIGN_CONTENT = ["stretch", "flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"];
export const ALIGN_SELF = ["auto", "flex-start", "flex-end", "center", "baseline", "stretch"];
export const GAP_UNITS = ["px", "rem", "em", "%"];
export const BASIS_QUICK = ["auto", "0", "100px", "25%", "min-content"];

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

export const mkItem = (): FlexItem => ({
  id: _uid++, order: 0, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto",
});

export const baseCfg = (): FlexConfig => ({
  direction: "row", wrap: "nowrap",
  justifyContent: "flex-start", alignItems: "stretch", alignContent: "stretch",
  rowGap: 10, colGap: 10, gapUnit: "px",
  items: [mkItem(), mkItem(), mkItem(), mkItem()],
});

export const freshState = (): FlexAppState => ({
  mode: "mobile",
  breakpoints: [{ id: _bpId++, name: "Base", w: 0, cfg: baseCfg() }],
  activeBp: 0,
  selected: 0,
  previewW: null,
  device: "fit",
  showLabels: true,
});

export function makeBreakpoint(existing: FlexBreakpoint[]): FlexBreakpoint {
  const others = existing.slice(1);
  const used = new Set(others.map((b) => b.w));
  const cand =
    [768, 1024, 480, 1280, 640, 1440].find((w) => !used.has(w)) ??
    (Math.max(320, ...others.map((b) => b.w)) + 256);
  return { id: _bpId++, name: cand + "px", w: cand, ov: {} };
}

/* ---------- cascade resolution ---------- */
export const base = (S: FlexAppState) => S.breakpoints[0];
export const others = (S: FlexAppState) => S.breakpoints.slice(1);
export const orderedOthers = (S: FlexAppState) =>
  others(S).slice().sort((a, b) => (S.mode === "mobile" ? a.w - b.w : b.w - a.w));
export const appliesAt = (S: FlexAppState, l: FlexBreakpoint, w: number) =>
  S.mode === "mobile" ? l.w <= w : l.w >= w;

export function applyOv(cfg: FlexConfig, ov?: FlexOverride): void {
  if (!ov) return;
  for (const k of SCALARS) {
    if (k in ov) (cfg as any)[k] = (ov as any)[k];
  }
  if (ov.items) {
    for (const key in ov.items) {
      const id = Number(key);
      const it = cfg.items.find((x) => x.id === id);
      if (it) Object.assign(it, ov.items[id]);
    }
  }
}

export function resolveAt(S: FlexAppState, w: number): FlexConfig {
  const cfg = structuredClone(base(S).cfg!) as FlexConfig;
  orderedOthers(S).forEach((l) => {
    if (appliesAt(S, l, w)) applyOv(cfg, l.ov);
  });
  return cfg;
}

export const resolveForLayer = (S: FlexAppState, idx: number): FlexConfig =>
  idx === 0 ? (structuredClone(base(S).cfg!) as FlexConfig) : resolveAt(S, S.breakpoints[idx].w);

export function winningLayer(S: FlexAppState, w: number): FlexBreakpoint {
  const app = orderedOthers(S).filter((l) => appliesAt(S, l, w));
  return app.length ? app[app.length - 1] : base(S);
}

/* ---------- code generation ---------- */
export const gapStr = (c: FlexConfig): string =>
  c.rowGap === c.colGap
    ? `${c.rowGap}${c.gapUnit}`
    : `${c.rowGap}${c.gapUnit} ${c.colGap}${c.gapUnit}`;

export function itemProps(it: FlexItem): [string, string][] {
  const p: [string, string][] = [];
  if (it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto") {
    p.push(["flex", `${it.grow} ${it.shrink} ${it.basis}`]);
  }
  if (it.order !== 0) p.push(["order", String(it.order)]);
  if (it.alignSelf !== "auto") p.push(["align-self", it.alignSelf]);
  return p;
}

const CONTAINER_MAP: [keyof FlexConfig, string][] = [
  ["direction", "flex-direction"], ["wrap", "flex-wrap"],
  ["justifyContent", "justify-content"], ["alignItems", "align-items"], ["alignContent", "align-content"],
];

export function buildCSS(S: FlexAppState): string {
  const b = base(S).cfg!;
  const L: string[] = [];
  L.push(
    ".flex-container {",
    "  display: flex;",
  );
  CONTAINER_MAP.forEach(([k, css]) => {
    const v = b[k] as string;
    if (v !== DEF[k as string]) L.push(`  ${css}: ${v};`);
  });
  L.push("  gap: " + gapStr(b) + ";", "}");
  b.items.forEach((it, i) => {
    const ip = itemProps(it);
    if (ip.length) L.push("", `.flex-item-${i + 1} {`, ...ip.map(([p, v]) => `  ${p}: ${v};`), "}");
  });

  const idIndex: Record<number, number> = {};
  b.items.forEach((it, i) => (idIndex[it.id] = i));

  orderedOthers(S).forEach((bp) => {
    const ov = bp.ov || {};
    const res = resolveAt(S, bp.w);
    const block: string[] = [];
    const cprops: [string, string][] = [];
    CONTAINER_MAP.forEach(([k, css]) => {
      if (k in ov) cprops.push([css, (ov as any)[k]]);
    });
    if ("colGap" in ov || "rowGap" in ov || "gapUnit" in ov) cprops.push(["gap", gapStr(res)]);
    if (cprops.length) block.push("  .flex-container {", ...cprops.map(([p, v]) => `    ${p}: ${v};`), "  }");

    if (ov.items) {
      const itemBlocks: string[] = [];
      Object.keys(ov.items).forEach((key) => {
        const id = Number(key);
        const set = ov.items![id];
        const r = res.items.find((x) => x.id === id);
        if (!r) return;
        const ip: [string, string][] = [];
        if ("grow" in set || "shrink" in set || "basis" in set) ip.push(["flex", `${r.grow} ${r.shrink} ${r.basis}`]);
        if ("order" in set) ip.push(["order", String(r.order)]);
        if ("alignSelf" in set) ip.push(["align-self", r.alignSelf]);
        if (ip.length) itemBlocks.push(`  .flex-item-${idIndex[id] + 1} {`, ...ip.map(([p, v]) => `    ${p}: ${v};`), "  }");
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

export function buildHTML(S: FlexAppState): string {
  const items = base(S).cfg!.items;
  const L: string[] = ['<div class="flex-container">'];
  items.forEach((it, i) => {
    let placed = itemProps(it).length > 0;
    if (!placed) placed = others(S).some((b) => !!b.ov?.items && it.id in b.ov.items);
    L.push(`  <div class="${placed ? "flex-item flex-item-" + (i + 1) : "flex-item"}">${i + 1}</div>`);
  });
  L.push("</div>");
  return L.join("\n");
}
