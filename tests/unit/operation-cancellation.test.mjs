// T2: controlled providers and deferred promises; no browser, audio device or service.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createSoundSystem } from "../../packages/sonant/dist/index.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

const turn = () => new Promise((resolve) => setImmediate(resolve));

async function settled(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Expected bounded settlement")), 500);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function voice(onStop) {
  const completion = deferred();
  const value = {
    stopCalls: 0,
    ended: completion.promise,
    finish: completion.resolve,
    stop() {
      value.stopCalls++;
      completion.resolve();
      onStop?.();
    },
  };
  return value;
}

function fixture({ unlock, play, ...options } = {}) {
  const calls = [];
  const voices = [];
  let unlockCalls = 0;
  const sound = createSoundSystem({
    ...options,
    provider: {
      name: "operation-cancellation-fixture",
      unlock() {
        unlockCalls++;
        return unlock ? unlock() : Promise.resolve(true);
      },
      play(event, detail) {
        calls.push({ event, detail });
        if (play) return play(event, detail);
        const next = voice();
        voices.push(next);
        return next;
      },
    },
  });
  return { sound, calls, voices, get unlockCalls() { return unlockCalls; } };
}

function abortListeners(signal) {
  const add = signal.addEventListener;
  const remove = signal.removeEventListener;
  const active = new Set();
  const added = [];
  const removed = [];
  signal.addEventListener = function (type, listener, options) {
    if (type === "abort") {
      active.add(listener);
      added.push(listener);
    }
    return add.call(this, type, listener, options);
  };
  signal.removeEventListener = function (type, listener, options) {
    if (type === "abort") {
      active.delete(listener);
      removed.push(listener);
    }
    return remove.call(this, type, listener, options);
  };
  return {
    active, added, removed,
    restore() {
      signal.addEventListener = add;
      signal.removeEventListener = remove;
    },
  };
}

test("a pre-aborted caller never unlocks or plays and its operation settles", { timeout: 2000 }, async () => {
  const caller = new AbortController();
  caller.abort();
  const f = fixture();
  try {
    const operation = f.sound.begin("progress.start", { signal: caller.signal });
    assert.equal(f.unlockCalls, 0);
    assert.deepEqual(f.calls, []);
    await settled(operation.ended);
    await operation.update("action.select");
    await operation.resolve("state.success");
    await operation.reject("state.error");
    assert.equal(f.unlockCalls, 0);
    assert.deepEqual(f.calls, []);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
  } finally {
    await f.sound.destroy();
  }
});

test("caller cancellation during pending unlock prevents late progress playback", { timeout: 2000 }, async () => {
  const unlock = deferred();
  const caller = new AbortController();
  const f = fixture({ unlock: () => unlock.promise });
  try {
    const operation = f.sound.begin("progress.start", { signal: caller.signal });
    assert.equal(f.unlockCalls, 1);
    caller.abort();
    await settled(operation.ended);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
    unlock.resolve(true);
    await turn();
    assert.deepEqual(f.calls, []);
    assert.equal(f.sound.getSnapshot().trace.at(-1).reason, "cancelled");
  } finally {
    unlock.resolve(true);
    await f.sound.destroy();
  }
});

test("caller cancellation during pending progress playback releases its eventual voice", { timeout: 2000 }, async () => {
  const playback = deferred();
  const late = voice();
  const caller = new AbortController();
  const f = fixture({ play: () => playback.promise });
  try {
    const operation = f.sound.begin("progress.start", { signal: caller.signal });
    await turn();
    assert.equal(f.calls.length, 1);
    caller.abort();
    await settled(operation.ended);
    assert.equal(f.calls[0].detail.signal.aborted, true);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
    playback.resolve(late);
    await turn();
    assert.ok(late.stopCalls >= 1);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
  } finally {
    playback.resolve(late);
    await f.sound.destroy();
  }
});

test("caller abort stops active progress and a pending update despite synchronous terminal reentry", { timeout: 2000 }, async () => {
  const updatePlayback = deferred();
  const progress = voice();
  const lateUpdate = voice();
  const caller = new AbortController();
  let operation;
  let reentered = [];
  caller.signal.addEventListener("abort", () => {
    reentered = [operation.update("state.warning"), operation.resolve("state.success")];
  }, { once: true });
  const f = fixture({ play: (event) => event === "progress.start" ? progress : updatePlayback.promise });
  try {
    operation = f.sound.begin("progress.start", { signal: caller.signal });
    await turn();
    const update = operation.update("action.select");
    await turn();
    assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", "action.select"]);
    caller.abort();
    await settled(Promise.all([operation.ended, update, ...reentered]));
    assert.ok(progress.stopCalls >= 1);
    assert.ok(f.calls.every((call) => call.detail.signal.aborted));
    updatePlayback.resolve(lateUpdate);
    await turn();
    assert.ok(lateUpdate.stopCalls >= 1);
    assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", "action.select"]);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
  } finally {
    updatePlayback.resolve(lateUpdate);
    await f.sound.destroy();
  }
});

