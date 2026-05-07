# 0016 Local Git Hooks

## Status

Accepted

## Context

The project explicitly avoids GitHub Actions. Local hooks must enforce quality gates.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`.

Hooks:

- `pre-commit`: format check, lint, TypeScript check, and `gitleaks protect --staged` when available.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: run dependency hints without mutating source.

Hooks are idempotent and can be run via Make targets.

## Consequences

- Contributors can inspect hook scripts directly.
- Missing optional tools such as `gitleaks` produce clear setup guidance.
- Slow checks run at push time rather than every commit.

## Alternatives Considered

- Lefthook: rejected for v1 because plain scripts are enough.
- GitHub Actions: rejected by requirement.
