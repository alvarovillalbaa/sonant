// Data tier T2: fresh offline consumer using the actual npm tarball.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

test("packed package installs offline and its public imports and executable CLI work", async () => {
  const root = await mkdtemp(join(tmpdir(), "sonant-consumer-"));
  const command = (binary, args, cwd = root) => {
    const result = spawnSync(binary, args, { cwd, encoding: "utf8", timeout: 30000, env: { ...process.env, npm_config_cache: process.env.npm_config_cache ?? join(tmpdir(), "sonant-npm-cache") } });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}\n${result.error ?? ""}`); return result;
  };
  try {
    const packed = command("npm", ["pack", "--json", "--ignore-scripts", "--workspace", "@alvarovillalbaa/sonant", "--pack-destination", root], process.cwd());
    const info = JSON.parse(packed.stdout)[0]; assert.ok(info.files.some(f => f.path === "dist/react.js"));
    assert.ok(info.files.some(f => f.path === "LICENSE")); assert.ok(info.files.every(f => !f.path.includes("node_modules")));
    command("npm", ["install", "--offline", "--ignore-scripts", "--no-audit", "--no-fund", "--omit=optional", join(root, info.filename)]);
    const imported = command(process.execPath, ["--input-type=module", "-e", 'import { createSoundSystem, events } from "@alvarovillalbaa/sonant"; console.log(events.length); await createSoundSystem().destroy();']);
    assert.equal(imported.stdout.trim(), "32");
    command("npm", ["exec", "--offline", "--", "sonant", "init", "--theme", "soft"]);
    command("npm", ["exec", "--offline", "--", "sonant", "add", "sound-settings"]);
    assert.match(await readFile(join(root, "components/sonant/sound-settings.tsx"), "utf8"), /useSound/);
    assert.match(await readFile(join(root, "node_modules/@alvarovillalbaa/sonant/dist/react.js"), "utf8"), /^"use client";/);
    assert.equal(JSON.parse(await readFile(join(root, "node_modules/@alvarovillalbaa/sonant/package.json"))).name, "@alvarovillalbaa/sonant");
    assert.ok(resolve(root));
  } finally { await rm(root, { recursive: true, force: true }); }
});
