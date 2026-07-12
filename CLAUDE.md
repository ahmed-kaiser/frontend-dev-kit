# DevKit — Project Vision & Progress

_Last updated: July 2026 · Status: v0.9 (Grid + Flexbox + Box Shadow + Gradient + Glass + Color Converter + Border Radius shipped)_

## Vision

DevKit is a personal, internal web application that brings the CSS and front-end
generators used in client work together under a single, consistent interface. Instead of
juggling scattered online generators, the goal is one polished tool suite — built and owned
in-house — where each utility shares the same layout language: **controls on the left, a live
preview on the right, and copy-ready code below.**

The suite is built **one tool at a time**, each fully featured before moving on, with progress
tracked as we go. The long-term intent is a fast, dependable, good-looking toolkit that fits
the way we actually work.

### Planned tools

| Tool | Purpose | Status |
| --- | --- | --- |
| **Grid Generator** | Build responsive CSS Grid layouts visually | ✅ Shipped |
| **Flexbox Generator** | Build responsive flexbox layouts visually | ✅ Shipped |
| **Box Shadow** | Compose and stack box shadows | ✅ Shipped |
| **Gradient** | Linear / radial / conic gradient generator | ✅ Shipped |
| **Glass Effect** | Frosted-glass / backdrop-blur panels | ✅ Shipped |
| **Color Converter** | Convert between HEX / RGB / HSL / OKLCH | ✅ Shipped |
| **Border Radius** | Compose per-corner / elliptical radii visually | ✅ Shipped |
| Animation | Keyframe & transition generator | ⏳ Planned |
| Color Mixer | Blend two colors across a stepped scale | ⏳ Planned |
| Shape Generator | Build shapes via `clip-path` / `border-radius` | ⏳ Planned |
| Text Wrap Visualizer | Preview `text-wrap`, `overflow`, `line-clamp` behavior | ⏳ Planned |
| _…and more_ | Additional utilities as needs arise | 💡 Ideas |

## Tech stack

The project started as a single vanilla HTML/CSS/JS file for fast iteration, then migrated to
a proper application foundation once the shape of the tool was clear.

- **Vite** — dev server and build tooling
- **React 18** — component-based UI
- **TypeScript** — typed state model and components (strict mode)
- **Raw CSS** — per-component stylesheets plus a shared global (theme variables + reset); no CSS framework
- **Deployment** — Vercel-ready (`vercel.json`); optional single-file build for offline/local use

### Project structure

```
react-grid-devkit/
  index.html                 Vite entry
  vite.config.ts             build config
  vercel.json                deployment config (framework, build, SPA rewrite)
  src/
    App.tsx                  shell: hash router, active tool lookup, sidebar mount
    tools.ts                 tool registry (id, label, icon, component) — single source of truth for nav + routing
    types.ts                 shared type definitions
    vite-env.d.ts             Vite ambient types (client env, CSS side-effect imports)
    styles/                  variables.css (theme) + global.css (reset + primitives)
    lib/
      gridModel.ts           pure logic: state, breakpoint cascade, CSS/HTML generation
      flexModel.ts           pure logic: flex state, breakpoint cascade, CSS/HTML generation
      shadowModel.ts         pure logic: shadow-layer state, color/rgba helpers, CSS/HTML generation
      gradientModel.ts       pure logic: gradient state, stop sorting, color/rgba helpers, CSS/HTML generation
      colorModel.ts          pure logic: color state (sRGB canonical), HEX/RGB/HSL/OKLCH conversions, format strings, CSS generation
      highlight.ts           tiny CSS/HTML syntax highlighters
    components/
      Sidebar.tsx            renders tool nav from the registry; disabled state for unbuilt tools
      Topbar.tsx             title + undo/redo/reset/copy
      Toast.tsx              transient notices
      CodePanel.tsx          generated CSS / HTML with copy — shared by every tool
      ComingSoon.tsx          placeholder view for registered-but-unbuilt tools
      grid/
        GridTool.tsx         owns app state + undo/redo history
        BreakpointBar.tsx    breakpoint layers + min/max-width mode
        Controls.tsx         columns/rows, gap, alignment, auto-placement, items
        Preview.tsx          device frame, size readout, grid line numbers
      flex/
        FlexTool.tsx         owns app state + undo/redo history
        BreakpointBar.tsx    breakpoint layers + min/max-width mode
        Controls.tsx         direction/wrap, gap, alignment, per-item grow/shrink/basis/order
        Preview.tsx          device frame, size readout, live flex layout
      shadow/
        ShadowTool.tsx       owns app state + undo/redo history
        Controls.tsx         layer stack (add/dup/remove/hide), per-layer inset/offset/blur/spread/color+opacity, element bg/border/radius/size, backdrop
        Preview.tsx          dark/light/checker/custom backdrop, live shadowed element
      gradient/
        GradientTool.tsx     owns app state + undo/redo history
        Controls.tsx         type (linear/radial/conic), angle/shape/position, color stops (add/remove) with color+opacity+position, live gradient bar
        Preview.tsx          type/geometry readout, full-bleed live gradient element
      glass/
        GlassTool.tsx        owns app state + undo/redo history
        Controls.tsx         sub-category groups: Frost (blur/saturate/brightness/contrast), Fill (tint+opacity), Border & Highlight, Elevation (drop shadow), Shape, Backdrop (preview scene)
        Preview.tsx          busy scene backdrop (10 scenes incl. a text backdrop + custom solid) with the live frosted panel on top
      color/
        ColorTool.tsx        owns app state + undo/redo history
        Controls.tsx         collapsible format groups (Color+picker+alpha+presets, RGB, HSL, OKLCH) — each editable, converting back to the canonical sRGB
        Preview.tsx          live swatch over checker/dark/light backdrop with dual contrast samples + copyable HEX/RGB/HSL/OKLCH rows
      radius/
        RadiusTool.tsx       owns app state + undo/redo history
        Controls.tsx         presets, linked/per-corner + uniform/elliptical toggles, unit selector, corner tabs, per-axis sliders, element bg/size/backdrop
        Preview.tsx          live shaped box with draggable corner handles over dark/light/checker/custom backdrop
```

