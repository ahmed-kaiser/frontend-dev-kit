import { useState, type ReactNode } from "react";
import type { GradientState, GradientStop } from "../../types";
import { ANGLE_QUICK, RADIAL_SHAPES, TYPES, barValue, mkStop } from "../../lib/gradientModel";
import type { Update } from "./GradientTool";
import "./Controls.css";

interface Props { S: GradientState; update: Update; }

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
  const stop = S.stops[S.selected];
  const usesAngle = S.type === "linear" || S.type === "conic";
  const usesPosition = S.type === "radial" || S.type === "conic";

  /* ---- root scalar edits ---- */
  const setVal = (field: "type" | "angle" | "radialShape" | "posX" | "posY", val: string | number) =>
    update((d) => { (d as any)[field] = val; });

  /* ---- stop edits ---- */
  const setStop = (field: keyof GradientStop, val: string | number) => update((d) => {
    (d.stops[d.selected] as any)[field] = val;
  });
  const setSelected = (i: number) => update((d) => { d.selected = i; });
  const addStop = () => update((d) => {
    d.stops.push(mkStop({ color: stop.color, pos: 50 }));
    d.selected = d.stops.length - 1;
  });
  const removeStop = () => update((d) => {
    if (d.stops.length <= 2) return; // a gradient needs at least two stops
    d.stops.splice(d.selected, 1);
    d.selected = Math.max(0, d.selected - 1);
  });

  return (
    <div className="controls-inner">
      <Group title="Type">
        <div className="field">
          <label><span>gradient type</span></label>
          <div className="seg">
            {TYPES.map((t) => (
              <button key={t} className={S.type === t ? "on" : ""} onClick={() => setVal("type", t)}>{t}</button>
            ))}
          </div>
        </div>
      </Group>

      <Group title="Geometry">
        {usesAngle && (
          <div className="field">
            <label>
              <span>{S.type === "conic" ? "From angle" : "Angle"}</span>
              <span className="rgt"><span className="val">{S.angle}°</span></span>
            </label>
            <input type="range" min={0} max={360} value={S.angle} onChange={(e) => setVal("angle", Number(e.target.value))} />
            <div className="quick-units">
              {ANGLE_QUICK.map((a) => (
                <button key={a} onClick={() => setVal("angle", a)}>{a}°</button>
              ))}
            </div>
          </div>
        )}
        {S.type === "radial" && (
          <div className="field">
            <label><span>Shape</span></label>
            <div className="seg">
              {RADIAL_SHAPES.map((s) => (
                <button key={s} className={S.radialShape === s ? "on" : ""} onClick={() => setVal("radialShape", s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {usesPosition && (
          <div className="row2">
            <div className="field">
              <label><span>Center X</span><span className="rgt"><span className="val">{S.posX}%</span></span></label>
              <input type="range" min={0} max={100} value={S.posX} onChange={(e) => setVal("posX", Number(e.target.value))} />
            </div>
            <div className="field">
              <label><span>Center Y</span><span className="rgt"><span className="val">{S.posY}%</span></span></label>
              <input type="range" min={0} max={100} value={S.posY} onChange={(e) => setVal("posY", Number(e.target.value))} />
            </div>
          </div>
        )}
        {!usesAngle && !usesPosition && <div className="hint">This gradient type has no geometry options.</div>}
      </Group>

      <Group title="Color stops">
        <div className="grad-bar" style={{ background: barValue(S) }} />
        <div className="field">
          <label>
            <span>Stops</span>
            <span className="rgt"><span className="val">{S.stops.length} total</span></span>
          </label>
          <div className="item-tabs">
            {S.stops.map((s, i) => (
              <div key={s.id} className={"item-tab" + (S.selected === i ? " on" : "")} onClick={() => setSelected(i)}>
                <span className="swatch" style={{ background: s.color }} />#{i + 1}
              </div>
            ))}
          </div>
          <div className="track-row" style={{ margin: "8px 0" }}>
            <button className="btn" style={{ flex: 1 }} onClick={addStop}>+ Add</button>
            <button className="btn" style={{ flex: 1 }} onClick={removeStop} disabled={S.stops.length <= 2}>− Remove</button>
          </div>
        </div>

        <div className="field">
          <label>
            <span>Color</span>
            <span className="rgt"><span className="val">{stop.color}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={stop.color} onChange={(e) => setStop("color", e.target.value)} />
            <input type="text" value={stop.color} onChange={(e) => setStop("color", e.target.value.trim() || "#000000")} />
          </div>
        </div>
        <div className="row2">
          <div className="field">
            <label><span>Opacity</span><span className="rgt"><span className="val">{stop.alpha}%</span></span></label>
            <input type="range" min={0} max={100} value={stop.alpha} onChange={(e) => setStop("alpha", Number(e.target.value))} />
          </div>
          <div className="field">
            <label><span>Position</span><span className="rgt"><span className="val">{stop.pos}%</span></span></label>
            <input type="range" min={0} max={100} value={stop.pos} onChange={(e) => setStop("pos", Number(e.target.value))} />
          </div>
        </div>
      </Group>
    </div>
  );
}
