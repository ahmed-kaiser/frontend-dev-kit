import type { CSSProperties } from "react";
import type { ShadowAppState } from "../../types";
import { STAGES, boxShadowValue, rgba } from "../../lib/shadowModel";
import type { Update } from "./ShadowTool";
import "./Preview.css";

export default function Preview({ S, update }: { S: ShadowAppState; update: Update }) {
  const cycleStage = () => update((d) => {
    d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length];
  });

  const isCustom = S.stage === "custom";
  const customBg = rgba(S.stageColor, S.stageAlpha);

  const boxStyle: CSSProperties = {
    width: S.size,
    height: S.size,
    borderRadius: S.radius,
    background: rgba(S.boxColor, S.boxAlpha),
    border: S.border ? `${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)}` : undefined,
    boxShadow: boxShadowValue(S),
  };

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <button className="stage-toggle" onClick={cycleStage} title="Cycle preview backdrop">
          <span className={"stage-dot " + S.stage} style={isCustom ? { background: customBg } : undefined} /> {S.stage}
        </button>
        <div className="spacer" />
        <span className="grid-size">{S.size}×{S.size} · r{S.radius}</span>
        <span className="layer-badge">{S.layers.length} layer{S.layers.length === 1 ? "" : "s"}</span>
      </div>

      <div className={"preview-stage stage-" + S.stage} style={isCustom ? { background: customBg } : undefined}>
        <div className="box-el" style={boxStyle} />
      </div>
    </div>
  );
}
