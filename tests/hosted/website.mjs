// Actual public website; no provider, app-state, response or renderer mocks.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SONANT_HOSTED_ROOT;
assert.ok(root && process.env.CI === 'true');
const { chromium } = await import(pathToFileURL(path.join(root, 'tools/node_modules/playwright/index.mjs')).href);
const origin = 'https://sonant-beta.vercel.app';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { source: process.env.SOURCE_COMMIT, origin, cases: [], requests: [], errors: [], assets: {}, passed: false };
const browser = await chromium.launch({ headless: true });
report.chromium = browser.version();
const until = async (predicate, label, ms = 5000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await predicate()) return; await new Promise(resolve => setTimeout(resolve, 40)); }
  throw new Error(label);
};
const settle = ms => new Promise(resolve => setTimeout(resolve, ms));
async function download(page, button, filename, id) {
  const pending = page.waitForEvent('download', { timeout: 5000 });
  await button.click();
  const item = await pending;
  assert.equal(item.suggestedFilename(), filename);
  assert.equal(await item.failure(), null);
  const bytes = await readFile(await item.path());
  assert.ok(bytes.length > 0 && bytes.length < 262144);
  await writeFile(path.join(root, 'proof', `${id}-${filename}`), bytes, { flag: 'wx' });
  await item.delete();
  return { value: JSON.parse(bytes), bytes: bytes.length, sha256: sha(bytes) };
}
async function audioObserver() {
  const records = [];
  Object.defineProperty(window, '__sonantHostedAudio', { value: records });
  let contextId = 0, sourceId = 0;
  const Native = window.AudioContext;
  window.AudioContext = class extends Native {
    constructor(options) {
      super(options); const id = ++contextId;
      records.push({ kind: 'context', id, state: this.state });
      this.addEventListener('statechange', () => records.push({ kind: 'state', id, state: this.state }));
    }
    createBufferSource() {
      const source = super.createBufferSource(), id = ++sourceId;
      const start = source.start.bind(source), stop = source.stop.bind(source);
      source.start = (...args) => { records.push({ kind: 'start', id, loop: source.loop, state: this.state }); return start(...args); };
      source.stop = (...args) => { records.push({ kind: 'stop', id }); return stop(...args); };
      source.addEventListener('ended', () => records.push({ kind: 'ended', id }));
      return source;
    }
  };
}
const definitions = [
  ['H01', false, '/', async (page, row) => {
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
    await page.getByRole('button', { name: 'Sound off', exact: true }).click();
    await page.getByRole('button', { name: 'Preview Success', exact: true }).click();
    await until(() => page.getByRole('status').filter({ hasText: 'Playing success' }).isVisible(), 'preview-not-accepted');
    await page.locator('header nav').getByRole('link', { name: 'Devtools', exact: true }).click();
    await until(() => page.locator('tbody').innerText().then(text => text.includes('state.success') && text.includes('played')), 'played-trace-missing');
    const before = await download(page, page.getByRole('button', { name: 'Export JSON', exact: true }), 'sonant-trace.json', row.id);
    assert.equal(before.value.schemaVersion, 1);
    assert.equal(before.value.provider, 'Web Audio');
    assert.ok(before.value.trace.some(entry => entry.event === 'state.success' && entry.decision === 'played'));
    row.trace = { bytes: before.bytes, sha256: before.sha256 };
    row.audio = await page.evaluate(() => window.__sonantHostedAudio);
    assert.ok(row.audio.some(entry => entry.kind === 'start' && entry.state === 'running'));
    await page.getByRole('button', { name: 'Sound on', exact: true }).click();
    await page.reload();
    await page.getByRole('button', { name: 'Sound off', exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
    await page.getByRole('button', { name: 'Try an error', exact: true }).click();
    await until(() => page.locator('tbody').innerText().then(text => text.includes('state.error') && text.includes('muted')), 'mute-not-observed');
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
  }],
  ['H02', false, '/#/examples', async (page, row) => {
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
    await page.getByRole('button', { name: 'Sound off', exact: true }).click();
    await page.getByRole('button', { name: 'Run workflow', exact: true }).click();
    await until(() => page.getByRole('log', { name: 'Agent workflow' }).innerText().then(text => text.includes('Searching the reference library')), 'first-update-missing');
    await page.locator('header nav').getByRole('link', { name: 'Devtools', exact: true }).click();
    await until(() => page.locator('.devtools-metrics article').filter({ hasText: 'Active voices' }).locator('strong').innerText().then(text => /^0\s*\//.test(text)), 'voices-not-stopped');
    const snapshot = await page.locator('tbody').innerText();
    assert.ok(snapshot.includes('agent.thinking') && snapshot.includes('agent.tool.started'));
    assert.ok(!snapshot.includes('agent.tool.completed') && !snapshot.includes('agent.ready'));
    await settle(2700);
    assert.equal(await page.locator('tbody').innerText(), snapshot);
    assert.ok(!(await page.locator('tbody').innerText()).includes('Active loop'));
    row.audio = await page.evaluate(() => window.__sonantHostedAudio);
    const loops = row.audio.filter(entry => entry.kind === 'start' && entry.loop);
    assert.ok(loops.length > 0 && loops.every(entry => entry.state === 'running'));
    for (const loop of loops) assert.ok(row.audio.some(entry => entry.kind === 'stop' && entry.id === loop.id) && row.audio.some(entry => entry.kind === 'ended' && entry.id === loop.id));
    const out = await download(page, page.getByRole('button', { name: 'Export JSON', exact: true }), 'sonant-trace.json', row.id);
    assert.ok(out.value.trace.some(entry => entry.event === 'agent.thinking' && entry.decision === 'played' && !entry.active));
    assert.ok(out.value.trace.every(entry => !entry.active));
    assert.ok(!out.value.trace.some(entry => ['agent.ready', 'agent.tool.completed'].includes(entry.event)));
    row.trace = { bytes: out.bytes, sha256: out.sha256 };
  }],
  ['H03', true, '/#/examples', async (page, row) => {
    await page.getByRole('button', { name: 'Run workflow', exact: true }).tap();
    await page.getByRole('button', { name: 'Stop', exact: true }).tap();
    await until(() => page.getByRole('log', { name: 'Agent workflow' }).innerText().then(text => text.includes('Stopped by you.')), 'visible-stop-missing');
    const snapshot = await page.getByRole('log', { name: 'Agent workflow' }).innerText();
    await settle(2700);
    assert.equal(await page.getByRole('log', { name: 'Agent workflow' }).innerText(), snapshot);
    await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
    await page.locator('header nav').getByRole('link', { name: 'Devtools', exact: true }).tap();
    const out = await download(page, page.getByRole('button', { name: 'Export JSON', exact: true }), 'sonant-trace.json', row.id);
    assert.equal(out.value.preferences.enabled, false);
    assert.ok(out.value.trace.some(entry => entry.event === 'agent.interrupted' && entry.reason === 'muted'));
    assert.ok(!out.value.trace.some(entry => entry.event === 'agent.ready'));
    assert.equal(out.value.trace.at(-1).event, 'agent.interrupted');
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
    row.trace = { bytes: out.bytes, sha256: out.sha256 };
  }],
  ['H04', true, '/#/create', async (page, row) => {
    await page.getByRole('button', { name: /WARM & UNHURRIED/ }).tap();
    await page.getByRole('button', { name: /quiet.*Outcomes/ }).tap();
    await page.getByLabel('async-action', { exact: false }).check();
    assert.ok((await page.locator('.builder-summary .code-block').innerText()).includes('--theme soft --profile quiet --volume 0.35'));
    const out = await download(page, page.getByRole('button', { name: 'Download source bundle', exact: true }), 'sonant-kit.json', row.id);
    assert.equal(out.value.format, 'sonant-kit-v1');
    assert.deepEqual(Object.keys(out.value.files).sort(), ['sonant.config.json', ...['provider.tsx', 'theme.json', 'sound-button.tsx', 'sound-settings.tsx', 'async-action.tsx'].map(name => `components/sonant/${name}`)].sort());
    assert.deepEqual(JSON.parse(out.value.files['sonant.config.json']), { schemaVersion: 1, theme: 'soft', preferences: { enabled: false, volume: 0.35, profile: 'quiet' }, directory: 'components/sonant' });
    assert.ok(out.value.files['components/sonant/async-action.tsx'].includes('operation.reject'));
    assert.ok(out.value.files['components/sonant/provider.tsx'].includes('"enabled":false'));
    assert.equal(Object.keys(JSON.parse(out.value.files['components/sonant/theme.json'])).length, 32);
    const again = await download(page, page.getByRole('button', { name: 'Download source bundle', exact: true }), 'sonant-kit.json', `${row.id}-repeat`);
    assert.equal(again.sha256, out.sha256);
    assert.deepEqual(await page.evaluate(() => window.__sonantHostedAudio), []);
    row.kit = { bytes: out.bytes, sha256: out.sha256, repeatedByteEqual: true, files: Object.keys(out.value.files) };
  }],
];
try {
  for (const [id, narrow, route, action] of definitions) {
    const row = { id, narrow, status: 'failed', errors: [], requests: [], closed: false };
    report.cases.push(row);
    const context = await browser.newContext({ viewport: narrow ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, isMobile: narrow, hasTouch: narrow, acceptDownloads: true, serviceWorkers: 'block' });
    let page; const pending = new Set(), outstanding = new Map();
    try {
      await context.addInitScript(audioObserver);
      await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.origin !== origin || request.method() !== 'GET' || url.username || url.password || url.search) {
          row.errors.push('unexpected-request'); await route.abort();
        } else await route.continue();
      });
      page = await context.newPage(); page.setDefaultTimeout(5000);
      page.on('pageerror', error => row.errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') row.errors.push(message.text()); });
      page.on('websocket', () => row.errors.push('unexpected-websocket'));
      page.on('request', request => outstanding.set(request, request.url()));
      page.on('requestfinished', request => outstanding.delete(request));
      page.on('requestfailed', request => { outstanding.delete(request); row.errors.push(`request-failed:${new URL(request.url()).pathname}`); });
      page.on('response', response => {
        const work = (async () => {
          assert.equal(response.status(), 200);
          assert.equal(await response.finished(), null);
          const bytes = await response.body(); assert.ok(bytes.length > 0 && bytes.length < 2097152);
          const url = new URL(response.url()); assert.equal(url.origin, origin);
          const item = { path: url.pathname, status: response.status(), bytes: bytes.length, sha256: sha(bytes), finished: true };
          if (report.assets[item.path]) assert.deepEqual(report.assets[item.path], { bytes: item.bytes, sha256: item.sha256 });
          else report.assets[item.path] = { bytes: item.bytes, sha256: item.sha256 };
          row.requests.push(item);
        })().catch(error => row.errors.push(String(error.stack ?? error).slice(0, 2000))).finally(() => pending.delete(work));
        pending.add(work);
      });
      await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 20000 });
      await page.locator('main h1').waitFor();
      await action(page, row);
      await until(() => outstanding.size === 0 && pending.size === 0, 'network-not-drained');
      row.audioFinal = await page.evaluate(() => window.__sonantHostedAudio);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(row.errors, []);
      await page.screenshot({ path: path.join(root, 'proof', `${id}.png`), fullPage: true });
      row.status = 'passed';
    } catch (error) {
      row.error = String(error.stack ?? error).slice(0, 6000);
      if (page && !page.isClosed()) await page.screenshot({ path: path.join(root, 'proof', `${id}.png`), fullPage: true }).catch(() => {});
    } finally {
      await context.close();
      await until(() => pending.size === 0, 'response-observers-not-drained');
      row.outstandingRequests = [...outstanding.values()].map(value => new URL(value).pathname);
      row.closed = !page || page.isClosed();
      if (row.errors.length || row.outstandingRequests.length || !row.closed) row.status = 'failed';
    }
  }
  // Independently re-fetch each actually observed public asset after all cases.
  assert.ok(Object.keys(report.assets).length > 2 && Object.keys(report.assets).length <= 16);
  for (const [pathname, expected] of Object.entries(report.assets)) {
    const response = await fetch(origin + pathname, { redirect: 'error', signal: AbortSignal.timeout(8000) });
    assert.equal(response.status, 200);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual({ bytes: bytes.length, sha256: sha(bytes) }, expected);
    report.requests.push({ path: pathname, ...expected, status: response.status, bodyComplete: true });
  }
  report.passed = report.cases.length === 4 && report.cases.every(row => row.status === 'passed');
} catch (error) { report.errors.push(String(error.stack ?? error).slice(0, 6000)); }
finally {
  await browser.close(); report.browserClosed = !browser.isConnected();
  report.passed &&= report.browserClosed && report.errors.length === 0;
  await writeFile(path.join(root, 'proof/browser.json'), JSON.stringify(report, null, 2) + '\n');
  process.exitCode = report.passed ? 0 : 1;
}
