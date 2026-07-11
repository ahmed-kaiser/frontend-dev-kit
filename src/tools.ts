import type { ComponentType } from "react";
import GridTool from "./components/grid/GridTool";
import FlexTool from "./components/flex/FlexTool";
import ShadowTool from "./components/shadow/ShadowTool";
import GradientTool from "./components/gradient/GradientTool";
import GlassTool from "./components/glass/GlassTool";

export interface ToolDef {
  id: string;
  label: string;
  ico: string;
  component?: ComponentType;
}

export interface ToolGroup {
  label: string;
  items: ToolDef[];
}

export const TOOL_GROUPS: ToolGroup[] = [
  { label: "Layout", items: [
    { id: "grid", label: "Grid Generator", ico: "▦", component: GridTool },
    { id: "flexbox", label: "Flexbox", ico: "▤", component: FlexTool },
  ] },
  { label: "Effects", items: [
    { id: "box-shadow", label: "Box Shadow", ico: "◨", component: ShadowTool },
    { id: "gradient", label: "Gradient", ico: "▧", component: GradientTool },
    { id: "glass", label: "Glass Effect", ico: "◍", component: GlassTool },
  ] },
  { label: "Utilities", items: [
    { id: "color", label: "Color Convert", ico: "◑" },
    { id: "animation", label: "Animation", ico: "✦" },
  ] },
];

export const DEFAULT_TOOL = "grid";

export function findTool(id: string): ToolDef | undefined {
  for (const group of TOOL_GROUPS) {
    const found = group.items.find((t) => t.id === id);
    if (found) return found;
  }
  return undefined;
}
