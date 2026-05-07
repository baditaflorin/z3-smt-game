# 0003 Frontend Framework And Build Tooling

## Status

Accepted

## Context

The app needs a polished interactive UI, strict TypeScript, fast builds, and a small initial payload.

## Decision

Use Vite with strict TypeScript and vanilla DOM modules. Do not use React, Vue, or Svelte in v1.

Runtime dependencies are kept focused:

- `z3-solver` for Z3-WASM.
- `mermaid` for diagrams, lazy-loaded.
- `comlink` for worker RPC.
- `zod` for runtime validation.
- `@tanstack/query-core` for small cached async resource loading.

Styling uses plain CSS with design tokens. Tailwind is not used in v1 because the app is small, the CSS surface is compact, and the asset budget matters.

## Consequences

- The initial bundle stays small.
- UI code has less framework magic and a slightly higher manual DOM cost.
- Dependencies are production-ready and narrow.

## Alternatives Considered

- React + Vite: rejected for v1 because it adds payload without solving a current complexity.
- Tailwind CSS: rejected for v1 because plain CSS is sufficient and easier to audit for the one-screen tool UI.
