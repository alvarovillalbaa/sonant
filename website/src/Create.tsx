import { useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, Circle, Play, Sparkles } from "lucide-react";
import { catalog, type Profile, type ThemeName } from "@alvarovillalbaa/sonant";
import { useSound } from "@alvarovillalbaa/sonant/react";
import { createConfig, kitFiles } from "@alvarovillalbaa/sonant/config";
import { registry, type RegistryItem } from "@alvarovillalbaa/sonant/registry";
import { Code, CopyButton, PACKAGE, Waveform, download } from "./ui";

const characters = [{ id: "studio", name: "Studio", label: "PRECISE & BALANCED", description: "Soft sine tones. A considered everyday voice for your product." }, { id: "soft", name: "Soft", label: "WARM & UNHURRIED", description: "Lower, rounder, gentler. Feedback that leaves a little space." }, { id: "arcade", name: "Arcade", label: "BRIGHT & PLAYFUL", description: "Crisp triangle tones. A touch of energy in every interaction." }] as const;
export function Create({ theme, setTheme }: { theme: ThemeName; setTheme: (theme: ThemeName) => void }) {
  const sound = useSound(); const [profile, setProfile] = useState<Profile>("balanced"); const [volume, setVolume] = useState(0.35);
  const [items, setItems] = useState<RegistryItem[]>(["sound-button", "sound-settings"]); const [notice, setNotice] = useState("");
  const config = createConfig({ theme, profile, volume, enabled: false });
  const command = `npx ${PACKAGE}@latest init --theme ${theme} --profile ${profile} --volume ${volume}\n${items.length ? `npx ${PACKAGE}@latest add ${items.join(" ")}` : ""}`.trim();
  const files = { ...kitFiles(config), ...Object.fromEntries(items.map(name => [`${config.directory}/${registry[name].file}`, registry[name].source])) };
  return <div className="create-page"><section className="page-intro"><div className="hero-label"><Sparkles size={13} /><span>THE KIT BUILDER</span></div><h1>Find your interface’s<br /><span>signature sound.</span></h1><p>A few choices. A coherent sound system. Source code you own.</p></section>
    <div className="builder-layout"><div className="builder-options"><section className="builder-section"><div className="step-title"><span>01</span><div><h2>Choose a character</h2><p>Same interactions. A different personality.</p></div></div>
      <div className="character-grid">{characters.map(c => <button className={`character-card ${theme === c.id ? "selected" : ""}`} key={c.id} aria-pressed={theme === c.id} onClick={() => setTheme(c.id)}><span className="choice-check">{theme === c.id ? <Check size={14} /> : <Circle size={14} />}</span><Waveform event="state.success" theme={c.id} /><span className="eyebrow">{c.label}</span><strong>{c.name}</strong><p>{c.description}</p></button>)}</div>
    </section><section className="builder-section"><div className="step-title"><span>02</span><div><h2>Set the level of expression</h2><p>Give feedback the right amount of room.</p></div></div>
      <div className="profile-options">{(["quiet", "balanced", "expressive"] as Profile[]).map(p => <button key={p} className={profile === p ? "selected" : ""} aria-pressed={profile === p} onClick={() => setProfile(p)}><span>{p}{profile === p && <Check size={14} />}</span><p>{p === "quiet" ? "Outcomes and important updates." : p === "balanced" ? "A considered mix. Our recommendation." : "More room for tactile interaction."}</p></button>)}</div>
      <label className="builder-volume"><span>Default volume</span><input aria-label="Default installation volume" type="range" min="0.05" max="1" step="0.05" value={volume} onChange={e => setVolume(Number(e.target.value))} /><strong>{Math.round(volume * 100)}%</strong></label>
    </section><section className="builder-section"><div className="step-title"><span>03</span><div><h2>Make it useful</h2><p>Copy in the components you need. Make them your own.</p></div></div>
      <div className="component-choices">{(Object.keys(registry) as RegistryItem[]).map(name => <label key={name}><input type="checkbox" checked={items.includes(name)} onChange={e => setItems(e.target.checked ? [...items, name] : items.filter(item => item !== name))} /><span><strong>{name}</strong><small>{registry[name].description}</small></span></label>)}</div>
    </section></div><aside className="builder-summary"><div className="summary-top"><span className="eyebrow">YOUR SOUND KIT</span><span className="tag">v0.1.0</span></div><Waveform event="state.success" theme={theme} large /><h2>{characters.find(c => c.id === theme)!.name}<span className="accent-dot">.</span></h2><p>{profile} · {Math.round(volume * 100)}% volume · sound off until opt-in</p>
      <div className="summary-preview"><span>TAKE IT FOR A SPIN</span>{(["action.select", "state.success", "state.error"] as const).map(event => <button key={event} onClick={async () => { const handle = await sound.emit(event, { source: "KitBuilder", visibleEquivalent: true }); setNotice(handle.decision === "played" ? `Previewed ${event}. Your installation uses the settings shown above.` : `Preview ${handle.decision}: ${handle.reason}. Use Sound on in the header.`); }}><Play size={11} fill="currentColor" />{catalog.find(c => c[0] === event)![1]}</button>)}</div>
      <p role="status" className="builder-notice">{notice || "Character previews use your website volume and profile."}</p><Code title="Install your kit">{command}</Code>
      <div className="file-tree"><span>YOU OWN THESE FILES</span>{Object.keys(files).map(path => <code key={path}>{path.replace("components/sonant/", "↳ ")}</code>)}</div>
      <button className="button primary full" onClick={() => download("sonant-kit.json", JSON.stringify({ format: "sonant-kit-v1", files }, null, 2))}><ArrowDownToLine size={15} />Download source bundle</button>
      <p className="bundle-note">A JSON bundle with every source file and its path. The CLI writes these files directly.</p><CopyButton value={command} label="Copy installation commands" /><a className="summary-docs" href="#/docs/installation">Installation guide<ArrowRight size={14} /></a>
    </aside></div></div>;
}
