# 0015 Deployment Topology

## Status

Accepted

## Context

Mode A deployment is GitHub Pages only.

## Decision

Deploy only static files from `main` `/docs` to GitHub Pages at `https://baditaflorin.github.io/z3-smt-game/`.

There is no Docker Compose, nginx, TLS termination config, Prometheus, or server runbook in v1. GitHub provides HTTPS for Pages.

## Consequences

- Operational burden is near zero.
- Rollbacks are git reverts.
- Any future backend requires a new ADR and Mode C migration.

## Alternatives Considered

- Docker backend: rejected by ADR 0001.
- Static site host other than GitHub Pages: rejected because the bootstrap requires Pages first.
