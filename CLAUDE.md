# overslash-docs

VitePress documentation site for Overslash, deployed via Vercel.

## Branch strategy

- `master` — production branch. GitHub default branch (visitors see this). Vercel production deployment. Only merge here from `dev` when content is ready to publish.
- `dev` — long-lived integration branch. **All PRs must target `dev`, not `master`.** Vercel preview deployment auto-builds on every push.

When opening a pull request, always set the base to `dev` unless you are doing a production release merge from `dev` → `master`.

## Local dev

```bash
npm run docs:dev
```

## Build

```bash
npm run docs:build
```
