import { useState, type ReactNode } from "react";
import type { ClampState } from "../../types";
import { UNITS, descending } from "../../lib/clampModel";
import type { Update } from "./ClampTool";
import "./Controls.css";

interface Props { S: ClampState; update: Update; }

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

/** A range slider paired with an editable number box, both in the same unit. */
function Field({ label, unit, value, min, max, step = 1, onChange }: {
  label: string; unit: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="unit">{unit}</span></span>
      </label>
      <div className="num-row">
        <input type="range" min={min} max={max} step={step} value={value}
               onChange={(e) => onChange(Number(e.target.value))} />
        <input type="number" value={value} step={step}
               onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    </div>
  );
}

export default function Controls({ S, update }: Props) {
  return (
    <div className="controls-inner">
      <Group title="Size range">
        <Field label="Min size" unit="px" value={S.minSize} min={0} max={200} step={0.5}
               onChange={(v) => update((d) => { d.minSize = v; })} />
        <Field label="Max size" unit="px" value={S.maxSize} min={0} max={400} step={0.5}
               onChange={(v) => update((d) => { d.maxSize = v; })} />
        {descending(S) && (
          <div className="hint">⚠ Min size is larger than max — the value will shrink as the viewport grows.</div>
        )}
      </Group>

      <Group title="Viewport range">
        <Field label="Min viewport" unit="px" value={S.minVw} min={0} max={2560} step={1}
               onChange={(v) => update((d) => { d.minVw = v; })} />
        <Field label="Max viewport" unit="px" value={S.maxVw} min={0} max={2560} step={1}
               onChange={(v) => update((d) => { d.maxVw = v; })} />
        {S.maxVw === S.minVw && (
          <div className="hint">⚠ Viewport range is zero-width — pick distinct min / max viewports to get a fluid term.</div>
        )}
      </Group>

      <Group title="Output">
        <div className="field">
          <label><span>Unit</span></label>
          <div className="seg">
            {UNITS.map((u) => (
              <button key={u} className={S.unit === u ? "on" : ""}
                      onClick={() => update((d) => { d.unit = u; })}>{u}</button>
            ))}
          </div>
        </div>
        {S.unit === "rem" && (
          <Field label="Root font-size" unit="px" value={S.root} min={1} max={32} step={1}
                 onChange={(v) => update((d) => { d.root = Math.max(1, v); })} />
        )}
        <div className="hint">
          The fluid term is a line through <code>(min-vw, min-size)</code> and <code>(max-vw, max-size)</code>,
          bounded by <code>clamp()</code>.
        </div>
      </Group>
    </div>
  );
}
