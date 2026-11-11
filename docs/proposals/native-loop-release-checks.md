# Native loop repair release checks

11 November 2026. The first hosted packet exposed a real native loop provider
error and separate harness failures. Preserve its immutable originals and
[repair rationale](../fixes/native-loop-buffer.md). The owner's standing approval
covers this necessary source fix and focused release gate without another ask.

Use one public Ubuntu 24.04 job, twenty-minute maximum, exact immutable source
checkout on next owned `qa/sonant-loop-release-20261111-3`. Follow the existing release
procedure and its Node 22 profile: frozen npm install, package/site check,
35 unit/integration cases, production site build, the 44 Chromium/Firefox/WebKit/
mobile scenarios (40 existing plus four native-loop regressions), five Firefox
cold starts and package inspection. Existing lockfile/dependencies/browser
configuration and permanent workflows stay unchanged. No package publishing.

Use the existing virtual PulseAudio null sink for Firefox. This proves native
provider acceptance in synthetic CI, not perceptual quality or physical audio.
Retain complete command logs and Playwright JSON in a bounded artifact, with
screenshots/traces only as the existing configuration produces them. Record
tracked source/modes/blob identities before and after. Generated app outputs,
dependencies and browser system packages live only on the disposable runner.
As with the earlier full-release profile, original process-group and runner
disposal are not independently inventoried; do not borrow the hosted supervisor's
cleanup proof. Keep failures and do not disable an assertion to make CI pass.

On success, publish the reviewed repair and verify its Vercel build/alias. Then
repeat all four unchanged hosted behavioral expectations with the corrected
download/receipt harness against that actual deployment. Retire both temporary
workflows and task QA refs after retaining terminal originals. Public npm and
real devices remain separate gates. Local Storage Guard still blocks builds.

First activation run 43012566436 was rejected with no jobs, check runs, logs or
artifacts. Its workflow incorrectly used `runner.temp` in job-level `env`;
[GitHub's context table](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability)
does not permit `runner` there. The corrected example defines the path inside
its first runner step via GITHUB_ENV. Runtime, test assertions, commands and
timeouts are unchanged. [Original metadata](../results/2026/11-11/native-loop-release-attempt-1.json)
retains the failure; no execution or cleanup pass is inferred.

The second activation passed all 35/44/5 checks and the buffer repair was
published/deployed at `54ae94d0`. The later hosted diagnostics exposed a separate
mobile navigation geometry failure. The [route-scroll candidate](../fixes/route-scroll-commit.md)
moves scrolling after DOM commit. The same four native loop matrix cases now
also assert viewport recovery and real post-navigation trace download, with
native touch on mobile. Run the same release commands and unchanged case count
at a new exact source before deploying that additional application change.
Do not relabel the earlier four simpler native cases as these stronger cases.
