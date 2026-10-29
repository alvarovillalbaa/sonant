# Operation cancellation repair

29 October 2026. Prepared from clean personal `main`
`c5657ad20911f136bc86769f2d79114889693b0e`; the remote head matched before
editing. Source publication will use the dedicated `fix/operation-cancellation`
branch. This is not a package or production release.

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
not type correctness, runtime cancellation or browser/audio acceptance.

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
