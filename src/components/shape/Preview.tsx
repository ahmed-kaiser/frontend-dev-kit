import { useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { ShapeState } from "../../types";
import { STAGES, clipPath, rgba } from "../../lib/shapeModel";
import type { Update } from "./ShapeTool";
import "./Preview.css";

export default function Preview({ S, update }: { S: ShapeState; update: Update }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRect = useRef<DOMRect | null>(null);

  const cycleStage = () => update((d) => {
    d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length];
  });

  const isCustom = S.stage === "custom";
  const customBg = rgba(S.stageColor, S.stageAlpha);
  const clip = clipPath(S);

  const boxStyle: CSSProperties = {
    width: S.width,
    height: S.height,
    background: rgba(S.bg, S.bgAlpha),
    clipPath: clip,
    WebkitClipPath: clip,
  };

  /* ---- draggable polygon vertices ---- */
  const onDown = (i: number) => (e: RPointerEvent) => {
    if (!boxRef.current) return;
    e.preventDefault();
    dragRect.current = boxRef.current.getBoundingClientRect();
    update((d) => { d.selected = i; });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onMove = (i: number) => (e: RPointerEvent) => {
    const rect = dragRect.current;
    if (!rect) return;
    const x = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    update((d) => { d.points[i] = { x, y }; });
  };

  const onUp = (e: RPointerEvent) => {
    dragRect.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const isPoly = S.type === "polygon";
  const detail = isPoly
    ? `${S.points.length} points`
    : S.type === "inset" && S.insetRound > 0 ? `round ${S.insetRound}px` : S.type;

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <button className="stage-toggle" onClick={cycleStage} title="Cycle preview backdrop">
          <span className={"stage-dot " + S.stage} style={isCustom ? { background: customBg } : undefined} /> {S.stage}
        </button>
        <div className="spacer" />
        <span className="grid-size">{S.width}×{S.height}</span>
        <span className="layer-badge">{S.type} · {detail}</span>
      </div>

      <div className={"shape-stage stage-" + S.stage} style={isCustom ? { background: customBg } : undefined}>
        <div className="shape-box-wrap" style={{ width: S.width, height: S.height }}>
          <div ref={boxRef} className="shape-el" style={boxStyle} />

          {isPoly && S.showGuides && (
            <>
              <svg className="shape-guide" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon
                  points={S.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                  fill="none" stroke="#fff" strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke" strokeDasharray="4 3"
                />
              </svg>
              {S.points.map((pt, i) => (
                <div
                  key={i}
                  className={"shape-handle" + (S.selected === i ? " on" : "")}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  onPointerDown={onDown(i)}
                  onPointerMove={onMove(i)}
                  onPointerUp={onUp}
                >
                  <span className="handle-idx">{i + 1}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
