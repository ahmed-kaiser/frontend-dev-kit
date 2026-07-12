import type { MixState } from "../../types";
import { STAGES, SPACES, luminance, rgbHex, scale } from "../../lib/mixModel";
import type { Update } from "./MixTool";
import "./Preview.css";

interface Props { S: MixState; update: Update; onCopy: (text: string, label: string) => void; }

export default function Preview({ S, update, onCopy }: Props) {
  const sw = scale(S);
  const spaceLabel = SPACES.find((sp) => sp.id === S.space)?.label ?? S.space;
  const cycleStage = () =>
    update((d) => { d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length]; });

  const copyAll = () => onCopy(sw.map((s) => s.hex).join(", "), "Scale");

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{rgbHex(S.from)}</span>
        <span className="mix-arrow">→</span>
        <span className="grid-size">{rgbHex(S.to)}</span>
        <button className="stage-btn" onClick={cycleStage} title="Cycle backdrop">◑ {S.stage}</button>
        <div className="spacer" />
        <button className="stage-btn" onClick={copyAll} title="Copy all hex values">⧉ Copy scale</button>
        <span className="layer-badge">{spaceLabel} · {sw.length} steps</span>
      </div>

      <div className={"preview-stage stage-" + S.stage}>
        <div className="mix-strip">
          {sw.map((s) => (
            <button
              key={s.i}
              className="mix-cell"
              style={{ background: s.hex }}
              title={`${s.hex} — click to copy`}
              onClick={() => onCopy(s.hex, s.hex)}
            >
              <span className="mix-hex" style={{ color: luminance(s) > 150 ? "#000" : "#fff" }}>{s.hex}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
