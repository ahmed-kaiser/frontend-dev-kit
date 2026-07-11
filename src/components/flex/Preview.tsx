import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { FlexAppState } from "../../types";
import { PRESETS, resolveAt, winningLayer, base } from "../../lib/flexModel";
import type { Update } from "./FlexTool";
import "./Preview.css";

export default function Preview({ S, update }: { S: FlexAppState; update: Update }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(1024);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setStageW(Math.max(280, stage.clientWidth - 52));
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    return () => ro.disconnect();
  }, []);

  const effW = S.previewW ?? stageW;
  const cfg = resolveAt(S, effW);
  const win = winningLayer(S, effW);

  const setDevice = (id: string, w: number | null) => update((d) => { d.device = id; d.previewW = w; });
  const setCustom = (w: number | null) => update((d) => {
    if (w && w > 0) { d.device = "custom"; d.previewW = w; }
    else { d.device = "fit"; d.previewW = null; }
  });
  const toggleLabels = () => update((d) => { d.showLabels = !d.showLabels; });
  const selectItem = (i: number) => update((d) => { d.selected = i; });

  const flexStyle: CSSProperties = {
    display: "flex",
    flexDirection: cfg.direction as CSSProperties["flexDirection"],
    flexWrap: cfg.wrap as CSSProperties["flexWrap"],
    justifyContent: cfg.justifyContent as CSSProperties["justifyContent"],
    alignItems: cfg.alignItems as CSSProperties["alignItems"],
    alignContent: cfg.alignContent as CSSProperties["alignContent"],
    rowGap: `${cfg.rowGap}${cfg.gapUnit}`,
    columnGap: `${cfg.colGap}${cfg.gapUnit}`,
  };

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <div className="dev-presets">
          {PRESETS.map((p) => (
            <button key={p.id} className={S.device === p.id ? "on" : ""} onClick={() => setDevice(p.id, p.w)}>
              <span>{p.ico}</span>{p.label}
            </button>
          ))}
        </div>
        <div className="width-ctl">
          <input type="range" min={280} max={1680} value={S.previewW ?? 1024} onChange={(e) => setCustom(Number(e.target.value))} />
          <input className="num" type="number" placeholder="fit" value={S.previewW ?? ""} onChange={(e) => setCustom(Number(e.target.value))} />
          <span className="unit">px</span>
        </div>
        <span className="grid-size">{cfg.direction} · {cfg.wrap} · {base(S).cfg!.items.length} items</span>
        <span className="layer-badge">{win.w === 0 ? "Base" : (S.mode === "mobile" ? "≥" : "≤") + win.w + "px"}</span>
        <label className="mini"><input type="checkbox" checked={S.showLabels} onChange={toggleLabels} />labels</label>
      </div>

      <div className="preview-stage" ref={stageRef}>
        <div className={"device-frame" + (S.previewW ? " framed" : "")} style={{ width: S.previewW ? S.previewW + "px" : "100%", maxWidth: "100%" }}>
          <div className="ruler">{S.previewW ? S.previewW + "px" : "Fit — " + effW + "px"}</div>
          <div id="flexPreview" style={flexStyle}>
            {cfg.items.map((it, i) => {
              const st: CSSProperties = {};
              if (it.grow !== 0 || it.shrink !== 1 || it.basis !== "auto") st.flex = `${it.grow} ${it.shrink} ${it.basis}`;
              if (it.order !== 0) st.order = it.order;
              if (it.alignSelf !== "auto") st.alignSelf = it.alignSelf as CSSProperties["alignSelf"];
              return (
                <div key={it.id} className={"pv-item" + (S.selected === i ? " sel" : "")} style={st} onClick={() => selectItem(i)}>
                  {S.showLabels && <span className="tag">#{i + 1}</span>}
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
