import { useState, type ReactNode } from "react";
import type { ColorState } from "../../types";
import {
  PRESETS, hexToRgb, toHex, hsl, oklch, hslToRgb, oklchToRgb, outOfGamut,
} from "../../lib/colorModel";
import type { Update } from "./ColorTool";
import "./Controls.css";

interface Props { S: ColorState; update: Update; }

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

/** A labelled range slider with a value readout. */
function Slider({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div className="field">
      <label><span>{label}</span><span className="rgt"><span className="val">{value}</span></span></label>
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function Controls({ S, update }: Props) {
  const setRgb = (r: number, g: number, b: number) =>
    update((d) => { d.r = r; d.g = g; d.b = b; });

  /* HEX / native picker */
  const applyHex = (text: string) => {
    const parsed = hexToRgb(text);
    if (!parsed) return;
    update((d) => {
      d.r = parsed.r; d.g = parsed.g; d.b = parsed.b;
      if (parsed.alpha !== undefined) d.alpha = parsed.alpha;
    });
  };
  const [hexDraft, setHexDraft] = useState<string | null>(null);
  const hexShown = hexDraft ?? toHex(S);

  /* RGB */
  const setChannel = (ch: "r" | "g" | "b", v: number) => update((d) => { (d as any)[ch] = v; });

  /* HSL — derive current, replace one channel, convert back */
  const H = hsl(S);
  const setHsl = (part: "h" | "s" | "l", v: number) => {
    const next = { h: H.h, s: H.s, l: H.l, [part]: v };
    const { r, g, b } = hslToRgb(next.h, next.s, next.l);
    setRgb(r, g, b);
  };

  /* OKLCH */
  const O = oklch(S);
  const setOklch = (part: "l" | "c" | "h", v: number) => {
    const next = { l: O.l, c: O.c, h: O.h, [part]: v };
    const { r, g, b } = oklchToRgb(next.l, next.c, next.h);
    setRgb(r, g, b);
  };
  const gamutWarn = outOfGamut(O.l, O.c, O.h);

  const rnd = (n: number) => Math.round(n);

  return (
    <div className="controls-inner">
      <Group title="Color">
        <div className="field">
          <label>
            <span>Pick / HEX</span>
            <span className="rgt"><span className="val">{toHex(S)}</span></span>
          </label>
          <div className="color-row">
            <input type="color" value={toHex({ ...S, alpha: 100 }).slice(0, 7)}
                   onChange={(e) => applyHex(e.target.value)} />
            <input
              type="text"
              value={hexShown}
              onChange={(e) => { setHexDraft(e.target.value); applyHex(e.target.value); }}
              onBlur={() => setHexDraft(null)}
              spellCheck={false}
            />
          </div>
        </div>

        <Slider label="Alpha %" value={S.alpha} min={0} max={100}
                onChange={(v) => update((d) => { d.alpha = v; })} />

        <div className="field">
          <label><span>Presets</span></label>
          <div className="preset-row">
            {PRESETS.map((p) => (
              <button key={p} className="preset" style={{ background: p }}
                      title={p} onClick={() => applyHex(p)} />
            ))}
          </div>
        </div>
      </Group>

      <Group title="RGB">
        <Slider label="Red" value={rnd(S.r)} min={0} max={255} onChange={(v) => setChannel("r", v)} />
        <Slider label="Green" value={rnd(S.g)} min={0} max={255} onChange={(v) => setChannel("g", v)} />
        <Slider label="Blue" value={rnd(S.b)} min={0} max={255} onChange={(v) => setChannel("b", v)} />
      </Group>

      <Group title="HSL" open={false}>
        <Slider label="Hue" value={rnd(H.h)} min={0} max={360} onChange={(v) => setHsl("h", v)} />
        <Slider label="Saturation %" value={rnd(H.s)} min={0} max={100} onChange={(v) => setHsl("s", v)} />
        <Slider label="Lightness %" value={rnd(H.l)} min={0} max={100} onChange={(v) => setHsl("l", v)} />
      </Group>

      <Group title="OKLCH" open={false}>
        <Slider label="Lightness %" value={Number(O.l.toFixed(1))} min={0} max={100} step={0.1}
                onChange={(v) => setOklch("l", v)} />
        <Slider label="Chroma" value={Number(O.c.toFixed(3))} min={0} max={0.4} step={0.001}
                onChange={(v) => setOklch("c", v)} />
        <Slider label="Hue" value={rnd(O.h)} min={0} max={360} onChange={(v) => setOklch("h", v)} />
        {gamutWarn && <div className="hint">⚠ Outside the sRGB gamut — clamped to the nearest displayable color.</div>}
      </Group>
    </div>
  );
}
