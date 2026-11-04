# Verify the prepared operation cancellation repair

4 November 2026. The owner's standing “I approve everything / Keep going / Do
all the work” authorization covers this focused packet. The earlier
[29 October proposal](operation-cancellation-checks.md) and its source inventory
remain historical, authored evidence; their pending-approval wording is not the
current execution gate.

The source repair remains on `fix/operation-cancellation`, originally checked
at `e562e6b159b581a3d9e02ae2e4bd7e8faa268095`. Main and the released package
remain separate. This packet changes verification tooling and status docs,
not runtime/test code, dependencies, public types or package version.

Run one public Ubuntu 24.04 job, Node 24.21.0, capped at ten minutes, with read-only
repository permission, pinned actions and no persisted checkout credentials.
Only creation of `qa/sonant-cancellation-20261104` in the exact public repository
can start it. The active workflow checks out an immutable preparation SHA;
publication commits use `[skip ci]`. Existing broad main/PR quality and npm
registry-installation workflows remain unchanged. No PR or main merge is needed
to establish this branch result.

GitHub's [create-event contract](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#create)
uses the created branch's commit, so activation can remain on the repair/check
branches. Its [skip directives](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs)
apply to push/PR events; the exact guarded create event is separate. No default
branch or production change is needed to start this packet.

The inactive `docs/examples/operation-cancellation-v2.workflow.yml` invokes
`tools/run-operation-cancellation-checks.mjs`. The controller verifies the full
checkout HEAD, index and tracked working files, plus a new source inventory at
`docs/results/2026/11-04/operation-cancellation-source.json`. The new inventory
lists every preparation input except its own bytes; full Git guards cover that
file too. The old inventory's runtime, test, dependency and protected inputs
must still match. Only `AGENTS.md` and `README.md` in its old 66-input set gain
current authorization/status wording.

Install the existing frozen lock with lifecycle scripts disabled in task-owned
scratch, using exact copies of the root lock/manifest and both workspace
manifests. Build only the library with its owned installed TypeScript compiler.
Both baseline and repair are compiled in isolated fixtures using exact package
source/configuration and the authored tests. Obtain the original
`runtime.ts` from exact baseline `c5657ad20911f136bc86769f2d79114889693b0e`;
fetch only that object if needed. Replace only the fixture's runtime file.
Never overwrite or restore a tracked runtime. One fixture symlink may reference
this job's own dependency directory for compiler resolution; cleanup must not
follow it into dependencies.

Require exactly **25 case executions**:

1. One baseline pre-aborted-caller case must fail with its expected assertion:
   zero unlocks expected, one actual, `ERR_ASSERTION`, test-process exit one.
   Unmatched cases must not execute. Preserve this failure as defect evidence.
2. The repaired library must pass the original fourteen runtime cases and all
   ten authored cancellation cases: exact names, 24 passes and no extra,
   failed, cancelled, skipped or TODO cases. Retain complete bounded TAP for
   both invocations and actual compiler/runtime versions.

Bound total work to 480 seconds, then reserve 30 seconds for owned cleanup and
two seconds for final stdout. Every command has a finite timeout and output
limit; supervise its original process group through direct-child exit/close and
group absence. A closed leader does not establish descendant settlement.
Timeout, unexpected signal, output overflow, incomplete stream or teardown
failure prevents success. Retain bounded source/output hashes, actual statuses
and the two complete TAP streams in one JSON result, using lossless gzip/base64
for TAP. Each command stream and the final report are capped at 128 KiB; each
compressed TAP payload is capped at 32 KiB. No truncated prefix counts as
acceptance. The job cap is an outer limit, not cleanup proof.

After the terminal result, retain failures, remove the active temporary workflow
and advance only this task's new check branch to its retired final bookmark.
Record source, build, test and cleanup boundaries separately. Branch/staging
publication is not an npm release or production delivery of the repair.

Local Storage Guard returned **14.4 GiB free / 34.0 GiB required**, exit two, on
4 November at 21:24 UTC. Perform no local installation, build or database work.
The remote packet uses no browser, audio device, real provider, account, database,
model call, secrets, cache/artifact upload, npm publication or paid enrollment.
No listening, physical audibility, broad suite, site build, real-host or
consumer/distribution acceptance is inferred from these synthetic tests.

## Observed focused outcome

The [actual receipt](../results/2026/11-04/operation-cancellation-checks.md)
records job `126883643063` in run `41918268685`, preparation source
`39d484c192b936f5aaf6e3cc25ce041a241719b8`: the one expected baseline assertion
failure and all 24 repaired cases, both library builds, all five source guards
and owned cleanup passed. The job is terminal success; the separate workflow
aggregate still projected in progress at receipt time. Preserve that distinction.
This final evidence edition removes the active workflow and retires only its
owned QA bookmark. Main, production, npm and broader release acceptance remain
separate from the focused packet.
