import type { ColorState } from "../../types";
import { STAGES, cssColor, formatRows, toHex } from "../../lib/colorModel";
import type { Update } from "./ColorTool";
import "./Preview.css";

interface Props { S: ColorState; update: Update; onCopy: (text: string, label: string) => void; }

export default function Preview({ S, update, onCopy }: Props) {
  const color = cssColor(S);
  const rows = formatRows(S);
  const cycleStage = () =>
    update((d) => { d.stage = STAGES[(STAGES.indexOf(d.stage) + 1) % STAGES.length]; });

  return (
    <div className="preview-wrap">
      <div className="preview-bar">
        <span className="grid-size">{toHex(S)}</span>
        <button className="stage-btn" onClick={cycleStage} title="Cycle backdrop">◑ {S.stage}</button>
        <div className="spacer" />
        <span className="layer-badge">{S.alpha}% alpha</span>
      </div>

      <div className={"preview-stage stage-" + S.stage}>
        <div className="swatch-card">
          <div className="swatch-fill" style={{ background: color }}>
            <span className="sample dark">Aa</span>
            <span className="sample light">Aa</span>
          </div>
        </div>

        <div className="fmt-list">
          {rows.map((row) => (
            <button key={row.key} className="fmt-row" onClick={() => onCopy(row.value, row.label)}>
              <span className="fmt-label">{row.label}</span>
              <span className="fmt-value">{row.value}</span>
              <span className="fmt-copy">⧉</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
