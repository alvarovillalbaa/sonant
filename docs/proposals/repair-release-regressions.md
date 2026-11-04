# Release regressions for the cancellation repair

4 November 2026. The [focused result](../results/2026/11-04/operation-cancellation-checks.md)
reproduced the baseline defect and passed all 24 repaired cases, both isolated
builds and owned source/process/fixture cleanup. Main and the existing npm
release still predate the repair. The repository's
[release checklist](../runbooks/release.md) requires broader package/site/browser
checks before delivery. The original product brief explicitly authorizes
production builds, browser verification and GitHub Actions; the owner's current
“I approve everything / Keep going / Do all the work” instruction covers this
separate next scope without another routine approval question.

Use one temporary public Ubuntu job capped at fifteen minutes, read-only
contents permission and an immutable reviewed repair-source checkout. It is
a faithful copy of the existing `quality-and-pages.yml` job, activated only by
creation of `qa/sonant-release-regression-20261104` in this public repository.
The inactive example is `docs/examples/repair-release-regressions.workflow.yml`.
Only its activation copy gains the exact source SHA. Keep the permanent
quality and registry workflows unchanged; no PR or main push is needed to run
these checks. Source-publication commits retain `[skip ci]`.

Retain the existing Node 22 profile, frozen `npm ci`, strict package/site checks,
full unit/integration tests, site production build, Chromium/Firefox/WebKit and
mobile Chromium browser scenarios, five additional Firefox cold starts, and
package dry run. The existing virtual PulseAudio null sink uses `norewinds=1`;
this is synthetic CI audio infrastructure, not a physical listening session.
Do not weaken assertions, enable retries or replace the native browser renderer.
Retain the existing npm cache and seven-day browser evidence artifact behavior,
which are separate from the focused packet's no-cache/no-artifact policy.

The temporary copy additionally refuses missing source pins, verifies its
checkout HEAD before execution and tracked/index/working cleanliness afterward,
and disables persisted checkout credentials. It pins the same existing v7
actions to their primary GitHub refs observed at 21:46 UTC:

- checkout `3d3c42e5aac5ba805825da76410c181273ba90b1`;
- setup-node `949feb2413d6458794dcd2491c4babbbce0c15c1`;
- upload-artifact `cf430e030ddbb5b0abf93d22962f4752f3646cd9`.

No runtime, test, dependency, browser configuration, provider/Auth or package
version change is proposed. Preserve the complete failed result before any
necessary repair and rerun only the affected scope. Retain actual package,
browser, compiler/runtime and build results rather than infer them from an
overall job color. This existing quality job does not independently inventory
all process groups or prove runner disposal; do not borrow the focused
controller's cleanup proof for this different execution profile.

After its terminal job, record the outcome and remove the active temporary
workflow, retaining the owned check branch as a retired bookmark. Then assess
the nonforce main integration and existing Vercel production route against the
actual source and required checks. Respect any provider or administrator gate.
Do not publish a package, change billing/account/SSO or enroll a paid service.
Public npm authentication, a new package version/release, real-device audibility,
screen-reader and full-product acceptance remain separate boundaries.

Local Storage Guard still blocks a local install/build. This job installs and
executes only on its public runner; no local dependency environment is created.