Note: `lib/radiusModel.ts` holds the pure logic (corner state, unit maxes, CSS-shorthand
collapse + elliptical `/` form, color/rgba helpers, CSS/HTML generation).

The architecture pattern for every future tool: **pure logic in `lib/`, a state-owner
component, and presentational children.** New tools slot into `components/<tool>/` and register
as one entry in `tools.ts` — the sidebar and router pick it up automatically, no shell changes
needed. Genuinely tool-agnostic pieces (`Topbar`, `Toast`, `CodePanel`, `highlight.ts`) live
outside any tool folder and are shared; per-tool state/config types and models are not shared
even when structurally similar (see `GridConfig`/`FlexConfig` in `types.ts`), keeping each tool's
cascade and codegen logic independent and easy to reason about in isolation.

## What's done — Grid Generator

The first tool is complete and covers simple-to-advanced grid authoring.

**Layout engine**

- Columns & rows with a per-track editor — free-form values so `1fr`, `100px`, `auto`,
  `min-content`, and `minmax(80px, 1fr)` all work; add/remove tracks; quick-insert chips.
- Row and column gap with a unit selector (px / rem / em / %).
- Full alignment set: `justify-items`, `align-items`, `justify-content`, `align-content`.
- Auto placement: `grid-auto-flow` (incl. dense), `grid-auto-rows`, `grid-auto-columns`.
- Items: add/remove, per-item column/row start–end, `justify-self` / `align-self`; click any
  item in the preview to select and edit it.

**Responsive mode**

- Breakpoint layers — a Base layer plus any number of breakpoints; each stores only the
  values it overrides (sparse), so generated CSS stays lean.
- Mobile-first (`min-width`) or desktop-first (`max-width`) toggle, with media queries emitted
  in the correct cascade order.
- Override indicators — changed values on a breakpoint show a reset dot to revert to inherited.

**Device preview**

- Device presets (Fit, Mobile 375, Tablet 768, Laptop 1024, Desktop 1440) plus an editable
  width and a live width scrubber — the layout reflows as breakpoints activate.
- Active-layer badge showing which breakpoint applies at the previewed width.

**Understanding aids**

- Total grid-size readout: `columns × rows · cells · items`, live.
- Toggleable row/column **grid line numbers** overlaid on the real rendered tracks.

**Productivity**

- Live generated **CSS + HTML** with syntax highlighting and one-click copy (per-tab or full).
- **Undo / redo** with coalesced history (rapid edits group into one step), keyboard shortcuts
  (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl+Y), and an **undoable Reset**.

**App shell**

- Tool-switching shell: a small `tools.ts` registry drives both the sidebar and a hash-based
  router (`#/grid`, `#/box-shadow`, …), so routes are shareable/bookmarkable and survive
  refresh via the existing SPA rewrite in `vercel.json`.
