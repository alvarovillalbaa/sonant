# GitHub release website links

Verified 26 October 2026. Updated only the website URLs in the existing [v0.1.0 release description](https://github.com/alvarovillalbaa/sonant/releases/tag/v0.1.0) after the Vercel cutover.

| Before | After |
| --- | --- |
| `https://alvarovillalbaa.github.io/sonant/` | `https://sonant-beta.vercel.app/` |
| `https://alvarovillalbaa.github.io/sonant/#/create` | `https://sonant-beta.vercel.app/#/create` |

The GitHub connector supports reading release metadata but exposes no release-update tool, so the update used `gh api --method PATCH` with a JSON body containing only `body`. Independent connector GET readback from `repos/alvarovillalbaa/sonant/releases/tags/v0.1.0` returned release ID `413793225`, `updated_at: 2026-10-26T15:16:35Z`, and a description exactly matching the previous body with these two URL substitutions. No `github.io` URL remains in the live body. Asset IDs and digests match the pre-update readback.

`curl -IL --max-time 20` returned HTTP 200 for the homepage and the URL containing `#/create`. URL fragments are browser-side routes: the HTTP response proves homepage delivery, not configurator interaction. No application code, package artifact, historical evidence, or deployment was changed; no build or browser suite was run for this metadata-only correction.
