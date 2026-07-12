import type { NeuState } from "../../types";
import { backgroundValue, shadowValue, shade } from "../../lib/neuModel";
import type { Update } from "./NeuTool";
import "./Preview.css";

interface Props { S: NeuState; update: Update; }

export default function Preview({ S }: Props) {
  const backdrop = S.stageTint !== 0 ? shade(S.bg, S.stageTint) : S.bg;

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{S.distance}px · {S.shape}</span>
        <span className="grid-size">{S.bg}</span>
        <div className="spacer" />
        <span className="layer-badge">{S.intensity}% intensity</span>
      </div>

      <div className="neu-stage" style={{ background: backdrop }}>
        <div
          className="neu-el"
          style={{
            width: S.size,
            height: S.size,
            borderRadius: S.radius,
            background: backgroundValue(S),
            boxShadow: shadowValue(S),
          }}
        />
      </div>
    </div>
  );
}
