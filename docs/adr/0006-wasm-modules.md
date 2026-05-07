# 0006 WASM Modules

## Status

Accepted

## Context

The core experience depends on Z3 solving constraints in the browser.

## Decision

Use the npm `z3-solver` package and lazy-load it inside a Web Worker. The worker initializes Z3 only when the user starts solving a puzzle.

Use the non-threaded browser-compatible WASM path. GitHub Pages cannot set COOP/COEP headers, so v1 avoids WASM features that require SharedArrayBuffer or cross-origin isolation.

## Consequences

- Initial page load stays light.
- Solver initialization can show a clear loading state.
- Large WASM bytes are fetched only for users who solve a puzzle.
- Some advanced Z3 performance options are out of scope on Pages.

## Alternatives Considered

- Compile Microsoft Research Z3 from source to WASM in this repo: rejected for v1 because the maintained npm package is battle-tested and much faster to integrate.
- Backend Z3 service: rejected by ADR 0001.
