import "./Sidebar.css";

interface NavEntry { label: string; ico: string; soon?: boolean; active?: boolean; }
interface NavGroup { label: string; items: NavEntry[]; }

const NAV: NavGroup[] = [
  { label: "Layout", items: [
    { label: "Grid Generator", ico: "▦", active: true },
    { label: "Flexbox", ico: "▤", soon: true },
  ] },
  { label: "Effects", items: [
    { label: "Box Shadow", ico: "◨", soon: true },
    { label: "Glass Effect", ico: "◍", soon: true },
  ] },
  { label: "Utilities", items: [
    { label: "Color Convert", ico: "◑", soon: true },
    { label: "Animation", ico: "✦", soon: true },
  ] },
];

export default function Sidebar() {
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
        {NAV.map((g) => (
          <div key={g.label}>
            <div className="nav-label">{g.label}</div>
            {g.items.map((it) => (
              <div
                key={it.label}
                className={"nav-item" + (it.active ? " active" : "") + (it.soon ? " disabled" : "")}
              >
                <span className="ico">{it.ico}</span> {it.label}
                {it.soon && <span className="soon">SOON</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">v0.3 · React · Internal build</div>
    </aside>
  );
}
