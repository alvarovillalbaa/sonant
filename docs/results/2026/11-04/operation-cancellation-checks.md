# Focused operation cancellation result

4 November 2026. **The baseline defect was reproduced and all 24 repaired
runtime cases passed** in [run 41918268685](https://github.com/alvarovillalbaa/sonant/actions/runs/41918268685),
job `126883643063`, 21:40:30–21:40:51 UTC. The
[machine receipt](operation-cancellation-checks.json) retains the actual single
controller result and both complete TAP payloads losslessly as gzip/base64.

| Invocation | Actual result |
| --- | --- |
| Baseline `c5657ad20911f136bc86769f2d79114889693b0e` runtime | Exactly one expected failing case; pre-aborted caller unlocks once, expected zero, `ERR_ASSERTION` / `strictEqual`, exit one |
| Repaired source `39d484c192b936f5aaf6e3cc25ce041a241719b8` | Exact 24-case set: fourteen original runtime regressions and ten cancellation cases, all passing |

Both invocations reported zero cancelled, skipped or TODO cases. The unmatched
baseline cases did not execute. These are 25 executions, not 25 passing tests.
Baseline TAP is 1,057 bytes; repaired TAP is 5,454 bytes. Root independently
decoded both payloads, matched their byte counts/hashes to the complete command
streams and checked the actual names, statuses and totals against the inventory.

The job checked out immutable preparation `39d484c192b936f5aaf6e3cc25ce041a241719b8`,
tree `da657bc2a0791a636a022f388badc296cd37cce1`, from activation
`c457090845038b2c900f963e390c25575beca899`. Five guards matched all 78 sealed
inputs (1,382,681 bytes), all 79 tracked/index/working leaves, the unchanged
historical inventory and thirteen protected inputs. The old inventory's only
two status-document differences were explicitly authorized AGENTS/README edits.

Node 24.21.0/npm 11.19.0 installed the existing frozen lock in owned scratch,
with lifecycle scripts disabled. Its own TypeScript 5.9.3 compiled both isolated
library fixtures, each with 36 recorded output files. Every copied fixture input,
generated ESM manifest and four installation manifests passed fingerprint replay.
The baseline runtime alone was replaced in its fixture; tracked source was never
overwritten. The initially absent shallow baseline object produced the expected
probe exit 128, then one bounded fetch obtained the pinned original commit.

All 39 command records have direct-child exit/close, complete bounded capture
and original process-group absence, with no stop reason or unexpected signal.
Thirty-seven exits were zero; the baseline probe's 128 and assertion's one were
intentional. Both dependency links and the task-owned install/cache/fixture root
were removed and verified absent. Cleanup passed; the controller reported no
errors or interruption. This checks original groups, not a global inventory of
independently detached descendant sessions. Executable hashes do not inventory
dynamic libraries; userspace timers cannot interrupt blocked kernel filesystem
operations.

The job API is terminal `completed/success` and all steps succeeded. The
separate workflow aggregate API still returned `in_progress` with a null
conclusion at receipt time; that observation is preserved rather than rewritten
as a completed workflow. Node-20 action runtime/deprecation warnings remain in
the receipt. The exact controller result and job completion establish the
focused outcome without inventing a different aggregate state.

This evidence edition removes the active temporary workflow and advances only
`qa/sonant-cancellation-20261104` to its final repair-branch bookmark. The inactive
example, original inventory/receipts and permanent quality/registry workflows
remain preserved. Three later status-document edits are outside the immutable
tested preparation; all runtime, test, dependency and controller inputs remain
unchanged. No local install, build or product/test import was performed.

The repair is published on `fix/operation-cancellation`; main/production and
the existing npm release remain separate. This synthetic lifecycle result does
not establish physical audibility, React/browser behavior, full release checks,
new registry installation or a deployed repair. Follow the
[release checklist](../../../runbooks/release.md) for those remaining boundaries.
