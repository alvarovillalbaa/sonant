import { useState } from "react";
import { Activity, ArrowDownToLine, CircleHelp, Play, Radio, Trash2, Volume2 } from "lucide-react";
import { useSound } from "@alvarovillalbaa/sonant/react";
import type { Profile, SoundEvent } from "@alvarovillalbaa/sonant";
import { download } from "./ui";

export function Devtools() {
  const sound = useSound();
  const [filter, setFilter] = useState("");
  const [decision, setDecision] = useState("all");
  const trace = [...sound.trace]
    .reverse()
    .filter(
      (entry) =>
        `${entry.event} ${entry.source ?? ""} ${entry.reason ?? ""}`
          .toLowerCase()
          .includes(filter.toLowerCase()) &&
        (decision === "all" || entry.decision === decision),
    );
  const played = sound.trace.filter((e) => e.decision === "played").length;
  return (
    <div className="devtools-page">
      <section className="page-intro">
        <span className="eyebrow">THE LISTENING ROOM</span>
        <h1>
          Know what played.
          <br />
          <span>Understand what didn’t.</span>
        </h1>
        <p>
          Live, local diagnostics from this website’s actual sound system. No account. No telemetry.
        </p>
      </section>
      <div className="devtools-metrics">
        <article>
          <Activity size={17} />
          <span>Active voices</span>
          <strong>
            {sound.activeVoices}
            <small> / 4</small>
          </strong>
        </article>
        <article>
          <Radio size={17} />
          <span>Audio context</span>
          <strong className="context-state">{sound.getStatus().audio}</strong>
        </article>
        <article>
          <Volume2 size={17} />
          <span>Accepted by provider</span>
          <strong>
            {played}
            <small> / {sound.trace.length}</small>
          </strong>
        </article>
        <article>
          <CircleHelp size={17} />
          <span>Suppressed or blocked</span>
          <strong>{sound.trace.length - played}</strong>
        </article>
      </div>
      <div className="devtools-controls">
        <div>
          <span className="eyebrow">TRY THE POLICY</span>
          <div className="segmented">
            {(["quiet", "balanced", "expressive"] as Profile[]).map((profile) => (
              <button
                key={profile}
                aria-pressed={sound.preferences.profile === profile}
                onClick={() => sound.setPreferences({ profile })}
              >
                {profile}
              </button>
            ))}
          </div>
        </div>
        <label className="speech-control">
          <input
            type="checkbox"
            checked={sound.speechActive}
            onChange={(e) => sound.setSpeechActive(e.target.checked)}
          />
          <span>
            Speech is active<small>Suppress low-priority cues</small>
          </span>
        </label>
        <button
          className="button secondary"
          onClick={() => {
            for (let i = 0; i < 8; i++)
              void sound.emit("action.select", { source: "PolicyBurst", surface: "devtools" });
          }}
        >
          Trigger a burst
          <Activity size={15} />
        </button>
        <button
          className="button primary"
          onClick={() =>
            void sound.emit("state.error", {
              source: "PriorityDemo",
              surface: "devtools",
              visibleEquivalent: true,
            })
          }
        >
          Try an error
          <Play size={13} />
        </button>
      </div>
      <div className="trace-panel">
        <div className="trace-toolbar">
          <div>
            <span className="status-dot" />
            <strong>EVENT TRACE</strong>
            <span className="tag">{sound.trace.length} events</span>
          </div>
          <div>
            <button
              className="button text small"
              onClick={() => download("sonant-trace.json", sound.exportTrace())}
            >
              <ArrowDownToLine size={14} />
              Export JSON
            </button>
            <button className="icon-button" aria-label="Clear trace" onClick={sound.clearTrace}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <div className="trace-filters">
          <input
            aria-label="Filter trace"
            placeholder="Filter by event, source, or reason…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select
            aria-label="Filter by decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <option value="all">All decisions</option>
            <option value="played">Played</option>
            <option value="suppressed">Suppressed</option>
            <option value="blocked">Blocked</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="trace-scroll">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Semantic event</th>
                <th>Source / surface</th>
                <th>Decision</th>
                <th>Reason / lifecycle</th>
                <th>
                  <span className="sr-only">Replay</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {trace.map((entry) => (
                <tr key={entry.id}>
                  <td className="trace-time">
                    {new Date(entry.time).toLocaleTimeString("en-GB", { hour12: false })}
                  </td>
                  <td>
                    <code>{entry.event}</code>
                  </td>
                  <td>
                    {entry.source ?? "—"}
                    <small>{entry.surface ?? "global"}</small>
                  </td>
                  <td>
                    <span className={`decision ${entry.decision}`}>{entry.decision}</span>
                  </td>
                  <td>
                    {entry.reason ??
                      (entry.active ? (entry.loop ? "Active loop" : "Active voice") : "Ended")}
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Replay ${entry.event}`}
                      onClick={() =>
                        void sound.emit(entry.event as SoundEvent, {
                          source: "TraceReplay",
                          surface: "devtools",
                          visibleEquivalent: true,
                        })
                      }
                    >
                      <Play size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!trace.length && (
          <div className="empty-state">
            <Activity size={28} />
            <h3>{sound.trace.length ? "No matching events." : "A quiet start."}</h3>
            <p>
              {sound.trace.length
                ? "Change your filters to find an event."
                : "Preview a sound or trigger a burst. Every decision will appear here."}
            </p>
          </div>
        )}
      </div>
      <p className="devtools-note">
        “Played” means the provider accepted a voice. It cannot prove your device was audible. Only
        event names, source labels, policy decisions, and preferences are kept in this bounded local
        trace.
      </p>
    </div>
  );
}
