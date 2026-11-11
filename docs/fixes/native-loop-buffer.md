# Choose a loop's buffer before assigning it

11 November 2026. The first hosted run 43011554260 failed. Its retained
[desktop screenshot](../results/2026/11-11/hosted-attempt-1/H02.png) shows
`agent.thinking` with a provider error while the ordinary cue/update worked.
Source inspection found two non-null `AudioBufferSourceNode.buffer` assignments
on the padded-loop path. The [Web Audio setter contract](https://webaudio.github.io/web-audio-api/#dom-audiobuffersourcenode-buffer)
throws InvalidStateError on the second assignment. The exception itself was
caught by the runtime and not retained; its specific cause is an inference from
the source and browser contract, not a captured exception message.

The provider now chooses its original or one-second padded buffer first and
assigns the native node once. Recipes, gain, loop bounds, caching, cancellation
and package version stay unchanged. A native browser regression requires the
thinking cue to be accepted, then checks navigation stops it with no provider
error. It runs in the existing Chromium/Firefox/WebKit/mobile matrix.

The [original packet](../results/2026/11-11/hosted-attempt-1/checksums.json)
retains all fifteen downloaded files, two actual PNGs and eight complete
command streams. All 95 source inputs matched before/after and exact Git blobs.
No complete browser JSON was written: an unhandled download waiter stopped the
process during H03; H04 did not run. No four-case or individual complete-case
acceptance is inferred. All four original process groups were absent, but two
unreadable same-UID processes made cleanup uncertain and prevented tool-root
deletion. That original cleanup failure remains unaccepted.

The corrected harness joins download wait/click promises immediately, waits for
the visible button before arming them and writes each completed case to disk.
Future process scans exclude only exact unchanged same-UID identities recorded
before tool setup; every newly created identity remains in scope. No deadline
or behavioral assertion is weakened. Public hosted acceptance must be repeated
against the repaired deployment after the separate release regression gate.

The [release gate](../results/2026/11-11/native-loop-release.md) passed 35
package/integration cases, 44 browser scenarios including four native-loop
regressions, and five Firefox cold starts at `3f3d5349`. Production cutover and
four hosted journeys remain separate; no new npm release or physical audibility
is claimed by this source repair.
