# Operation cancellation repair

29 October 2026. Prepared from clean personal `main`
`c5657ad20911f136bc86769f2d79114889693b0e`; the remote head matched before
editing. Source was published at `17b2edb1b48a418f8bd9c2ceeaa995e2e650b863`
on `fix/operation-cancellation`. All 74 local/remote file identities matched
(path, mode, type and blob SHA), the tree was untruncated and zero Actions runs
were returned. Main remains at the baseline. This is not a package or production
release. The [publication receipt](operation-cancellation-publication.json)
retains the complete leaf ledger and hosted observations.

The public `EmitOptions.signal` reaches `begin`, but baseline `begin` replaced
it with a fresh internal signal. A pre-aborted caller could therefore unlock
and request progress playback. Updates used separate metadata, so stopping an
operation also left pending update playback outside its cancellation controller.
These findings come from source inspection, not an executed reproduction.

The repair links caller cancellation to the operation controller, uses that
controller for initial progress and updates, and sets settlement before provider
cleanup to fence synchronous reentry. Pending-handle accounting retains one
caller listener while any progress/update is pending or active and removes it
when none remain. Renewed updates restore the link and recheck pre-abort.
The watchdog can still end the initial loop without settling the operation;
a later confirmed result uses the caller signal independently from stopped
progress. Public types and exports are unchanged.

Root/package READMEs, the architecture reference and website API documentation
describe those cancellation boundaries, initial-loop `ended` and the existing
`cancelled` trace reason. Dependencies, package version, provider/policy code,
Auth, CI and production configuration are untouched.

The [focused proposal](../../../proposals/operation-cancellation-checks.md)
prepares ten new cases and fourteen unchanged runtime regressions, plus one
baseline reproduction. All are unrun against this repair. The twenty-four patched case names
and exact inputs are sealed in the
[inventory](operation-cancellation-inventory.json): 66 files, 344,554 bytes
and thirteen protected unchanged inputs. Its ten-minute Ubuntu
workflow is an inactive text example outside `.github/workflows`.

Read-only TypeScript 5.9.3 syntax parsing passed for the runtime and website
docs, using an existing compiler and Node 26.8.2; no product/test module was imported. Native
`node --check`, YAML parsing, seven shell-body syntax checks, four embedded-JS
syntax checks and `git diff --check` passed. These are syntax/static evidence,
not type correctness, runtime cancellation or browser/audio acceptance. The
separate hosted compilation below establishes a narrower build result.

The existing Git integration created branch deployment
`dpl_7hxAE3i3PNgYZpzsB7xQZ4JVEhMc`, now READY at
<https://sonant-r3oz19sjb-my-team-4f230354.vercel.app>, for exactly `17b2edb`.
Its npm-ci/library-TypeScript/Vite build completed. The logs retain npm's
provider-side unknown `cache-dir` environment warning. No test script ran.
Unauthenticated HEAD returns 302 to Vercel SSO; its query was omitted from
evidence. Authenticated rendering, interactions and physical audio were not
checked. Existing protection settings were preserved.

Canonical production still resolves to READY
`dpl_G9gBpqxifRZZ5QW5qqcyLeG3tXEt`, source `c5657ad`, target `production`.
No main merge, production promotion or npm release was performed. The focused
CI question was sent after the exact source publication; it remains pending.

Storage Guard returned 29.5 GiB free versus 34.0 GiB required, exit two. No
local install, build or new dependency environment was created. No fixture,
browser, audio device, model/provider call, npm publication or paid plan ran.
The public npm metadata was read during preparation and reports version 0.1.0;
this work did not update a registry artifact. Existing dist artifacts were not
edited or used to claim validation of changed source.

Independent source review found no further concrete runtime defect; two extra
coverage boundaries were added to the authored cases. Review also corrected the
baseline probe's assertion ordering and added an always-run artifact bound for
failed checks. No probe or test was run to make those static corrections.
Full fresh package,
browser/device audio and release acceptance remain separate. Other projects'
pending checks and external-service decisions remain unchanged.
