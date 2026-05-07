# 0008 Go Backend Layout

## Status

Accepted

## Context

The bootstrap defines Go backend layout rules for Mode B and Mode C. This project is Mode A.

## Decision

Do not create a Go backend layout in v1.

No `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, `scripts/`, or Go module is needed for runtime or build-time behavior.

## Consequences

- The repository stays focused on the static frontend.
- Go-specific lint hooks are omitted until a Go component exists.
- ADR 0001 must be revisited before adding any backend.

## Alternatives Considered

- Empty Go project layout: rejected because empty directories and placeholder commands would imply a backend that does not exist.
