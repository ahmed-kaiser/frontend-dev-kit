# DevKit — Project Vision & Progress

_Last updated: July 2026 · Status: v0.4 (Grid + Flexbox Generators shipped)_

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
| Box Shadow | Compose and stack box shadows | ⏳ Planned (next) |
| Glass Effect | Frosted-glass / backdrop-blur presets | ⏳ Planned |
| Color Converter | Convert between HEX / RGB / HSL / OKLCH | ⏳ Planned |
| Animation | Keyframe & transition generator | ⏳ Planned |
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
```

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

## Deliverables produced so far

- `react-grid-devkit/` — the full Vite + React + TypeScript source project.
- `grid-devkit-app.html` — self-contained single-file build (opens in a browser, no server).
- Source zip for easy download; project is Vercel-ready.

## Roadmap / next steps

- **Box Shadow** — the next tool, following the same `lib/` + `components/<tool>/` +
  `tools.ts`-registration pattern.
- **Grid extras** (optional polish): `grid-template-areas` visual editor; hover-to-pick N×M
  size picker.
- **DX**: an `npm run build:standalone` script to regenerate the single-file app on demand.
- Continue down the planned-tools list, keeping this document updated as each ships.
