# Source registry

Last updated: 2026-10-15

- User-supplied project brief and three research reviews: inspected in full during implementation. Historical adoption numbers are not treated as current facts and are not used as Sonant social proof.
- [shadcn/ui](https://ui.shadcn.com/) and [source repository](https://github.com/shadcn-ui/ui): inspected for component-library distribution and source ownership. No implementation or sound assets were copied.
- [shadcn Create](https://ui.shadcn.com/create): inspected; its interactive content is client-rendered and the fetched page did not expose configurator detail. Sonant's configurator is an independent implementation.
- [Cuelume inspiration](https://cuelume-site.pages.dev/): inspected for live sound previews and interaction-oriented presentation. No recordings, recipes, branding, testimonials, or usage figures were copied.
- [W3C Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html): linked as normative user guidance; automated audits are not presented as WCAG certification.
- Font packages: DM Sans Variable and IBM Plex Mono, distributed by Fontsource under upstream OFL licenses. Runtime dependencies and exact versions are recorded in the lockfile.
- [npm staged publishing](https://docs.npmjs.com/staged-publishing/): inspected during release verification to distinguish the temporary `0.0.0-stage` placeholder from the approved, installable release.

The supplied research's suggested later features are retained as context in the [product scope](../specs/product.md), not advertised as implemented.
