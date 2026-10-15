# Architecture

Last updated: 2026-10-15

`catalog.ts` owns the semantic contract, themes, deterministic PCM generation, validation, and WAV encoding. Recipes use bounded tone arrays with deterministic envelopes. Themes change material while preserving event names.

`runtime.ts` owns instance preferences, budgets, pending reservations, voice priority, operation cancellation, loop watchdogs, lifecycle, subscriptions, and a bounded local trace. Reservation happens before async unlock so simultaneous calls cannot bypass limits. Abort signals stop requests that have not reached a renderer yet. A watchdog ends audio without preventing a later operation outcome.

`audio.ts` creates a Web Audio context lazily, caches per-instance buffers, and renders through a master gain. Injected contexts remain application-owned. `providers.ts` supports sample-backed media and normalized external bridges. Provider acceptance is observable; device audibility is outside this contract.

`react.tsx` is a client entry point with a scoped context, useSyncExternalStore subscriptions, StrictMode-safe delayed disposal for owned systems, and unmount-safe operations. Externally supplied systems remain caller-owned.

`config.ts` is shared by the CLI and website configurator. `registry.ts` owns copy-in component source. The CLI validates paths, refuses symlinks and existing files, renders assets locally, and runs explicitly advisory source heuristics. It does not install packages or rewrite user source.

The website uses the built workspace package, hash-based static routes, native controls, shared recipe generation, and local preference storage. There is no backend, account system, database, or telemetry endpoint. Fonts are bundled locally.

Public entry points and detailed methods are documented in the website's API reference. Package exports are authoritative. Tests separate synthetic runtime/CLI behavior from real browser integration.
