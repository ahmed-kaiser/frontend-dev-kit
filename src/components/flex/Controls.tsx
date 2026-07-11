import { useState, type ReactNode } from "react";
import type { FlexAppState, FlexConfig, FlexItemOverride, FlexOverride } from "../../types";
import {
  ALIGN_CONTENT, ALIGN_ITEMS, ALIGN_SELF, BASIS_QUICK, DIRECTIONS, GAP_UNITS, JUSTIFY, WRAPS,
  base, mkItem, resolveForLayer,
} from "../../lib/flexModel";
import type { Update } from "./FlexTool";
import "./Controls.css";

interface Props { S: FlexAppState; update: Update; }

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

  /* ---- container scalar values ---- */
  const getVal = <K extends keyof FlexConfig>(k: K): FlexConfig[K] => cfg[k];
  const setVal = (key: keyof FlexOverride, val: unknown) => update((d) => {
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
  const setItem = (i: number, field: keyof FlexItemOverride, val: string | number) => update((d) => {
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
  const seg = (label: string, key: keyof FlexOverride, opts: string[]) => (
    <div className="field" key={String(key)}>
      <label><span>{label}</span><span className="rgt">{labelDot(String(key))}</span></label>
      <div className="seg">
        {opts.map((o) => (
          <button key={o} className={getVal(key as keyof FlexConfig) === o ? "on" : ""} onClick={() => setVal(key, o)}>{o}</button>
        ))}
      </div>
    </div>
  );

  const slider = (label: string, key: "rowGap" | "colGap") => (
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

  const itemNum = (field: "order" | "grow" | "shrink", label: string, min = 0) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt">{itemDot(field)}</span></label>
      <input
        type="number" min={min} value={selItem[field]}
        onChange={(e) => setItem(S.selected, field, Number(e.target.value))}
      />
    </div>
  );

  const itemSelf = (label: string) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt">{itemDot("alignSelf")}</span></label>
      <select value={selItem.alignSelf} onChange={(e) => setItem(S.selected, "alignSelf", e.target.value)}>
        {ALIGN_SELF.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Flow">
        {seg("flex-direction", "direction", DIRECTIONS)}
        {seg("flex-wrap", "wrap", WRAPS)}
      </Group>

      <Group title="Gap">
        {slider("Row gap", "rowGap")}
        {slider("Column gap", "colGap")}
        {sel("Gap unit", "gapUnit", GAP_UNITS)}
      </Group>

      <Group title="Alignment">
        {seg("justify-content", "justifyContent", JUSTIFY)}
        {seg("align-items", "alignItems", ALIGN_ITEMS)}
        {seg("align-content", "alignContent", ALIGN_CONTENT)}
        <div className="hint">align-content only affects layout once items wrap onto multiple lines.</div>
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
              Editing item #{S.selected + 1}{isBase ? "" : " at " + S.breakpoints[S.activeBp].name}.
            </div>
            <div className="row2">
              {itemNum("grow", "flex-grow")}
              {itemNum("shrink", "flex-shrink")}
            </div>
            <div className="field">
              <label><span>flex-basis</span><span className="rgt">{itemDot("basis")}</span></label>
              <input type="text" value={selItem.basis} onChange={(e) => setItem(S.selected, "basis", e.target.value.trim() || "auto")} />
              <div className="quick-units">
                {BASIS_QUICK.map((u) => (
                  <button key={u} onClick={() => setItem(S.selected, "basis", u)}>{u}</button>
                ))}
              </div>
            </div>
            <div className="row2">
              {itemNum("order", "order", -99)}
              {itemSelf("align-self")}
            </div>
          </div>
        </div>
      </Group>
    </div>
  );
}
