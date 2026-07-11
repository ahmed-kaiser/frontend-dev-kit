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
