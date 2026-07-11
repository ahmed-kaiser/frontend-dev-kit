import { useState, type ReactNode } from "react";
import type { GlassState } from "../../types";
import { BLUR_QUICK, SCENES } from "../../lib/glassModel";
import type { Update } from "./GlassTool";
import "./Controls.css";

interface Props { S: GlassState; update: Update; }

type Setter = <K extends keyof GlassState>(field: K, val: GlassState[K]) => void;
type ColorKey = "tintColor" | "borderColor" | "shadowColor" | "sceneColor";
type AlphaKey = "tintAlpha" | "borderAlpha" | "shadowAlpha" | "sceneAlpha";

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

/* a colour swatch + hex + opacity trio — defined at module scope so its identity is
   stable across renders (an inner component would remount on every edit, closing the
   native colour picker and breaking mid-drag on the opacity slider). */
function ColorField({ S, set, label, colorKey, alphaKey }: {
  S: GlassState; set: Setter; label: string; colorKey: ColorKey; alphaKey: AlphaKey;
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
  /* one setter for every scalar/boolean field on the flat state */
  const set: Setter = (field, val) => update((d) => { d[field] = val; });

  const slider = (label: string, key: keyof GlassState, min: number, max: number, unit: string) => (
    <div className="field">
      <label><span>{label}</span><span className="rgt"><span className="val">{S[key] as number}{unit}</span></span></label>
      <input type="range" min={min} max={max} value={S[key] as number} onChange={(e) => set(key, Number(e.target.value) as never)} />
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Frost">
        <div className="field">
          <label><span>Blur</span><span className="rgt"><span className="val">{S.blur}px</span></span></label>
          <input type="range" min={0} max={60} value={S.blur} onChange={(e) => set("blur", Number(e.target.value))} />
          <div className="quick-units">
            {BLUR_QUICK.map((b) => (
              <button key={b} onClick={() => set("blur", b)}>{b}px</button>
            ))}
          </div>
        </div>
        <div className="row2">
          {slider("Saturation", "saturate", 0, 300, "%")}
          {slider("Brightness", "brightness", 50, 200, "%")}
        </div>
        {slider("Contrast", "contrast", 50, 200, "%")}
        <div className="hint">Saturation, brightness &amp; contrast are only emitted when non-neutral (100%).</div>
      </Group>

      <Group title="Fill">
        <ColorField S={S} set={set} label="Tint colour" colorKey="tintColor" alphaKey="tintAlpha" />
        <div className="hint">The semi-transparent layer over the blur. Low opacity keeps it glassy; higher opacity frosts it.</div>
      </Group>

      <Group title="Border & Highlight">
        <label className="mini">
          <input type="checkbox" checked={S.border} onChange={(e) => set("border", e.target.checked)} />
          Border
        </label>
        {S.border && (
          <>
            {slider("Width", "borderWidth", 0, 8, "px")}
            <ColorField S={S} set={set} label="Border colour" colorKey="borderColor" alphaKey="borderAlpha" />
          </>
        )}
        <label className="mini">
          <input type="checkbox" checked={S.highlight} onChange={(e) => set("highlight", e.target.checked)} />
          Top-edge light highlight
        </label>
        {S.highlight && slider("Highlight strength", "highlightAlpha", 0, 100, "%")}
      </Group>

      <Group title="Elevation">
        <label className="mini">
          <input type="checkbox" checked={S.shadow} onChange={(e) => set("shadow", e.target.checked)} />
          Drop shadow
        </label>
        {S.shadow && (
          <>
            <div className="row2">
              {slider("Offset Y", "shadowY", 0, 60, "px")}
              {slider("Blur", "shadowBlur", 0, 100, "px")}
            </div>
            <ColorField S={S} set={set} label="Shadow colour" colorKey="shadowColor" alphaKey="shadowAlpha" />
          </>
        )}
      </Group>

      <Group title="Shape">
        {slider("Corner radius", "radius", 0, 80, "px")}
        <div className="row2">
          {slider("Width", "width", 120, 640, "px")}
          {slider("Height", "height", 100, 480, "px")}
        </div>
      </Group>

      <Group title="Backdrop" open={false}>
        <div className="field">
          <label><span>Preview scene</span></label>
          <div className="seg">
            {SCENES.map((s) => (
              <button key={s} className={S.scene === s ? "on" : ""} onClick={() => set("scene", s)}>{s}</button>
            ))}
          </div>
        </div>
        {S.scene === "solid" && <ColorField S={S} set={set} label="Backdrop colour" colorKey="sceneColor" alphaKey="sceneAlpha" />}
        <div className="hint">The backdrop is preview-only — it isn't part of the generated <code>.glass</code> rule.</div>
      </Group>
    </div>
  );
}
