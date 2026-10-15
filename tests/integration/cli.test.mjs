// Data tier T2: disposable local fixture directories. No remote service calls.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const cli = resolve("packages/sonant/dist/cli.js");
const run = (root, ...args) =>
  spawnSync(process.execPath, [cli, ...args, "--cwd", root], { encoding: "utf8" });
async function fixture(fn) {
  const root = await mkdtemp(join(tmpdir(), "sonant-test-"));
  try {
    await fn(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("CLI creates an editable kit and selected source components", () =>
  fixture(async (root) => {
    const init = run(root, "init", "--theme", "soft", "--profile", "quiet");
    assert.equal(init.status, 0, init.stderr);
    const config = JSON.parse(await readFile(join(root, "sonant.config.json")));
    assert.equal(config.theme, "soft");
    assert.equal(config.preferences.enabled, false);
    const add = run(root, "add", "sound-button", "async-action", "sound-settings");
    assert.equal(add.status, 0, add.stderr);
    assert.match(
      await readFile(join(root, "components/sonant/async-action.tsx"), "utf8"),
      /finally/,
    );
    assert.match(
      await readFile(join(root, "components/sonant/provider.tsx"), "utf8"),
      /^"use client"/,
    );
  }));
test("CLI preflights all collisions and preserves existing bytes", () =>
  fixture(async (root) => {
    await writeFile(join(root, "sonant.config.json"), "user work");
    const result = run(root, "init");
    assert.equal(result.status, 1);
    assert.equal(await readFile(join(root, "sonant.config.json"), "utf8"), "user work");
    assert.deepEqual(await readdir(root), ["sonant.config.json"]);
  }));
test("dry runs and invalid input leave no residue", () =>
  fixture(async (root) => {
    assert.equal(run(root, "init", "--dry-run").status, 0);
    assert.deepEqual(await readdir(root), []);
    assert.equal(run(root, "init", "--theme", "bogus").status, 1);
    assert.equal(run(root, "init", "--volume", "NaN").status, 1);
    assert.equal(run(root, "init", "--unknown").status, 1);
    assert.deepEqual(await readdir(root), []);
  }));
test("CLI rejects traversal, symlinks, and inherited registry keys", () =>
  fixture(async (root) => {
    run(root, "init");
    const path = join(root, "sonant.config.json");
    const config = JSON.parse(await readFile(path));
    config.directory = "../outside";
    await writeFile(path, JSON.stringify(config));
    assert.equal(run(root, "add", "sound-button").status, 1);
    config.directory = "linked";
    await writeFile(path, JSON.stringify(config));
    await symlink(tmpdir(), join(root, "linked"));
    assert.equal(run(root, "add", "sound-button").status, 1);
    assert.equal(run(root, "add", "toString").status, 1);
  }));
test("export emits portable WAVs with provenance and deterministic hashes", () =>
  fixture(async (root) => {
    const result = run(root, "export", "--theme", "studio");
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(await readFile(join(root, "sonant-assets/manifest.json")));
    assert.equal(manifest.cues.length, 32);
    assert.equal(manifest.cues[0].license, "MIT");
    assert.match(manifest.cues[0].sha256, /^[a-f0-9]{64}$/);
    assert.equal(
      (await readFile(join(root, "sonant-assets/state.success.wav"))).subarray(0, 4).toString(),
      "RIFF",
    );
    assert.equal(run(root, "export").status, 1);
  }));
test("compile validates copied recipes and recipe checks run for all themes", () =>
  fixture(async (root) => {
    run(root, "init");
    assert.equal(run(root, "compile").status, 0);
    assert.ok((await readdir(join(root, "sonant-assets"))).includes("theme.ts"));
    for (const theme of ["studio", "soft", "arcade"]) {
      const result = run(root, "test", "--theme", theme);
      assert.equal(result.status, 0, result.stderr);
    }
  }));
test("audit findings are explicitly advisory and strict mode is opt-in", () =>
  fixture(async (root) => {
    await writeFile(
      join(root, "upload.tsx"),
      'const operation = sound.begin("progress.start");\nsound.emit("state.error");',
    );
    const result = run(root, "audit", "--json");
    assert.equal(result.status, 0);
    const report = JSON.parse(result.stdout);
    assert.equal(report.kind, "heuristic-review");
    assert.equal(report.findings.length, 2);
    assert.equal(run(root, "audit", "--strict").status, 1);
  }));
