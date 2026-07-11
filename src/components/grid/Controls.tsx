import { useState, type ReactNode } from "react";
import type { AppState, GridConfig, ItemOverride, Override } from "../../types";
import {
  ALIGN_CONTENT, ALIGN_ITEMS, FLOW, GAP_UNITS, SELF, TRACK_QUICK,
  base, mkItem, resolveForLayer,
} from "../../lib/gridModel";
import type { Update } from "./GridTool";
import "./Controls.css";

interface Props { S: AppState; update: Update; }

function Group({ title, open = true, children }: { title: string; open?: boolean; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(!open);
  return (
    <div className={"group" + (collapsed ? " collapsed" : "")}>
      <div className="group-head" onClick={() => setCollapsed((c) => !c)}>
        <span className="caret">▼</span>
        <h3>{title}</h3>
      </div>
      <div className="group-body">{children}</div>
    </div>
  );
}

function OvDot({ on, onClear }: { on: boolean; onClear: () => void }) {
  return (
    <span
      className={"ov-dot" + (on ? " on" : "")}
      title={on ? "Overridden here — click to reset" : "Inherited"}
      onClick={(e) => { e.stopPropagation(); if (on) onClear(); }}
    />
  );
}

export default function Controls({ S, update }: Props) {
  const isBase = S.activeBp === 0;
  const cfg = resolveForLayer(S, S.activeBp);
  const baseItems = base(S).cfg!.items;

  /* ---- container scalar/array values ---- */
  const getVal = <K extends keyof GridConfig>(k: K): GridConfig[K] => cfg[k];
  const setVal = (key: keyof Override, val: unknown) => update((d) => {
    if (d.activeBp === 0) (d.breakpoints[0].cfg as any)[key] = val;
    else {
      const a = d.breakpoints[d.activeBp];
      a.ov = a.ov || {};
      (a.ov as any)[key] = val;
    }
  });
  const hasOv = (key: string) => !isBase && !!S.breakpoints[S.activeBp].ov && key in (S.breakpoints[S.activeBp].ov as any);
  const clearOv = (key: string) => update((d) => {
    const a = d.breakpoints[d.activeBp];
    if (a.ov) delete (a.ov as any)[key];
  });

  const labelDot = (key: string) => (isBase ? null : <OvDot on={hasOv(key)} onClear={() => clearOv(key)} />);

  /* ---- item values ---- */
  const selItem = cfg.items[S.selected];
  const setItem = (i: number, field: keyof ItemOverride, val: string) => update((d) => {
    const id = base(d).cfg!.items[i].id;
    if (d.activeBp === 0) (d.breakpoints[0].cfg!.items[i] as any)[field] = val;
    else {
      const a = d.breakpoints[d.activeBp];
      a.ov = a.ov || {};
      a.ov.items = a.ov.items || {};
      a.ov.items[id] = a.ov.items[id] || {};
      (a.ov.items[id] as any)[field] = val;
    }
  });
  const hasItemOv = (i: number, field: string) => {
    if (isBase) return false;
    const a = S.breakpoints[S.activeBp];
    const id = baseItems[i].id;
    return !!a.ov?.items?.[id] && field in (a.ov.items[id] as any);
  };
  const clearItemOv = (i: number, field: string) => update((d) => {
    const a = d.breakpoints[d.activeBp];
    const id = base(d).cfg!.items[i].id;
    if (a.ov?.items?.[id]) delete (a.ov.items[id] as any)[field];
  });
  const itemDot = (field: string) => (isBase ? null : <OvDot on={hasItemOv(S.selected, field)} onClear={() => clearItemOv(S.selected, field)} />);

  const setSelected = (i: number) => update((d) => { d.selected = i; });
  const addItem = () => update((d) => {
    const it = mkItem();
    d.breakpoints[0].cfg!.items.push(it);
    d.selected = d.breakpoints[0].cfg!.items.length - 1;
  });
  const removeItem = () => update((d) => {
    const arr = d.breakpoints[0].cfg!.items;
    if (arr.length <= 1) return;
    const id = arr[d.selected].id;
    arr.splice(d.selected, 1);
    d.breakpoints.slice(1).forEach((b) => { if (b.ov?.items) delete b.ov.items[id]; });
    d.selected = Math.max(0, d.selected - 1);
  });

  /* ---- field renderers ---- */
  const slider = (label: string, key: "colGap" | "rowGap") => (
    <div className="field" key={key}>
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{getVal(key)}{getVal("gapUnit")}</span>{labelDot(key)}</span>
      </label>
      <input type="range" min={0} max={80} value={getVal(key)} onChange={(e) => setVal(key, Number(e.target.value))} />
    </div>
  );

  const sel = (label: string, key: "gapUnit", opts: string[]) => (
    <div className="field" key={key}>
      <label><span>{label}</span><span className="rgt">{labelDot(key)}</span></label>
      <select value={getVal(key)} onChange={(e) => setVal(key, e.target.value)}>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const text = (label: string, key: "autoRows" | "autoCols") => (
    <div className="field" key={key}>
      <label><span>{label}</span><span className="rgt">{labelDot(key)}</span></label>
      <input type="text" value={getVal(key)} onChange={(e) => setVal(key, e.target.value)} />
    </div>
  );

  const seg = (label: string, key: keyof Override, opts: string[]) => (
    <div className="field" key={String(key)}>
      <label><span>{label}</span><span className="rgt">{labelDot(String(key))}</span></label>
      <div className="seg">
        {opts.map((o) => (
          <button key={o} className={getVal(key as keyof GridConfig) === o ? "on" : ""} onClick={() => setVal(key, o)}>{o}</button>
        ))}
      </div>
    </div>
  );

  const track = (label: string, key: "columns" | "rows") => {
    const arr = getVal(key) as string[];
    const setArr = (next: string[]) => setVal(key, next);
    return (
      <div className="field" key={key}>
        <label>
          <span>{label}</span>
          <span className="rgt"><span className="val">{arr.length} tracks</span>{labelDot(key)}</span>
        </label>
        <div className="track-list">
          {arr.map((t, i) => (
            <div key={i}>
              <div className="track-row">
                <span className="idx">{i + 1}</span>
                <input type="text" value={t} onChange={(e) => { const a = arr.slice(); a[i] = e.target.value; setArr(a); }} />
                <button className="icon-btn danger" title="Remove" onClick={() => { if (arr.length > 1) { const a = arr.slice(); a.splice(i, 1); setArr(a); } }}>−</button>
              </div>
              {i === arr.length - 1 && (
                <div className="quick-units">
                  {TRACK_QUICK.map((u) => (
                    <button key={u} onClick={() => { const a = arr.slice(); a[i] = u; setArr(a); }}>{u}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="add-track" onClick={() => setArr([...arr, "1fr"])}>+ Add {label.slice(0, -1).toLowerCase()}</button>
      </div>
    );
  };

  const itemInput = (field: "colStart" | "colEnd" | "rowStart" | "rowEnd", label: string) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt">{itemDot(field)}</span></label>
      <input type="text" value={selItem[field]} onChange={(e) => setItem(S.selected, field, e.target.value.trim() || "auto")} />
    </div>
  );
  const itemSelf = (field: "justifySelf" | "alignSelf", label: string) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt">{itemDot(field)}</span></label>
      <select value={selItem[field]} onChange={(e) => setItem(S.selected, field, e.target.value)}>
        {SELF.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Columns & Rows">
        {track("Columns", "columns")}
        {track("Rows", "rows")}
      </Group>

      <Group title="Gap">
        {slider("Column gap", "colGap")}
        {slider("Row gap", "rowGap")}
        {sel("Gap unit", "gapUnit", GAP_UNITS)}
      </Group>

      <Group title="Alignment">
        {seg("justify-items", "justifyItems", ALIGN_ITEMS)}
        {seg("align-items", "alignItems", ALIGN_ITEMS)}
        {seg("justify-content", "justifyContent", ALIGN_CONTENT)}
        {seg("align-content", "alignContent", ALIGN_CONTENT)}
      </Group>

      <Group title="Auto placement" open={false}>
        {seg("grid-auto-flow", "autoFlow", FLOW)}
        <div className="row2">
          {text("grid-auto-rows", "autoRows")}
          {text("grid-auto-columns", "autoCols")}
        </div>
      </Group>

      <Group title="Items">
        <div className="field">
          <label>
            <span>Items</span>
            <span className="rgt"><span className="val">{baseItems.length} total</span></span>
          </label>
          <div className="item-tabs">
            {baseItems.map((_, i) => (
              <div key={i} className={"item-tab" + (S.selected === i ? " on" : "")} onClick={() => setSelected(i)}>#{i + 1}</div>
            ))}
          </div>
          <div className="track-row" style={{ margin: "8px 0" }}>
            <button className="btn" style={{ flex: 1 }} onClick={addItem}>+ Add item</button>
            <button className="btn" style={{ flex: 1 }} onClick={removeItem}>− Remove</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>
            <div className="hint">
              Editing item #{S.selected + 1}{isBase ? "" : " at " + S.breakpoints[S.activeBp].name}. Use line numbers, "span N", or "auto".
            </div>
            <div className="row2">{itemInput("colStart", "column start")}{itemInput("colEnd", "column end")}</div>
            <div className="row2">{itemInput("rowStart", "row start")}{itemInput("rowEnd", "row end")}</div>
            <div className="row2">{itemSelf("justifySelf", "justify-self")}{itemSelf("alignSelf", "align-self")}</div>
          </div>
        </div>
      </Group>
    </div>
  );
}
