import type { HoverState } from "../../types";
import { STAGES, previewCSS, transitionValue } from "../../lib/hoverModel";
import type { Update } from "./HoverTool";
import "./Preview.css";

interface Props { S: HoverState; update: Update; }

const SEL = ".hvp-btn";

export default function Preview({ S, update }: Props) {
  const css = previewCSS(S, SEL);
  const active = transitionValue(S) ? `${S.duration}ms ${S.easing}` : "no hover change";

  const cycleStage = () =>
    update((d) => { d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length]; });
  const toggleForce = () =>
    update((d) => { d.forceHover = !d.forceHover; });

  return (
    <div className="preview-wrap">
      {/* scoped stylesheet — real :hover fires on the live button */}
      <style>{css}</style>

      <div className="preview-bar">
        <span className="grid-size">{active}</span>
        <button className={"stage-btn" + (S.forceHover ? " on" : "")} onClick={toggleForce}
                title="Pin the hover state">⤒ {S.forceHover ? "hover pinned" : "pin hover"}</button>
        <button className="stage-btn" onClick={cycleStage} title="Cycle backdrop">◑ {S.stage}</button>
        <div className="spacer" />
        <span className="layer-badge">hover me →</span>
      </div>

      <div className={"hover-stage stage-" + S.stage}>
        <button className={"hvp-btn" + (S.forceHover ? " force" : "")} type="button">
          {S.label || "Hover me"}
        </button>
      </div>
    </div>
  );
}
