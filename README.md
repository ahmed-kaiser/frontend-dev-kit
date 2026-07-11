# DevKit — Grid Generator (React + Vite + TypeScript)

An internal frontend tooling suite. First tool: a responsive CSS Grid layout generator
with a live device preview and code export. Styling is raw CSS (per-component files plus a
global variables/reset), no CSS framework.

## Run

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # type-check (tsc) + production build to dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  main.tsx                 app entry
  App.tsx                  shell: sidebar + active tool
  types.ts                 shared type definitions
  styles/
    variables.css          CSS custom properties (theme)
    global.css             reset + shared primitives (.btn, .field, .seg, toast…)
  lib/
    gridModel.ts           pure logic: state, breakpoint cascade, CSS/HTML generation
    highlight.ts           tiny CSS/HTML syntax highlighters
  components/
    Sidebar.tsx            tool navigation (Grid active; others queued)
    Topbar.tsx             title + Reset / Copy actions
    Toast.tsx              transient copy/reset notice
    grid/
      GridTool.tsx         owns app state; wires everything together
      BreakpointBar.tsx    breakpoint layers + min-width/max-width mode
      Controls.tsx         columns/rows, gap, alignment, auto-placement, items
      Preview.tsx          device frame, size readout, grid line numbers
      CodePanel.tsx        generated CSS / HTML with copy
```

## State model

`AppState` holds an ordered list of breakpoints. The Base breakpoint carries a full
`GridConfig`; every added breakpoint stores only sparse overrides. `resolveAt(width)`
merges the applicable layers (mobile-first ascending, or desktop-first descending) to
produce the effective config used by both the preview and the generated `@media` blocks.

## Adding another tool

Add a component under `src/components/<tool>/`, register it in the `Sidebar` nav list,
and render it from `App`/a router. The grid model pattern (pure `lib/` logic + a state
owner component + presentational children) is the template to follow.
