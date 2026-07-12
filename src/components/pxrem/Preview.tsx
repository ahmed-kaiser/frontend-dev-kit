import type { PxRemState } from "../../types";
import { STAGES, remOf, tableRows, trim } from "../../lib/pxRemModel";
import type { Update } from "./PxRemTool";
import "./Preview.css";

interface Props { S: PxRemState; update: Update; onCopy: (text: string, label: string) => void; }

export default function Preview({ S, update, onCopy }: Props) {
  const rem = remOf(S);
  const rows = tableRows(S);
  const sampleSize = Math.min(S.px, 96); // cap so huge values stay in the card

  const cycleStage = () =>
    update((d) => { d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length]; });

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{trim(S.px, 3)}px = {trim(rem, 4)}rem</span>
        <button className="stage-btn" onClick={cycleStage} title="Cycle backdrop">◑ {S.stage}</button>
        <div className="spacer" />
        <span className="layer-badge">root {trim(S.root, 3)}px</span>
      </div>

      <div className={"pxr-stage stage-" + S.stage}>
        <div className="pxr-eq">
          <button className="eq-part" onClick={() => onCopy(`${trim(S.px, 3)}px`, "Pixels")}>
            <span className="eq-num">{trim(S.px, 3)}</span>
            <span className="eq-unit">px</span>
          </button>
          <span className="eq-sign">=</span>
          <button className="eq-part accent" onClick={() => onCopy(`${trim(rem, 4)}rem`, "Rem")}>
            <span className="eq-num">{trim(rem, 4)}</span>
            <span className="eq-unit">rem</span>
          </button>
        </div>

        <div className="pxr-card">
          <p className="pxr-sample" style={{ fontSize: sampleSize }}>Aa</p>
          <span className="pxr-cap">Text rendered at {trim(S.px, 3)}px</span>
        </div>

        <div className="pxr-table">
          {rows.map((r) => (
            <button key={r.px} className={"pxr-trow" + (S.px === r.px ? " on" : "")}
                    onClick={() => update((d) => { d.px = r.px; })}
                    title={`Set ${r.px}px`}>
              <span className="t-px">{r.px}px</span>
              <span className="t-arrow">→</span>
              <span className="t-rem">{r.rem}rem</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
