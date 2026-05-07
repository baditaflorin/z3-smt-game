# Postmortem

## Built

Z3 SMT Game v0.1.0 ships as a static GitHub Pages puzzle lab at:

https://baditaflorin.github.io/z3-smt-game/

Implemented:

- Vite + strict TypeScript static app.
- Three puzzle families: logic grid, schedule, arithmetic weights.
- Z3-WASM solver loaded lazily through a Comlink worker.
- COOP/COEP service-worker shim for SharedArrayBuffer on GitHub Pages.
- Mermaid solution diagrams.
- Deterministic explanations plus optional local Ollama-style LLM endpoint.
- Repo, PayPal, version, and commit links in the live UI.
- Local hooks, Makefile, Vitest unit tests, and Playwright smoke test.

## Deployment Mode Recheck

Mode A was correct. The only server-like need was COOP/COEP headers for Z3's pthread-enabled WASM package, and the service-worker shim handles that while keeping the public app static.

Mode B was unnecessary because puzzle data is tiny. Mode C was unnecessary because there are no secrets, accounts, mutations, or hosted LLM calls.

## What Worked

- The maintained `z3-solver` npm package made real Z3 solving feasible quickly.
- Lazy-loading keeps the initial app shell small.
- Mermaid gives the solution a concrete visual payoff.
- GitHub Pages from `/docs` works cleanly with a Vite base path.

## What Did Not Work

- Z3's browser package requires `SharedArrayBuffer`; plain Pages headers were not enough.
- Mermaid's package produces many lazy chunks, so the published asset folder is larger than ideal even though first load is still small.

## Surprises

- The COOP/COEP requirement matters even when Z3 is called from an outer worker.
- The first isolated load may need a service-worker reload, so smoke tests must allow service workers.

## Tech Debt Accepted

- The local LLM path targets Ollama-style JSON first and only lightly supports OpenAI-like text choices.
- Puzzle encodings are handwritten switch cases rather than a puzzle DSL.
- Mermaid is lazy but not tree-shaken down to only flowcharts.

## Next Improvements

1. Add a small puzzle authoring format that compiles to Z3 constraints.
2. Add more recreational math packs and a difficulty curve.
3. Reduce Mermaid payload by replacing the full package with a flowchart-only rendering strategy if a maintained option is available.

## Time

Estimated: 4-6 hours for a static v1.

Actual: about 3 hours for scaffold, app, tests, docs, and publishing flow.
