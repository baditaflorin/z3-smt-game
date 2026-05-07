# 0009 Configuration And Secrets

## Status

Accepted

## Context

The frontend must never hold secrets. Mode A has no server-side secret store.

## Decision

There are no required secrets in v1.

Configuration is limited to public build metadata and optional user-supplied local settings:

- `VITE_APP_VERSION`
- `VITE_GIT_COMMIT`
- optional local LLM endpoint stored by the user's browser

`.env.example` documents placeholders only. `.env*` files remain ignored except `.env.example`.

## Consequences

- The app can be forked and deployed without provisioning.
- Local LLM calls can only reach endpoints exposed by the user's own machine or network.
- Secret scanning still runs in local hooks.

## Alternatives Considered

- Hosted LLM API key: rejected because frontend secrets are not acceptable.
- Backend proxy for LLM: rejected by ADR 0001.
