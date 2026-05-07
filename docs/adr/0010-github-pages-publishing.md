# 0010 GitHub Pages Publishing

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable. The app must work from a repository subpath.

## Decision

Publish from the `main` branch `/docs` folder.

The Vite build outputs directly to `docs/`. The configured base path is `/z3-smt-game/`. The build writes hashed assets under `docs/assets/`, preserves `docs/.nojekyll`, and copies `docs/index.html` to `docs/404.html` for SPA-style fallback safety.

The live URL is `https://baditaflorin.github.io/z3-smt-game/`.

The repository URL is `https://github.com/baditaflorin/z3-smt-game`.

The Pages publish directory is intentionally not gitignored.

## Consequences

- Every Pages deployment is a normal commit on `main`.
- Rollback is a git revert of the publishing commit.
- Pages-specific unsupported files such as `_headers` and `_redirects` are not used.
- Service worker scope must stay under `/z3-smt-game/`.

## Alternatives Considered

- `gh-pages` branch: rejected because it separates source and published output.
- GitHub Actions Pages build: rejected because the project requires no GitHub Actions.
- Publish from repository root: rejected because source files should not be served directly.
