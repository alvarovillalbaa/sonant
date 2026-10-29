# Operation cancellation checks

29 October 2026. Prepared, unapproved and unrun. The supplied AGENTS.md §§7/14
gate the new runtime checks and temporary CI. Existing quality/browser workflows
and the first release's evidence do not establish this repair.

## Source and behavior

The public `begin(event, options)` accepts `signal` but the old implementation
replaced it with its internal signal. Updates also escaped that internal
controller. The repair links caller cancellation to progress and updates,
cleans up caller listeners, fences synchronous terminal reentry, and preserves
the documented watchdog followed by a later confirmed outcome.

Public types/exports, dependencies, policies, providers and package version stay
unchanged. The source branch is `fix/operation-cancellation`; npm 0.1.0 and
production `main` are not this repair's release.

## Exact proposed execution

One temporary public Ubuntu GitHub job, Node 24.21.0, ten-minute cap, read-only
repository permission and no persisted checkout credential. Use the existing
frozen npm lock and build only the library. No local installation or build:
Storage Guard returned 29.5 GiB free versus 34.0 GiB required.

1. Check out the explicitly approved 40-hex source commit and match every
   [prepared input hash](../results/2026/10-29/operation-cancellation-inventory.json).
2. Fetch only baseline commit `c5657ad20911f136bc86769f2d79114889693b0e`.
   Temporarily compile its `runtime.ts` with the otherwise unchanged library.
   Run only the new pre-aborted-caller case against it. Require its one expected
   assertion failure: the old code unlocks once when zero unlocks are allowed.
   Retain the failure and restore the approved source even if the probe fails.
3. Rebuild the repaired library, verify its source hashes again, then run only:

   ```sh
   node --test --test-concurrency=1 --test-reporter=tap \
     tests/unit/runtime.test.mjs \
     tests/unit/operation-cancellation.test.mjs
   ```

   This is **24 patched cases**: fourteen unchanged runtime regressions and ten
   new cancellation cases. Together with the one baseline reproduction, this
   is 25 intended case executions. Unmatched baseline cases are not executed.
4. Match the patched TAP names/count/status to the inventory: all 24 must pass,
   with no failures, cancellations, skips or TODOs. Retain bounded raw TAP and
   a report with source/output hashes and runtime/compiler versions for seven
   days. An always-run step bounds retained artifacts to 256 KiB each, records
   original/retained sizes and hashes, and fails on overflow; retained prefixes
   cannot count as acceptance. A runner exit alone is insufficient evidence.
5. Remove the active temporary workflow after recording the result. Preserve
   failed attempts; any bounded same-scope repair/rerun must identify its new
   source commit and input hashes.

The ten authored cases cover pre-abort, pending unlock/playback, late voices,
active progress and updates, explicit stop, watchdog renewal, terminal reentry,
listener cleanup, updates outliving progress and synchronous provider abort.
They use controlled in-memory providers and timers only. Acceptance means
provider lifecycle/cancellation, not physical sound, browser or device behavior.

## Activation boundary

The [workflow example](../examples/operation-cancellation-checks.workflow.yml)
is outside `.github/workflows` and cannot run through source publication.
After approval, put its exact approved source SHA in `SOURCE_COMMIT` and
activate it only on task branch `checks/sonant-operation-cancellation`. Its push
trigger runs the single job against that pinned source, not mutable branch HEAD.
The existing main-push quality and registry-installation workflows stay unchanged.
The quality workflow also triggers on pull requests. No PR will be opened as
part of this narrowly approved check scope.

No broad suite, CLI integration, browser, audio device, live provider, database,
model call, production data, Auth setting, dependency update, npm publication,
production merge/promotion, account or paid enrollment is included. The separate
runtime/browser/distribution and release requirements remain open.
