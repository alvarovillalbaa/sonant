# Vercel hosting

Configured on 15 October 2026 at the owner's request.

- Production: https://sonant-beta.vercel.app/
- Team: Clous Team (Pro), `my-team-4f230354`.
- Project: `sonant`, `prj_e0gY5HZyOJwbsFtEvHDDZDFuAbo5`.
- Source: `alvarovillalbaa/sonant`, production branch `main`, repository root.
- Vite preset; `vercel.json` installs with `npm ci`, runs `npm run build:site`, and serves `website/dist/`.
- Leave `SONANT_BASE` unset for `/`. Hash routes cover the playground, configurator, examples, docs and devtools.
- The GitHub quality workflow keeps its checks and browser evidence; its Pages deployment job is removed. Vercel builds are independent of GitHub quality checks.

Initial production deployment `dpl_8MeQuwUTiXFdeS38DpcevEDgKv7H` reached READY from `00702069b9ec69f6e0372004893be7b59a20c1e5`. The verified cutover to Vercel is recorded below. Published npm version 0.1.0 is unchanged; source homepage updates apply to a future package release.

## Verified cutover

- **Target / status:** production / READY, Git-triggered deployment from `d2bc491f23a9e069401a08615d466877dd28e62f`.
- **Deployment:** [dpl_3vy6u8TSpRSFTVCbTTcCfyZPX9iW](https://vercel.com/my-team-4f230354/sonant/3vy6u8TSpRSFTVCbTTcCfyZPX9iW); framework Vite; build duration 8.6s.
- **HTTP:** 8 production URL checks matched expectations, including 0 expected 404s. 2 downloaded public files matched source bytes. See [machine-readable results](deployment-verification.json).
- **GitHub:** `main` push triggered the deployment automatically; the repository homepage now points to Vercel. Pages is disabled (`has_pages: false`), and the former Pages URL returns HTTP 404. No old-URL redirect is configured.
- **Checks:** `npm run check` passed. The local suite passed 24/25 initially; the packed-package test hit EPERM on the global npm cache, then passed with a writable temporary cache. The retained [GitHub quality run](https://github.com/alvarovillalbaa/sonant/actions/runs/38770219574) passed checks, all tests, production build, cross-browser E2E, repeated Firefox cold starts, and package validation. `git diff --check` passed.
- **Observability:** the last-hour Vercel runtime-error scan returned no errors. Drains inventory returned HTTP 404, so drains/continuous monitoring are unverified. Static delivery and HTTP checks do not prove browser interactions or physical audio output.

The migration adds no dependencies or required environment variables. Browser interaction QA was not rerun against these Vercel sites; earlier browser evidence remains scoped to its original deployment. The following evidence-only commit may trigger a fresh build; the source commit above identifies the fully checked migration build.
