# Sonant contributor instructions

Last updated: 2026-10-15

Read `README.md`, `docs/specs/product.md`, and the closest source before editing. Preserve unrelated work.

- `packages/sonant/src/` owns the public runtime, taxonomy, recipes, React hooks, and CLI.
- `website/src/` consumes the package. Do not fork its audio engine or configuration generator.
- Keep core imports SSR-safe and free of runtime dependencies. React stays an optional peer.
- Never play audio on mount. Preserve explicit mute, volume, and visible outcome feedback.
- Cancel pending playback on teardown. Every loop needs bounded lifetime and deterministic cleanup.
- Do not copy third-party audio or invent endorsements, adoption counts, or compatibility evidence.
- `audit` findings are advisory. Never claim they prove accessibility or control flow.
- Tests live under `tests/unit`, `tests/integration`, and `tests/e2e`; fixture data is synthetic T2.
- Verify relevant changes with `npm run check`, `npm test`, `npm run build:site`, and browser checks when authorized. Always use `git diff --check`.
- Read `docs/runbooks/release.md` before publishing. Never expose registry credentials or add them to source.
- Durable sources, specs, references, results, and runbooks live under `docs/` following AFS naming. Keep evidence distinct from claims about live releases.

Current focused authority (4 November 2026): the owner's repeated “I approve
everything / Keep going / Do all the work” clears the prepared cancellation
packet's check/temporary-CI gate. Follow
`docs/proposals/operation-cancellation-verification.md`: one expected baseline
failure plus 24 repaired cases in a bounded public job, with immutable source,
full Git guards, isolated baseline fixture and owned process/storage cleanup.
Preserve the old inventory, examples and results. Existing broad quality and
registry workflows remain unchanged. This packet does not release npm or merge
the repair to main/production; preserve those separate acceptance boundaries.

The [focused result](docs/results/2026/11-04/operation-cancellation-checks.md)
passed at `39d484c192b936f5aaf6e3cc25ce041a241719b8`: one expected baseline
assertion failure, all 24 repaired cases, two isolated library builds, five full
source guards and owned cleanup. Its active workflow is retired; preserve the
inactive example and original results. The job completed successfully while
the workflow aggregate API remained in progress at receipt time; retain both
observations. Main/production/npm and full release checks are separate.
