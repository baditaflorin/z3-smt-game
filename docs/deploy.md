# Deployment

Live URL:

https://baditaflorin.github.io/z3-smt-game/

Repository:

https://github.com/baditaflorin/z3-smt-game

## Topology

Mode A: Pure GitHub Pages.

- Source branch: `main`
- Pages source: `/docs`
- Base path: `/z3-smt-game/`
- Runtime backend: none
- Docker: none
- GitHub Actions: none

## Publish

```bash
npm install
make test
make build
git add docs package.json package-lock.json src public scripts vite.config.ts
git commit -m "chore: publish pages build"
git push
```

GitHub Pages serves the committed `/docs` output.

## Rollback

Revert the publishing commit and push:

```bash
git revert <publishing-commit-sha>
git push
```

## Custom Domain

No custom domain is configured in v1. To add one:

1. Add `docs/CNAME` containing the domain.
2. Configure DNS using GitHub Pages documentation.
3. Rebuild and commit `/docs`.

GitHub Pages does not support `_headers` or `_redirects`. The app uses `docs/404.html` as the fallback copy of `docs/index.html`.
