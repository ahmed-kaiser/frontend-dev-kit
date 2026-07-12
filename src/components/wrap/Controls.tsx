import { useState, type ReactNode } from "react";
import type { WrapState } from "../../types";
import {
  ALIGN, HYPHENS, MAX_W, MIN_W, OVERFLOW, OVERFLOW_WRAP, PRESETS, STAGES,
  TEXT_OVERFLOW, TEXT_WRAP, WHITE_SPACE,
} from "../../lib/wrapModel";
import type { Update } from "./WrapTool";
import "./Controls.css";

interface Props { S: WrapState; update: Update; }

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
  const set = (field: keyof WrapState, val: string | number | boolean) =>
    update((d) => { (d as any)[field] = val; });

  const applyPreset = (patch: Partial<WrapState>) => update((d) => { Object.assign(d, patch); });

  const seg = (label: string, field: keyof WrapState, options: string[]) => (
    <div className="field">
      <label><span>{label}</span></label>
      <div className="seg">
        {options.map((o) => (
          <button key={o} className={S[field] === o ? "on" : ""} onClick={() => set(field, o)}>{o}</button>
        ))}
      </div>
    </div>
  );

  const slider = (label: string, field: keyof WrapState, min: number, max: number, step = 1, unit = "") => (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{S[field] as number}{unit}</span></span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={S[field] as number}
        onChange={(e) => set(field, Number(e.target.value))}
      />
    </div>
  );

  return (
    <div className="controls-inner">
      <Group title="Sample">
        <div className="field">
          <label><span>Text</span></label>
          <textarea
            className="sample-text"
            value={S.text}
            rows={5}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        {slider("Container width", "width", MIN_W, MAX_W, 1, "px")}
        <div className="hint">Tip: drag the right edge of the box on the preview to resize.</div>
      </Group>

      <Group title="Wrap & break">
        <div className="field">
          <label><span>Presets</span></label>
          <div className="seg preset-seg">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p.patch)}>{p.label}</button>
            ))}
          </div>
        </div>
        {seg("text-wrap", "textWrap", TEXT_WRAP)}
        <div className="hint">
          <b>balance</b> evens out line lengths (headings); <b>pretty</b> avoids orphans (paragraphs).
        </div>
        {seg("white-space", "whiteSpace", WHITE_SPACE)}
        {seg("overflow-wrap", "overflowWrap", OVERFLOW_WRAP)}
        {seg("hyphens", "hyphens", HYPHENS)}
      </Group>

      <Group title="Truncate" open={false}>
        <label className="mini">
          <input type="checkbox" checked={S.clamp} onChange={(e) => set("clamp", e.target.checked)} />
          Line clamp (<code>-webkit-line-clamp</code>)
        </label>
        {S.clamp && slider("Lines", "lines", 1, 10)}
        {!S.clamp && seg("overflow", "overflow", OVERFLOW)}
        {seg("text-overflow", "textOverflow", TEXT_OVERFLOW)}
        <div className="hint">
          <b>ellipsis</b> needs clipped overflow — use line clamp, or set <b>white-space: nowrap</b> +{" "}
          <b>overflow: hidden</b> for a single line.
        </div>
      </Group>

      <Group title="Typography" open={false}>
        <div className="row2">
          {slider("Font size", "fontSize", 11, 48, 1, "px")}
          {slider("Line height", "lineHeight", 1, 2.4, 0.05)}
        </div>
        {slider("Weight", "fontWeight", 100, 900, 100)}
        {seg("text-align", "align", ALIGN)}
        <div className="field">
          <label><span>Preview backdrop</span></label>
          <div className="seg">
            {STAGES.map((s) => (
              <button key={s} className={S.stage === s ? "on" : ""} onClick={() => set("stage", s)}>{s}</button>
            ))}
          </div>
        </div>
      </Group>
    </div>
  );
}
