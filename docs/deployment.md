# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://sonant-beta.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `sonant`, `prj_e0gY5HZyOJwbsFtEvHDDZDFuAbo5`.
- Source: `alvarovillalbaa/sonant`, production branch `main`, repository root.
- Vite preset; `vercel.json` installs with `npm ci`, runs `npm run build:site`, and serves `website/dist/`.
- Leave `SONANT_BASE` unset for `/`. Hash routes cover the playground, configurator, examples, docs and devtools.
- The GitHub quality workflow keeps its checks and browser evidence; its Pages deployment job is removed. Vercel builds are independent of GitHub quality checks.

Initial production deployment `dpl_8MeQuwUTiXFdeS38DpcevEDgKv7H` reached READY from `00702069b9ec69f6e0372004893be7b59a20c1e5`. GitHub Pages cutover and verification of the migrated source are recorded below after publication. Published npm version 0.1.0 is unchanged; source homepage updates apply to a future package release.