- Sidebar navigation renders from the registry — Grid is live and clickable; tools without a
  registered component show a "SOON" badge and are inert to clicks (but still deep-linkable,
  rendering a `ComingSoon` placeholder).
- Topbar actions and a consistent dark UI theme driven by CSS variables.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds.
- Breakpoint cascade and CSS/HTML generation unit-tested (mobile-first and desktop-first).
- App mounts and runs with zero runtime errors; undo/redo and interactions verified.

## What's done — Flexbox Generator

Second tool, built to the same depth as Grid via the tool-switching shell — registered in
`tools.ts`, no shell changes required.

**Layout engine**

- `flex-direction` (row / row-reverse / column / column-reverse) and `flex-wrap` (nowrap / wrap
  / wrap-reverse).
- Row and column gap with a unit selector (px / rem / em / %).
- Full alignment set: `justify-content`, `align-items`, `align-content` (with a hint that
  align-content only matters once items wrap).
- Items: add/remove, per-item `flex-grow` / `flex-shrink` / `flex-basis` (with quick-insert
  chips), `order`, and `align-self`; click any item in the preview to select and edit it.
  Grow/shrink/basis emit a single shorthand `flex` declaration only when non-default.

**Responsive mode**

- Same breakpoint-layer model as Grid — Base layer plus any number of breakpoints, sparse
  overrides, mobile-first/desktop-first toggle, override indicators.

**Device preview**

- Same device presets and width scrubber as Grid; the previewed items visually reflow
  (grow/shrink/wrap) live as the container width changes.

**Productivity**

- Live generated **CSS + HTML** and **undo/redo** — reuses the same `CodePanel`, `Topbar`, and
  history-coalescing pattern as Grid verbatim.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds.
- Driven end-to-end in a real browser: direction/wrap toggles, gap sliders, item grow/shrink/
  basis editing, breakpoint override with correct generated `@media` block, and undo — plus a
  regression check that Grid still works after promoting `CodePanel` to a shared component.

## What's done — Box Shadow Generator

Third tool, registered in `tools.ts` with no shell changes. Deliberately **not** breakpoint-aware
— box shadows are rarely breakpoint-specific — so it keeps a single flat state instead of the
breakpoint-layer model, making it the simplest tool to reason about.

**Shadow engine**

- Stack any number of shadow **layers** — add, duplicate, remove, or **hide/show** each layer;
  actions sit in a two-per-row button grid (Add / Remove, then Duplicate / Hide). Each layer tab
  shows a colour swatch, and layers paint front-to-back (last layer sits behind the first).
- **Hidden layers** are kept in state but excluded from both the preview and generated CSS (their
  tab dims to grayscale), so shadow stacks can be compared without deleting/recreating layers.
  With every layer hidden the output cleanly becomes `box-shadow: none;`.
- Per-layer controls: `inset`/`outset` toggle, offset-x, offset-y, blur, and spread sliders,
  plus a colour picker (native swatch + editable hex) and an opacity slider that emits `rgba()`
  (falls back to plain hex at full opacity). A live one-line preview of the layer's CSS value
  sits under the controls.
- Spread is omitted from the generated value when it's `0`, keeping declarations minimal;
  multi-layer shadows are emitted one-per-line for readability.

**Element / preview**

- Editable preview element: background **colour + opacity**, an optional **border** (toggle with
  its own width / colour / opacity), border-radius, and size — all reflected in the generated
  `.box` rule so the copied CSS reproduces exactly what's shown.
- Every colour input (shadow, element background, border, custom backdrop) pairs a native swatch
  with an editable hex field and an opacity slider, all sharing one `rgba()` helper that collapses
  to plain hex at full opacity.
- Switchable preview backdrop — **dark / light / checker / custom** (custom exposes its own colour
  + opacity) — to judge shadows against different surfaces, toggled from the preview bar or cycled
  by click; live layer-count readout.

**Productivity**

- Live generated **CSS + HTML** and **undo/redo** — reuses the same `CodePanel`, `Topbar`, and
  history-coalescing pattern as Grid and Flexbox verbatim.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds.

## What's done — Gradient Generator

Fourth tool, registered under **Effects** in `tools.ts` with no shell changes. Like Box Shadow it
keeps a single flat state (gradients are rarely breakpoint-specific).

**Gradient engine**

