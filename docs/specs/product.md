# Sonant product scope

Last updated: 2026-10-15

## Brief and decisions

The user requested an end-to-end reusable sound library for React and/or Next.js, npm/npx/pnpm installation, a shadcn-inspired website and configurator, consideration of three supplied research reviews, and upload to their GitHub account. The user selected **Sonant**, **public**, and **MIT**, and explicitly approved production builds, browser verification, GitHub Actions, and GitHub Pages.

The final research shifts differentiation toward policy, QA, and observability. The initial release combines the requested sound library and source ownership with those capabilities. It does not treat every suggestion in the historical research as a mandated first-release feature or claim hosted business outcomes.

## Acceptance map

| Requirement | Owner | Verification |
| --- | --- | --- |
| Reusable installable library | `packages/sonant/package.json` and exports | Packed-artifact consumer installation and imports |
| npm, npx, pnpm workflows | Published tarball and CLI bin | Registry metadata plus fresh npm/npx/pnpm consumer checks |
| React / Next.js | Client provider, hooks, generated provider | Strict TypeScript checks, React SSR/StrictMode and generated-source checks |
| Website like a component library | `website/src/` | Production build, browser interaction tests, visual inspection |
| Installation configurator | Shared `config.ts`, `Create.tsx`, CLI | Downloaded files and CLI options agree |
| Source ownership | Registry and generated theme | CLI integration, no overwrite, valid source compilation |
| Useful sound library | 22 UI and 10 optional agent events, 3 themes | Deterministic recipe checks, previews, WAV export |
| Consider final research | Runtime policy and Devtools | Cooldown, priority, density, cancellation, speech, mute, local trace tests |
| Accessibility and user control | Preferences, native controls, visible states | Axe checks, keyboard interactions, explicit limits |
| Provenance | Original recipes and manifests | MIT license and SHA-256 export checks |
| Public GitHub upload | `alvarovillalbaa/sonant` | Remote commit, workflow run and release state |
| Hosted website | Vercel deployment on Clous Team (Pro) | Successful deployment and live HTTP/browser inspection |

## Research directions beyond this release

Hosted experiments, product-outcome measurement, team taxonomy governance, signed native exports, haptics, full Storybook integration, perceptual loudness certification, third-party version-specific adapters, and professional sound-design review remain separate work. No telemetry is enabled to imply those capabilities exist.

The normalized provider bridge supports application-owned engines without making unverifiable compatibility claims about packages Sonant does not install. The auditor provides inspectable hints rather than invented control-flow guarantees.
