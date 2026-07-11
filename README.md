# DevKit — CSS Tool Suite (React + Vite + TypeScript)

A personal, internal front-end tooling suite that brings the CSS generators used in client
work under one consistent interface: **controls on the left, a live preview on the right, and
copy-ready code below.** Built one tool at a time, each fully featured before the next.

Styling is raw CSS — per-component stylesheets plus a shared global (theme variables + reset),
no CSS framework. TypeScript strict mode throughout.

## Tools

| Tool | Purpose | Status |
| --- | --- | --- |
| **Grid Generator** | Build responsive CSS Grid layouts visually | ✅ Shipped |
| **Flexbox Generator** | Build responsive flexbox layouts visually | ✅ Shipped |
| **Box Shadow** | Compose and stack box shadows | ✅ Shipped |
| **Gradient** | Linear / radial / conic gradient generator | ✅ Shipped |
| Glass Effect | Frosted-glass / backdrop-blur presets | ⏳ Next |
| Color Converter, Animation, … | Additional utilities as needs arise | 💡 Planned |

**Grid** and **Flexbox** offer breakpoint layers (mobile-first / desktop-first), full alignment
and per-item controls, a device-preset preview with a width scrubber, and live CSS + HTML export.
**Box Shadow** stacks any number of shadow layers (add / duplicate / remove / hide), each with
inset, offset, blur, spread, and colour + opacity; the preview element has configurable
background, optional border, radius, and size, viewed against a dark / light / checker / custom
backdrop. **Gradient** builds linear, radial, and conic gradients with type-aware geometry (angle,
shape, center position) and any number of colour stops (colour + opacity + position), with a live
gradient bar in the editor. All tools share undo/redo and one-click copy.

## Run

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # type-check (tsc) + production build to dist/
npm run preview  # preview the production build
```

Deployment is Vercel-ready (`vercel.json` sets the framework, build, and SPA rewrite).

## Structure

```
index.html                 Vite entry (loads src/main.tsx)
src/
  main.tsx                 React mount
  App.tsx                  shell: hash router (#/grid, #/flexbox, …), active-tool lookup, sidebar
  tools.ts                 tool registry — single source of truth for nav + routing
  types.ts                 shared type definitions (GridConfig, FlexConfig, ShadowAppState, …)
  styles/
    variables.css          CSS custom properties (theme)
    global.css             reset + shared primitives (.btn, .field, .seg, toast…)
  lib/
    gridModel.ts           pure logic: grid state, breakpoint cascade, CSS/HTML generation
    flexModel.ts           pure logic: flex state, breakpoint cascade, CSS/HTML generation
    shadowModel.ts         pure logic: shadow-layer state, rgba helpers, CSS/HTML generation
    gradientModel.ts       pure logic: gradient state, stop sorting, rgba helpers, CSS/HTML generation
    highlight.ts           tiny CSS/HTML syntax highlighters
  components/
    Sidebar.tsx            tool navigation rendered from the registry (SOON badge for unbuilt tools)
    Topbar.tsx             title + undo / redo / reset / copy
    Toast.tsx              transient notices
    CodePanel.tsx          generated CSS / HTML with copy — shared by every tool
    ComingSoon.tsx         placeholder for registered-but-unbuilt tools
    grid/                  GridTool + BreakpointBar + Controls + Preview
    flex/                  FlexTool + BreakpointBar + Controls + Preview
    shadow/                ShadowTool + Controls + Preview
    gradient/              GradientTool + Controls + Preview
```

## Architecture

Every tool follows the same pattern: **pure logic in `lib/`, a state-owner component that owns
undo/redo history, and presentational children.** The state owner keeps a single config object,
clones it on each edit (coalescing rapid edits into one undo step), and derives the live CSS/HTML
via the tool's `buildCSS` / `buildHTML`.

Grid and Flexbox use a breakpoint model: `AppState` holds an ordered list of breakpoints where the
Base layer carries a full config and each added breakpoint stores only sparse overrides;
`resolveAt(width)` merges the applicable layers (mobile-first ascending or desktop-first descending)
to produce the effective config used by both the preview and the generated `@media` blocks. Box
Shadow and Gradient keep a single flat state — those effects are rarely breakpoint-specific.

Genuinely tool-agnostic pieces (`Topbar`, `Toast`, `CodePanel`, `highlight.ts`) are shared; per-tool
state/config types and models are kept independent even when structurally similar, so each tool's
codegen stays easy to reason about in isolation.

## Adding another tool

1. Write the pure model in `src/lib/<tool>Model.ts` (state factory + `buildCSS` / `buildHTML`).
2. Add `src/components/<tool>/` with a state-owner component and presentational children.
3. Register one entry in `src/tools.ts` (`id`, `label`, `ico`, `component`).

The sidebar and hash router pick it up automatically — no shell changes needed.
