import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { catalog } from "@alvarovillalbaa/sonant";
import { registry } from "@alvarovillalbaa/sonant/registry";
import { Code, CopyButton, Install, PACKAGE, REPO } from "./ui";

const pages = [
  ["/docs", "Introduction", "GETTING STARTED"],
  ["/docs/installation", "Installation", "GETTING STARTED"],
  ["/docs/events", "Semantic events", "CONCEPTS"],
  ["/docs/themes", "Sound characters", "CONCEPTS"],
  ["/docs/policy", "Policy & lifecycle", "GUIDES"],
  ["/docs/accessibility", "Accessible sound", "GUIDES"],
  ["/docs/providers", "Bring your own engine", "GUIDES"],
  ["/docs/api", "API reference", "REFERENCE"],
  ["/docs/cli", "CLI & configuration", "REFERENCE"],
  ["/docs/ai", "Add with AI", "RESOURCES"],
  ["/docs/compatibility", "Compatibility & releases", "RESOURCES"],
] as const;
const aiPrompt = `Integrate @alvarovillalbaa/sonant into this React application.
Inspect the current component structure before changing anything.
Create one client-side SoundProvider, default sound off, and add visible mute and volume controls with device-local preferences.
Use semantic events for a few meaningful interactions. Emit success after confirmed completion and preserve all visible status and error messages.
Use useSoundOperation for pending work and stop operations on cancellation or unmount. Do not emit sounds for every token or hover.
Run sonant audit and review its advisory findings. Do not claim the audit proves accessibility or audible output.
Show me the changed files and verification results.`;

