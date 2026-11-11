# Sonant

Last updated: 2026-10-15

**A little sound. A lot more feeling.**

An open-source sound layer for React, Next.js, and the web: semantic feedback, original sound characters, considerate playback policy, copy-in components, and local diagnostics.

[Website & playground](https://sonant-beta.vercel.app/) · [Create a kit](https://sonant-beta.vercel.app/#/create) · [Documentation](https://sonant-beta.vercel.app/#/docs)

## Install

```sh
npm install @alvarovillalbaa/sonant
# or: pnpm add @alvarovillalbaa/sonant

npx @alvarovillalbaa/sonant@latest init
pnpm dlx @alvarovillalbaa/sonant@latest add sound-button sound-settings
```

The CLI copies a client provider, all editable recipes, and chosen headless components into your application. It refuses existing files and symlinks. It never installs dependencies or modifies your layout automatically.

```tsx
"use client";
import { SoundProvider, useSound } from "@alvarovillalbaa/sonant/react";

function Preview() {
  const sound = useSound();
  return <button onClick={() => void sound.emit("action.select")}>Try a cue</button>;
}

export default function App() {
  return <SoundProvider><Preview /></SoundProvider>;
}
```

The runtime defaults to enabled at 35% volume. The generated installation starts sound **off**, uses device-local preferences, and works with the copied `sound-settings` component for explicit opt-in. Neither plays automatically.

## Included

- **32 semantic events:** 22 interface interactions plus 10 agent state transitions.
- **Three original characters:** Studio, Soft, and Arcade. Deterministic synthesis, no recordings or runtime dependencies in the core.
- **Scoped runtime:** cooldowns, surface density budgets, priorities, voice limits, preference controls, speech suppression, background silence, bounded loops, and idle suspension.
- **Operation lifecycle:** begin, update, resolve, reject, and stop. Cancellation and React unmount cleanup cover pending browser unlocks.
- **React:** client provider, reactive hook, operation hook, and headless inspector; SSR-safe core imports.
- **Providers:** Web Audio, application-owned contexts, HTML audio files, and a normalized bridge for existing engines.
- **CLI:** init, add, list, audit, test, export, and compile. Editable recipes and source; WAV export with provenance and hashes.
- **Website:** searchable previews, code snippets, WAV downloads, examples, configurator, complete API docs, and live trace inspector.
- **Local diagnostics:** bounded traces and explicit suppression reasons. No network telemetry or audio recording.

## Stateful feedback

```ts
const operation = sound.begin("progress.start", {
  source: "Upload",
  visibleEquivalent: true,
});
try {
  await upload();
  await operation.resolve("state.success");
} catch {
  await operation.reject("state.error");
} finally {
  operation.stop();
}
```

Loops stop after three seconds by default. A later confirmed outcome can still play. The consuming app owns status messages, accessibility, cancellation, and the decision to use sound.

Pass an `AbortSignal` as `begin(event, { signal })` to cancel pending or active
progress and updates together. `operation.stop()` also cancels those updates.
A cancelled operation cannot emit a later update or outcome. A confirmed
`resolve`/`reject` stops progress first and emits its outcome separately; the
caller signal can still cancel that outcome while it is pending or active.

## Development

Node 22.12+ and npm:

```sh
npm ci
npm run dev
npm run check
npm test
npm run build:site
npm run test:e2e
npm run pack:library
```

The repository is an npm workspace. `packages/sonant/` owns the public ESM package; `website/` consumes that exact package. `tests/` holds unit, CLI integration, and browser checks. The static site uses hash routes and is hosted on Vercel, Clous Team (Pro). `vercel.json` builds the workspace with `npm run build:site` and serves `website/dist` at `/`. The connected `main` branch deploys automatically. See [deployment evidence](docs/deployment.md).

## Proof and limits

The operation-cancellation repair passed its
[focused verification](docs/results/2026/11-04/operation-cancellation-checks.md):
one baseline defect reproduction and all 24 repaired-runtime cases, with both
isolated builds, source guards and owned cleanup passing. The original
[source-only record](docs/results/2026/10-29/operation-cancellation.md) remains
historical evidence. Main now includes the repair; a new npm release remains
separate from the published source and CI results.

The [release regressions](docs/results/2026/11-04/release-regressions.md) also
passed: 35 package/integration cases, 40 browser scenarios, five repeated Firefox
cold starts, package/site checks, site build and package inspection. The 35-case
suite includes the 24 focused cases and a fresh packed consumer. These results
remain tied to their immutable sources.

The [public delivery receipt](docs/results/2026/11-04/public-delivery.md) records
the production cutover and five anonymous HTTP 200 checks, including the built
assets and source-identical public files. Installation/policy/API guidance
distinguishes the source repair from the older verified 0.1.0 package. The
browser matrix predates that small status callout; its provider build and public
bundle checks are separate evidence. No new npm version was published.

The later [native loop buffer repair](docs/fixes/native-loop-buffer.md) also
passed its [release gate](docs/results/2026/11-11/native-loop-release.md): 35
package/integration cases, 44 browser scenarios including four actual native
loop regressions, and five Firefox cold starts. The published 0.1.0 package
does not contain this source repair; its registry release remains pending.

The [mobile trace layout repair](docs/fixes/trace-label-containing-block.md)
also passed [35 package tests,44 browser cases and five cold starts](docs/results/2026/11-11/trace-layout-release.md).
Its four native navigation cases now verify viewport containment and actual
post-navigation exports, using touch on mobile. Hosted acceptance is separate.

`sonant audit` is an advisory source review, not control-flow or accessibility proof. `sonant test` checks deterministic recipes, sample peaks, and tails, not perceptual loudness or subjective quality. A “played” trace means a provider accepted playback; it cannot establish physical audibility.

This release does not include hosted analytics, experiments, native haptics, Ogg export, team governance, or direct version-specific third-party adapters. See [scope](docs/specs/product.md), [architecture](docs/references/architecture.md), [sources](docs/sources/INDEX.md), and [release procedure](docs/runbooks/release.md).

Original recipes and code are MIT licensed. Website fonts use their upstream SIL Open Font Licenses. No competitor sounds or testimonials are copied.
