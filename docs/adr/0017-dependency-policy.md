# 0017 Dependency Policy

## Status

Accepted

## Context

The app depends on solver, diagram, test, and build libraries. Dependency drift can break Pages builds.

## Decision

Use production-ready libraries with pinned lockfile versions. Add dependencies only when they remove meaningful risk or complexity.

Rules:

- Prefer maintained packages with recent releases and clear licenses.
- Keep Z3, Mermaid, and local LLM code lazy-loaded where possible.
- Run `npm audit` and address high or critical findings before release.
- Do not add custom solvers when Z3 can model the problem.

## Consequences

- The app remains easier to audit.
- Feature work may be slower when a dependency is not justified.

## Alternatives Considered

- Vendoring dependencies: rejected because npm lockfiles are enough for v1.
- Hand-rolled SAT/SMT logic: rejected because the product is specifically about Z3.
