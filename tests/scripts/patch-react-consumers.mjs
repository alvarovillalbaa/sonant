import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const archive = process.env.SONANT_TARBALL;
assert.equal(createHash('sha256').update(await readFile(archive)).digest('hex'), process.env.SONANT_TARBALL_SHA256);
const manifest = JSON.parse(await readFile(join(process.env.SONANT_PATCH_ROOT, 'proof/archive-manifest.json')));
const root = await mkdtemp(join(tmpdir(), 'sonant-react-consumers-'));
const report = { source: process.env.SOURCE_COMMIT, version: '0.1.1', node: process.version, cases: [], passed: false };
function run(args, cwd) {
  const child = spawnSync(process.execPath, args, { cwd, stdio: 'inherit', timeout: 120000 });
  assert.equal(child.status, 0, `${args[0]} failed: ${child.error ?? child.signal ?? child.status}`);
}
function npm(args, cwd) {
  const child = spawnSync('npm', args, { cwd, stdio: 'inherit', timeout: 120000 });
  assert.equal(child.status, 0, `npm failed: ${child.error ?? child.signal ?? child.status}`);
}
try {
  for (const profile of [
    { id: 'react18', react: '18.3.1', types: '18.3.12', domTypes: '18.3.1' },
    { id: 'react19', react: '19.3.1', types: '19.3.0', domTypes: '19.3.0' },
  ]) {
    const dir = join(root, profile.id); await mkdir(dir);
    await writeFile(join(dir, 'package.json'), JSON.stringify({ name: `sonant-${profile.id}-fixture`, private: true, type: 'module' }));
    npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', archive,
      `react@${profile.react}`, `react-dom@${profile.react}`, `@types/react@${profile.types}`,
      `@types/react-dom@${profile.domTypes}`, 'typescript@5.9.3'], dir);
    const installed = join(dir, 'node_modules/@alvarovillalbaa/sonant');
    for (const file of manifest.files) {
      const data = await readFile(join(installed, file.path));
      assert.equal(data.length, file.bytes);
      assert.equal(createHash('sha256').update(data).digest('hex'), file.sha256);
    }
    const lock = JSON.parse(await readFile(join(dir, 'package-lock.json')));
    assert.equal(lock.packages['node_modules/@alvarovillalbaa/sonant'].version, '0.1.1');
    assert.equal(lock.packages['node_modules/@alvarovillalbaa/sonant'].integrity, process.env.SONANT_TARBALL_INTEGRITY);
    npm(['exec', '--offline', '--', 'sonant', 'init', '--theme', 'soft', '--profile', 'quiet'], dir);
    npm(['exec', '--offline', '--', 'sonant', 'add', 'sound-button', 'sound-switch', 'sound-settings', 'async-action'], dir);
    await writeFile(join(dir, 'consumer.tsx'), `import { createSoundSystem } from '@alvarovillalbaa/sonant';
import { SoundProvider, useSound, useSoundOperation, SoundInspector } from '@alvarovillalbaa/sonant/react';
import { mappedProvider } from '@alvarovillalbaa/sonant/providers';
import { createConfig } from '@alvarovillalbaa/sonant/config';
import { registry } from '@alvarovillalbaa/sonant/registry';
import { SonantProvider } from './components/sonant/provider.js';
void createSoundSystem; void mappedProvider; void createConfig; void registry; void SoundInspector;
function Child() {
  const sound = useSound(); const begin = useSoundOperation(); void begin;
  void sound.emit('action.select');
  // @ts-expect-error Unknown semantic events must be rejected by the public declarations.
  void sound.emit('invented.event');
  return <button>{sound.preferences.enabled ? 'On' : 'Off'}</button>;
}
export default function App() { return <SonantProvider><SoundProvider><Child /></SoundProvider></SonantProvider>; }
`);
    await writeFile(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', jsx: 'react-jsx',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'], strict: true, skipLibCheck: false,
      resolveJsonModule: true, noEmit: true,
    }, include: ['consumer.tsx', 'components/**/*.tsx'] }));
    run(['node_modules/typescript/bin/tsc', '--project', 'tsconfig.json'], dir);
    await writeFile(join(dir, 'ssr.mjs'), `import assert from 'node:assert/strict';
import {createElement, StrictMode} from 'react'; import {renderToString} from 'react-dom/server';
import {createSoundSystem} from '@alvarovillalbaa/sonant';
import {SoundProvider,useSound} from '@alvarovillalbaa/sonant/react';
const system=createSoundSystem({preferences:{enabled:false}});
function Child(){const sound=useSound();return createElement('button',null,sound.preferences.enabled?'On':'Off');}
try {const html=renderToString(createElement(StrictMode,null,createElement(SoundProvider,{system},createElement(Child))));assert.ok(html.includes('Off'));}
finally {await system.destroy();}
`);
    run(['ssr.mjs'], dir);
    await writeFile(join(process.env.SONANT_PATCH_ROOT, 'proof', `${profile.id}-consumer-lock.json`), JSON.stringify(lock, null, 2) + '\n');
    report.cases.push({ ...profile, passed: true, strictTypes: true, generatedComponents: 4, ssr: true, archiveFilesEqual: manifest.fileCount });
  }
  report.passed = true;
} finally {
  await rm(root, { recursive: true, force: true }); report.ownedRootRemoved = true;
  await writeFile(join(process.env.SONANT_PATCH_ROOT, 'proof/react-consumers.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log('PASS: strict generated-source and SSR consumers on React18/19');
