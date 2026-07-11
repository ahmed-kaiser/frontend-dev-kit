import { useState, type ReactNode } from "react";
import type { ShadowAppState, ShadowLayer } from "../../types";
import { STAGES, mkLayer, shadowStr } from "../../lib/shadowModel";
import type { Update } from "./ShadowTool";
import "./Controls.css";

interface Props { S: ShadowAppState; update: Update; }

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

export default function Controls({ S, update }: Props) {
  const layer = S.layers[S.selected];

  /* ---- selected-layer edits ---- */
  const setLayer = (field: keyof ShadowLayer, val: string | number | boolean) => update((d) => {
    (d.layers[d.selected] as any)[field] = val;
  });

  const setSelected = (i: number) => update((d) => { d.selected = i; });
  const toggleLayer = (i: number) => update((d) => { d.layers[i].on = !d.layers[i].on; });
  const addLayer = () => update((d) => {
    d.layers.push(mkLayer({ y: 2, blur: 8, alpha: 25 }));
    d.selected = d.layers.length - 1;
  });
  const dupLayer = () => update((d) => {
    const src = d.layers[d.selected];
    d.layers.splice(d.selected + 1, 0, mkLayer({ ...src }));
    d.selected += 1;
  });
  const removeLayer = () => update((d) => {
    if (d.layers.length <= 1) return;
    d.layers.splice(d.selected, 1);
    d.selected = Math.max(0, d.selected - 1);
  });

  /* ---- element (preview appearance) edits ---- */
  const setEl = (
    field: "boxColor" | "boxAlpha" | "border" | "borderWidth" | "borderColor" | "borderAlpha"
      | "radius" | "size" | "stage" | "stageColor" | "stageAlpha",
    val: string | number | boolean,
  ) => update((d) => {
    (d as any)[field] = val;
  });

  const opacity = (field: "boxAlpha" | "borderAlpha" | "stageAlpha") => (
    <div className="field">
      <label>
        <span>Opacity</span>
        <span className="rgt"><span className="val">{S[field]}%</span></span>
      </label>
      <input type="range" min={0} max={100} value={S[field]} onChange={(e) => setEl(field, Number(e.target.value))} />
    </div>
  );

  /* ---- field renderers ---- */
  const slider = (label: string, field: keyof ShadowLayer, min: number, max: number) => (
    <div className="field" key={String(field)}>
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{layer[field] as number}px</span></span>
      </label>
      <input
        type="range" min={min} max={max} value={layer[field] as number}
        onChange={(e) => setLayer(field, Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Layers">
        <div className="field">
          <label>
            <span>Shadow layers</span>
            <span className="rgt"><span className="val">{S.layers.length} total</span></span>
          </label>
          <div className="item-tabs">
            {S.layers.map((l, i) => (
              <div
                key={l.id}
                className={"item-tab" + (S.selected === i ? " on" : "") + (l.on ? "" : " off")}
                onClick={() => setSelected(i)}
              >
                <span className="swatch" style={{ background: l.color }} />#{i + 1}
              </div>
            ))}
          </div>
          <div className="track-row" style={{ margin: "8px 0" }}>
            <button className="btn" style={{ flex: 1 }} onClick={addLayer}>+ Add</button>
            <button className="btn" style={{ flex: 1 }} onClick={removeLayer}>− Remove</button>
          </div>
          <div className="track-row" style={{ margin: "0 0 8px" }}>
            <button className="btn" style={{ flex: 1 }} onClick={dupLayer}>⧉ Duplicate</button>
            <button
              className="btn"
              style={{ flex: 1 }}
              onClick={() => toggleLayer(S.selected)}
              title={layer.on ? "Hide selected layer" : "Show selected layer"}
            >
              {layer.on ? "◉ Hide" : "○ Show"}
            </button>
          </div>
          <div className="hint">Layers paint front-to-back; #{S.layers.length} sits behind #1. Editing #{S.selected + 1}.</div>
        </div>
      </Group>

      <Group title={`Shadow #${S.selected + 1}`}>
        <div className="field">
          <label><span>Type</span></label>
          <div className="seg">
            <button className={!layer.inset ? "on" : ""} onClick={() => setLayer("inset", false)}>outset</button>
            <button className={layer.inset ? "on" : ""} onClick={() => setLayer("inset", true)}>inset</button>
          </div>
        </div>
        <div className="row2">
          {slider("Offset X", "x", -100, 100)}
          {slider("Offset Y", "y", -100, 100)}
        </div>
        <div className="row2">
          {slider("Blur", "blur", 0, 150)}
          {slider("Spread", "spread", -60, 60)}
        </div>
        <div className="field">
          <label>
            <span>Color</span>
            <span className="rgt"><span className="val">{layer.color}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={layer.color} onChange={(e) => setLayer("color", e.target.value)} />
            <input
              type="text" value={layer.color}
              onChange={(e) => setLayer("color", e.target.value.trim() || "#000000")}
            />
          </div>
        </div>
        <div className="field">
          <label>
            <span>Opacity</span>
            <span className="rgt"><span className="val">{layer.alpha}%</span></span>
          </label>
          <input type="range" min={0} max={100} value={layer.alpha} onChange={(e) => setLayer("alpha", Number(e.target.value))} />
        </div>
        <div className="hint" style={{ fontFamily: "var(--mono)" }}>{shadowStr(layer)}</div>
      </Group>

      <Group title="Element" open={false}>
        <div className="field">
          <label>
            <span>Background</span>
            <span className="rgt"><span className="val">{S.boxColor}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={S.boxColor} onChange={(e) => setEl("boxColor", e.target.value)} />
            <input type="text" value={S.boxColor} onChange={(e) => setEl("boxColor", e.target.value.trim() || "#000000")} />
          </div>
        </div>
        {opacity("boxAlpha")}
        <div className="row2">
          <div className="field">
            <label><span>Radius</span><span className="rgt"><span className="val">{S.radius}px</span></span></label>
            <input type="range" min={0} max={150} value={S.radius} onChange={(e) => setEl("radius", Number(e.target.value))} />
          </div>
          <div className="field">
            <label><span>Size</span><span className="rgt"><span className="val">{S.size}px</span></span></label>
            <input type="range" min={60} max={320} value={S.size} onChange={(e) => setEl("size", Number(e.target.value))} />
          </div>
        </div>
        <div className="field">
          <label><span>Border</span></label>
          <div className="seg">
            <button className={!S.border ? "on" : ""} onClick={() => setEl("border", false)}>none</button>
            <button className={S.border ? "on" : ""} onClick={() => setEl("border", true)}>border</button>
          </div>
        </div>
        {S.border && (
          <>
            <div className="field">
              <label><span>Border width</span><span className="rgt"><span className="val">{S.borderWidth}px</span></span></label>
              <input type="range" min={0} max={40} value={S.borderWidth} onChange={(e) => setEl("borderWidth", Number(e.target.value))} />
            </div>
            <div className="field">
              <label>
                <span>Border color</span>
                <span className="rgt"><span className="val">{S.borderColor}</span></span>
              </label>
              <div className="color-row">
                <input type="color" value={S.borderColor} onChange={(e) => setEl("borderColor", e.target.value)} />
                <input type="text" value={S.borderColor} onChange={(e) => setEl("borderColor", e.target.value.trim() || "#000000")} />
              </div>
            </div>
            {opacity("borderAlpha")}
          </>
        )}
        <div className="field">
          <label><span>Preview backdrop</span></label>
          <div className="seg">
            {STAGES.map((s) => (
              <button key={s} className={S.stage === s ? "on" : ""} onClick={() => setEl("stage", s)}>{s}</button>
            ))}
          </div>
        </div>
        {S.stage === "custom" && (
          <div className="field">
            <label>
              <span>Backdrop color</span>
              <span className="rgt"><span className="val">{S.stageColor}</span></span>
            </label>
            <div className="color-row">
              <input type="color" value={S.stageColor} onChange={(e) => setEl("stageColor", e.target.value)} />
              <input type="text" value={S.stageColor} onChange={(e) => setEl("stageColor", e.target.value.trim() || "#000000")} />
            </div>
          </div>
        )}
        {S.stage === "custom" && opacity("stageAlpha")}
      </Group>
    </div>
  );
}
