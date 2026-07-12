import { useState, type ReactNode } from "react";
import type { MixEndpoint, MixState } from "../../types";
import { MAX_STEPS, MIN_STEPS, SPACES, STAGES, parseHex, rgbHex } from "../../lib/mixModel";
import type { Update } from "./MixTool";
import "./Controls.css";

interface Props { S: MixState; update: Update; }

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

/* Module scope so its identity is stable across renders — an inner component
   would remount on every edit, closing the native picker mid-interaction. */
function EndpointField({ label, value, onChange }: {
  label: string; value: MixEndpoint; onChange: (c: MixEndpoint) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const hex = rgbHex(value);
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        <span className="rgt"><span className="val">{hex}</span></span>
      </label>
      <div className="color-row">
        <input type="color" value={hex} onChange={(e) => onChange(parseHex(e.target.value)!)} />
        <input
          type="text"
          value={draft ?? hex}
          onChange={(e) => {
            setDraft(e.target.value);
            const p = parseHex(e.target.value);
            if (p) onChange(p);
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
    </div>
  );
}

export default function Controls({ S, update }: Props) {
  const setEndpoint = (which: "from" | "to") => (c: MixEndpoint) => update((d) => { d[which] = c; });
  const swap = () => update((d) => { const t = d.from; d.from = d.to; d.to = t; });
  const set = (field: "space" | "steps" | "hueDir" | "stage", val: string | number) =>
    update((d) => { (d as any)[field] = val; });

  return (
    <div className="controls-inner">
      <Group title="Endpoints">
        <EndpointField label="From" value={S.from} onChange={setEndpoint("from")} />
        <EndpointField label="To" value={S.to} onChange={setEndpoint("to")} />
        <button className="btn" style={{ justifyContent: "center" }} onClick={swap}>⇄ Swap colors</button>
      </Group>

      <Group title="Blend">
        <div className="field">
          <label><span>Interpolation space</span></label>
          <div className="seg">
            {SPACES.map((sp) => (
              <button key={sp.id} className={S.space === sp.id ? "on" : ""} onClick={() => set("space", sp.id)}>{sp.label}</button>
            ))}
          </div>
          <div className="hint">
            {S.space === "oklch" && "Perceptually uniform — evenly-spaced, no muddy midpoints."}
            {S.space === "srgb" && "Straight RGB channel blend — fast, but can pass through grey."}
            {S.space === "hsl" && "Travels around the hue wheel — vivid, but lightness is uneven."}
          </div>
        </div>

        <div className="field">
          <label>
            <span>Steps</span>
            <span className="rgt"><span className="val">{S.steps}</span></span>
          </label>
          <input
            type="range" min={MIN_STEPS} max={MAX_STEPS} value={S.steps}
            onChange={(e) => set("steps", Number(e.target.value))}
          />
        </div>

        {S.space !== "srgb" && (
          <div className="field">
            <label><span>Hue direction</span></label>
            <div className="seg">
              <button className={S.hueDir === "short" ? "on" : ""} onClick={() => set("hueDir", "short")}>shortest</button>
              <button className={S.hueDir === "long" ? "on" : ""} onClick={() => set("hueDir", "long")}>longest</button>
            </div>
            <div className="hint">Which way around the color wheel the hue travels between the two colors.</div>
          </div>
        )}
      </Group>

      <Group title="Preview" open={false}>
        <div className="field">
          <label><span>Backdrop</span></label>
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
