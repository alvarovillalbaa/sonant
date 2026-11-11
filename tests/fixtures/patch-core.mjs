// Runs after copying into a fresh installed consumer; imports resolve there.
import assert from 'node:assert/strict';
import { events, createSoundSystem, createTheme, validateTheme, renderPCM, encodeWav, webAudioProvider } from '@alvarovillalbaa/sonant';
import { mappedProvider } from '@alvarovillalbaa/sonant/providers';
import { registry } from '@alvarovillalbaa/sonant/registry';
import { createConfig, kitFiles } from '@alvarovillalbaa/sonant/config';

assert.equal(events.length, 32);
assert.equal(typeof mappedProvider, 'function');
assert.deepEqual(Object.keys(registry).sort(), ['async-action', 'sound-button', 'sound-settings', 'sound-switch']);
assert.equal(createConfig().preferences.enabled, false);
assert.ok(kitFiles(createConfig())['components/sonant/provider.tsx'].includes('SoundProvider'));
const theme = createTheme('soft'); assert.ok(validateTheme(theme));
const bytes = encodeWav(renderPCM(theme['state.success']));
assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), 'RIFF');
const system = createSoundSystem({ preferences: { enabled: false } });
assert.equal((await system.emit('state.success', { visibleEquivalent: true })).reason, 'muted');
await system.destroy();

// An authored Web Audio contract fixture, not a native browser or listening test.
const sources = []; let contextClosed = false;
const context = {
  state: 'running', sampleRate: 44100, destination: {},
  createGain: () => ({ gain: { value: 0, setTargetAtTime() {} }, connect() {}, disconnect() {} }),
  createBuffer(channels, length, rate) {
    assert.equal(channels, 1); const data = new Float32Array(length);
    return { duration: length / rate, copyToChannel: value => data.set(value), getChannelData: () => data };
  },
  createBufferSource() {
    let buffer, sets = 0;
    const source = { loop: false, started: false, stopped: false, connect() {}, disconnect() {},
      start() { this.started = true; }, stop() { this.stopped = true; }, get sets() { return sets; } };
    Object.defineProperty(source, 'buffer', { get: () => buffer, set(value) {
      if (value !== null && sets) throw new DOMException('A non-null buffer can only be assigned once', 'InvalidStateError');
      if (value !== null) sets++; buffer = value;
    } });
    sources.push(source); return source;
  },
  close: async () => { contextClosed = true; },
};
const provider = webAudioProvider({ context });
assert.equal(await provider.unlock(), true);
const voice = provider.play('agent.thinking', { volume: 0.35, loop: true, signal: new AbortController().signal });
assert.ok(voice && sources.length === 1 && sources[0].started && sources[0].loop);
assert.equal(sources[0].sets, 1); assert.equal(sources[0].buffer.duration, 1);
voice.stop(); await voice.ended; assert.equal(sources[0].stopped, true);
await provider.destroy(); assert.equal(contextClosed, false);
console.log('PASS: installed public core/providers/config/registry, SSR-safe mute and single-assignment loop fixture');
