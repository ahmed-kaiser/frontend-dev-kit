import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ComingSoon from "./components/ComingSoon";
import { DEFAULT_TOOL, findTool } from "./tools";

function readHash(): string {
  const id = window.location.hash.replace(/^#\/?/, "");
  return id && findTool(id) ? id : DEFAULT_TOOL;
}

export default function App() {
  const [activeTool, setActiveTool] = useState(readHash);

  useEffect(() => {
    const onHashChange = () => setActiveTool(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = (id: string) => {
    if (id !== activeTool) window.location.hash = `/${id}`;
    setActiveTool(id);
  };

  const tool = findTool(activeTool);
  const ToolComponent = tool?.component;

  return (
    <div className="app">
      <Sidebar activeTool={activeTool} onSelect={select} />
      {ToolComponent ? <ToolComponent /> : <ComingSoon label={tool?.label ?? ""} />}
    </div>
  );
}
