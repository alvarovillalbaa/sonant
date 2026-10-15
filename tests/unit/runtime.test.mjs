// Data tier T2: synthetic provider and in-memory preferences. No service calls.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSoundSystem, createTheme, validateTheme, renderPCM, encodeWav, events } from "../../packages/sonant/dist/index.js";

function engine(overrides = {}) {
  const played = []; const stopped = [];
  const provider = { name: "test", unlock: async () => true, play(event, options) {
    played.push({ event, options }); let finish;
    const ended = new Promise(resolve => { finish = resolve; });
    return { ended, stop() { stopped.push(event); finish(); } };
  }, ...overrides };
  return { provider, played, stopped };
}

test("all characters implement the complete deterministic contract with silent tails", () => {
  for (const character of ["studio", "soft", "arcade"]) {
    const theme = createTheme(character); assert.ok(validateTheme(theme));
    assert.equal(Object.keys(theme).length, 32);
    for (const event of events) {
      const a = renderPCM(theme[event]); const b = renderPCM(theme[event]);
      assert.deepEqual(a, b); assert.ok(a.every(Number.isFinite));
      assert.ok(a.some(x => Math.abs(x) > 0.01));
      assert.ok(a.every(x => Math.abs(x) < 0.5));
      assert.ok(a.slice(-400).every(x => Math.abs(x) < 0.001));
      const wav = encodeWav(a); assert.equal(Buffer.from(wav.subarray(0, 4)).toString(), "RIFF");
      assert.equal(wav.length, 44 + a.length * 2);
    }
  }
});
test("validation rejects incomplete, non-finite and out-of-budget recipes", () => {
  assert.equal(validateTheme({}), false);
  const theme = createTheme(); theme["state.error"].tones[0].frequency = NaN;
  assert.equal(validateTheme(theme), false);
  assert.throws(() => renderPCM({ duration: 1000, tones: [] }));
  assert.throws(() => renderPCM({ duration: 0.5, tones: [{ delay: -Infinity }] }));
  const invalid = createTheme(); invalid["state.error"].tones = [null]; assert.equal(validateTheme(invalid), false);
});
test("server imports and unavailable audio are safe and observable", async () => {
  const sound = createSoundSystem();
  assert.equal((await sound.emit("action.select")).reason, "activation");
  assert.equal(sound.getSnapshot().activeVoices, 0); await sound.destroy();
});
test("muting stops a live voice and persists bounded preferences", async () => {
  const e = engine(); const saves = [];
  const sound = createSoundSystem({ provider: e.provider, storage: { load: () => null, save: p => saves.push(p) } });
  const handle = await sound.emit("state.success"); assert.equal(handle.decision, "played");
  sound.setPreferences({ enabled: false, volume: 9 }); await handle.ended;
  assert.equal(sound.getSnapshot().activeVoices, 0); assert.ok(e.stopped.length);
  assert.equal((await sound.emit("state.error")).reason, "muted");
  assert.equal(saves.at(-1).volume, 1); await sound.destroy();
});
test("cooldown and voice reservations cover concurrent unlocks", async () => {
  let unlock; const e = engine({ unlock: () => new Promise(resolve => { unlock = resolve; }) });
  const sound = createSoundSystem({ provider: e.provider });
  const first = sound.emit("action.select");
  assert.equal((await sound.emit("action.select")).reason, "cooldown");
  assert.equal(sound.getSnapshot().activeVoices, 1);
  unlock(true); assert.equal((await first).decision, "played"); assert.equal(e.played.length, 1); await sound.destroy();
});
test("cancellation during unlock never reaches the renderer", async () => {
  let unlock; const e = engine({ unlock: () => new Promise(resolve => { unlock = resolve; }) });
  const sound = createSoundSystem({ provider: e.provider }); const operation = sound.begin();
  operation.stop(); assert.equal(sound.getSnapshot().activeVoices, 0); unlock(true);
  await operation.ended; await new Promise(resolve => setImmediate(resolve));
  assert.equal(e.played.length, 0); assert.equal(sound.getSnapshot().trace.at(-1).reason, "cancelled"); await sound.destroy();
});
test("high-priority failure interrupts a lower-priority voice", async () => {
  const e = engine(); const sound = createSoundSystem({ provider: e.provider, maxVoices: 1 });
  await sound.emit("action.press"); assert.equal((await sound.emit("action.select")).reason, "voice-limit");
  assert.equal((await sound.emit("state.error")).decision, "played"); assert.ok(e.stopped.includes("action.press"));
  assert.equal(sound.getSnapshot().activeVoices, 1); await sound.destroy();
});
test("quiet, speech, category, surface, density and visible-equivalent policies are explicit", async () => {
  const e = engine(); const sound = createSoundSystem({ provider: e.provider, densityPerSecond: 1, mutedSurfaces: ["exam"], requireVisibleEquivalent: true });
  sound.setPreferences({ profile: "quiet" }); assert.equal((await sound.emit("action.press")).reason, "profile");
  assert.equal((await sound.emit("state.success")).reason, "visual-equivalent");
  assert.equal((await sound.emit("state.success", { visibleEquivalent: true, surface: "exam" })).reason, "surface");
  sound.setPreferences({ profile: "balanced", categories: { Navigation: false } });
  assert.equal((await sound.emit("overlay.open")).reason, "category"); sound.setSpeechActive(true);
  assert.equal((await sound.emit("action.select")).reason, "speech"); sound.setSpeechActive(false);
  await sound.emit("action.press"); assert.equal((await sound.emit("action.release")).reason, "density"); await sound.destroy();
});
test("watchdog stops loops but a later real result still emits exactly once", async () => {
  const e = engine(); const sound = createSoundSystem({ provider: e.provider, policy: { "progress.start": { maxDurationMs: 15 } } });
  const op = sound.begin(); await op.ended;
  assert.equal(sound.getSnapshot().activeVoices, 0); await op.resolve("state.success"); await op.reject("state.error");
  assert.deepEqual(e.played.map(p => p.event), ["progress.start", "state.success"]); await sound.destroy();
});
test("destroy during async provider playback releases the eventual voice", async () => {
  let resolvePlay; let stopped = false;
  const e = engine({ play: () => new Promise(resolve => { resolvePlay = resolve; }) });
  const sound = createSoundSystem({ provider: e.provider }); const pending = sound.emit("action.select");
  await new Promise(resolve => setImmediate(resolve)); await sound.destroy();
  resolvePlay({ stop() { stopped = true; }, ended: Promise.resolve() });
  assert.equal((await pending).reason, "destroyed"); assert.equal(stopped, true);
});
test("provider failures are isolated and traces remain bounded and exportable", async () => {
  const e = engine({ play() { throw new Error("broken provider"); } });
  const sound = createSoundSystem({ provider: e.provider, traceLimit: 2, now: () => 1234 });
  assert.equal((await sound.emit("action.select")).decision, "error");
  await sound.emit("state.error"); await sound.emit("invalid-event");
  const data = JSON.parse(sound.exportTrace()); assert.equal(data.trace.length, 2); assert.equal(data.schemaVersion, 1);
  assert.equal(data.trace.at(-1).reason, "unknown-event"); assert.equal(sound.getSnapshot().activeVoices, 0); await sound.destroy();
});
test("malformed stored preferences cannot erase safe defaults", async () => {
  const e = engine(); const sound = createSoundSystem({ provider: e.provider, storage: { load: () => ({ enabled: "yes", volume: NaN, profile: "loud", categories: null }), save() { throw new Error("private mode"); } } });
  assert.equal(sound.getSnapshot().preferences.volume, 0.35); assert.equal(sound.getSnapshot().preferences.profile, "balanced");
  sound.setPreferences({ enabled: false }); await sound.destroy();
});
