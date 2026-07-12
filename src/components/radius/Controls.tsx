import { useState, type ReactNode } from "react";
import type { RadiusCorner, RadiusState } from "../../types";
import {
  CORNERS, CORNER_LABELS, STAGES, UNITS, radiusValue, unitMax, unitStep,
  type CornerKey,
} from "../../lib/radiusModel";
import type { Update } from "./RadiusTool";
import "./Controls.css";

interface Props { S: RadiusState; update: Update; }

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

/* corner-radius presets — [unit, value, elliptical] applied to all four corners */
const PRESETS: { label: string; unit: string; val: number }[] = [
  { label: "Sharp", unit: "px", val: 0 },
  { label: "Soft", unit: "px", val: 12 },
  { label: "Round", unit: "px", val: 28 },
  { label: "Pill", unit: "px", val: 999 },
  { label: "Circle", unit: "%", val: 50 },
];

export default function Controls({ S, update }: Props) {
  const [sel, setSel] = useState<CornerKey>("tl");

  const max = unitMax(S.unit);
  const step = unitStep(S.unit);
  /* when linked, all corners are identical so read from tl; else the selected corner */
  const active = S.corners[S.linked ? "tl" : sel];

  /* set an axis on the target corner(s); keeps x==y when not elliptical */
  const setAxis = (axis: "x" | "y", val: number) => update((d) => {
    const apply = (c: RadiusCorner) => {
      if (!d.elliptical) { c.x = val; c.y = val; }
      else c[axis] = val;
    };
    if (d.linked) CORNERS.forEach((k) => apply(d.corners[k]));
    else apply(d.corners[sel]);
  });

  const setLinked = (linked: boolean) => update((d) => {
    d.linked = linked;
    if (linked) {
      const src = { ...d.corners[sel] };            // unify to the selected corner
      CORNERS.forEach((k) => { d.corners[k] = { ...src }; });
    }
  });

  const setElliptical = (v: boolean) => update((d) => { d.elliptical = v; });
  const setUnit = (u: string) => update((d) => { d.unit = u; });

  const applyPreset = (p: { unit: string; val: number }) => update((d) => {
    d.unit = p.unit;
    d.elliptical = false;
    d.linked = true;
    CORNERS.forEach((k) => { d.corners[k] = { x: p.val, y: p.val }; });
  });

  const setEl = (
    field: "bg" | "bgAlpha" | "width" | "height" | "showHandles" | "stage" | "stageColor" | "stageAlpha",
    val: string | number | boolean,
  ) => update((d) => { (d as any)[field] = val; });

  const axisSlider = (label: string, axis: "x" | "y") => (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{active[axis]}{S.unit}</span></span>
      </label>
      <input
        type="range" min={0} max={max} step={step} value={active[axis]}
        onChange={(e) => setAxis(axis, Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Corners">
        <div className="field">
          <label><span>Presets</span></label>
          <div className="seg">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="row2">
          <div className="field">
            <label><span>Corners</span></label>
            <div className="seg">
              <button className={S.linked ? "on" : ""} onClick={() => setLinked(true)}>linked</button>
              <button className={!S.linked ? "on" : ""} onClick={() => setLinked(false)}>per-corner</button>
            </div>
          </div>
          <div className="field">
            <label><span>Radii</span></label>
            <div className="seg">
              <button className={!S.elliptical ? "on" : ""} onClick={() => setElliptical(false)}>uniform</button>
              <button className={S.elliptical ? "on" : ""} onClick={() => setElliptical(true)}>elliptical</button>
            </div>
          </div>
        </div>

        <div className="field">
          <label><span>Unit</span></label>
          <div className="seg">
            {UNITS.map((u) => (
              <button key={u} className={S.unit === u ? "on" : ""} onClick={() => setUnit(u)}>{u}</button>
            ))}
          </div>
        </div>

        {!S.linked && (
          <div className="field">
            <label>
              <span>Edit corner</span>
              <span className="rgt"><span className="val">{CORNER_LABELS[sel]}</span></span>
            </label>
            <div className="item-tabs corner-tabs">
              {CORNERS.map((k) => (
                <div
                  key={k}
                  className={"item-tab corner-tab c-" + k + (sel === k ? " on" : "")}
                  onClick={() => setSel(k)}
                  title={CORNER_LABELS[k]}
                >
                  {k.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}

        {S.elliptical ? (
          <div className="row2">
            {axisSlider("Horizontal", "x")}
            {axisSlider("Vertical", "y")}
          </div>
        ) : (
          axisSlider("Radius", "x")
        )}

        <div className="hint" style={{ fontFamily: "var(--mono)" }}>border-radius: {radiusValue(S)};</div>
      </Group>

      <Group title="Element" open={false}>
        <div className="field">
          <label>
            <span>Background</span>
            <span className="rgt"><span className="val">{S.bg}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={S.bg} onChange={(e) => setEl("bg", e.target.value)} />
            <input type="text" value={S.bg} onChange={(e) => setEl("bg", e.target.value.trim() || "#000000")} />
          </div>
        </div>
        <div className="field">
          <label>
            <span>Opacity</span>
            <span className="rgt"><span className="val">{S.bgAlpha}%</span></span>
          </label>
          <input type="range" min={0} max={100} value={S.bgAlpha} onChange={(e) => setEl("bgAlpha", Number(e.target.value))} />
        </div>
        <div className="row2">
          <div className="field">
            <label><span>Width</span><span className="rgt"><span className="val">{S.width}px</span></span></label>
            <input type="range" min={80} max={480} value={S.width} onChange={(e) => setEl("width", Number(e.target.value))} />
          </div>
          <div className="field">
            <label><span>Height</span><span className="rgt"><span className="val">{S.height}px</span></span></label>
            <input type="range" min={80} max={480} value={S.height} onChange={(e) => setEl("height", Number(e.target.value))} />
          </div>
        </div>
        <label className="mini">
          <input type="checkbox" checked={S.showHandles} onChange={(e) => setEl("showHandles", e.target.checked)} />
          Draggable corner handles
        </label>
        <div className="field">
          <label><span>Preview backdrop</span></label>
          <div className="seg">
            {STAGES.map((s) => (
              <button key={s} className={S.stage === s ? "on" : ""} onClick={() => setEl("stage", s)}>{s}</button>
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
                <input type="color" value={S.stageColor} onChange={(e) => setEl("stageColor", e.target.value)} />
                <input type="text" value={S.stageColor} onChange={(e) => setEl("stageColor", e.target.value.trim() || "#000000")} />
              </div>
            </div>
            <div className="field">
              <label>
                <span>Backdrop opacity</span>
                <span className="rgt"><span className="val">{S.stageAlpha}%</span></span>
              </label>
              <input type="range" min={0} max={100} value={S.stageAlpha} onChange={(e) => setEl("stageAlpha", Number(e.target.value))} />
            </div>
          </>
        )}
      </Group>
    </div>
  );
}
