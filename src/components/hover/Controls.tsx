import { useState, type ReactNode } from "react";
import type { HoverState } from "../../types";
import { EASINGS, PRESETS } from "../../lib/hoverModel";
import type { Update } from "./HoverTool";
import "./Controls.css";

interface Props { S: HoverState; update: Update; }

type Setter = <K extends keyof HoverState>(field: K, val: HoverState[K]) => void;
type ColorKey = "bg" | "color" | "borderColor" | "shadowColor" | "hBg" | "hColor" | "hShadowColor" | "hBorderColor";
type AlphaKey = "bgAlpha" | "colorAlpha" | "borderAlpha" | "shadowAlpha" | "hBgAlpha" | "hColorAlpha" | "hShadowAlpha" | "hBorderAlpha";

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

/* module-scope so its identity stays stable across edits — an inner component would
   remount every render, closing the native colour picker and breaking slider drags
   (the lesson noted for Glass in CLAUDE.md). */
function ColorField({ S, set, label, colorKey, alphaKey }: {
  S: HoverState; set: Setter; label: string; colorKey: ColorKey; alphaKey: AlphaKey;
}) {
  return (
    <>
      <div className="field">
        <label>
          <span>{label}</span>
          <span className="rgt"><span className="val">{S[colorKey]}</span></span>
        </label>
        <div className="color-row">
          <input type="color" value={S[colorKey]} onChange={(e) => set(colorKey, e.target.value)} />
          <input type="text" value={S[colorKey]} onChange={(e) => set(colorKey, e.target.value.trim() || "#000000")} />
        </div>
      </div>
      <div className="field">
        <label><span>Opacity</span><span className="rgt"><span className="val">{S[alphaKey]}%</span></span></label>
        <input type="range" min={0} max={100} value={S[alphaKey]} onChange={(e) => set(alphaKey, Number(e.target.value))} />
      </div>
    </>
  );
}

