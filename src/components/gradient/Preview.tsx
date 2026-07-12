import type { GradientState } from "../../types";
import { gradientValue } from "../../lib/gradientModel";
import type { Update } from "./GradientTool";
import "./Preview.css";

export default function Preview({ S }: { S: GradientState; update: Update }) {
  const bg = gradientValue(S);
  const geo = S.type === "radial"
    ? `${S.radialShape} · ${S.posX}%,${S.posY}%`
    : S.type === "conic"
      ? `${S.angle}° · ${S.posX}%,${S.posY}%`
      : `${S.angle}°`;

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{S.type} · {geo}</span>
        <div className="spacer" />
        <span className="layer-badge">{S.stops.length} stops</span>
      </div>

      <div className="grad-stage">
        <div className="grad-el" style={{ background: bg }} />
      </div>
    </div>
  );
}
