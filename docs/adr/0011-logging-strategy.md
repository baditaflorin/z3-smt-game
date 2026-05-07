# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Production browser logs should be quiet.

## Decision

Use minimal browser console logging:

- Development may log solver timing and worker initialization.
- Production suppresses routine logs.
- User-facing failures appear in the UI as accessible notices.
- Unexpected errors are caught by the global error boundary and can be copied by the user from the page.

## Consequences

- No PII leaves the browser.
- Debuggability relies on reproducible local behavior and visible error states.

## Alternatives Considered

- Remote client logging: rejected for privacy and simplicity.
- Console-heavy diagnostics: rejected because production should be quiet.
