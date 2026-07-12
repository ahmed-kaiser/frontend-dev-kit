import { useRef, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import type { WrapState } from "../../types";
import { MAX_W, MIN_W, PAD, STAGES } from "../../lib/wrapModel";
import type { Update } from "./WrapTool";
import "./Preview.css";

/** Inline style mirroring the generated `.text` rule (layout-affecting props only). */
function textStyle(S: WrapState): CSSProperties {
  const st: Record<string, string | number> = {
    maxWidth: S.width,
    padding: PAD,
    fontSize: S.fontSize,
    lineHeight: S.lineHeight,
    fontWeight: S.fontWeight,
    textAlign: S.align,
    textWrap: S.textWrap,
  };
  if (S.whiteSpace !== "normal") st.whiteSpace = S.whiteSpace;
  if (S.overflowWrap !== "normal") st.overflowWrap = S.overflowWrap;
  if (S.hyphens !== "none") st.hyphens = S.hyphens;
  if (S.clamp) {
    st.display = "-webkit-box";
    st.WebkitBoxOrient = "vertical";
    st.WebkitLineClamp = S.lines;
    st.overflow = "hidden";
  } else if (S.overflow !== "visible") {
    st.overflow = S.overflow;
  }
  if (S.textOverflow !== "clip") st.textOverflow = S.textOverflow;
  return st as CSSProperties;
}

export default function Preview({ S, update }: { S: WrapState; update: Update }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const dragLeft = useRef<number | null>(null);

  const cycleStage = () => update((d) => {
    d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length];
  });

  /* ---- draggable right-edge width resizer ---- */
  const onDown = (e: RPointerEvent) => {
    if (!boxRef.current) return;
    e.preventDefault();
    dragLeft.current = boxRef.current.getBoundingClientRect().left;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent) => {
    if (dragLeft.current == null) return;
    const w = Math.min(MAX_W, Math.max(MIN_W, Math.round(e.clientX - dragLeft.current)));
    update((d) => { d.width = w; });
  };
  const onUp = (e: RPointerEvent) => {
    dragLeft.current = null;
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <button className="stage-toggle" onClick={cycleStage} title="Cycle preview backdrop">
          <span className={"stage-dot " + S.stage} /> {S.stage}
        </button>
        <div className="spacer" />
        <span className="grid-size">{S.width}px wide</span>
        <span className="layer-badge">text-wrap: {S.textWrap}</span>
      </div>

      <div className={"wrap-stage stage-" + S.stage}>
        <div ref={boxRef} className="wrap-card" style={{ width: S.width }}>
          <p className="wrap-text" style={textStyle(S)}>{S.text}</p>
          <div className="wrap-resizer" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}>
            <span className="grip" />
          </div>
        </div>
      </div>
    </div>
  );
}
