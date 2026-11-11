# Reset route scrolling after the page commits

11 November 2026. Third hosted run 43014896933 again passed H01/H02/H04 and
failed H03. Its actual click/geometry receipt narrows the export failure: the
touch action never reaches the button. Native hit testing repeatedly reports
other Devtools content intercepting it. Before the action, inner/document width
is 624, visual width 390 and visual offsetTop 473. The actual failed PNG was
inspected. The [complete original packet](../results/2026/11-11/hosted-attempt-3/checksums.json)
and lossless 22-file archive retain these observations; all 174 source inputs,
eight full streams, closed contexts/browser and owned cleanup were verified.

The hash handler currently calls `setRoute` and immediately scrolls while the
old page may still be mounted. Move that reset into a layout effect keyed by
the committed route. [React's contract](https://react.dev/reference/react/useLayoutEffect)
places this effect after the DOM commit and before repaint. This is a source
timing correction and a candidate explanation for the observed viewport state,
not yet proof of its entire cause or resolution. Do not force a click, change
viewport dimensions, inject app state, mask overflow or extend the timeout.

The existing four native-loop matrix cases now also use native touch on the
mobile profile, assert document/visual viewport recovery and download the real
trace after navigation. This keeps the current matrix at 44 cases; the four
changed cases are stronger, not four additional scenarios. Rerun the existing
release gate because application navigation changed, then verify the actual
hosted journey after deployment. Runtime/provider/recipe/dependency/package
versions are unchanged except the route-scroll placement.

The buffer fix remains independently accepted and live at `54ae94d0`.
This additional navigation candidate is pending and has not been deployed.

The new release run 43015780669 failed: 35 unit cases and 43 browser cases
passed; the strengthened mobile case still found document overflow. Cold starts
and package inspection did not run after that failure. All 177 source inputs
matched, and the actual mobile failure PNG was viewed. Its
[24 original files](../results/2026/11-11/native-loop-release-attempt-3/checksums.json)
remain losslessly archived. The scroll-timing hypothesis is insufficient;
the candidate stays out of production. The next scoped diagnostic records
overflowing elements and CSS widths, preserving every failing assertion.
The following diagnostic identified the escaping absolute table label. The
ineffective route-scroll change was removed; App.tsx again equals production.
See [the localized containing-block repair](trace-label-containing-block.md).
