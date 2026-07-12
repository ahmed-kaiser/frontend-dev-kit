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
  scene: string;        // "aurora" | … | "image" | "solid"
  sceneColor: string;   // backdrop color when scene === "solid" (hex)
  sceneAlpha: number;   // 0–100
  sceneImage: string;   // selected image id when scene === "image" (e.g. "bg-1")

  /* Foreground text on the panel — a legibility check (preview-only unless non-empty) */
  text: string;         // panel text; empty = no text
  textColor: string;    // hex
  textAlpha: number;    // 0–100
  textSize: number;     // px
  textWeight: number;   // 100–900
  textLineHeight: number; // unitless
  textSpacing: number;  // letter-spacing (px)
  textAlign: string;    // "left" | "center" | "right"
}

/* ---------- Color Converter tool ---------- */

export interface ColorState {
  /* Canonical color kept as continuous sRGB channels (0–255 floats) plus alpha.
     Floats — not rounded ints — so HSL/OKLCH slider edits round-trip smoothly
     instead of snapping to the nearest displayable hex on every drag. */
  r: number;
  g: number;
  b: number;
  alpha: number;   // 0–100
  stage: string;   // preview backdrop: "checker" | "dark" | "light"
}

/* ---------- Border Radius tool ---------- */

export interface RadiusCorner {
  x: number;   // horizontal radius (in the current unit)
  y: number;   // vertical radius (used only when elliptical)
}

export interface RadiusState {
  corners: {
    tl: RadiusCorner;
    tr: RadiusCorner;
    br: RadiusCorner;
    bl: RadiusCorner;
  };
  unit: string;        // "px" | "%" | "rem" | "em"
  elliptical: boolean; // separate x / y radii per corner when true
  linked: boolean;     // all four corners share one value when true
  /* preview element */
  width: number;       // px
  height: number;      // px
  bg: string;          // hex
  bgAlpha: number;     // 0–100
  showHandles: boolean;// draggable corner handles on the preview
  stage: string;       // preview backdrop: "dark" | "light" | "checker" | "custom"
  stageColor: string;  // backdrop color when stage === "custom" (hex)
  stageAlpha: number;  // 0–100
}

/* ---------- Color Mixer tool ---------- */

export interface MixEndpoint { r: number; g: number; b: number; } // sRGB 0–255

export interface MixState {
  from: MixEndpoint;
  to: MixEndpoint;
  space: string;   // interpolation space: "oklch" | "srgb" | "hsl"
  steps: number;   // number of swatches, including both endpoints
  hueDir: string;  // hue interpolation direction (hsl/oklch): "short" | "long"
  stage: string;   // preview backdrop: "dark" | "light" | "checker"
}

/* ---------- Shape Generator tool ---------- */

export interface ShapePoint { x: number; y: number; } // percentages 0–100

export interface ShapeState {
  type: string;         // "polygon" | "circle" | "ellipse" | "inset"
  points: ShapePoint[]; // polygon vertices (%)
  selected: number;     // selected polygon vertex

  /* circle */
  circleR: number; circleX: number; circleY: number;             // radius / center (%)
  /* ellipse */
  ellipseRX: number; ellipseRY: number; ellipseX: number; ellipseY: number; // radii / center (%)
  /* inset */
  insetT: number; insetR: number; insetB: number; insetL: number; // edge offsets (%)
  insetRound: number;                                             // corner rounding (px)

  /* preview element */
  width: number;        // px
  height: number;       // px
  bg: string;           // fill hex
  bgAlpha: number;      // 0–100
  showGuides: boolean;  // outline + draggable vertex handles (polygon)
  stage: string;        // backdrop: "dark" | "light" | "checker" | "custom"
  stageColor: string;   // backdrop color when stage === "custom" (hex)
  stageAlpha: number;   // 0–100
}

/* ---------- Text Wrap Visualizer tool ---------- */

export interface WrapState {
  text: string;         // editable sample copy
  width: number;        // container max-width (px)

  /* wrapping & breaking */
  textWrap: string;     // "wrap" | "nowrap" | "balance" | "pretty" | "stable"
  whiteSpace: string;   // "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line"
  overflowWrap: string; // "normal" | "break-word" | "anywhere"
  hyphens: string;      // "none" | "auto"

  /* truncation */
  clamp: boolean;       // -webkit-line-clamp
  lines: number;        // clamp line count
  overflow: string;     // "visible" | "hidden" | "auto" | "scroll"
  textOverflow: string; // "clip" | "ellipsis"

  /* typography (for a realistic preview) */
  fontSize: number;     // px
  lineHeight: number;   // unitless
  fontWeight: number;   // 100–900
  align: string;        // text-align

  stage: string;        // preview backdrop: "dark" | "light" | "checker"
}

/* ---------- CSS clamp() calculator ---------- */

export interface ClampState {
  minSize: number;   // value at (and below) the min viewport (px)
  maxSize: number;   // value at (and above) the max viewport (px)
  minVw: number;     // viewport where scaling starts (px)
  maxVw: number;     // viewport where scaling ends (px)
  root: number;      // root font-size for rem conversion (px)
  unit: string;      // output unit: "rem" | "px"
  previewVw: number; // scrubbed viewport width for the live readout (px)
  stage: string;     // preview backdrop: "dark" | "light" | "checker"
}

/* ---------- PX ↔ REM calculator ---------- */

export interface PxRemState {
  px: number;    // canonical value in px (rem is derived as px / root)
  root: number;  // root font-size (px)
  stage: string; // preview backdrop: "dark" | "light" | "checker"
}
