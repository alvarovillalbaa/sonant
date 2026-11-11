# Mobile trace containment passed the release gate

11 November 2026. [Run43017388896](https://github.com/alvarovillalbaa/sonant/actions/runs/43017388896),
job130511736665, succeeded at source `3608e4d4694ab7a0ca0a867e45093ba1d7d95af6`
through activation `683f25343576a9aacf09383b7c228e602c05b149`.

All **35 package/integration cases**, **44 browser scenarios** and **five Firefox
cold starts** passed. The four strengthened native cases use the actual sound
provider, navigate to Devtools, require stopped playback, document width within
client width and zero visual offset, then download the real trace. Mobile uses
native taps. The actual geometry is1280/1280 on desktop Chromium/Firefox/WebKit,
and390/390 on mobile Chromium, all visual offsetTop0. Every browser identity has
one passing result, with no skipped, unexpected, flaky cases or retries.

The [localized repair](../../../fixes/trace-label-containing-block.md) adds a
positioning context to the existing trace scroller. The escaping absolute hidden
heading stays locally contained; the semantic label and table's horizontal
scroll remain. The ineffective route-timing candidate was removed. Compared
with accepted production54ae94d, only the two-line CSS rule/comment changes
application code. No runtime dependency, recipe, version or provider change.

Frozen install, package/site checks, production build and package dry run passed
on public Ubuntu24.04, Node22.23.4/npm10.9.9. Firefox used a virtual audio sink.
The [lossless packet](trace-layout-release-attempt-1/checksums.json) preserves all
34 original artifact files /4,959,243 bytes, full captured logs and original
Playwright JSON. Independent verification matches every case and all **183 source
files /11,265,571 bytes**, modes/blobs/SHA before/after and immutable Git. The
18 catalog PNGs are retained without a gallery visual-acceptance claim.

Earlier three failed hosted attempts, the invalid release activation, failed
scroll-only release and failed one-case diagnostic remain immutable. This new
invocation supersedes none of those outcomes and is not additive to overlapping
older counts. The full-release profile does not independently inventory process
groups or runner disposal. Provider acceptance is not physical audibility.

Production cutover and all four public hosted journeys are separate next gates.
Temporary controls are retired after retaining terminal evidence; permanent
quality and registry jobs remain unchanged. Public npm remains0.1.0 without the
source repairs. No local install/build/browser, account, paid plan or model API.
