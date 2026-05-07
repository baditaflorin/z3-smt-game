# 0013 Testing Strategy

## Status

Accepted

## Context

The app has critical solver encodings and a small browser UI.

## Decision

Use:

- Vitest for TypeScript unit tests.
- Playwright for one happy-path smoke/e2e test.
- `scripts/smoke.sh` to build, serve `docs/`, and run Playwright against the static output.
- `make test`, `make build`, `make smoke`, and `make lint` as local quality gates.

Coverage target is at least 70 percent for frontend logic modules. Browser-only rendering is covered by Playwright smoke rather than snapshot tests.

## Consequences

- Tests run locally without GitHub Actions.
- Z3-WASM initialization is verified in the smoke path.
- UI regressions that are not on the happy path may need future e2e expansion.

## Alternatives Considered

- Cypress: rejected because Playwright is lighter for static smoke checks.
- No e2e test: rejected because WASM loading must be verified.
