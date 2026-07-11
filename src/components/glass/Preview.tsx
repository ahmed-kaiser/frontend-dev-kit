import type { CSSProperties } from "react";
import type { GlassState } from "../../types";
import { SCENE_BG, TEXT_FILLER, boxShadowValue, filterValue, rgba } from "../../lib/glassModel";
import type { Update } from "./GlassTool";
import "./Preview.css";

export default function Preview({ S }: { S: GlassState; update: Update }) {
  const filter = filterValue(S);
  const glass: CSSProperties = {
    width: S.width,
    height: S.height,
    borderRadius: S.radius,
    background: rgba(S.tintColor, S.tintAlpha),
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    border: S.border ? `${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)}` : undefined,
    boxShadow: boxShadowValue(S) || undefined,
  };

  const sceneBg = S.scene === "solid" ? rgba(S.sceneColor, S.sceneAlpha) : SCENE_BG[S.scene];

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">blur {S.blur}px · {S.width}×{S.height}</span>
        <div className="spacer" />
        <span className="layer-badge">{S.scene}</span>
      </div>

      <div className="preview-stage" style={{ background: sceneBg }}>
        {S.scene === "text" && <div className="scene-text" aria-hidden="true">{TEXT_FILLER}</div>}
        <div className="glass-el" style={glass} />
      </div>
    </div>
  );
}