- Three gradient **types** — `linear`, `radial`, and `conic` — each emitting the correct CSS
  function. Geometry adapts to the type: angle (+ quick-angle chips) for linear/conic, a
  `circle`/`ellipse` shape for radial, and a center X/Y position for radial/conic.
- **Colour stops** — add / remove (min two), each with a colour picker (native swatch + editable
  hex), an opacity slider that emits `rgba()`, and a position slider. Stops are sorted by position
  for the generated value, so ordering is always predictable regardless of edit order.
- A live **gradient bar** in the stops editor previews the stop distribution as a horizontal ramp.

**Preview**

- Full-bleed live gradient element over the app's dotted stage, with a type + geometry readout and
  a stop-count badge.

**Productivity**

- Live generated **CSS + HTML** and **undo/redo** — reuses `CodePanel`, `Topbar`, and the same
  history-coalescing pattern as the other tools.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds (75 modules); `#/gradient` route
  serves and the tool mounts.

## What's done — Glass Effect Generator

Fifth tool, registered under **Effects** in `tools.ts` with no shell changes. Like Box Shadow and
Gradient it keeps a single flat state (glass effects are rarely breakpoint-specific). Its controls
are organised into **collapsible sub-categories** so the panel scales from basic to advanced use.

**Glass engine**

- **Frost** — `backdrop-filter` with a blur slider (+ quick-blur chips) plus `saturate`,
  `brightness`, and `contrast`. The three filter functions are only emitted when non-neutral
  (100%), keeping the value minimal; blur is always present. Output pairs `backdrop-filter` with a
  `-webkit-backdrop-filter` line for Safari.
- **Fill** — semi-transparent tint layer (colour + opacity) painted over the blur via the shared
  `rgba()` helper that collapses to plain hex at full opacity.
- **Border & Highlight** — optional border (width / colour / opacity) plus an optional inset
  top-edge light highlight (a white `inset 0 1px 0` line) that simulates light catching the glass
  edge; both fold into a single combined `box-shadow` with the drop shadow.
- **Elevation** — optional drop shadow (offset-Y / blur / colour + opacity) so the panel floats.
- **Shape** — corner radius plus width / height of the panel.

**Preview**

- The frosted panel sits over a **busy scene backdrop** — ten options: `aurora`, `sunset`, `ocean`,
  `candy`, `lime`, `dusk`, `mesh`, `photo`, a `text` scene, and a custom `solid` colour — chosen so
  `backdrop-filter` is actually visible (a blur over a flat colour shows nothing). Scenes render from
  the `SCENES` constant in `glassModel.ts`, so adding one only touches the model. The `text` scene
  paints real uppercase type behind the panel (painted before the glass element so `backdrop-filter`
  blurs it) — the real-world test for frosting legible content. All backdrops are preview-only and
  excluded from the generated `.glass` rule.
- Blur/size + active-scene readout in the preview bar.

**Productivity**

- Live generated **CSS + HTML** and **undo/redo** — reuses `CodePanel`, `Topbar`, and the same
  history-coalescing pattern as the other tools.

**Implementation note**

- Colour + opacity controls share a single `ColorField` helper defined at **module scope** (not
  inside `Controls`). An inner component gets a fresh identity each render, so React remounts it on
  every edit — which closed the native colour picker and dropped pointer capture mid-drag on the
  opacity sliders. Module scope keeps its type stable so edits update in place.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds (82 modules).

## What's done — Color Converter

Sixth tool, registered under **Utilities** in `tools.ts` with no shell changes. It's the first
tool that's a **converter** rather than a live-CSS generator, so it adapts the shared layout
language: controls edit a single color on the left; the right shows a live swatch plus each
format as a copy-ready row (and the shared `CodePanel` emits the color as CSS custom properties).

**Conversion engine**

- Canonical state is the color as **continuous sRGB channels** (`r`/`g`/`b` as 0–255 floats, not
  rounded ints) plus alpha. Keeping floats — rather than snapping to the nearest displayable hex —
  lets HSL and OKLCH slider drags round-trip smoothly instead of jittering on every edit; HEX and
  RGB round only for display.
- Full bidirectional conversions in `colorModel.ts`: HEX ⇄ sRGB (incl. 3/4/6/8-digit hex with
  alpha), sRGB ⇄ HSL, and sRGB ⇄ **OKLCH** via linear-light sRGB and OKLab (Ottosson's
  coefficients). Verified against spec references — pure red resolves to `oklch(62.8% 0.258 29.2)`
  and the OKLCH→RGB round-trip is exact.
