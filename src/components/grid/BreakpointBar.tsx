import type { AppState, Mode } from "../../types";
import { makeBreakpoint } from "../../lib/gridModel";
import type { Update } from "./GridTool";
import "./BreakpointBar.css";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

interface Props { S: AppState; update: Update; }

export default function BreakpointBar({ S, update }: Props) {
  const isBase = S.activeBp === 0;
  const active = S.breakpoints[S.activeBp];

  const setMode = (m: Mode) => update((d) => { d.mode = m; });
  const selectBp = (i: number) => update((d) => { d.activeBp = i; });
  const addBp = () => update((d) => {
    const bp = makeBreakpoint(d.breakpoints);
    d.breakpoints.push(bp);
    d.activeBp = d.breakpoints.length - 1;
  });
  const removeBp = () => update((d) => {
    if (d.activeBp === 0) return;
    d.breakpoints.splice(d.activeBp, 1);
    d.activeBp = 0;
  });
  const setWidth = (raw: number) => update((d) => {
    const b = d.breakpoints[d.activeBp];
    b.w = clamp(raw || 1, 1, 3840);
    if (/^\d+px$/.test(b.name)) b.name = b.w + "px";
  });

  return (
    <div className="bp-bar">
      <div className="bp-top">
        <span className="lbl">Breakpoints</span>
        <span className="spacer" />
        <div className="mode-toggle">
          <button className={S.mode === "mobile" ? "on" : ""} onClick={() => setMode("mobile")}>min-width</button>
          <button className={S.mode === "desktop" ? "on" : ""} onClick={() => setMode("desktop")}>max-width</button>
        </div>
      </div>

      <div className="bp-chips">
        {S.breakpoints.map((b, i) => (
          <div key={b.id} className={"bp-chip" + (S.activeBp === i ? " on" : "")} onClick={() => selectBp(i)}>
            {b.name}
            {b.w > 0 && <span className="w">{(S.mode === "mobile" ? "≥" : "≤") + b.w}</span>}
          </div>
        ))}
        <div className="bp-chip add" onClick={addBp}>+ Breakpoint</div>
      </div>

      <div className="bp-meta">
        {isBase ? (
          <span>Base layer — applies to all widths. Add a breakpoint to override values at a size.</span>
        ) : (
          <>
            <span className="pill">{S.mode === "mobile" ? "@min-width" : "@max-width"}</span>
            <input
              type="number" min={1} max={3840} value={active.w}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            <span className="unit">px</span>
            <span className="spacer" />
            <span className="rm" onClick={removeBp}>✕ remove</span>
          </>
        )}
      </div>
    </div>
  );
}
