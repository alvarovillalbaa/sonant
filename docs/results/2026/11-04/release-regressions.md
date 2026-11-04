# Cancellation repair release regressions

4 November 2026. The existing release-quality job **passed** in
[run 41919747791](https://github.com/alvarovillalbaa/sonant/actions/runs/41919747791),
job `126888797472`, 21:50:10–21:52:23 UTC. Both the job and workflow API report
completed/success. The [machine receipt](release-regressions.json) retains the
actual steps, normalized unit TAP/case identities, browser summaries, build
outputs and browser-artifact metadata.

| Check | Actual outcome |
| --- | --- |
| Strict package and website TypeScript checks | Passed |
| Full unit/integration suite | 35 passed; zero failed, cancelled, skipped or TODO |
| Website production build | Passed, Vite 8.3.4 |
| Chromium, Firefox, WebKit and mobile Chromium | All 40 scheduled scenarios passed, 41.3 seconds |
| Five repeated Firefox cold starts | All five passed, 13.9 seconds |
| Package dry run | Passed, 39 files, version 0.1.0 |
| Final HEAD/index/working-source guard | Passed |

The 35-case suite includes actual local tarball creation, a fresh offline
consumer install, public imports, executable CLI init/add, generated React
source compilation and SSR/hydration boundaries. It also includes all 24
repaired-runtime cases from the separate [focused result](operation-cancellation-checks.md).
Do not add the profiles as unique tests. The five cold starts repeat one browser
case; they are not five additional unique scenarios. The dot reporter supplies
40 scheduled/40 passed rather than every runtime browser-case ID; retain that
proof boundary.

The immutable checkout was `55c990b3998e1a3b3f03cd80dc32fb971da8eec8`, tree
`3c44f77fd4c9481c4f18fa6950ac411942c4cf48`, from activation
`1679f07639d61998eb6eb513f73d15661d391c92`. Node 22.23.4/npm 10.9.9 ran the
unchanged lockfile and original quality commands. TypeScript 5.9.3 comes from
that frozen lock; this profile does not separately print its compiler version.
The application, test and dependency inputs are unchanged from the focused
repair. All original quality steps remain; no assertion was weakened or retry
enabled. The permanent workflows are unchanged.

The main matrix's instrumented Firefox AudioContext resumed in 62 ms; the five
additional runs measured 41, 42, 31, 39 and 42 ms. The virtual PulseAudio null
sink retains the existing `norewinds=1` configuration. These are native browser
events on synthetic CI audio infrastructure, not listening or physical-device
evidence. No subjective audio-quality or screen-reader claim is made.

The browser evidence artifact is ID `13367680010`, 4,216,164 bytes, seven-day
retention, digest `sha256:ba0e7bc9d6114c105e680d72c93defe3893527bb6c08ded367f1182d8620124e`.
Its metadata is retained; the archive was not duplicated locally. The decoded
job log is 184,457 UTF-8 bytes with SHA-256
`8f37a4b4656157aa6e4c5fa034df844dfdedb255f7b51c384f4c16d11619091d`.
Only selected evidence and timestamp/ANSI-normalized unit TAP are retained in
the receipt. This is not an independent raw-process stream capture.

The standard quality job does not independently inventory all process groups,
temporary resources or runner disposal. Its success does not borrow the focused
controller's cleanup proof. No local install, build or browser was run.

This final evidence edition removes the active temporary release workflow and
retires its own `qa/sonant-release-regression-20261104` bookmark. The earlier
focused bookmark stays at `2fa135253596fc78fff2c3b7e3b4335f57056643`. Three
status-document edits are outside the immutable checked source; application,
tests, lockfile and permanent CI remain unchanged. Nonforce main integration
and production delivery require separate actual ref/provider observations.
The job publishes no npm version and performs no paid enrollment.