function Section({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className="doc-section" id={id}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Docs({ route }: { route: string }) {
  const [search, setSearch] = useState("");
  const page = pages.find((p) => p[0] === route);
  const index = pages.findIndex((p) => p[0] === route);
  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <div className="docs-title">
          <BookOpen size={16} />
          <strong>Documentation</strong>
        </div>
        <input
          aria-label="Search documentation"
          placeholder="Find a page…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {pages
          .filter(([, title]) => title.toLowerCase().includes(search.toLowerCase()))
          .map(([path, title, group], i, filtered) => (
            <div key={path}>
              {(i === 0 || filtered[i - 1][2] !== group) && (
                <span className="sidebar-label">{group}</span>
              )}
              <a
                className={route === path ? "active" : ""}
                href={`#${path}`}
                aria-current={route === path ? "page" : undefined}
              >
                {title}
                {route === path && <ArrowRight size={12} />}
              </a>
            </div>
          ))}
        {search &&
          !pages.some(([, title]) => title.toLowerCase().includes(search.toLowerCase())) && (
            <p className="small-note">No pages match.</p>
          )}
      </aside>
      <article className="doc-content">
        <span className="eyebrow">{page?.[2] ?? "DOCUMENTATION"}</span>
        <h1>
          {page?.[1] ?? "Page not found"}
          <span className="accent-dot">.</span>
        </h1>
        <DocContent route={route} />
        <div className="doc-pagination">
          {index > 0 ? (
            <a href={`#${pages[index - 1][0]}`}>
              <ArrowLeft size={14} />
              {pages[index - 1][1]}
            </a>
          ) : (
            <span />
          )}
          {index >= 0 && index < pages.length - 1 && (
            <a href={`#${pages[index + 1][0]}`}>
              {pages[index + 1][1]}
              <ArrowRight size={14} />
            </a>
          )}
        </div>
        <a
          className="doc-source"
          href={`${REPO}/tree/main/packages/sonant/src`}
          target="_blank"
          rel="noreferrer"
        >
          Read the source
          <ArrowUpRight size={13} />
        </a>
      </article>
    </div>
  );
}
function DocContent({ route }: { route: string }) {
  if (route === "/docs")
    return (
      <>
        <p className="doc-lead">
          A considered sound layer for the interfaces you build. Semantic events, original sound
          characters, and policies that respect the people listening.
        </p>
        <div className="doc-callout">
          Sonant is an early, local-first release. It includes a runtime, React hooks, a copy-in
          CLI, a kit builder, and local diagnostics. No accounts or hosted analytics.
        </div>
        <Section title="Start small">
          <p>
            Install the package, wrap your client tree, and add feedback to one meaningful
            interaction. Keep sound optional and keep the visual feedback you already have.
          </p>
          <Install />
          <Code>{`"use client";\nimport { SoundProvider, useSound } from "${PACKAGE}/react";\n\nfunction Preview() {\n  const sound = useSound();\n  return <button onClick={() => {\n    void sound.emit("action.select");\n  }}>Try a selection</button>;\n}\n\nexport default function App() {\n  return <SoundProvider><Preview /></SoundProvider>;\n}`}</Code>
          <p>
            The runtime defaults to enabled at 35% volume, but nothing plays without an event. The
            generated kit defaults sound off and includes opt-in controls.
          </p>
        </Section>
        <Section title="Meaning first, character second">
          <p>
            Your product emits <code>state.success</code>. A theme decides how that sounds. A policy
            decides whether it should play at all. Local traces explain the decision.
          </p>
          <div className="concept-flow">
            <span>Product event</span>
            <ArrowRight size={14} />
            <span>Policy</span>
            <ArrowRight size={14} />
            <span>Provider</span>
            <ArrowRight size={14} />
            <span>Feedback</span>
          </div>
        </Section>
        <Section title="What makes it yours">
          <p>
            The CLI copies editable recipes and headless React components into your project. The
            small runtime handles policy and browser audio. No third-party sound recordings are
            bundled.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/installation")
    return (
      <>
        <p className="doc-lead">
          From an empty project to your first cue. Works with React 18/19 and Next.js client
          components.
        </p>
        <Section title="1. Install the runtime">
          <Install />
          <p>
            Sonant is ESM-only. React is an optional peer dependency; vanilla TypeScript users
            import the core entry point.
          </p>
        </Section>
        <Section title="2. Create your kit">
          <Install cli />
          <p>
            Or use the <a href="#/create">kit builder</a> to choose a character, profile, and
            components. The CLI never overwrites an existing file.
          </p>
          <Code title="Generated structure">{`sonant.config.json\ncomponents/sonant/\n  provider.tsx\n  theme.json`}</Code>
        </Section>
        <Section title="3. Mount the provider">
          <p>
            In Next.js, keep your root layout as a server component. Import the generated client
            provider and wrap its children.
          </p>
          <Code title="app/layout.tsx">{`import { SonantProvider } from "../components/sonant/provider";\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <html lang="en"><body>\n    <SonantProvider>{children}</SonantProvider>\n  </body></html>;\n}`}</Code>
          <p>
            In Vite or another React app, wrap your application in <code>SonantProvider</code>.
            Enable JSON imports in TypeScript if your framework has not already done so.
          </p>
        </Section>
        <Section title="4. Add controls and a component">
          <Code title="Terminal">{`npx ${PACKAGE}@latest add sound-settings sound-button`}</Code>
          <p>
            Render <code>SoundSettings</code> somewhere discoverable so people can opt in. Render{" "}
            <code>SoundButton</code> inside the same provider. Native buttons support keyboard
            activation automatically.
          </p>
        </Section>
        <Section title="Vanilla TypeScript">
          <Code title="TypeScript">{`import { createSoundSystem, localPreferences } from "${PACKAGE}";\n\nconst sound = createSoundSystem({\n  preferences: { enabled: false },\n  storage: localPreferences("my-product:sound"),\n});\n\nbutton.addEventListener("click", () => {\n  sound.setPreferences({ enabled: true });\n  void sound.emit("action.confirm");\n});\n// When this application instance is removed:\n// await sound.destroy();`}</Code>
        </Section>
      </>
    );
  if (route === "/docs/events")
    return (
      <>
        <p className="doc-lead">
          Describe what happened. Keep sound selection out of your product logic.
        </p>
        <Section title="Why semantic events?">
          <p>
            A product event stays stable when its sonic identity changes. <code>overlay.close</code>{" "}
            can be a warm descent today and a crisp tick tomorrow. Your component still describes
            the same interaction.
          </p>
          <p>
            Only emit confirmed outcomes: a request starting is <code>progress.start</code>, never{" "}
            <code>state.success</code>. The optional AI pack uses state transitions instead of
            token-by-token feedback.
          </p>
        </Section>
        <Section title="Event contract · v1">
          <div
            className="doc-table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Semantic event reference"
          >
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map(([event, , , description]) => (
                  <tr key={event}>
                    <td>
                      <code>{event}</code>
                    </td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        <Section title="Carry useful context">
          <Code>{`void sound.emit("state.success", {\n  source: "ProjectSettings",\n  surface: "settings",\n  visibleEquivalent: true,\n});`}</Code>
          <p>
            Source and surface are developer-owned labels. Never put user text, IDs, prompts, or
            private data in them. They appear in local exports.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/themes")
    return (
      <>
        <p className="doc-lead">
          A coherent character for every semantic event. Editable recipes, with original provenance.
        </p>
        <Section title="Three starting points">
          <p>
            <strong>Studio</strong> uses short, rounded sine tones. <strong>Soft</strong> lowers and
            lengthens them. <strong>Arcade</strong> uses brighter triangle tones with tighter
            timing.
          </p>
          <Code>{`import { createTheme, validateTheme } from "${PACKAGE}";\n\nconst theme = createTheme("studio");\ntheme["state.success"].tones[0].frequency = 600;\n\nif (!validateTheme(theme)) throw new Error("Invalid theme");\nconst sound = createSoundSystem({ theme });`}</Code>
          <p>
            Validate custom themes before use. Every event must have a recipe, a duration up to
            three seconds, and valid bounded tones. Theme options are read when the system is
            created; destroy the old system before replacing it.
          </p>
        </Section>
        <Section title="Own the source">
          <p>
            The CLI writes the complete theme to <code>components/sonant/theme.json</code>. Edit
            frequencies, gains, delays, durations, and sine/triangle waveforms there. The schema is
            Sonant’s own contract, not a standardized Design Tokens sound type.
          </p>
          <Code title="Recipe shape">{`{\n  "duration": 0.2,\n  "tones": [{\n    "frequency": 440,\n    "endFrequency": 660,\n    "delay": 0,\n    "duration": 0.15,\n    "gain": 0.2,\n    "waveform": "sine"\n  }]\n}`}</Code>
        </Section>
        <Section title="Export portable assets">
          <Code title="Terminal">{`npx ${PACKAGE}@latest compile\n# Validates the installed theme and writes WAVs, theme.ts, and a manifest.\n\nnpx ${PACKAGE}@latest export --theme soft --out audio`}</Code>
          <p>
            Exports are mono, 44.1 kHz, 16-bit PCM WAV. Each manifest entry includes author,
            license, duration, and SHA-256. Ogg, native code generation, and haptics are future
            work.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/policy")
    return (
      <>
        <p className="doc-lead">
          An expressive interface needs limits. Policy lives beside the sound system, not scattered
          across components.
        </p>
        <Section title="Profiles and budgets">
          <p>
            <strong>Quiet</strong> allows outcomes and important updates. <strong>Balanced</strong>{" "}
            allows tactile interactions with a six-event-per-second surface budget.{" "}
            <strong>Expressive</strong> raises that budget to twelve. Error and failure events can
            interrupt lower-priority voices.
          </p>
          <Code>{`const sound = createSoundSystem({\n  maxVoices: 4,\n  idleSuspendMs: 800,\n  requireVisibleEquivalent: true,\n  mutedSurfaces: ["exam"],\n  policy: {\n    "action.select": { cooldownMs: 200 },\n    "agent.streaming": { cooldownMs: 500 },\n    "state.error": { priority: 100 },\n    "agent.thinking": { maxDurationMs: 3000 },\n  },\n});`}</Code>
          <p>
            Budgets count accepted requests, including pending browser unlocks. Background tabs are
            suppressed. Cooldowns are scoped by event and surface. There is no implicit hover
            playback, queue, or automatic token sampling.
          </p>
        </Section>
        <Section title="Operations own their loops">
          <Code>{`const operation = sound.begin("progress.start", {\n  source: "Upload", visibleEquivalent: true,\n});\ntry {\n  await upload();\n  await operation.resolve("state.success");\n} catch {\n  await operation.reject("state.error");\n} finally {\n  operation.stop();\n}`}</Code>
          <p>
            Loops stop after three seconds by default, even if your application forgets. A later
            resolve still emits the outcome. Set <code>maxDurationMs</code> explicitly, up to 30
            seconds, only when independent controls exist. <code>useSoundOperation</code> also stops
            on unmount.
          </p>
        </Section>
        <Section title="Speech and lifecycle">
          <Code>{`sound.setSpeechActive(true); // Stops voices, suppresses low-priority cues.\nsound.setSpeechActive(false);\nawait sound.suspend();      // Stops voices and suspends an owned context.\nawait sound.destroy();      // Terminal. Releases owned resources.`}</Code>
          <p>
            Speech state is explicit: Sonant cannot detect a screen reader or infer that a call has
            started. An injected AudioContext stays application-owned and is never suspended or
            closed by the Web Audio provider.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/accessibility")
    return (
      <>
        <p className="doc-lead">
          Sound is an enhancement. Every interaction should still make sense in silence.
        </p>
        <Section title="Give people control">
          <p>
            Keep a discoverable sound toggle and volume control. The generated kit starts muted.
            Store preferences on the device only when appropriate for your product; do not make a
            shared computer inherit another device’s audio preferences.
          </p>
          <Code>{`const sound = createSoundSystem({\n  preferences: { enabled: false, volume: 0.25 },\n  storage: localPreferences("my-app:interaction-sound"),\n});\n\nsound.setPreferences({ categories: { Navigation: false } });`}</Code>
        </Section>
        <Section title="Keep outcomes visible">
          <p>
            Preserve status text, field errors, and screen-reader announcements.{" "}
            <code>requireVisibleEquivalent</code> requires a developer assertion on outcome events;
            it does not inspect the DOM or prove accessibility.
          </p>
          <p>
            Reduced motion is a separate preference. The website reduces animation without changing
            sound settings. No automatic screen-reader detection is claimed.
          </p>
        </Section>
        <Section title="Make long audio independently controllable">
          <p>
            Automatic audio lasting more than three seconds requires a stop/pause mechanism or
            independent volume control under WCAG guidance. Sonant’s default loop watchdog is three
            seconds; the consuming application remains responsible for accessible controls and
            meaningful use.
          </p>
          <a
            href="https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html"
            target="_blank"
            rel="noreferrer"
          >
            W3C: Audio Control
            <ArrowUpRight size={13} />
          </a>
        </Section>
        <Section title="Audit, then listen">
          <p>
            The CLI flags review candidates using source heuristics. It cannot prove control flow, a
            visible equivalent, or perceptual comfort. Test with keyboard navigation, screen
            readers, real speakers, headphones, and realistic interaction density.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/providers")
    return (
      <>
        <p className="doc-lead">
          Use Sonant’s policy and traces with your own Web Audio engine or audio files.
        </p>
        <Section title="Application-owned context">
          <Code>{`import { createSoundSystem, webAudioProvider } from "${PACKAGE}";\n\nconst context = new AudioContext();\nconst sound = createSoundSystem({\n  provider: webAudioProvider({ context, destination: context.destination }),\n});\n// Your app retains responsibility for closing context.`}</Code>
        </Section>
        <Section title="Sample-backed audio">
          <Code>{`import { htmlAudioProvider } from "${PACKAGE}/providers";\n\nconst sound = createSoundSystem({\n  provider: htmlAudioProvider({\n    "state.success": "/audio/success.wav",\n    "state.error": "/audio/error.wav",\n  }),\n});`}</Code>
          <p>
            Missing mappings produce a provider error in the trace. You own licensing, CORS, file
            availability, and media policy. A playback acceptance is never proof of physical
            audibility.
          </p>
        </Section>
        <Section title="Cuelume, UI SFX, tiks, or a custom engine">
          <p>
            <code>mappedProvider</code> accepts a normalized bridge. Bind the installed version’s
            actual API yourself. Sonant does not import those packages or claim their global state
            can be isolated.
          </p>
          <Code title="Provider bridge">{`import { mappedProvider } from "${PACKAGE}/providers";\n\nconst provider = mappedProvider({\n  name: "My audio engine",\n  mapping: { "state.success": "positive" },\n  unlock: () => myEngine.unlock(),\n  play: (cue, options) => {\n    const handle = myEngine.play(cue, options);\n    return { stop: () => handle.stop(), ended: handle.ended };\n  },\n});\n// myEngine is your application-owned adapter.`}</Code>
          <p>
            A bridge must accurately implement stop and completion. Do not emulate a stoppable loop
            using a fire-and-forget playback API. Direct version-specific adapters are not bundled
            in this release.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/api")
    return (
      <>
        <p className="doc-lead">The complete public surface of the local-first runtime.</p>
        <Section title="Core exports">
          <dl className="api-list">
            <dt>createSoundSystem(options?)</dt>
            <dd>
              Creates an isolated runtime. Options: theme, provider, preferences, storage,
              maxVoices, densityPerSecond, idleSuspendMs, traceLimit, mutedSurfaces, policy,
              requireVisibleEquivalent, and an optional clock function now.
            </dd>
            <dt>emit(event, options?) → Promise&lt;FeedbackHandle&gt;</dt>
            <dd>
              Options: source, surface, visibleEquivalent, loop. The handle has id, decision,
              reason, stop(), and ended. Blocked and suppressed handles complete immediately.
            </dd>
            <dt>begin(event?, options?) → operation</dt>
            <dd>
              Default progress.start. Returns stop(), update(event), resolve(event?),
              reject(event?), and ended. Resolution defaults to progress.complete; rejection
              defaults to progress.fail. Terminal calls are idempotent.
            </dd>
            <dt>setPreferences(partial)</dt>
            <dd>
              Changes enabled, volume (0–1), profile, and category flags. Muting, changing
              categories or profiles stops active voices. Persists through an optional storage
              adapter.
            </dd>
            <dt>setSpeechActive(boolean)</dt>
            <dd>
              Stops voices on speech start. Events below priority 80 are suppressed while speech is
              active.
            </dd>
            <dt>unlock() → Promise&lt;boolean&gt;</dt>
            <dd>
              Call within a trusted gesture. emit also attempts to unlock. False means audio is
              unavailable or blocked.
            </dd>
            <dt>stopAll(), suspend(), destroy()</dt>
            <dd>
              Stop voices; stop and suspend; or terminal cleanup. destroy is async and idempotent.
            </dd>
            <dt>getSnapshot(), getStatus(), subscribe(listener)</dt>
            <dd>
              Snapshot includes preferences, bounded trace, activeVoices, speechActive, destroyed,
              and provider. Status adds the provider audio state. subscribe returns an unsubscribe
              function.
            </dd>
            <dt>clearTrace(), exportTrace()</dt>
            <dd>
              Clear local trace or return a versioned JSON evidence bundle. There is no network
              transport.
            </dd>
            <dt>createTheme(name), validateTheme(value)</dt>
            <dd>
              Create a complete theme or validate all 32 event recipes. Names: studio, soft, arcade.
            </dd>
            <dt>renderPCM(recipe, sampleRate?), encodeWav(samples, sampleRate?)</dt>
            <dd>Deterministic offline rendering, default 44100 Hz. WAV encoding is mono PCM16.</dd>
            <dt>catalog, categories, events</dt>
            <dd>The version 1 semantic event taxonomy and metadata.</dd>
            <dt>localPreferences(key?), bindSounds(root, system, options?)</dt>
            <dd>
              Device-local storage adapter; delegated data-sonant click bindings. Optional hover
              uses data-sonant-hover with mouse movement gating. bindSounds returns an unbind
              function.
            </dd>
            <dt>webAudioProvider(options?)</dt>
            <dd>
              Built-in lazy browser provider. Optional theme, context, and destination. It owns its
              context unless you inject one.
            </dd>
          </dl>
        </Section>
        <Section title="React exports">
          <dl className="api-list">
            <dt>SoundProvider</dt>
            <dd>
              Accepts SoundOptions, children, or an externally owned system. Configuration is read
              once at mount. Create one per intended scope. External systems are disposed by their
              owner.
            </dd>
            <dt>useSound()</dt>
            <dd>
              Reactive preferences, traces, voice counts, and the runtime methods. Requires a
              SoundProvider.
            </dd>
            <dt>useSoundOperation()</dt>
            <dd>
              Returns begin(event, options). Stops the previous operation on reuse and the current
              operation on unmount.
            </dd>
            <dt>SoundInspector</dt>
            <dd>
              A headless render-prop component. Receives children(state) using the same data as
              useSound.
            </dd>
          </dl>
        </Section>
        <Section title="Other entry points">
          <p>
            <code>/providers</code>: mappedProvider, htmlAudioProvider, webAudioProvider.{" "}
            <code>/registry</code>: registry and RegistryItem. <code>/config</code>: packageName,
            createConfig, providerSource, kitFiles. Types are shipped beside every entry point.
          </p>
        </Section>
        <Section title="Decision reasons">
          <p>
            muted, category, profile, speech, background, surface, cooldown, density, voice-limit,
            activation, provider, destroyed, unknown-event, visual-equivalent.
          </p>
          <p>
            “Played” means accepted by a provider. The trace retains the latest 100 decisions by
            default and marks ended voices. It records no audio, user text, or model output.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/cli")
    return (
      <>
        <p className="doc-lead">Inspectable source, safe installation, portable assets.</p>
        <Section title="Commands">
          <Code title="Terminal">{`npx ${PACKAGE}@latest init --theme soft --profile quiet\nnpx ${PACKAGE}@latest add sound-button sound-settings\nnpx ${PACKAGE}@latest list\nnpx ${PACKAGE}@latest audit --json\nnpx ${PACKAGE}@latest test --theme studio\nnpx ${PACKAGE}@latest export --theme soft --out audio\nnpx ${PACKAGE}@latest compile --out branded-audio`}</Code>
          <p>
            <code>init</code> creates configuration, provider, and a complete editable theme.{" "}
            <code>add</code> copies selected components. <code>export</code> renders a built-in
            theme. <code>compile</code> validates and renders your installed theme, plus a
            TypeScript object.
          </p>
          <p>
            All writing commands accept <code>--dry-run</code> and <code>--cwd</code>. Existing
            files and symlinks are refused. The CLI never edits your package manifest, installs
            dependencies, or mounts a provider automatically.
          </p>
        </Section>
        <Section title="Copy-in registry">
          <dl className="api-list">
            {Object.entries(registry).map(([name, item]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section title="Audit is a review aid">
          <p>
            <code>audit</code> reports likely missing operation cleanup, unasserted visible
            outcomes, hover density, and realm-sensitive DOM checks. It reads source; it does not
            execute applications or prove accessibility. <code>--strict</code> exits 1 when review
            hints exist. <code>--json</code> produces structured findings.
          </p>
        </Section>
        <Section title="Recipe checks">
          <p>
            <code>test</code> checks completeness, finite samples, per-cue sample peaks, and tail
            silence for a built-in theme. It does not certify true peaks, LUFS, perceptual
            distinctiveness, or real-device playback.
          </p>
        </Section>
        <Section title="Configuration">
          <Code title="sonant.config.json">{`{\n  "schemaVersion": 1,\n  "theme": "studio",\n  "preferences": {\n    "enabled": false,\n    "volume": 0.35,\n    "profile": "balanced"\n  },\n  "directory": "components/sonant"\n}`}</Code>
          <p>
            Configuration controls subsequent CLI copies and compilation. Runtime preferences live
            in the copied provider; changing configuration alone does not rewrite installed source.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/ai")
    return (
      <>
        <p className="doc-lead">Give your coding agent a small, explicit integration brief.</p>
        <div className="ai-prompt">
          <pre>{aiPrompt}</pre>
          <CopyButton value={aiPrompt} label="Copy agent prompt" />
        </div>
        <Section title="A useful review checklist">
          <p>
            Verify one provider per intended scope, native keyboard activation, device-local
            controls, confirmed outcomes, deterministic loop cleanup, and a meaningful silent
            experience. Review the actual generated patch before shipping.
          </p>
          <p>
            The public repository includes <code>AGENTS.md</code> for source contributors and a
            compact <code>llms.txt</code> for product integration. Neither grants an agent authority
            to publish or alter your application.
          </p>
        </Section>
      </>
    );
  if (route === "/docs/compatibility")
    return (
      <>
        <p className="doc-lead">
          Early release. Explicit limits. Evidence over blanket compatibility claims.
        </p>
        <Section title="Runtime requirements">
          <p>
            Modern browsers with Web Audio, ESM support, and a user gesture for playback. Server
            imports are safe: the audio context is lazy. React 18/19 are supported peers; Next.js
            integrations use a client provider. The core has no runtime dependencies.
          </p>
          <p>
            Desktop automated browser coverage is recorded in the repository’s release evidence.
            Real-device Safari, Android, Bluetooth, screen-reader, and subjective listening checks
            require manual release review.
          </p>
        </Section>
        <Section title="Known limits">
          <p>
            No haptic renderer, cloud telemetry, experiment measurement, team registry, native
            compiler, Ogg export, or version-specific third-party engine adapters are bundled. The
            static auditor is deliberately advisory. Playback traces cannot measure device output.
          </p>
          <p>
            Use explicit speech state and preference controls. Sonant does not detect assistive
            technologies. Test production routes, browser activation, iframe contexts, and
            shared-device preferences in your own application.
          </p>
        </Section>
        <Section title="v0.1.0">
          <p>
            Initial runtime, 32 semantic cues, three original procedural characters, React hooks,
            copy-in components, deterministic WAV export, kit builder, source review, and local
            diagnostics.
          </p>
          <a href={`${REPO}/releases`} target="_blank" rel="noreferrer">
            Release notes
            <ArrowUpRight size={13} />
          </a>
        </Section>
      </>
    );
  return (
    <p>
      This documentation page does not exist. <a href="#/docs">Go to the introduction.</a>
    </p>
  );
}