export default function Controls({ S, update }: Props) {
  const set: Setter = (field, val) => update((d) => { d[field] = val; });

  const slider = (label: string, key: keyof HoverState, min: number, max: number, unit: string, step = 1) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt"><span className="val">{S[key] as number}{unit}</span></span></label>
      <input type="range" min={min} max={max} step={step} value={S[key] as number}
             onChange={(e) => set(key, Number(e.target.value) as never)} />
    </div>
  );

  const toggle = (label: string, key: keyof HoverState) => (
    <label className="mini">
      <input type="checkbox" checked={S[key] as boolean} onChange={(e) => set(key, e.target.checked as never)} />
      {label}
    </label>
  );

  return (
    <div className="controls-inner">
      <Group title="Presets">
        <div className="seg preset-seg">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => update((d) => p.apply(d))}>{p.label}</button>
          ))}
        </div>
        <div className="hint">Each preset sets a full hover bundle — then tweak the groups below.</div>
      </Group>

      <Group title="Transition">
        <div className="row2">
          {slider("Duration", "duration", 0, 1000, "ms", 10)}
          {slider("Delay", "delay", 0, 1000, "ms", 10)}
        </div>
        <div className="field">
          <label><span>Easing</span></label>
          <div className="seg">
            {EASINGS.map((e) => (
              <button key={e.value} className={S.easing === e.value ? "on" : ""}
                      onClick={() => set("easing", e.value)}>{e.label}</button>
            ))}
          </div>
        </div>
      </Group>

      <Group title="Element (rest)">
        <div className="field">
          <label><span>Label</span></label>
          <input type="text" value={S.label} onChange={(e) => set("label", e.target.value)} spellCheck={false} />
        </div>
        <div className="row2">
          {slider("Width (0 = auto)", "width", 0, 400, "px")}
          {slider("Radius", "radius", 0, 60, "px")}
        </div>
        <div className="row2">
          {slider("Padding X", "padX", 0, 60, "px")}
          {slider("Padding Y", "padY", 0, 40, "px")}
        </div>
        <div className="row2">
          {slider("Font size", "fontSize", 10, 32, "px")}
          <div className="field">
            <label><span>Weight</span><span className="rgt"><span className="val">{S.fontWeight}</span></span></label>
            <input type="range" min={100} max={900} step={100} value={S.fontWeight}
                   onChange={(e) => set("fontWeight", Number(e.target.value))} />
          </div>
        </div>
        <ColorField S={S} set={set} label="Background" colorKey="bg" alphaKey="bgAlpha" />
        <ColorField S={S} set={set} label="Text colour" colorKey="color" alphaKey="colorAlpha" />
        {toggle("Border", "border")}
        {S.border && (
          <>
            {slider("Border width", "borderWidth", 0, 8, "px")}
            <ColorField S={S} set={set} label="Border colour" colorKey="borderColor" alphaKey="borderAlpha" />
          </>
        )}
        {toggle("Drop shadow", "shadow")}
        {S.shadow && (
          <>
            <div className="row2">
              {slider("Offset Y", "shadowY", -20, 40, "px")}
              {slider("Blur", "shadowBlur", 0, 80, "px")}
            </div>
            {slider("Spread", "shadowSpread", -20, 20, "px")}
            <ColorField S={S} set={set} label="Shadow colour" colorKey="shadowColor" alphaKey="shadowAlpha" />
          </>
        )}
      </Group>

      <Group title="Hover · Transform">
        {toggle("Change transform on hover", "hoverTransform")}
        {S.hoverTransform && (
          <>
            {slider("Scale", "hScale", 0.5, 1.6, "×", 0.01)}
            {slider("Rotate", "hRotate", -45, 45, "°")}
            <div className="row2">
              {slider("Translate X", "hTx", -40, 40, "px")}
              {slider("Translate Y", "hTy", -40, 40, "px")}
            </div>
            <div className="hint">Negative Translate Y lifts the element up.</div>
          </>
        )}
      </Group>

      <Group title="Hover · Colours">
        {toggle("Change background on hover", "hoverBg")}
        {S.hoverBg && <ColorField S={S} set={set} label="Hover background" colorKey="hBg" alphaKey="hBgAlpha" />}
        {toggle("Change text colour on hover", "hoverColor")}
        {S.hoverColor && <ColorField S={S} set={set} label="Hover text" colorKey="hColor" alphaKey="hColorAlpha" />}
      </Group>

      <Group title="Hover · Shadow" open={false}>
        {toggle("Change shadow on hover", "hoverShadow")}
        {S.hoverShadow && (
          <>
            <div className="row2">
              {slider("Offset Y", "hShadowY", -20, 60, "px")}
              {slider("Blur", "hShadowBlur", 0, 100, "px")}
            </div>
            {slider("Spread", "hShadowSpread", -20, 30, "px")}
            <ColorField S={S} set={set} label="Hover shadow" colorKey="hShadowColor" alphaKey="hShadowAlpha" />
          </>
        )}
      </Group>

      <Group title="Hover · Border" open={false}>
        {toggle("Change border on hover", "hoverBorder")}
        {S.hoverBorder && (
          <>
            {slider("Border width", "hBorderWidth", 0, 8, "px")}
            <ColorField S={S} set={set} label="Hover border" colorKey="hBorderColor" alphaKey="hBorderAlpha" />
          </>
        )}
      </Group>

      <Group title="Hover · Opacity" open={false}>
        {toggle("Change opacity on hover", "hoverOpacity")}
        {S.hoverOpacity && slider("Opacity", "hOpacity", 0, 100, "%")}
      </Group>

      <Group title="Hover · Filter" open={false}>
        {toggle("Change filter on hover", "hoverFilter")}
        {S.hoverFilter && (
          <>
            {slider("Brightness", "hBrightness", 50, 200, "%")}
            {slider("Blur", "hBlur", 0, 12, "px")}
          </>
        )}
      </Group>
    </div>
  );
}