test("explicit operation stop cancels a pending update as well as progress", { timeout: 2000 }, async () => {
  const updatePlayback = deferred();
  const progress = voice();
  const lateUpdate = voice();
  const f = fixture({ play: (event) => event === "progress.start" ? progress : updatePlayback.promise });
  try {
    const operation = f.sound.begin();
    await turn();
    const update = operation.update("action.select");
    await turn();
    operation.stop();
    operation.stop();
    await settled(Promise.all([operation.ended, update]));
    assert.ok(progress.stopCalls >= 1);
    assert.ok(f.calls.every((call) => call.detail.signal.aborted));
    updatePlayback.resolve(lateUpdate);
    await turn();
    assert.ok(lateUpdate.stopCalls >= 1);
    await operation.resolve("state.success");
    await operation.reject("state.error");
    assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", "action.select"]);
    assert.equal(f.sound.getSnapshot().activeVoices, 0);
  } finally {
    updatePlayback.resolve(lateUpdate);
    await f.sound.destroy();
  }
});

test("watchdog completion permits a real result while later caller abort cancels renewed updates and outcomes", { timeout: 2000 }, async () => {
  const normal = fixture({ policy: { "progress.start": { maxDurationMs: 10 } } });
  try {
    const operation = normal.sound.begin();
    await settled(operation.ended);
    assert.equal(normal.sound.getSnapshot().activeVoices, 0);
    const outcome = await operation.resolve("state.success");
    assert.equal(outcome.decision, "played");
    assert.deepEqual(normal.calls.map((call) => call.event), ["progress.start", "state.success"]);
  } finally {
    await normal.sound.destroy();
  }

  const caller = new AbortController();
  const renewed = fixture({ policy: { "progress.start": { maxDurationMs: 10 } } });
  try {
    const operation = renewed.sound.begin("progress.start", { signal: caller.signal });
    await settled(operation.ended);
    const update = await operation.update("action.select");
    assert.equal(update.decision, "played");
    assert.equal(renewed.sound.getSnapshot().activeVoices, 1);
    caller.abort();
    await settled(update.ended);
    assert.ok(renewed.voices[1].stopCalls >= 1);
    await operation.update("state.warning");
    await operation.resolve("state.success");
    await operation.reject("state.error");
    assert.deepEqual(renewed.calls.map((call) => call.event), ["progress.start", "action.select"]);
    assert.equal(renewed.sound.getSnapshot().activeVoices, 0);
  } finally {
    await renewed.sound.destroy();
  }
});

test("resolve and reject settle once under provider reentry without cancelling their confirmed outcome", { timeout: 2000 }, async () => {
  for (const method of ["resolve", "reject"]) {
    let operation;
    const reentered = [];
    const progress = voice(() => {
      reentered.push(operation[method === "resolve" ? "reject" : "resolve"]());
    });
    const outcome = voice();
    const f = fixture({ play: (event) => event === "progress.start" ? progress : outcome });
    try {
      operation = f.sound.begin();
      await turn();
      const result = await operation[method]();
      await Promise.all(reentered);
      await operation.resolve();
      await operation.reject();
      assert.equal(result.decision, "played");
      assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", method === "resolve" ? "progress.complete" : "progress.fail"]);
      assert.equal(f.calls[0].detail.signal.aborted, true);
      assert.equal(f.calls[1].detail.signal.aborted, false);
      assert.equal(f.sound.getSnapshot().activeVoices, 1);
      assert.equal(outcome.stopCalls, 0);
    } finally {
      await f.sound.destroy();
    }
  }
});

