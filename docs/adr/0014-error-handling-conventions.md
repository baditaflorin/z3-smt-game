# 0014 Error Handling Conventions

## Status

Accepted

## Context

Solver initialization, malformed puzzles, local LLM endpoints, and Mermaid rendering can fail.

## Decision

Use typed result objects instead of thrown errors across feature boundaries.

UI-facing errors include:

- a short title,
- a clear recovery hint,
- optional technical detail hidden in a disclosure element.

Worker errors are normalized before crossing the Comlink boundary. The app registers global `error` and `unhandledrejection` listeners and renders a non-blocking toast.

## Consequences

- Failures are visible without breaking the whole app.
- Tests can assert stable error codes.

## Alternatives Considered

- Throw errors through the UI: rejected because recovery messaging becomes inconsistent.
