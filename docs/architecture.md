# Architecture

Z3 SMT Game is a Mode A GitHub Pages app. The public runtime boundary is static files served from:

https://baditaflorin.github.io/z3-smt-game/

## Context

```mermaid
C4Context
title Z3 SMT Game Context
Person(player, "Puzzle player", "Solves logic, scheduling, and arithmetic puzzles")
System_Boundary(pages, "GitHub Pages static boundary") {
  System(app, "Z3 SMT Game", "Browser-only puzzle lab")
}
System_Ext(repo, "GitHub repository", "https://github.com/baditaflorin/z3-smt-game")
System_Ext(paypal, "PayPal", "https://www.paypal.com/paypalme/florinbadita")
System_Ext(localLlm, "Local LLM endpoint", "Optional Ollama-compatible endpoint")
Rel(player, app, "Loads and plays")
Rel(app, repo, "Links to source")
Rel(app, paypal, "Links to support")
Rel(app, localLlm, "Optional local explanation request")
```

## Container

```mermaid
C4Container
title Browser Containers Inside GitHub Pages
Person(player, "Puzzle player")
System_Boundary(pages, "GitHub Pages: /docs from main") {
  Container(shell, "App shell", "Vanilla TypeScript + Vite", "Puzzle UI, local storage, version display")
  Container(worker, "Solver worker", "Comlink + Z3-WASM", "Encodes puzzles and solves off the main thread")
  Container(diagrams, "Diagram renderer", "Mermaid", "Lazy-rendered solution diagrams")
  Container(coi, "COOP/COEP service worker", "coi-serviceworker", "Enables SharedArrayBuffer on Pages")
}
System_Ext(localLlm, "Local LLM", "Optional user endpoint")
Rel(player, shell, "Uses")
Rel(shell, worker, "Solve request")
Rel(worker, shell, "Model, SMT-LIB, timing")
Rel(shell, diagrams, "Mermaid source")
Rel(shell, localLlm, "Optional prompt")
Rel(coi, shell, "Adds isolation headers")
Rel(coi, worker, "Adds isolation headers")
```

## Module Boundaries

- `src/features/puzzles/`: puzzle catalog and schema validation.
- `src/features/solver/`: worker client, Z3 initialization, puzzle encodings, model extraction.
- `src/features/diagram/`: Mermaid rendering.
- `src/features/explainer/`: deterministic explanation and optional local LLM request.
- `src/shared/`: storage and version helpers.

No runtime backend exists in v1.
