import { useState, type ReactNode } from "react";
import type { NeuState } from "../../types";
import { SHAPES, PRESETS, darkColor, lightColor } from "../../lib/neuModel";
import type { Update } from "./NeuTool";
import "./Controls.css";

interface Props { S: NeuState; update: Update; }

type Setter = <K extends keyof NeuState>(field: K, val: NeuState[K]) => void;

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
  const set: Setter = (field, val) => update((d) => { d[field] = val; });

  const slider = (label: string, key: keyof NeuState, min: number, max: number, unit: string, step = 1) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt"><span className="val">{S[key] as number}{unit}</span></span></label>
      <input type="range" min={min} max={max} step={step} value={S[key] as number}
             onChange={(e) => set(key, Number(e.target.value) as never)} />
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Surface">
        <div className="field">
          <label>
            <span>Base colour</span>
            <span className="rgt"><span className="val">{S.bg}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={S.bg} onChange={(e) => set("bg", e.target.value)} />
            <input type="text" value={S.bg} onChange={(e) => set("bg", e.target.value.trim() || "#000000")} />
          </div>
        </div>
        <div className="field">
          <label><span>Presets</span></label>
          <div className="preset-row">
            {PRESETS.map((p) => (
              <button key={p} className="preset" style={{ background: p }} title={p} onClick={() => set("bg", p)} />
            ))}
          </div>
        </div>
        <div className="hint">
          The element and its page must share this colour — that's what makes the shadows read as
          a raised or pressed surface.
        </div>
      </Group>

      <Group title="Shape">
        <div className="seg">
          {SHAPES.map((sh) => (
            <button key={sh} className={S.shape === sh ? "on" : ""} onClick={() => set("shape", sh)}>{sh}</button>
          ))}
        </div>
        <div className="hint">Flat / concave / convex sit raised; <code>pressed</code> insets the shadows.</div>
      </Group>

      <Group title="Shadow">
        {slider("Distance", "distance", 2, 60, "px")}
        {slider("Blur", "blur", 0, 120, "px")}
        {slider("Intensity", "intensity", 3, 40, "%")}
        <div className="swatch-pair">
          <span className="swatch" style={{ background: lightColor(S) }} title="Light shadow">{lightColor(S)}</span>
          <span className="swatch" style={{ background: darkColor(S) }} title="Dark shadow">{darkColor(S)}</span>
        </div>
        <div className="hint">Light and dark shadow colours are shaded from the base by the intensity.</div>
      </Group>

      <Group title="Element">
        {slider("Corner radius", "radius", 0, 100, "px")}
        {slider("Size", "size", 80, 360, "px")}
      </Group>

      <Group title="Preview" open={false}>
        {slider("Backdrop tint", "stageTint", -14, 14, "%")}
        <div className="hint">Preview-only nudge of the backdrop vs. the element, to reveal soft edges. Keep at 0 for the true effect.</div>
      </Group>
    </div>
  );
}