test("caller listeners detach when progress ends or settles while an asynchronous outcome remains cancellable", { timeout: 2000 }, async () => {
  const caller = new AbortController();
  const listeners = abortListeners(caller.signal);
  const natural = fixture();
  try {
    const operation = natural.sound.begin("progress.start", { signal: caller.signal });
    await turn();
    assert.equal(listeners.active.size, 1);
    natural.voices[0].finish();
    await settled(operation.ended);
    await turn();
    assert.equal(listeners.active.size, 0);
    assert.equal(listeners.removed.includes(listeners.added[0]), true);
  } finally {
    await natural.sound.destroy();
    listeners.restore();
  }

  const completingCaller = new AbortController();
  const completingListeners = abortListeners(completingCaller.signal);
  const pendingOutcome = deferred();
  const progress = voice();
  const lateOutcome = voice();
  const completing = fixture({ play: (event) => event === "progress.start" ? progress : pendingOutcome.promise });
  try {
    const operation = completing.sound.begin("progress.start", { signal: completingCaller.signal });
    await turn();
    const bridge = completingListeners.added[0];
    assert.ok(bridge);
    const result = operation.resolve("state.success");
    await turn();
    assert.equal(completingListeners.active.has(bridge), false);
    assert.equal(completingListeners.removed.includes(bridge), true);
    assert.equal(completingListeners.active.size, 1);
    assert.deepEqual(completing.calls.map((call) => call.event), ["progress.start", "state.success"]);
    completingCaller.abort();
    const cancelled = await settled(result);
    assert.equal(cancelled.reason, "cancelled");
    assert.equal(completing.calls[1].detail.signal.aborted, true);
    assert.equal(completingListeners.active.size, 0);
    pendingOutcome.resolve(lateOutcome);
    await turn();
    assert.ok(lateOutcome.stopCalls >= 1);
    assert.equal(completing.sound.getSnapshot().activeVoices, 0);
  } finally {
    pendingOutcome.resolve(lateOutcome);
    await completing.sound.destroy();
    completingListeners.restore();
  }
});

test("natural progress completion retains caller cancellation for an already pending or active update", { timeout: 2000 }, async () => {
  for (const phase of ["pending", "active"]) {
    const caller = new AbortController();
    const listeners = abortListeners(caller.signal);
    const updatePlayback = deferred();
    const progress = voice();
    const updateVoice = voice();
    const f = fixture({
      play: (event) => event === "progress.start"
        ? progress
        : phase === "pending" ? updatePlayback.promise : updateVoice,
    });
    try {
      const operation = f.sound.begin("progress.start", { signal: caller.signal });
      await turn();
      const update = operation.update("action.select");
      await turn();
      assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", "action.select"]);
      progress.finish();
      await settled(operation.ended);
      await turn();
      assert.equal(f.sound.getSnapshot().activeVoices, 1);
      assert.equal(listeners.active.size, 1);
      caller.abort();
      const handle = await settled(update);
      await settled(handle.ended);
      assert.equal(f.calls[1].detail.signal.aborted, true);
      assert.equal(listeners.active.size, 0);
      updatePlayback.resolve(updateVoice);
      await turn();
      assert.ok(updateVoice.stopCalls >= 1);
      assert.equal(f.sound.getSnapshot().activeVoices, 0);
      assert.deepEqual(f.calls.map((call) => call.event), ["progress.start", "action.select"]);
    } finally {
      updatePlayback.resolve(updateVoice);
      await f.sound.destroy();
      listeners.restore();
    }
  }
});

test("caller cancellation synchronously inside provider unlock or play cannot retain a voice", { timeout: 2000 }, async () => {
  const unlockingCaller = new AbortController();
  const unlocking = fixture({
    unlock() {
      unlockingCaller.abort();
      return Promise.resolve(true);
    },
  });
  try {
    const operation = unlocking.sound.begin("progress.start", { signal: unlockingCaller.signal });
    await settled(operation.ended);
    await turn();
    assert.equal(unlocking.unlockCalls, 1);
    assert.deepEqual(unlocking.calls, []);
    assert.equal(unlocking.sound.getSnapshot().activeVoices, 0);
    assert.equal(unlocking.sound.getSnapshot().trace.at(-1).reason, "cancelled");
  } finally {
    await unlocking.sound.destroy();
  }

  const playingCaller = new AbortController();
  const playback = deferred();
  const eventualVoice = voice();
  const playing = fixture({
    play() {
      playingCaller.abort();
      return playback.promise;
    },
  });
  try {
    const operation = playing.sound.begin("progress.start", { signal: playingCaller.signal });
    await turn();
    await settled(operation.ended);
    assert.equal(playing.calls.length, 1);
    assert.equal(playing.calls[0].detail.signal.aborted, true);
    assert.equal(playing.sound.getSnapshot().activeVoices, 0);
    playback.resolve(eventualVoice);
    await turn();
    assert.ok(eventualVoice.stopCalls >= 1);
    assert.equal(playing.sound.getSnapshot().activeVoices, 0);
    assert.equal(playing.sound.getSnapshot().trace.at(-1).reason, "cancelled");
  } finally {
    playback.resolve(eventualVoice);
    await playing.sound.destroy();
  }
});
