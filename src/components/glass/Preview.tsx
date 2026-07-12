import type { CSSProperties } from "react";
import type { GlassState } from "../../types";
import {
  SCENE_BG, TEXT_FILLER, TEXT_PAD, boxShadowValue, filterValue, hasText, rgba, sceneImageUrl,
} from "../../lib/glassModel";
import type { Update } from "./GlassTool";
import "./Preview.css";

export default function Preview({ S }: { S: GlassState; update: Update }) {
  const filter = filterValue(S);
  const showText = hasText(S);
  const glass: CSSProperties = {
    width: S.width,
    height: S.height,
    borderRadius: S.radius,
    background: rgba(S.tintColor, S.tintAlpha),
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    border: S.border ? `${S.borderWidth}px solid ${rgba(S.borderColor, S.borderAlpha)}` : undefined,
    boxShadow: boxShadowValue(S) || undefined,
    ...(showText ? { display: "flex", alignItems: "center", padding: TEXT_PAD } : null),
  };

  const textStyle: CSSProperties = {
    margin: 0,
    width: "100%",
    color: rgba(S.textColor, S.textAlpha),
    fontSize: S.textSize,
    fontWeight: S.textWeight,
    lineHeight: S.textLineHeight,
    letterSpacing: S.textSpacing ? `${S.textSpacing}px` : undefined,
    textAlign: S.textAlign as CSSProperties["textAlign"],
  };

  const sceneBg =
    S.scene === "solid" ? rgba(S.sceneColor, S.sceneAlpha)
      : S.scene === "image" ? `url(${sceneImageUrl(S.sceneImage)}) center / cover no-repeat`
        : SCENE_BG[S.scene];

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">blur {S.blur}px · {S.width}×{S.height}</span>
        <div className="spacer" />
        <span className="layer-badge">{S.scene}</span>
      </div>

      <div className="glass-stage" style={{ background: sceneBg }}>
        {S.scene === "text" && <div className="scene-text" aria-hidden="true">{TEXT_FILLER}</div>}
        <div className="glass-el" style={glass}>
          {showText && <p className="glass-text-el" style={textStyle}>{S.text}</p>}
        </div>
      </div>
    </div>
  );
}
