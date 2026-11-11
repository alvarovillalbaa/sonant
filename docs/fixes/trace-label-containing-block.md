# Keep the trace heading inside its scroll container

11 November 2026. The [one-case diagnostic](../results/2026/11-11/mobile-layout-diagnostic-1/checksums.json)
failed its unchanged overflow assertion and recorded the actual elements.
Client width is390, document width586. The absolutely positioned `.sr-only`
Replay heading ends at586; the wider table ends at633 inside the existing
scroller. This identifies the escaped label, rather than the internally
scrolling table, as the matching document-width boundary.

The scroller had no positioned ancestor for that absolute label. CSS's
[containing-block/overflow contract](https://drafts.csswg.org/css2/zindex.html)
allows such descendants to escape intermediate overflow clipping when their
containing block lies outside it. Add `position: relative` to `.trace-scroll`
so the existing local scrollbar also contains the hidden label. Keep the
semantic heading, native table scrolling and all page controls. No page-wide
overflow masking or forced input is used.

The earlier scroll-timing hypothesis failed and its App.tsx change is removed.
All originals and negative results remain versioned. The real native mobile
regression still requires successful playback, navigation, zero active voices,
document width within client width, zero visual offset and an actual trace
download. It retains the read-only layout diagnostics.

Standing approval covers one public twenty-minute release job, immutable
source,35 unit/integration cases,44 existing browser identities with the four
stronger navigation/export cases,5Firefox cold starts,check/build/package and
source guards. The inactive release example is restored to that full scope;
activate only owned `qa/sonant-trace-layout-release-20261111-1` using the separate
temporary-trace-layout-release path. Runtime dependencies/versions/permanent
workflows stay unchanged. No local heavy operation, account, paid plan or API
model call. Full-release process-group/runner disposal proof remains separate.

Preserved source evidence now includes multiple unique original archives.
The hosted supervisor's explicit whole-source byte ceiling is20MB instead of
12MB, keeping its200-file bound and hashing every file without an exclusion.
This is a bounded source/evidence allowance, not a behavior or failure bypass.

The [release gate](../results/2026/11-11/trace-layout-release.md) passed35/44/5
at3608e4d, including mobile document/client width390/390, zero visual offset and
a real trace download. Production cutover and the four public hosted cases
remain separate next gates, requiring an actual repaired canonical deployment.
Those gates subsequently passed at published source `fe64588b`: the canonical
deployment was READY and [all four public journeys](../results/2026/11-11/hosted-browser.md)
passed together, including the actual narrow trace download.
