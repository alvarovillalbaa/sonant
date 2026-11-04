# Public delivery of the cancellation repair

4 November 2026. [Sonant](https://sonant-beta.vercel.app/) returned **five
complete anonymous HTTP 200 responses** in
[run 41922988638](https://github.com/alvarovillalbaa/sonant/actions/runs/41922988638),
job `126899979073`, 22:11:08–22:11:19 UTC. The
[machine receipt](public-delivery.json) retains the actual single controller
result, all body sizes/hashes, source comparisons and provider mapping.

| Endpoint | Actual outcome |
| --- | --- |
| `/` | 919-byte HTML, expected source title and JS/CSS references |
| `/llms.txt` | 938 bytes, byte-identical to pinned source |
| `/favicon.svg` | 218 bytes, byte-identical to pinned source |
| `/assets/index-D_Lgjs50.js` | 310,658-byte JavaScript, complete body and repair-status notice strings |
| `/assets/index-QBo_8_vM.css` | 43,433-byte stylesheet, complete body and observed hash |

Every response had the expected content type and canonical effective origin.
All five requests settled and their streams released within the 15-second
request, 1 MiB body and 60-second global bounds. The 2,954-byte report stayed
below its 16 KiB limit. No cookies, credentials, redirects, share link or
protection bypass was used. Node 24.21.0 ran a dependency-free three-minute
public-runner job; it installed no packages and ran no browser or model.

The checked-out comparison/application source is
`22ab91b9d1333b749d31d8946512c49c279972e8`, tree
`07b758b36329dc51eacfa96c8cb840d0067f9439`. Independently verified production
`dpl_AxxzCyGn5ovst1Mz7vkvySCVoi9v` is READY at that exact source, intended
project and canonical alias. Its [notice-edition receipt](production-notice.json)
preserves the actual provider build and source distinction. The earlier
[main cutover](production-release.json) was source `9be0bd5b`, deployment
`dpl_EcAWQPwDPkkDjbSG7Wnt9fYqiUVj`.

Vercel selected Node 26.x from the existing root range despite configured 24.x;
the patch version was not measured. Both provider builds passed on Vite 8.3.4.
The first cutover's JS/CSS asset names matched CI; the nine-line existing-style
callout then changed the JS path, while CSS stayed unchanged. No dependency,
test, runtime-library, stylesheet, Auth/domain, project-setting or billing
change accompanied that notice. The provider's `live:false` projection and
warnings remain in the receipts alongside the actual public HTTP evidence.

The [focused result](operation-cancellation-checks.md) reproduced the baseline
assertion and passed 24 repaired cases. The separate
[release regressions](release-regressions.md) passed 35 package/integration
cases, 40 browser scenarios and five repeated Firefox cold starts at `55c990b`.
Those 35 include the 24 focused cases; counts are not additive. That browser
profile predates the copy-only callout. These HTTP checks establish delivered
bytes/strings, not browser execution or visible rendering of the notice.
Only the two specified public files are compared byte-for-byte with source;
unknown expected JS/CSS bundle bytes are not invented.

Activation was `bf1f30c6def9ae08783108723d6287cd69e5b566`, checking out the
production source above. This evidence edition removes the active HTTP workflow
and retires only `qa/sonant-public-http-20261104`. The earlier focused bookmark
stays at `2fa13525`, and the release-regression bookmark stays at `9be0bd5b`.
The inactive examples, permanent quality/registry workflows, original receipts
and source seals are preserved. Final status publication changes documentation
only; later provider metadata is separate from this actual HTTP execution.

The existing verified npm 0.1.0 artifact predates this repair. No new package
was published, and no claim about a different maintainer's current latest
version is made. Physical listening, real-device/screen-reader acceptance,
hosted browser interaction and a new registry release remain open. The full
portfolio goal remains active and unfinished.
