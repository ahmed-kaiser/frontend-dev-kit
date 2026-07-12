import { useState, type ReactNode } from "react";
import type { PxRemState } from "../../types";
import { TABLE_PX, remToPx, remOf, trim } from "../../lib/pxRemModel";
import type { Update } from "./PxRemTool";
import "./Controls.css";

interface Props { S: PxRemState; update: Update; }

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
  const rem = remOf(S);
  const quick = [8, 12, 14, 16, 24, 32];

  return (
    <div className="controls-inner">
      <Group title="Convert">
        <div className="conv-row">
          <div className="conv-cell">
            <label>Pixels</label>
            <div className="conv-input">
              <input type="number" step={0.5} value={S.px}
                     onChange={(e) => update((d) => { d.px = Number(e.target.value); })} />
              <span className="suffix">px</span>
            </div>
          </div>
          <span className="conv-eq">=</span>
          <div className="conv-cell">
            <label>Rem</label>
            <div className="conv-input">
              <input type="number" step={0.05} value={Number(trim(rem, 4))}
                     onChange={(e) => update((d) => { d.px = remToPx(Number(e.target.value), d.root); })} />
              <span className="suffix">rem</span>
            </div>
          </div>
        </div>

        <div className="field">
          <label><span>Pixels</span><span className="rgt"><span className="val">{trim(S.px, 3)}px</span></span></label>
          <input type="range" min={0} max={128} step={0.5} value={S.px}
                 onChange={(e) => update((d) => { d.px = Number(e.target.value); })} />
        </div>

        <div className="field">
          <label><span>Quick px</span></label>
          <div className="seg preset-seg">
            {quick.map((p) => (
              <button key={p} className={S.px === p ? "on" : ""}
                      onClick={() => update((d) => { d.px = p; })}>{p}</button>
            ))}
          </div>
        </div>
      </Group>

      <Group title="Root font-size">
        <div className="field">
          <label><span>1 rem equals</span><span className="rgt"><span className="val">{trim(S.root, 3)}px</span></span></label>
          <input type="range" min={8} max={32} step={1} value={S.root}
                 onChange={(e) => update((d) => { d.root = Math.max(1, Number(e.target.value)); })} />
        </div>
        <div className="conv-input">
          <input type="number" step={1} value={S.root}
                 onChange={(e) => update((d) => { d.root = Math.max(1, Number(e.target.value)); })} />
          <span className="suffix">px</span>
        </div>
        <div className="hint">Browsers default to <code>16px</code>. Changing it rescales every rem value.</div>
      </Group>

      <Group title="Reference table" open={false}>
        <div className="hint">Common sizes at the current root — click a row to load it.</div>
        <div className="ref-grid">
          {TABLE_PX.map((px) => (
            <button key={px} className={"ref-cell" + (S.px === px ? " on" : "")}
                    onClick={() => update((d) => { d.px = px; })}>
              <span className="ref-px">{px}px</span>
              <span className="ref-rem">{trim(px / (S.root > 0 ? S.root : 16), 4)}rem</span>
            </button>
          ))}
        </div>
      </Group>
    </div>
  );
}
