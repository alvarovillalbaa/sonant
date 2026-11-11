# Sonant patch registry preflight

The official public registry returned HTTP200 on11 November2026 at12:34:01–02Z:
latest `@alvarovillalbaa/sonant` was0.1.0; the only versions were0.0.0-stage and
0.1.0, so0.1.1 was available at that observation. The8779-byte original response
has SHA256 `64af7302408b7d151012ddb4d991eca51b4686d861f9d50358eec57d272931d2`.
See the [original receipt and four source/registry files](registry-metadata-1/checksums.json).

[Run43021430379](https://github.com/alvarovillalbaa/sonant/actions/runs/43021430379)
and job130525316710 succeeded at source `955056cd5bab82fc553bbf06f6a60e417813ac95`,
activation `3b1635683e9823951dba2ee764ff2dd2ca594b63`. All194 tracked source
files matched their modes, Git blobs and complete working bytes before/after.
Artifact13855142246 (32054 bytes) has server ZIP SHA256
`734639c67d09ec0642e099dbdf8f78e428191454f3c97260ce646d89614786c9`.
The temporary workflow414652510 is disabled, with readback. The owned QA ref
is retired separately after these original files are published.

The anonymous request exposed public maintainer metadata, not an authenticated
npm identity, token state or publication permission. No install, build, test,
registry write or paid action occurred. Response/descriptor closure is observed;
this is not an independent host process audit. Local DNS remains a separate
network limitation; repeating it does not establish missing credentials.

The native npm metadata generator subsequently changed only
`packages/sonant/package.json.version` and
`package-lock.json.packages["packages/sonant"].version` to0.1.1. Parsed comparison
against the recorded pre-generator source found every other field/dependency
unchanged. Commands used `--offline`, `--ignore-scripts`,
`--workspaces-update=false` and no Git tag; lock generation used
`--package-lock-only --no-audit --no-fund`. No local build or dependency install
was performed. Existing local `node_modules` was preserved; its entire ignored
tree was not independently re-inventoried. Actual tarball, consumer acceptance
and registry publication remain separate steps.
