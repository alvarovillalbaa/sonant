# Identify the overflowing mobile element

11 November 2026. The post-commit scroll candidate failed its stronger mobile
case in run43015780669; 43 other browser cases and 35 unit cases passed. Preserve
that failure and do not deploy the candidate. Both hosted and local mobile
profiles now reproduce the overflow. The current hypothesis is insufficient.

Standing owner approval covers one public Ubuntu24.04 diagnostic job, eight
minutes maximum, read-only permission and exact owned branch
`qa/sonant-loop-layout-20261111-1`. Use an immutable source checkout, frozen
installation, package/site check and production build, then only the one mobile
native-loop/navigation case. Install Chromium only. Do not rerun unit suites,
all44 browsers, Firefox cold starts or packaging for this observational change.

The case adds only bounded read-only console diagnostics: document and visual
viewport sizes, and the first500 DOM nodes filtered to those overflowing the
client width, with element/class/parent and computed width/overflow/position.
All original native loop, viewport, real-input and download assertions remain
unchanged. This run may remain failed and must not be described as acceptance.
No forced click, state/renderer/response injection, global overflow clipping,
viewport override or timeout extension is proposed.

The inactive `docs/examples/native-loop-release.workflow.yml` is now a temporary
diagnostic subset of its historical full release example, which remains pinned
at `784aee89`. Its active copy uses the separate temporary-loop-layout path.
Retain original JSON/logs/screenshot/trace and source guards even on failure.
This profile does not independently verify process groups or runner disposal.
Retire its controls after terminal evidence. Production stays at accepted
`54ae94d0`; no account, dependency change, model/API call, paid plan or local
heavy operation is needed.
