import { useState, type ReactNode } from "react";
import { Check, Copy, ArrowUpRight, AudioLines } from "lucide-react";
import { createTheme, renderPCM, type SoundEvent, type ThemeName } from "@alvarovillalbaa/sonant";

export function Logo() { return <a className="logo" href="#/" aria-label="Sonant home"><AudioLines size={27} strokeWidth={2.4} /><span>sonant<span className="logo-dot">.</span></span></a>; }
export function External({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<ArrowUpRight size={15} /></a>;
}
export function CopyButton({ value, label = "Copy", compact = false }: { value: string; label?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  return <button className={`copy-button ${compact ? "compact" : ""}`} aria-label={state === "copied" ? "Copied" : label} onClick={async () => {
    try { await navigator.clipboard.writeText(value); setState("copied"); } catch { setState("error"); }
    window.setTimeout(() => setState("idle"), 2000);
  }}>{state === "copied" ? <Check size={15} /> : <Copy size={15} />}{!compact && <span role="status">{state === "copied" ? "Copied" : state === "error" ? "Select to copy" : label}</span>}</button>;
}
export function Code({ children, title = "React / Next.js" }: { children: string; title?: string }) {
  return <div className="code-block"><div className="code-top"><span>{title}</span><CopyButton value={children} compact /></div><pre><code>{children}</code></pre></div>;
}
const waveCache = new Map<string, number[]>();
export function Waveform({ event, theme = "studio", large = false, playing = false }: { event: SoundEvent; theme?: ThemeName; large?: boolean; playing?: boolean }) {
  const key = `${theme}:${event}`;
  let bars = waveCache.get(key);
  if (!bars) {
    const pcm = renderPCM(createTheme(theme)[event], 8000);
    bars = Array.from({ length: 49 }, (_, i) => {
      const slice = pcm.subarray(Math.floor(i * pcm.length / 49), Math.floor((i + 1) * pcm.length / 49));
      return Math.max(1.6, Math.sqrt(slice.reduce((sum, n) => sum + n * n, 0) / slice.length) * 360);
    });
    waveCache.set(key, bars);
  }
  return <svg className={`waveform ${large ? "large" : ""} ${playing ? "playing" : ""}`} viewBox="0 0 196 64" aria-hidden="true">
    <path d="M0 32h196" className="wave-axis" />
    {bars.map((height, i) => <path key={i} d={`M${i * 4 + 2} ${32 - height / 2}v${height}`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />)}
  </svg>;
}
export const PACKAGE = "@alvarovillalbaa/sonant";
export const REPO = "https://github.com/alvarovillalbaa/sonant";
export type Manager = "npm" | "pnpm" | "yarn" | "bun";
export function installCommand(manager: Manager, cli = false) {
  return cli ? ({ npm: `npx ${PACKAGE}@latest init`, pnpm: `pnpm dlx ${PACKAGE}@latest init`, yarn: `yarn dlx ${PACKAGE}@latest init`, bun: `bunx ${PACKAGE}@latest init` })[manager]
    : `${manager} ${manager === "npm" ? "install" : "add"} ${PACKAGE}`;
}
export function Install({ cli = false }: { cli?: boolean }) {
  const [manager, setManager] = useState<Manager>("npm");
  return <div className="install"><div className="manager-tabs" aria-label="Package manager">{(["npm", "pnpm", "yarn", "bun"] as Manager[]).map(m => <button key={m} aria-pressed={m === manager} onClick={() => setManager(m)}>{m}</button>)}</div>
    <div className="install-command"><span className="prompt">$</span><code>{installCommand(manager, cli)}</code><CopyButton value={installCommand(manager, cli)} compact /></div></div>;
}
export function download(name: string, content: BlobPart, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
