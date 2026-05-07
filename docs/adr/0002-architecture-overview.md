# 0002 Architecture Overview

## Status

Accepted

## Context

The app should make constraint solving feel like a game while keeping the public surface static.

## Decision

Use a browser-only architecture with these module boundaries:

- `features/puzzles`: puzzle catalog, input state, and validation.
- `features/solver`: Web Worker boundary, Z3-WASM initialization, and result mapping.
- `features/explainer`: deterministic explanation plus optional local LLM endpoint.
- `features/diagram`: Mermaid rendering and diagram source generation.
- `shared`: browser storage, version metadata, errors, and UI helpers.

The UI never calls Z3 directly; it talks to a worker through Comlink. Worker messages use typed request and response objects.

## Consequences

- Solver work stays off the main thread.
- Z3 can be lazy-loaded behind a user action.
- Puzzle encodings remain testable as pure TypeScript where possible.
- Browser storage is local to the device.

## Alternatives Considered

- Single-file app: rejected because solver, explanation, and diagram concerns would blur quickly.
- Backend API: rejected by ADR 0001.
