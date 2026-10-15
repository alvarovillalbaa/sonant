// T2 disposable consumer fixtures; reads the public registry, never writes to it.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const version = process.env.SONANT_VERSION ?? "0.1.0";
assert.match(version, /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/);
const spec = `@alvarovillalbaa/sonant@${version}`;
const root = await mkdtemp(join(tmpdir(), "sonant-registry-"));
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", timeout: 120000 });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(" ")} failed: ${result.error ?? result.signal ?? "nonzero exit"}`,
  );
}
async function consumer(name) {
  const dir = join(root, name);
  await mkdir(dir);
  return dir;
}
try {
  const npm = await consumer("npm");
  run("npm", ["init", "--yes"], npm);
  run("npm", ["install", spec, "--no-audit", "--no-fund"], npm);
  const installed = JSON.parse(
    await readFile(join(npm, "node_modules/@alvarovillalbaa/sonant/package.json"), "utf8"),
  );
  assert.equal(installed.version, version);
  assert.equal(installed.bin.sonant, "dist/cli.js");
  run(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      'import { createSoundSystem, events } from "@alvarovillalbaa/sonant"; if (events.length !== 32) throw new Error("Incomplete taxonomy"); await createSoundSystem().destroy();',
    ],
    npm,
  );

  const npx = await consumer("npx");
  run("npx", ["--yes", spec, "init", "--cwd", npx], root);
  run("npx", ["--yes", spec, "add", "sound-settings", "--cwd", npx], root);
  assert.match(
    await readFile(join(npx, "components/sonant/sound-settings.tsx"), "utf8"),
    /useSound/,
  );

  const pnpm = await consumer("pnpm");
  run("pnpm", ["add", spec], pnpm);
  run("pnpm", ["dlx", spec, "init", "--cwd", pnpm, "--theme", "soft"], root);
  run("pnpm", ["dlx", spec, "add", "async-action", "--cwd", pnpm], root);
  const config = JSON.parse(await readFile(join(pnpm, "sonant.config.json"), "utf8"));
  assert.equal(config.theme, "soft");
  assert.match(
    await readFile(join(pnpm, "components/sonant/async-action.tsx"), "utf8"),
    /operation.reject/,
  );
  console.log(`PASS: fresh npm import, npx init/add, pnpm add/dlx for ${spec}`);
} finally {
  await rm(root, { recursive: true, force: true });
}
