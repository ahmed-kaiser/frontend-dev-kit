import { useState, type ReactNode } from "react";
import type { ShapeState } from "../../types";
import { PRESETS, STAGES, TYPES, clipPath } from "../../lib/shapeModel";
import type { Update } from "./ShapeTool";
import "./Controls.css";

interface Props { S: ShapeState; update: Update; }

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
  const set = (field: string, val: string | number | boolean) => update((d) => { (d as any)[field] = val; });

  const setType = (t: string) => update((d) => { d.type = t; });

  const applyPreset = (pts: [number, number][]) => update((d) => {
    d.type = "polygon";
    d.points = pts.map(([x, y]) => ({ x, y }));
    d.selected = Math.min(d.selected, d.points.length - 1);
  });

  const setPoint = (axis: "x" | "y", val: number) => update((d) => { d.points[d.selected][axis] = val; });
  const selectPoint = (i: number) => update((d) => { d.selected = i; });
  const addPoint = () => update((d) => {
    const i = d.selected;
    const a = d.points[i];
    const b = d.points[(i + 1) % d.points.length];
    d.points.splice(i + 1, 0, { x: Math.round((a.x + b.x) / 2), y: Math.round((a.y + b.y) / 2) });
    d.selected = i + 1;
  });
  const removePoint = () => update((d) => {
    if (d.points.length <= 3) return;
    d.points.splice(d.selected, 1);
    d.selected = Math.max(0, Math.min(d.selected, d.points.length - 1));
  });

  const slider = (label: string, field: string, min: number, max: number, unit = "%") => (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{(S as any)[field]}{unit}</span></span>
      </label>
      <input
        type="range" min={min} max={max} value={(S as any)[field]}
        onChange={(e) => set(field, Number(e.target.value))}
      />
    </div>
  );

  const pt = S.points[S.selected];

  return (
    <div className="controls-inner">
      <Group title="Shape">
        <div className="field">
          <label><span>Type</span></label>
          <div className="seg">
            {TYPES.map((t) => (
              <button key={t} className={S.type === t ? "on" : ""} onClick={() => setType(t)}>{t}</button>
            ))}
          </div>
        </div>

        {S.type === "polygon" && (
          <>
            <div className="field">
              <label><span>Presets</span></label>
              <div className="seg preset-seg">
                {PRESETS.map((pr) => (
                  <button key={pr.label} onClick={() => applyPreset(pr.pts)}>{pr.label}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>
                <span>Vertices</span>
                <span className="rgt"><span className="val">{S.points.length} points</span></span>
              </label>
              <div className="item-tabs">
                {S.points.map((_, i) => (
                  <div
                    key={i}
                    className={"item-tab" + (S.selected === i ? " on" : "")}
                    onClick={() => selectPoint(i)}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="track-row" style={{ marginTop: 8 }}>
                <button className="btn" style={{ flex: 1 }} onClick={addPoint}>+ Add</button>
                <button className="btn" style={{ flex: 1 }} onClick={removePoint} disabled={S.points.length <= 3}>− Remove</button>
              </div>
            </div>
            <div className="row2">
              <div className="field">
                <label><span>Point X</span><span className="rgt"><span className="val">{pt.x}%</span></span></label>
                <input type="range" min={0} max={100} value={pt.x} onChange={(e) => setPoint("x", Number(e.target.value))} />
              </div>
              <div className="field">
                <label><span>Point Y</span><span className="rgt"><span className="val">{pt.y}%</span></span></label>
                <input type="range" min={0} max={100} value={pt.y} onChange={(e) => setPoint("y", Number(e.target.value))} />
              </div>
            </div>
            <div className="hint">Tip: drag the vertices directly on the preview.</div>
          </>
        )}

        {S.type === "circle" && (
          <>
            {slider("Radius", "circleR", 0, 75)}
            <div className="row2">
              {slider("Center X", "circleX", 0, 100)}
              {slider("Center Y", "circleY", 0, 100)}
            </div>
          </>
        )}

        {S.type === "ellipse" && (
          <>
            <div className="row2">
              {slider("Radius X", "ellipseRX", 0, 75)}
              {slider("Radius Y", "ellipseRY", 0, 75)}
            </div>
            <div className="row2">
              {slider("Center X", "ellipseX", 0, 100)}
              {slider("Center Y", "ellipseY", 0, 100)}
            </div>
          </>
        )}

        {S.type === "inset" && (
          <>
            <div className="row2">
              {slider("Top", "insetT", 0, 50)}
              {slider("Right", "insetR", 0, 50)}
            </div>
            <div className="row2">
              {slider("Bottom", "insetB", 0, 50)}
              {slider("Left", "insetL", 0, 50)}
            </div>
            {slider("Corner round", "insetRound", 0, 120, "px")}
          </>
        )}

        <div className="hint" style={{ fontFamily: "var(--mono)" }}>clip-path: {clipPath(S)};</div>
      </Group>

      <Group title="Element" open={false}>
        <div className="field">
          <label>
            <span>Fill</span>
            <span className="rgt"><span className="val">{S.bg}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={S.bg} onChange={(e) => set("bg", e.target.value)} />
            <input type="text" value={S.bg} onChange={(e) => set("bg", e.target.value.trim() || "#000000")} />
          </div>
        </div>
        {slider("Opacity", "bgAlpha", 0, 100)}
        <div className="row2">
          {slider("Width", "width", 100, 480, "px")}
          {slider("Height", "height", 100, 480, "px")}
        </div>
        <label className="mini">
          <input type="checkbox" checked={S.showGuides} onChange={(e) => set("showGuides", e.target.checked)} />
          Outline &amp; draggable vertices
        </label>
        <div className="field">
          <label><span>Preview backdrop</span></label>
          <div className="seg">
            {STAGES.map((s) => (
              <button key={s} className={S.stage === s ? "on" : ""} onClick={() => set("stage", s)}>{s}</button>
            ))}
          </div>
        </div>
        {S.stage === "custom" && (
          <>
            <div className="field">
              <label>
                <span>Backdrop color</span>
                <span className="rgt"><span className="val">{S.stageColor}</span></span>
              </label>
              <div className="color-row">
                <input type="color" value={S.stageColor} onChange={(e) => set("stageColor", e.target.value)} />
                <input type="text" value={S.stageColor} onChange={(e) => set("stageColor", e.target.value.trim() || "#000000")} />
              </div>
            </div>
            {slider("Backdrop opacity", "stageAlpha", 0, 100)}
          </>
        )}
      </Group>
    </div>
  );
}
