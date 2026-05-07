# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A has no backend. Puzzle content must ship as static frontend data and remain versioned.

## Decision

Bundle v1 puzzles as TypeScript data modules under `src/features/puzzles/`. The public contract is:

- `schemaVersion`: integer, currently `1`.
- `id`: stable kebab-case puzzle id.
- `title`: display title.
- `kind`: puzzle family.
- `difficulty`: `beginner`, `intermediate`, or `expert`.
- `story`: short prompt.
- `givens`: human-readable constraints.
- `diagram`: Mermaid graph source template.
- `metrics`: expected variables and constraints count.

The app validates puzzle records with `zod` at startup. If future data grows large, it may move to `docs/data/v2/*.json` with sibling metadata files.

## Consequences

- No network request is needed to start.
- Git diffs capture puzzle edits directly.
- Breaking data changes require a schema version bump.

## Alternatives Considered

- Fetch JSON from `docs/data`: deferred until puzzle data needs independent publishing.
- GitHub Release artifacts: rejected for v1 because data is small.
