# Publish the verified Sonant0.1.1 archive

The [candidate result](../results/2026/11-11/patch-package-candidate.md) is complete.
This handoff needs an existing authenticated npm maintainer terminal with working
registry networking. The controlled native npm path failed DNS; the supported
browser currently exposes no connected surface. Neither observation proves
credentials absent. Do not extract a token, add it to CI, create an account or
change package access settings to work around those boundaries.

Standing owner authorization covers the patch release. Authentication/2FA and
the actual registry write are still required; another general approval is not
the missing step. Download the exact candidate from
[GitHub's0.1.1 candidate release](https://github.com/alvarovillalbaa/sonant/releases/tag/v0.1.1-candidate.1).
The release is explicitly a prerelease; npm latest stays0.1.0 until publication.

In a disposable directory outside a source checkout, download
`alvarovillalbaa-sonant-0.1.1.tgz`, then verify:

```sh
shasum -a 256 alvarovillalbaa-sonant-0.1.1.tgz
npm whoami --registry=https://registry.npmjs.org/
npm access list collaborators @alvarovillalbaa/sonant --json --registry=https://registry.npmjs.org/
npm view @alvarovillalbaa/sonant versions --json --registry=https://registry.npmjs.org/
```

Require SHA256
`10106e3dd4b4f37ebf7f33273919a257ba7698807eada39e673283b2827b2963`,
the intended maintainer identity and its actual `read-write` package permission.
If0.1.1 already exists, stop and compare its dist integrity; never republish an
existing version or overwrite a distribution tag to disguise a mismatch.
Complete npm's normal interactive sign-in/2FA in that terminal if necessary.

Publish the reviewed archive itself, retaining its exact bytes:

```sh
npm publish ./alvarovillalbaa-sonant-0.1.1.tgz --access public --registry=https://registry.npmjs.org/
npm view @alvarovillalbaa/sonant@0.1.1 version dist --json --registry=https://registry.npmjs.org/
```

Return only the package version and public dist integrity/URL; never send a
password, token, OTP or npm config. The agent then verifies the public tarball
against the candidate, dispatches the existing `Registry installation` workflow
for0.1.1 and retains its fresh npm/npx/pnpm consumer evidence. Only afterward
create the stable0.1.1 GitHub release and update public version notices. Keep
the candidate, failed originals and prior release evidence intact.
