# Release procedure

Last updated: 2026-10-15

1. Read `docs/specs/product.md`; inspect the current diff and cleanly preserve unrelated work.
2. Run `npm ci`, `npm run check`, `npm test`, and `npm run build:site`.
3. Run browser tests in Chromium, Firefox, WebKit, and mobile Chromium. Inspect real previews and configurator downloads. Follow the listening protocol before making perceptual claims.
4. Run `npm run pack:library`; inspect `npm pack --dry-run --workspace @alvarovillalbaa/sonant`. Confirm declarations, executable CLI, client directive, README, and MIT license are included. Never include credentials, local-only paths, website source, or node_modules.
5. Install the actual tarball into a fresh consumer. Exercise core imports, CLI init/add/export, and generated React source compilation.
6. Reconfirm the npm identity and permission for the scope. Publish the reviewed package with `npm publish --workspace @alvarovillalbaa/sonant --access public`. Complete npm's interactive authentication or 2FA if required; never pass credentials into Git history. If using staged publishing, inspect the exact staged version and tarball before the maintainer approves it with 2FA in npm's Staged Packages page. A `0.0.0-stage` placeholder is not a released application version; see [npm's staged publishing procedure](https://docs.npmjs.com/staged-publishing/).
7. Verify registry metadata and dispatch the `Registry installation` workflow for that exact version. It checks fresh npm imports, npx init/add, and pnpm add/dlx using disposable consumers. Create a matching GitHub release with the package tarball and notes.
8. When authorized, push the reviewed source. Vercel deploys `main` on Clous Team (Pro), using `npm run build:site` and `website/dist` with the default root base. The quality workflow remains a separate check; it no longer deploys Pages. Verify the remote commit, quality checks, Vercel READY state, production alias, HTTP responses, and live site. See [deployment evidence](../deployment.md).
9. Record actual results and limits in `docs/results/YYYY/MM-DD/`. A successful build is not proof of npm publication, hosted deployment, real-device audio, or improved user outcomes.

The first release is authorized by the project brief. Subsequent registry releases and deployments require their own task authorization.
