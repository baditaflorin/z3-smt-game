# 0005 Client-Side Storage

## Status

Accepted

## Context

The app needs to remember puzzle attempts and optional local LLM settings without accounts.

## Decision

Use `localStorage` for v1:

- selected puzzle id,
- completed puzzle ids,
- optional local LLM endpoint URL,
- explanation mode preference.

Values are validated with `zod` before use. Storage failures fall back to in-memory defaults.

## Consequences

- Implementation is simple and works on GitHub Pages.
- State is device-local and can be cleared by the user.
- Cross-device sync is not available in v1.

## Alternatives Considered

- IndexedDB: more durable but unnecessary for small settings.
- OPFS: unnecessary because v1 stores no large local files.
- Server persistence: rejected by ADR 0001.
