# 0007 Data Generation Pipeline

## Status

Accepted

## Context

The bootstrap asks for a data generation ADR in Mode B. This project is Mode A.

## Decision

Do not build a data generation pipeline in v1.

All puzzle data is authored and bundled in source. `make data` is a no-op that explains Mode A has no generated artifacts.

## Consequences

- No generated data artifacts can drift.
- No scheduled jobs or release uploads are needed.
- If puzzle packs become large, a Mode B migration can add `docs/data/v2/` and metadata files.

## Alternatives Considered

- Build a Go generator now: rejected because it would add unused machinery.
