# Contributing

Last updated: 2026-10-15

Read [AGENTS.md](AGENTS.md) and the [architecture](docs/references/architecture.md). Open an issue for taxonomy or policy changes before expanding the API. Keep patches focused and provide evidence of the behavior changed.

Run `npm ci`, `npm run check`, `npm test`, `npm run build:site`, and `npm run test:e2e`. Install Playwright browsers with `npx playwright install --with-deps`. CI repeats these gates before deploying the site.

For sound changes, run the recipe checks for every character and follow the [listening protocol](docs/runbooks/listening.md). Automated checks do not replace listening. Include provenance for every new recipe or asset. Do not introduce audio-only status or autoplay.
