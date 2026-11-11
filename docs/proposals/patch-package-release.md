# Prepare the repaired Sonant package

11 November 2026. The [two source repairs and public verification](../results/2026/11-11/hosted-browser.md)
are published at `0976c617`. The published npm version remains0.1.0. Preparation
updates the package metadata to0.1.1 and corrects its stale repair notice. The intended outcome is
an actual patched npm package and fresh package-name consumers, not just source
or a GitHub archive. Physical audibility remains a separate boundary.

The owner's continued all-project goal and standing "approve everything / keep
going" authorize necessary free preparation/CI/source publication. Do not create
an account, enroll a plan, copy local tokens to CI, or publish without verifying
the actual npm identity and package permission. Follow the owning release runbook.

1. Read public registry metadata anonymously from a public Ubuntu job, two-minute
   cap, exact source pin, read-only permission and owned branch
   `qa/sonant-registry-metadata-20261111-1`. Retain the original bounded response,
   HTTP status/time/hash and derived version/dist/maintainer summary. Confirm
   whether0.1.1 is available before changing metadata; a failed lookup proves
   neither package absence nor credential absence.
2. Prepare the exact next patch, initially0.1.1 if available, correct its package
   README and generate the lockfile with npm. Verify the dependency graph is
   unchanged. Build/pack in owned free CI and retain the actual immutable tarball,
   file inventory, integrity and source binding. No heavy local operation: current
   Storage Guard is8.4GiB free versus34GiB required.
3. Verify fresh archive consumers: public imports, executable CLI init/add/export,
   generated React compilation and npm/npx/pnpm paths. Preserve failures and keep
   package-version/archive identity exact. The already accepted runtime/browser
   cohorts are not new package-name registry proof and need no unchanged rerun.
4. Publish only the reviewed archive after authenticated identity/permission is
   verified; verify registry metadata/tarball and fresh registry consumers. If a
   supported authentication/network step needs the owner, first finish the
   concrete candidate and consumer proof. A GitHub candidate is not npm release.

The first metadata job has no app install/build/test/browser, secret, model/API,
database, account, paid action or registry write. It uses Python's standard HTTPS
client, one official registry GET with a15-second timeout/512KiB limit, no auth
header, redirect or cookie. Source files/modes/blobs/bytes are sealed before and
after. Response/descriptor closure is observed; no host-wide process proof.
Retire its exact temporary workflow/ref after retaining terminal evidence.

Local npm identity/version preflights already failed DNS ENOTFOUND; the public
web tool could not access the metadata URL. Do not repeat those unchanged paths
or infer missing credentials. The connected repository secret list was empty;
that does not establish whether trusted publishing is configured.

The [metadata receipt](../results/2026/11-11/registry-metadata.md) confirms the
official registry returned0.1.0 as latest and no0.1.1 on11 November. npm generated
the0.1.1 metadata offline with scripts/workspace reification disabled; parsed
comparison found only the package and workspace-lock version fields changed.
The dependency graph is unchanged. This is preparation, not publication.

The inactive `docs/examples/patch-candidate.workflow.yml` defines the next exact
scope: one public Ubuntu job,20-minute cap, read-only repository permission,
immutable source and owned `qa/sonant-patch-candidate-20261111-3` branch. It runs
the release runbook's frozen install/type/site/package checks and35 existing
package/integration cases, then packs once and retains the actual tarball. It
inventories every archive member, declarations/exports, executable/client
directives, license/README and embedded source-map content against source;
SHA256, SHA512 SRI and npm's SHA1 bind those exact bytes.

Seven fresh archive consumer profiles follow: npm/npx/pnpm on Node22.23.4;
strict generated React18.3.1 and19.3.1 source/SSR with TypeScript5.9.3; and npm
core/CLI/export on the declared minimum Node20.19.0 and Node24.22.2. The isolated
pnpm tool is10.17.1. Generated output covers all four registry components and32
authored WAVs; no model, provider, browser or real audio is used. Source guards
cover every tracked mode/blob/byte before/after. Consumer roots and owned tools
are removed on success, but this profile does not independently inventory
process groups or prove physical device/runner disposal. Failed originals are
retained, not relabeled as successful archive or registry checks. Retire only
the task's exact temporary controls after terminal evidence.

Attempt1 stopped during archive inspection: the built CLI had mode0644 in the
actual tarball. All35 package tests/type/site checks and source guards passed,
but the seven profiles were correctly skipped. The package build now explicitly
sets its emitted CLI to0755 using Node's filesystem API; no dependency changed.
Attempt2 must retain the executable check and exercise the newly packed bytes.

Attempt2 accepted all39 archive members and the fresh npm core/CLI/export
profile. npx interpreted the bare archive path as an executable and stopped
with126, before pnpm/React/compatibility profiles. The harness now uses the
documented explicit `--package` and `sonant` binary form for archive npx/dlx;
the package-name registry path is unchanged. Sources:
[npm npx](https://docs.npmjs.com/cli/v11/commands/npx/) and
[pnpm10 dlx](https://pnpm.io/10.x/cli/dlx). This invocation correction does not
weaken a consumer assertion or alter the package payload.
