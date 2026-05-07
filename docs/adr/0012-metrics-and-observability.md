# 0012 Metrics And Observability

## Status

Accepted

## Context

Usage metrics can be useful, but v1 should protect privacy and avoid services.

## Decision

Do not include analytics in v1.

Local in-page observability shows:

- Z3 initialization status,
- solve duration,
- satisfiable/unsatisfiable status,
- app version and git commit.

## Consequences

- No tracking banner or analytics consent is needed.
- Success metrics are verified by tests and manual checks rather than telemetry.

## Alternatives Considered

- Plausible: deferred until there is a clear product need.
- Custom beacon: rejected because it would add a runtime endpoint.
