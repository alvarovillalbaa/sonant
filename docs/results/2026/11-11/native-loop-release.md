# Native loop repair passed the release gate

11 November 2026. [Run 43012905409](https://github.com/alvarovillalbaa/sonant/actions/runs/43012905409),
job 130496683009, succeeded at source `3f3d53490d33e7cc226725ec8c680b8f34a7d613`
through activation `8fab686f66ffb39793b78e649c7feb5d9bd7aa39`.
The [buffer repair](../../../fixes/native-loop-buffer.md) assigns the native
source's chosen buffer once, fixing the padded looping-cue error.

All **35 package/integration cases**, **44 browser scenarios** and **five Firefox
cold starts** passed. The 44 include the same 40 existing scenarios and four new
native-loop regressions, one each in Chromium, Firefox, WebKit and mobile
Chromium. Each new case requires `agent.thinking: played`, then navigation,
an ended trace, zero active voices and no provider error. There were zero
unexpected, flaky or skipped browser cases, one result per case and no retries.
This is one current invocation; older overlapping cohorts are not additive.

Frozen installation, package/site checks, production site build and package dry
run passed. The build emitted 1,745 transformed modules and JS
`index-BoiVdViH.js`; the existing package remains version 0.1.0. Toolchain was
Node 22.23.4/npm 10.9.9 on public Ubuntu 24.04 with the existing frozen tool graph.
Firefox used a virtual PulseAudio null sink. This proves native provider
acceptance in synthetic CI, not physical listening or perceptual quality.

The [original packet](native-loop-release-attempt-2/checksums.json) preserves
34 artifact files / 4,908,575 original bytes: complete captured command logs,
two actual Playwright JSON reports, 18 catalog PNGs, generated guard and source
receipts. Logs alone are losslessly gzip-packed; checksums retain original and
stored sizes/hashes. Independent verification matched every original result
and all **115 source files / 1,854,244 bytes**, modes/blobs/SHA-256, before/after
and against immutable Git. No visual judgment is inferred for the retained
catalog gallery. The new loop regressions use actual DOM/trace assertions and
did not generate success PNGs.

The first [hosted failure](hosted-attempt-1/checksums.json) and the
[rejected release activation](native-loop-release-attempt-1.json) remain failed.
The corrected activation only moves proof-path setup into a runner step;
all repaired app/runtime/test bytes equal the preceding source `f6a842e6`.
The full release profile does not independently inventory process groups or
runner disposal; no hosted-supervisor cleanup proof is borrowed.

Production cutover and four public hosted journeys remain separate next gates.
No new npm version, account, paid plan, model/API call or local heavy operation
was used. Temporary verification workflows/refs must be retired after terminal
publication; permanent quality and registry jobs remain unchanged.
