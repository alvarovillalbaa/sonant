# Initial release evidence

## Implemented and published to GitHub

Sonant includes the public ESM runtime, React adapter, 32 semantic events, three original themes, copy-in CLI, shared installation configurator, WAV export, source audit hints, recipe checks, provider bridges, local Devtools, interaction examples, and documentation.

- Repository: https://github.com/alvarovillalbaa/sonant
- Website: https://alvarovillalbaa.github.io/sonant/
- Initial fully green source: `20b38b95629c5be606e723c060deab42b8203fa0`.
- Expanded 40-check browser run: [38735142788](https://github.com/alvarovillalbaa/sonant/actions/runs/38735142788), source `2edb63615bf369808532d07c0d9c324f908876ea`. Quality and Pages deployment both succeeded.

## Checks and proof

- `npm run check`: strict package and website TypeScript passed.
- `npm test`: **25 passed**, including actual packed-package installation, executable CLI invocation through npm, generated React source compilation, SSR rendering, deferred device preferences, deterministic recipes, voice budgets, and cancellation during pending unlock/media playback.
- Browser suite: **40 passed** across Chromium, Firefox, WebKit, and mobile Chromium. Covers previews, configuration downloads, visible outcomes, native dialog keyboard behavior, persistent mute, policy traces, exports, iframe bindings, cancellation/disabled controls, unbinding, five-page accessibility checks, and horizontal overflow.
- GitHub Pages: successful deployment and live **HTTP 200**. A separate live Chrome interaction returned `state.success: played` and visible “Playing success.”
- `git diff --check` and staged whitespace checks passed.
- The packed artifact contains 39 files, declarations, preserved client directive, executable CLI, inline public source maps, README, and MIT license. The core has no runtime dependencies.

Screenshots below come from the expanded successful browser run. Browser instrumentation observes native context lifecycle and does not substitute a fake audio renderer.

![Desktop playground](desktop-preview.png)

[Full desktop page](desktop-home.png) · [Mobile page](mobile-home.png)

## Repairs made during verification

Fresh consumer testing caught an npm executable symlink guard that skipped the CLI. Generated-source compilation caught JSON import attributes needed by NodeNext. Browser checks caught contrast, hidden mobile labels, and non-focusable horizontal scrolling. Those were repaired and checked again.

Some headless Firefox cold starts initially remained suspended. The runtime now bounds unlock waits and reports blocked playback; CI has an explicit virtual audio device. Native lifecycle evidence from the successful run shows trusted activation, a suspended context, two resume requests, then running state. No assertion was removed and no test retry was enabled. Physical audio quality and repeated real-device cold starts remain manual validation.

## Registry publication gate

The agent attempted npm publication after the checks passed. Its execution environment failed to resolve `registry.npmjs.org` (`ENOTFOUND`). Browser account login is confirmed, but this is not registry-publication proof. The user was given the exact reviewed tarball publication command; registry publication and fresh registry-based npm/npx/pnpm checks remain pending until verified.

Artifact: `alvarovillalbaa-sonant-0.1.0.tgz`.
SHA-256: `d4c375fb44dd36f0f561216193dd515ea82fbbfa4ef3808c9be93ef9c713a78d`.

## Limits

Automated browser acceptance does not prove physical audibility, real iOS/Android hardware behavior, screen-reader compatibility, perceived loudness, sonic distinctiveness, or improved user outcomes. The auditor is heuristic. Hosted experiments, team governance, native haptics, Ogg export, and direct version-specific external engine adapters are outside this initial local-first implementation.