- Out-of-gamut detection: OKLCH values outside sRGB are flagged in the UI and clamped to the
  nearest displayable color.

**Controls**

- Collapsible format groups (same `Group` pattern as Gradient/Glass): **Color** (native picker +
  editable hex + alpha slider + preset swatches), **RGB**, **HSL**, and **OKLCH** — every group is
  editable and writes back through the canonical sRGB, so all views stay in sync.

**Preview / output**

- Live swatch over a switchable **checker / dark / light** backdrop (checker makes alpha visible),
  with black-and-white `Aa` samples to judge contrast both ways.
- Copy-ready **HEX / RGB / HSL / OKLCH** rows — click any row to copy that format; alpha folds into
  each (`#rrggbbaa`, `rgba()`, `hsla()`, `oklch(… / a)`).

**Productivity**

- Live generated **CSS** (color as `--color` / `--color-rgb` / `--color-hsl` / `--color-oklch`
  custom properties) + **HTML**, and **undo/redo** — reuses `CodePanel`, `Topbar`, and the same
  history-coalescing pattern as the other tools.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds (89 modules). OKLCH conversion
  math validated against spec reference values with an exact round-trip.

## What's done — Border Radius

Seventh tool, registered under **Effects** in `tools.ts` next to Box Shadow with no shell
changes. Like the other single-box tools it keeps a flat state (border-radius is rarely
breakpoint-specific).

**Radius engine**

- Per-corner control for all four corners (TL / TR / BR / BL), each with a horizontal and a
  vertical radius so **elliptical** corners (`x / y`) are supported. A **uniform** toggle keeps
  `x === y` (circular) for simpler cases; an **elliptical** toggle exposes both axes.
- **Linked** mode edits all four corners together; **per-corner** mode adds a 2×2 corner-tab
  selector (laid out to mirror the physical corners) to edit one corner at a time.
- **Unit selector** — `px` / `%` / `rem` / `em`; slider range and step adapt per unit
  (`unitMax` / `unitStep`), and drag/edit values are interpreted in the active unit (no implicit
  conversion between units).
- **Presets** — Sharp (0), Soft, Round, Pill (999px), and Circle (50%), each resetting to a
  linked/uniform value.
- Generated value uses **CSS shorthand collapse** (1–4 values via margin-like rules) and only
  emits the `a / b` elliptical form when the horizontal and vertical sets actually differ.

**Preview**

- Live shaped box (editable background colour + opacity, width, height) over the shared
  dark / light / checker / custom backdrop.
- **Draggable corner handles** — a handle at each corner adjusts that corner by pointer drag
  (horizontal → x, vertical → y; the larger axis drives the radius in uniform mode). Handles
  honour linked vs. per-corner mode and the active unit, and can be toggled off. Uses pointer
  capture so a drag can't be lost mid-gesture.

**Productivity**

- Live generated **CSS + HTML** and **undo/redo** — reuses `CodePanel`, `Topbar`, and the same
  history-coalescing pattern as the other tools.

### Quality / verification

- `tsc` strict type-check passes; Vite production build succeeds (96 modules); dev server serves
  the `#/border-radius` route and the tool mounts.

## Deliverables produced so far

- `react-grid-devkit/` — the full Vite + React + TypeScript source project.
- `grid-devkit-app.html` — self-contained single-file build (opens in a browser, no server).
- Source zip for easy download; project is Vercel-ready.

## Roadmap / next steps

- **Animation** — the next tool (keyframe & transition generator), following the same `lib/` +
  `components/<tool>/` + `tools.ts`-registration pattern.
- **Newly queued tools** (same pattern — pure `lib/` model, state-owner + presentational children,
  one `tools.ts` entry):
  - **Color Mixer** — blend two colors into a stepped scale; reuses the `colorModel.ts` conversions
    (mix in a chosen space, e.g. sRGB / OKLCH).
  - **Shape Generator** — build shapes via `clip-path` (polygon presets + editable points) and/or
    `border-radius`, with a draggable preview.
  - **Text Wrap Visualizer** — preview `text-wrap` (`balance` / `pretty`), `overflow`/`text-overflow`,
    and `-webkit-line-clamp` against editable sample copy at adjustable widths.
- **Grid extras** (optional polish): `grid-template-areas` visual editor; hover-to-pick N×M
  size picker.
- **DX**: an `npm run build:standalone` script to regenerate the single-file app on demand.
- Continue down the planned-tools list, keeping this document updated as each ships.
