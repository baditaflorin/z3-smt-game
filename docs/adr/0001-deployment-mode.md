# 0001 Deployment Mode

## Status

Accepted

## Context

Z3 SMT Game needs to run logic puzzles, scheduling problems, and constraint explanations for public users. The bootstrap rules require GitHub Pages first and a runtime backend only when browser or build-time work is insufficient.

## Decision

Use Mode A: Pure GitHub Pages.

The app ships as static files from `https://baditaflorin.github.io/z3-smt-game/`. Z3 is loaded as WebAssembly in the browser only after the user starts solving. Mermaid renders diagrams in the browser. Puzzle definitions are bundled static data. User progress and optional local LLM endpoint settings stay in browser storage.

No runtime backend, Go service, Docker image, nginx config, server database, server metrics, or hosted secrets are part of v1.

## Consequences

- Public deployment is simple and cheap.
- No application server can leak secrets because none exists.
- Z3 performance is bounded by the user's browser and device.
- GitHub Pages cannot provide COOP/COEP headers, so WASM choices must avoid features that require cross-origin isolation.
- Explanations must use either deterministic local logic or a user-controlled local LLM endpoint.

## Alternatives Considered

- Mode B: rejected because v1 puzzle data is small and static; no scheduled pipeline is needed.
- Mode C: rejected because v1 has no auth, mutations, server secrets, cross-device sync, or privileged APIs.
