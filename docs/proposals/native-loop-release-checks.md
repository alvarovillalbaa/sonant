# Native loop repair release checks

11 November 2026. The first hosted packet exposed a real native loop provider
error and separate harness failures. Preserve its immutable originals and
[repair rationale](../fixes/native-loop-buffer.md). The owner's standing approval
covers this necessary source fix and focused release gate without another ask.

Use one public Ubuntu 24.04 job, twenty-minute maximum, exact immutable source
checkout on owned `qa/sonant-loop-release-20261111-1`. Follow the existing release
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
