// T2 disposable consumer fixtures; reads the public registry, never writes to it.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, copyFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, isAbsolute } from "node:path";
import { spawnSync } from "node:child_process";

const version = process.env.SONANT_VERSION ?? "0.1.0";
assert.match(version, /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/);
const archive = process.env.SONANT_TARBALL;
if (archive) {
  assert.ok(isAbsolute(archive) && archive.endsWith('.tgz'));
  assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), process.env.SONANT_TARBALL_SHA256);
}
const spec = archive ?? `@alvarovillalbaa/sonant@${version}`;
const npmOnly = process.env.SONANT_NPM_ONLY === 'true';
assert.ok(!npmOnly || archive, 'Compatibility-only mode requires the reviewed archive');
const root = await mkdtemp(join(tmpdir(), "sonant-registry-"));
const cases = [];
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
  run("npm", ["install", spec, "--no-audit", "--no-fund", ...(archive ? ['--ignore-scripts', '--omit=optional'] : [])], npm);
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

  if (archive) {
    await copyFile(join(process.cwd(), 'tests/fixtures/patch-core.mjs'), join(npm, 'verify.mjs'));
    run(process.execPath, ['verify.mjs'], npm);
    run('npm', ['exec', '--offline', '--', 'sonant', 'init', '--theme', 'soft'], npm);
    run('npm', ['exec', '--offline', '--', 'sonant', 'add', 'sound-settings'], npm);
    run('npm', ['exec', '--offline', '--', 'sonant', 'export', '--out', 'exported'], npm);
    const manifest = JSON.parse(await readFile(join(npm, 'exported/manifest.json')));
    assert.equal(manifest.cues.length, 32);
    for (const cue of manifest.cues) {
      const wav = await readFile(join(npm, 'exported', cue.file));
      assert.equal(wav.subarray(0, 4).toString(), 'RIFF');
      assert.equal(wav.readUInt32LE(4) + 8, wav.length);
      assert.equal(createHash('sha256').update(wav).digest('hex'), cue.sha256);
    }
  }
  cases.push({ id: 'npm', passed: true, version });

  if (!npmOnly) {
    const npx = await consumer("npx");
    const npxPackage = archive ? ['--yes', '--package', spec, '--', 'sonant'] : ['--yes', spec];
    run("npx", [...npxPackage, "init", "--cwd", npx], root);
    run("npx", [...npxPackage, "add", "sound-settings", "--cwd", npx], root);
    assert.match(
      await readFile(join(npx, "components/sonant/sound-settings.tsx"), "utf8"),
      /useSound/,
    );
    cases.push({ id: 'npx', passed: true, version });

    const pnpm = await consumer("pnpm");
    const store = archive ? ['--store-dir', join(root, 'pnpm-store')] : [];
    run("pnpm", [...store, "add", spec], pnpm);
    const dlxPackage = archive ? ['--package', spec, 'dlx', 'sonant'] : ['dlx', spec];
    run("pnpm", [...store, ...dlxPackage, "init", "--cwd", pnpm, "--theme", "soft"], root);
    run("pnpm", [...store, ...dlxPackage, "add", "async-action", "--cwd", pnpm], root);
    assert.equal(JSON.parse(await readFile(join(pnpm, 'node_modules/@alvarovillalbaa/sonant/package.json'))).version, version);
    const config = JSON.parse(await readFile(join(pnpm, "sonant.config.json"), "utf8"));
    assert.equal(config.theme, "soft");
    assert.match(
      await readFile(join(pnpm, "components/sonant/async-action.tsx"), "utf8"),
      /operation.reject/,
    );
    cases.push({ id: 'pnpm', passed: true, version });
  }
  console.log(`PASS: ${cases.map(row => row.id).join(', ')} consumers for ${spec}`);
} finally {
  await rm(root, { recursive: true, force: true });
  if (process.env.SONANT_CONSUMER_REPORT) await writeFile(process.env.SONANT_CONSUMER_REPORT, JSON.stringify({ version, node: process.version, archiveMode: Boolean(archive), cases, ownedRootRemoved: true, passed: cases.length === (npmOnly ? 1 : 3) }, null, 2) + '\n');
}
