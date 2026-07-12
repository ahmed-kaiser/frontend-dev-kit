import type { ClampState } from "../../types";
import { STAGES, parts, resolvedAt } from "../../lib/clampModel";
import type { Update } from "./ClampTool";
import "./Preview.css";

interface Props { S: ClampState; update: Update; onCopy: (text: string, label: string) => void; }

const VB_W = 320, VB_H = 150, PAD_X = 8, PAD_Y = 14;
const SCRUB_MIN = 200, SCRUB_MAX = 2560;
const round = (n: number, dp = 2) => Number(n.toFixed(dp));

export default function Preview({ S, update, onCopy }: Props) {
  const p = parts(S);
  const px = resolvedAt(S, S.previewVw);
  const rem = px / S.root;

  const cycleStage = () =>
    update((d) => { d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length]; });

  /* ---- response curve domain (viewport ×, resolved value ÷) ---- */
  const span = Math.abs(S.maxVw - S.minVw);
  const pad = Math.max(140, span * 0.35);
  const domLo = Math.max(0, Math.min(S.minVw, S.maxVw, S.previewVw) - pad);
  const domHi = Math.max(S.maxVw, S.minVw, S.previewVw) + pad;
  const valLo = Math.min(S.minSize, S.maxSize);
  const valHi = Math.max(S.minSize, S.maxSize);
  const valPad = Math.max(2, (valHi - valLo) * 0.2);

  const mapX = (vw: number) =>
    PAD_X + ((vw - domLo) / (domHi - domLo || 1)) * (VB_W - 2 * PAD_X);
  const mapY = (v: number) => {
    const lo = valLo - valPad, hi = valHi + valPad;
    return VB_H - PAD_Y - ((v - lo) / (hi - lo || 1)) * (VB_H - 2 * PAD_Y);
  };

  const N = 64;
  const line = Array.from({ length: N + 1 }, (_, i) => {
    const vw = domLo + ((domHi - domLo) * i) / N;
    return `${round(mapX(vw))},${round(mapY(resolvedAt(S, vw)))}`;
  }).join(" ");

  const markerX = mapX(S.previewVw);
  const markerY = mapY(px);

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{round(px, 1)}px · {round(rem, 3)}rem</span>
        <button className="stage-btn" onClick={cycleStage} title="Cycle backdrop">◑ {S.stage}</button>
        <div className="spacer" />
        <span className="layer-badge">@ {S.previewVw}px vw</span>
      </div>

      <div className={"clamp-stage stage-" + S.stage}>
        {/* live text sized at the resolved value */}
        <div className="clamp-card">
          <p className="clamp-sample" style={{ fontSize: px }}>Fluid</p>
        </div>

        {/* response curve: flat → ramp → flat */}
        <div className="clamp-chart">
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            {/* size bounds */}
            <line x1={PAD_X} x2={VB_W - PAD_X} y1={mapY(valLo)} y2={mapY(valLo)}
                  className="c-bound" vectorEffect="non-scaling-stroke" />
            <line x1={PAD_X} x2={VB_W - PAD_X} y1={mapY(valHi)} y2={mapY(valHi)}
                  className="c-bound" vectorEffect="non-scaling-stroke" />
            {/* viewport bounds */}
            <line x1={mapX(S.minVw)} x2={mapX(S.minVw)} y1={PAD_Y} y2={VB_H - PAD_Y}
                  className="c-vbound" vectorEffect="non-scaling-stroke" />
            <line x1={mapX(S.maxVw)} x2={mapX(S.maxVw)} y1={PAD_Y} y2={VB_H - PAD_Y}
                  className="c-vbound" vectorEffect="non-scaling-stroke" />
            {/* the clamp response */}
            <polyline points={line} className="c-line" fill="none" vectorEffect="non-scaling-stroke" />
            {/* current-viewport marker */}
            <line x1={markerX} x2={markerX} y1={PAD_Y} y2={VB_H - PAD_Y}
                  className="c-marker" vectorEffect="non-scaling-stroke" />
            <circle cx={markerX} cy={markerY} r={4} className="c-dot" />
          </svg>
          <div className="chart-legend">
            <span>{round(domLo)}px</span>
            <span className="chart-note">
              {!p.valid ? "flat" : p.vwCoeff < 0 ? "shrinks with viewport" : "grows with viewport"}
            </span>
            <span>{round(domHi)}px</span>
          </div>
        </div>

        {/* viewport scrubber */}
        <div className="clamp-scrub">
          <label>
            <span>Preview viewport</span>
            <button className="chip" onClick={() => onCopy(`${round(px, 2)}px`, "Resolved value")}>
              {round(px, 2)}px ⧉
            </button>
          </label>
          <input type="range" min={SCRUB_MIN} max={SCRUB_MAX} step={1} value={S.previewVw}
                 onChange={(e) => update((d) => { d.previewVw = Number(e.target.value); })} />
        </div>
      </div>
    </div>
  );
}
