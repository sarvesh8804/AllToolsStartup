# Forge

**Everything you need. One website.**

Browser-first utility platform. Static Next.js app, client-side tools, Vercel-ready.

## Docs

| File | Purpose |
|---|---|
| [`docs/plan.md`](./docs/plan.md) | Product & technical blueprint |
| [`docs/implementation.md`](./docs/implementation.md) | Daily phase calendar |
| [`docs/done.md`](./docs/done.md) | Progress tracker |

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Tool registry in `content/tools/*.json` (Zod-validated)
- Blog in `content/blog/*.md`
- No database, no auth, no paid APIs for MVP

## Develop

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run validate:tools
npm test
npm run typecheck
npm run lint
npm run build
```

**Rule:** every shipped tool must include unit tests for its pure logic and `npm test` must pass before marking the phase done.

## Deploy

Connect the repo to Vercel. Set optional `NEXT_PUBLIC_SITE_URL` to your production origin (defaults to `https://forge.tools`).

## Current status

Foundation **F00–F11** complete. Next: **P001** — JSON Formatter + JSON Validator.
