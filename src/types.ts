export type Mode = "mobile" | "desktop";

export interface GridItem {
  id: number;
  colStart: string;
  colEnd: string;
  rowStart: string;
  rowEnd: string;
  justifySelf: string;
  alignSelf: string;
}

export interface GridConfig {
  columns: string[];
  rows: string[];
  colGap: number;
  rowGap: number;
  gapUnit: string;
  justifyItems: string;
  alignItems: string;
  justifyContent: string;
  alignContent: string;
  autoFlow: string;
  autoRows: string;
  autoCols: string;
  items: GridItem[];
}

export type ItemOverride = Partial<Omit<GridItem, "id">>;

export interface Override {
  columns?: string[];
  rows?: string[];
  colGap?: number;
  rowGap?: number;
  gapUnit?: string;
  justifyItems?: string;
  alignItems?: string;
  justifyContent?: string;
  alignContent?: string;
  autoFlow?: string;
  autoRows?: string;
  autoCols?: string;
  items?: Record<number, ItemOverride>;
}

export interface Breakpoint {
  id: number;
  name: string;
  w: number;
  cfg?: GridConfig;   // present on the Base breakpoint (full config)
  ov?: Override;      // present on non-base breakpoints (sparse overrides)
}

export interface AppState {
  mode: Mode;
  breakpoints: Breakpoint[];
  activeBp: number;
  selected: number;
  previewW: number | null;
  device: string;
  showLabels: boolean;
  showLines: boolean;
}

export interface DevicePreset {
  id: string;
  label: string;
  ico: string;
  w: number | null;
}

/* ---------- Flexbox tool ---------- */

export interface FlexItem {
  id: number;
  order: number;
  grow: number;
  shrink: number;
  basis: string;
  alignSelf: string;
}

export interface FlexConfig {
  direction: string;
  wrap: string;
  justifyContent: string;
  alignItems: string;
  alignContent: string;
  rowGap: number;
  colGap: number;
  gapUnit: string;
  items: FlexItem[];
}

export type FlexItemOverride = Partial<Omit<FlexItem, "id">>;

export interface FlexOverride {
  direction?: string;
  wrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  rowGap?: number;
  colGap?: number;
  gapUnit?: string;
  items?: Record<number, FlexItemOverride>;
}

export interface FlexBreakpoint {
  id: number;
  name: string;
  w: number;
  cfg?: FlexConfig;   // present on the Base breakpoint (full config)
  ov?: FlexOverride;  // present on non-base breakpoints (sparse overrides)
}

export interface FlexAppState {
  mode: Mode;
  breakpoints: FlexBreakpoint[];
  activeBp: number;
  selected: number;
  previewW: number | null;
  device: string;
  showLabels: boolean;
}

/* ---------- Box Shadow tool ---------- */

export interface ShadowLayer {
  id: number;
  on: boolean;     // included in output when true; hidden/disabled when false
  inset: boolean;
  x: number;       // offset-x (px)
  y: number;       // offset-y (px)
  blur: number;    // blur radius (px)
  spread: number;  // spread radius (px)
  color: string;   // hex "#rrggbb"
  alpha: number;   // 0–100
}

export interface ShadowAppState {
  layers: ShadowLayer[];
  selected: number;
  boxColor: string;   // preview element background (hex)
  boxAlpha: number;   // preview element background opacity (0–100)
  border: boolean;    // whether the element has a border
  borderWidth: number;// border width (px)
  borderColor: string;// border color (hex)
  borderAlpha: number;// border opacity (0–100)
  radius: number;     // preview element border-radius (px)
  size: number;       // preview element width/height (px)
  stage: string;      // preview backdrop: "dark" | "light" | "checker" | "custom"
  stageColor: string; // backdrop color when stage === "custom" (hex)
  stageAlpha: number; // backdrop opacity when stage === "custom" (0–100)
}

/* ---------- Gradient tool ---------- */

export interface GradientStop {
  id: number;
  color: string;   // hex "#rrggbb"
  alpha: number;   // 0–100
  pos: number;     // 0–100 (%)
}

export interface GradientState {
  type: string;        // "linear" | "radial" | "conic"
  angle: number;       // linear angle / conic "from" angle (deg)
  radialShape: string; // "circle" | "ellipse" (radial only)
  posX: number;        // center X % (radial/conic)
  posY: number;        // center Y % (radial/conic)
  stops: GradientStop[];
  selected: number;
}

/* ---------- Glass Effect tool ---------- */

export interface GlassState {
  /* Frost — backdrop-filter (100% = neutral for saturate/brightness/contrast) */
  blur: number;         // px
  saturate: number;     // %
  brightness: number;   // %
  contrast: number;     // %

  /* Fill — semi-transparent background layer over the blur */
  tintColor: string;    // hex
  tintAlpha: number;    // 0–100

  /* Border + top-edge light highlight */
  border: boolean;
  borderWidth: number;  // px
  borderColor: string;  // hex
  borderAlpha: number;  // 0–100
  highlight: boolean;   // inset light line along the top edge
  highlightAlpha: number; // 0–100 (white)

  /* Elevation — drop shadow so the panel floats */
  shadow: boolean;
  shadowY: number;      // px
  shadowBlur: number;   // px
  shadowColor: string;  // hex
  shadowAlpha: number;  // 0–100

  /* Shape */
  radius: number;       // px
  width: number;        // px
  height: number;       // px

  /* Preview backdrop scene (so the blur is actually visible) */
  scene: string;        // "aurora" | "sunset" | "mesh" | "photo" | "solid"
  sceneColor: string;   // backdrop color when scene === "solid" (hex)
  sceneAlpha: number;   // 0–100
}
