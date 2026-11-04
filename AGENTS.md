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

The [release regression result](docs/results/2026/11-04/release-regressions.md)
passed at `55c990b3998e1a3b3f03cd80dc32fb971da8eec8`: 35 package/integration
cases (including the 24 focused cases), 40 browser scenarios, five repeated
Firefox cold starts, type/site checks, production build and package inspection.
The temporary release workflow is retired, preserving the permanent jobs.
The actual ref/provider state owns subsequent integration and hosted delivery;
do not claim a new npm version or physical listening from CI.

Main includes the verified repair. The
[public delivery receipt](docs/results/2026/11-04/public-delivery.md) records
READY production at notice source `22ab91b9d1333b749d31d8946512c49c279972e8`
and five complete anonymous HTTP 200s, two source-byte comparisons and delivered
release-note strings. The nine-line Docs callout follows the broad CI edition;
runtime/test/dependency/style/configuration inputs remain unchanged. This final
status edition retires the HTTP workflow; keep the older QA bookmarks fixed.
Provider metadata for later docs-only deployments does not relabel the tested
HTTP source. Public npm, physical audio and hosted browser limits remain open.
