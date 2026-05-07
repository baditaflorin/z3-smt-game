# 0006 WASM Modules

## Status

Accepted

## Context

The core experience depends on Z3 solving constraints in the browser.

## Decision

Use the npm `z3-solver` package and lazy-load it inside a Web Worker. The worker initializes Z3 only when the user starts solving a puzzle.

The maintained browser package requires `SharedArrayBuffer`. GitHub Pages cannot set COOP/COEP headers directly, so v1 serves `coi-serviceworker.min.js` from this origin. The shim registers a service worker, reloads once when needed, and adds the required COOP/COEP headers to same-origin responses.

The Z3 Emscripten script and WASM are emitted as Vite assets. The solver worker loads the script dynamically, passes explicit `locateFile` and `mainScriptUrlOrBlob` values, and keeps solver work off the UI thread.

## Consequences

- The first visit may reload once to activate cross-origin isolation.
- Initial page load stays light because Z3 itself is fetched only on solve.
- Solver initialization can show a clear loading state.
- Large WASM bytes are fetched only for users who solve a puzzle.
- Service worker behavior must be tested on the Pages URL, not only local file previews.

## Alternatives Considered

- Compile Microsoft Research Z3 from source to WASM in this repo: rejected for v1 because the maintained npm package is battle-tested and much faster to integrate.
- Backend Z3 service: rejected by ADR 0001.
- Avoid COOP/COEP by using a different solver: rejected because Z3 is the product premise.
