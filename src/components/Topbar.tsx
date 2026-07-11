import "./Topbar.css";

interface Props {
  title: string;
  desc: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onCopy: () => void;
}

export default function Topbar({ title, desc, canUndo, canRedo, onUndo, onRedo, onReset, onCopy }: Props) {
  return (
    <div className="topbar">
      <h2>{title}</h2>
      <span className="desc">{desc}</span>
      <div className="spacer" />
      <div className="history-group">
        <button className="btn ghost" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)">↶ Undo</button>
        <button className="btn ghost" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)">↷ Redo</button>
      </div>
      <button className="btn ghost" onClick={onReset} title="Reset to defaults">↺ Reset</button>
      <button className="btn primary" onClick={onCopy}>⧉ Copy Code</button>
    </div>
  );
}
