# Four public Sonant journeys passed

11 November 2026. [Run 43018663824](https://github.com/alvarovillalbaa/sonant/actions/runs/43018663824),
job 130516042950, passed all four cases together at source
`fe64588bfb8c95e0b2b5ca6f249594b7afc28087`, through activation
`8d70d9572f41b10b7a5e34cdeef589d969e4036f`.
Before and after execution, the canonical `sonant-beta.vercel.app` alias mapped
to READY production `dpl_C6MbPHV3uY9uK7eYBvcRgKyL5rwm` at that exact source.

| Case | Profile | Verified behavior |
| --- | --- | --- |
| H01 | Desktop Chromium | No audio context on mount; explicit native preview and real trace download; mute survives reload and blocks an error without creating a context. |
| H02 | Desktop Chromium | The thinking loop and first update play through native Web Audio; navigation stops the loop, leaves zero active voices and prevents later updates/outcome. The real trace download agrees. |
| H03 | Narrow Chromium with touch | Native start/stop/navigation taps preserve the visible interruption. The actual trace export retains muted interruption with no late outcome or audio context. Its document and visual viewport are both 390 pixels wide, with zero visual offset. |
| H04 | Narrow Chromium with touch | Soft/quiet selection and async-action produce the matching command and real six-file source bundle. Exact config/theme/component expectations pass; the second actual download is byte-equal. |

All four actual PNGs were downloaded and inspected, including the repaired
390-pixel H03 capture. Five downloads retain their original JSON bytes. The kit
is 19,599 bytes. Native context/source instrumentation delegates unchanged;
there is no app-state, response or renderer replacement. Provider acceptance
does not prove physical audibility. These captures establish their recorded
states, not complete visual, assistive-technology or physical-device acceptance.

There were **25 complete browser responses** over five stable public assets,
plus **five independent final GETs** with equal body sizes/hashes. All were
same-origin HTTP 200s; all observers, requests, pages, contexts and the browser
closed. Every download control received trusted input; narrow exports used
touch. No unexpected request, WebSocket, console/page error or provider API call
was recorded. Served-asset stability and the provider source pin are separate
evidence; no reconstructed production-bundle equivalence is claimed.

Independent verification matched all **188 source files / 15,552,588 bytes**,
modes, blobs and SHA-256 before/after and against immutable Git. All four owned
command groups exited zero without signals and were absent; all eight bounded
streams were complete, closed and hash-matched. No marked or uncertain process
remained and the exact owned tool directory was removed. Only unchanged
same-UID identities recorded before tool setup were excluded. Chromium system
packages rely on runner disposal; this is not a host-wide cleanup claim.

The [lossless original packet](hosted-attempt-4/checksums.json) retains 22 files /
553,649 original bytes in a 382,197-byte archive, plus independent verification.
Runtime was Node 24.22.2, Playwright 1.65.0 and Chromium 158.0.8127.18 on public
Ubuntu 24.04. No local dependency install, build or browser was used.

The [35/44/5 release gate](trace-layout-release.md) is a separate, overlapping
cohort. The native buffer repair and localized trace-label containment are now
verified on the public site. All earlier failures and the ineffective
scroll-timing hypothesis remain preserved; no prior failure is relabeled.

The temporary hosted workflow is disabled. The final publication retires its
last exact owned QA ref, following the earlier eight retired controls; permanent
quality/registry workflows remain unchanged. Later documentation publication
preserves checked application bytes and does not relabel this run as another
deployment's browser proof. Public npm 0.1.0 still lacks these source repairs;
registry release and physical audio/devices remain open. No account, paid plan,
model API, database or production-data change was involved.
