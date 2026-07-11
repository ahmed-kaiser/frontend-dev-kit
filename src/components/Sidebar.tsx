import "./Sidebar.css";
import { TOOL_GROUPS } from "../tools";

interface Props {
  activeTool: string;
  onSelect: (id: string) => void;
}

export default function Sidebar({ activeTool, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">D</div>
        <div>
          <h1>DevKit</h1>
          <span>Frontend Tools</span>
        </div>
      </div>
      <nav className="nav">
        {TOOL_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="nav-label">{g.label}</div>
            {g.items.map((it) => {
              const soon = !it.component;
              const active = it.id === activeTool;
              return (
                <div
                  key={it.id}
                  className={"nav-item" + (active ? " active" : "") + (soon ? " disabled" : "")}
                  onClick={() => !soon && onSelect(it.id)}
                >
                  <span className="ico">{it.ico}</span> {it.label}
                  {soon && <span className="soon">SOON</span>}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">v0.3 · React · Internal build</div>
    </aside>
  );
}
