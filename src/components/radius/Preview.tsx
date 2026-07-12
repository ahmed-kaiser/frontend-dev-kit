import { useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { RadiusCorner, RadiusState } from "../../types";
import { CORNERS, STAGES, radiusValue, rgba, unitMax, type CornerKey } from "../../lib/radiusModel";
import type { Update } from "./RadiusTool";
import "./Preview.css";

export default function Preview({ S, update }: { S: RadiusState; update: Update }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ corner: CornerKey; rect: DOMRect } | null>(null);

  const cycleStage = () => update((d) => {
    d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length];
  });

  const isCustom = S.stage === "custom";
  const customBg = rgba(S.stageColor, S.stageAlpha);

  const boxStyle: CSSProperties = {
    width: S.width,
    height: S.height,
    background: rgba(S.bg, S.bgAlpha),
    borderRadius: radiusValue(S),
  };

  /* ---- draggable corner handles ---- */
  const onDown = (corner: CornerKey) => (e: RPointerEvent) => {
    if (!boxRef.current) return;
    e.preventDefault();
    drag.current = { corner, rect: boxRef.current.getBoundingClientRect() };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const { corner, rect } = d;
    // inward distance from this corner, in px
    let dx: number, dy: number;
    switch (corner) {
      case "tl": dx = e.clientX - rect.left; dy = e.clientY - rect.top; break;
      case "tr": dx = rect.right - e.clientX; dy = e.clientY - rect.top; break;
      case "br": dx = rect.right - e.clientX; dy = rect.bottom - e.clientY; break;
      default:   dx = e.clientX - rect.left; dy = rect.bottom - e.clientY; break; // bl
    }
    const max = unitMax(S.unit);
    const toVal = (px: number, dim: number) => {
      let v: number;
      if (S.unit === "%") v = (px / dim) * 100;
      else if (S.unit === "rem" || S.unit === "em") v = px / 16;
      else v = px;
      const rounded = S.unit === "rem" || S.unit === "em" ? Math.round(v * 2) / 2 : Math.round(v);
      return Math.min(Math.max(rounded, 0), max);
    };
    const vx = toVal(dx, rect.width);
    const vy = toVal(dy, rect.height);
    update((st) => {
      const apply = (c: RadiusCorner) => {
        if (st.elliptical) { c.x = vx; c.y = vy; }
        else { const r = Math.max(vx, vy); c.x = r; c.y = r; }
      };
      if (st.linked) CORNERS.forEach((k) => apply(st.corners[k]));
      else apply(st.corners[corner]);
    });
  };

  const onUp = (e: RPointerEvent) => {
    drag.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <button className="stage-toggle" onClick={cycleStage} title="Cycle preview backdrop">
          <span className={"stage-dot " + S.stage} style={isCustom ? { background: customBg } : undefined} /> {S.stage}
        </button>
        <div className="spacer" />
        <span className="grid-size">{S.width}×{S.height}</span>
        <span className="layer-badge">border-radius: {radiusValue(S)}</span>
      </div>

      <div className={"rad-stage stage-" + S.stage} style={isCustom ? { background: customBg } : undefined}>
        <div className="rad-box-wrap" style={{ width: S.width, height: S.height }}>
          <div ref={boxRef} className="box-el" style={boxStyle} />
          {S.showHandles && CORNERS.map((k) => (
            <div
              key={k}
              className={"rad-handle h-" + k}
              onPointerDown={onDown(k)}
              onPointerMove={onMove}
              onPointerUp={onUp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
