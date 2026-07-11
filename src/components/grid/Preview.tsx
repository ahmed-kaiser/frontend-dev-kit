import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { AppState } from "../../types";
import { PRESETS, resolveAt, winningLayer, base } from "../../lib/gridModel";
import type { Update } from "./GridTool";
import "./Preview.css";

interface Line { axis: "col" | "row"; pos: number; label: number; }

export default function Preview({ S, update }: { S: AppState; update: Update }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [stageW, setStageW] = useState(1024);
  const [lines, setLines] = useState<Line[]>([]);

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
  const nc = cfg.columns.length;
  const nr = cfg.rows.length;

  useLayoutEffect(() => {
    const prev = gridRef.current;
    if (!prev || !S.showLines) { setLines([]); return; }
    const cs = getComputedStyle(prev);
    const pl = parseFloat(cs.paddingLeft) || 0;
    const pt = parseFloat(cs.paddingTop) || 0;
    const cg = parseFloat(cs.columnGap) || 0;
    const rg = parseFloat(cs.rowGap) || 0;
    const parse = (v: string) => (v || "").split(" ").map(parseFloat).filter((n) => !isNaN(n));
    const edges = (tr: number[], gap: number) => {
      const xs: number[] = [];
      let acc = 0;
      for (let k = 0; k < tr.length; k++) { xs.push(acc); acc += tr[k] + gap; }
      xs.push(acc - gap);
      return xs;
    };
    const out: Line[] = [];
    edges(parse(cs.gridTemplateColumns), cg).forEach((x, i) => out.push({ axis: "col", pos: pl + x, label: i + 1 }));
    edges(parse(cs.gridTemplateRows), rg).forEach((y, i) => out.push({ axis: "row", pos: pt + y, label: i + 1 }));
    setLines(out);
  }, [S, effW, stageW]);

  const setDevice = (id: string, w: number | null) => update((d) => { d.device = id; d.previewW = w; });
  const setCustom = (w: number | null) => update((d) => {
    if (w && w > 0) { d.device = "custom"; d.previewW = w; }
    else { d.device = "fit"; d.previewW = null; }
  });
  const toggle = (key: "showLabels" | "showLines") => update((d) => { d[key] = !d[key]; });
  const selectItem = (i: number) => update((d) => { d.selected = i; });

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: cfg.columns.join(" "),
    gridTemplateRows: cfg.rows.join(" "),
    gap: `${cfg.rowGap}${cfg.gapUnit} ${cfg.colGap}${cfg.gapUnit}`,
    justifyItems: cfg.justifyItems as CSSProperties["justifyItems"],
    alignItems: cfg.alignItems as CSSProperties["alignItems"],
    justifyContent: cfg.justifyContent as CSSProperties["justifyContent"],
    alignContent: cfg.alignContent as CSSProperties["alignContent"],
    gridAutoFlow: cfg.autoFlow as CSSProperties["gridAutoFlow"],
    gridAutoRows: cfg.autoRows,
    gridAutoColumns: cfg.autoCols,
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
        <span className="grid-size">{nc} × {nr} · {nc * nr} cells · {base(S).cfg!.items.length} items</span>
        <span className="layer-badge">{win.w === 0 ? "Base" : (S.mode === "mobile" ? "≥" : "≤") + win.w + "px"}</span>
        <label className="mini"><input type="checkbox" checked={S.showLabels} onChange={() => toggle("showLabels")} />labels</label>
        <label className="mini"><input type="checkbox" checked={S.showLines} onChange={() => toggle("showLines")} />line #</label>
      </div>

      <div className="preview-stage" ref={stageRef}>
        <div className={"device-frame" + (S.previewW ? " framed" : "")} style={{ width: S.previewW ? S.previewW + "px" : "100%", maxWidth: "100%" }}>
          <div className="ruler">{S.previewW ? S.previewW + "px" : "Fit — " + effW + "px"}</div>
          <div id="gridPreview" ref={gridRef} style={gridStyle}>
            {cfg.items.map((it, i) => {
              const st: CSSProperties = {};
              if (it.colStart !== "auto" || it.colEnd !== "auto") st.gridColumn = `${it.colStart} / ${it.colEnd}`;
              if (it.rowStart !== "auto" || it.rowEnd !== "auto") st.gridRow = `${it.rowStart} / ${it.rowEnd}`;
              if (it.justifySelf !== "auto") st.justifySelf = it.justifySelf as CSSProperties["justifySelf"];
              if (it.alignSelf !== "auto") st.alignSelf = it.alignSelf as CSSProperties["alignSelf"];
              return (
                <div key={it.id} className={"pv-item" + (S.selected === i ? " sel" : "")} style={st} onClick={() => selectItem(i)}>
                  {S.showLabels && <span className="tag">#{i + 1}</span>}
                  {i + 1}
                </div>
              );
            })}
            {S.showLines && (
              <div className="grid-lines">
                {lines.map((l, i) => (
                  <div
                    key={i}
                    className={"gl " + (l.axis === "col" ? "gl-col" : "gl-row")}
                    style={l.axis === "col" ? { left: l.pos.toFixed(1) + "px" } : { top: l.pos.toFixed(1) + "px" }}
                  >
                    {l.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
