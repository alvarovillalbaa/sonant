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

11 November: standing owner approval covers the four-case public hosted packet
in `docs/proposals/hosted-browser-checks.md` and the necessary evidence-backed
repairs. The buffer fix passed its 35/44/5 release gate at `3f3d5349` and was
published/deployed at `54ae94d0`. The later containing-block repair passed its
own 35 package/integration cases, 44 browser scenarios and five Firefox cold
starts at `3608e4d` in run43017388896. Its four strengthened native cases include
viewport recovery and real post-navigation trace downloads, with mobile touch.
See `docs/results/2026/11-11/trace-layout-release.md` and its original packet.

All three failed hosted attempts, the invalid release activation, failed
scroll-only hypothesis and failed one-case diagnostic remain preserved.
The ineffective route change is removed. Do not repeat the completed release
matrix unchanged, or borrow the full-release profile's source checks as proof
of independent process-group/runner disposal or physical audio.

Publish the reviewed source/results and verify an actual canonical repaired
deployment before the next four-case hosted invocation. Use its exact source
pin and owned branch ending-4 in one public twelve-minute job; retain originals
and retire only task-owned controls after terminal evidence. No model/API call,
account, paid plan, dependency change or production-setting mutation is needed.
Public npm and physical-device acceptance remain separate from source/hosting.
The four public hosted cases subsequently passed together at `fe64588b` in
run43018663824, with actual downloads, source/stream/process verification and
all four PNGs inspected. See `docs/results/2026/11-11/hosted-browser.md`. Retire
the last QA control with final publication; do not rerun these closed scopes
unchanged. Public npm and physical-device acceptance are still separate gates.

Patch package preparation follows docs/proposals/patch-package-release.md under
the standing continued goal. Begin with its anonymous public metadata job; do
not repeat failed local DNS or extract/copy local tokens. Prepare and verify
the exact patch tarball before publication. Authenticated npm identity and scope
permission remain required; candidate archives are not registry releases.
The metadata job succeeded at `955056cd` in run43021430379. Do not repeat it.
The next inactive candidate profile is `docs/examples/patch-candidate.workflow.yml`:
one exact-source public job with a20-minute cap, archive inspection and seven
fresh archive consumer profiles after the35 existing package cases/type/site
checks. Follow the proposal's pinned versions and cleanup/proof limits. This
scope does not publish npm, relabel public0.1.0 or rerun the closed browser cohort.
Candidate attempt1 (run43025540905) passed35 cases/type/site checks but rejected
the CLI archive mode0644 before consumers. Preserve its original packet. The
build now sets its emitted CLI to0755; the candidate profile uses ending-2 and
keeps the executable assertion. No dependency or runtime contract changed.
Candidate attempt4 passed all seven archive profiles and35 package/type/site
checks at `111a097e` in run43026956835. Preserve all three failed packets and
the exact49923-byte tarball/SRI. Do not rerun completed archive/browser cohorts
unchanged. See `docs/results/2026/11-11/patch-package-candidate.md` and
`docs/runbooks/sonant-0.1.1-publication.md`; authenticated registry publication
and fresh public package-name checks remain open. No token extraction or new
account/plan is authorized by this handoff.
