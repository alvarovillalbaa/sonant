import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";

const SEAL = "docs/results/2026/11-04/operation-cancellation-source.json";
const OLD = "docs/results/2026/10-29/operation-cancellation-inventory.json";
const BASE = "c5657ad20911f136bc86769f2d79114889693b0e";
const BASE_HASH = "f6c41b2b490aeac401d189bfa5f8397ac5bc44faa7e3784dc0dbc273594704f0";
const OLD_HASH = "fcf4f75cb09706b820a9879c14411a9727b67a20d8dc122bcf0c0fcdde95848d";
const OLD_BLOB = "cebfcd8f9296139e8c695402c69fb506d2ff60b5";
const FILES = ["tests/unit/runtime.test.mjs", "tests/unit/operation-cancellation.test.mjs"];
const NAME = "a pre-aborted caller never unlocks or plays and its operation settles";
const hash = (data, algorithm = "sha256") => createHash(algorithm).update(data).digest("hex");
const blob = data => hash(Buffer.concat([Buffer.from("blob " + data.length + "\0"), data]), "sha1");
const need = (value, code) => { if (!value) throw new Error(code); };
const code = error => /^[a-z0-9_]+$/.test(error?.message ?? "") ? error.message : "controller_error";
const sourceCommit = process.argv[3];
need(process.argv.length === 4 && process.argv[2] === "--source-commit" && /^[a-f0-9]{40}$/.test(sourceCommit ?? ""), "source_pin_required");
need(process.version === "v24.21.0" && process.platform === "linux" && process.env.GITHUB_ACTIONS === "true"
  && process.env.GITHUB_REPOSITORY === "alvarovillalbaa/sonant" && process.env.GITHUB_EVENT_NAME === "create"
  && process.env.GITHUB_REF === "refs/heads/qa/sonant-cancellation-20261104" && process.env.SONANT_PUBLIC_REPOSITORY === "true"
  && process.env.SONANT_CREATED_REF_TYPE === "branch", "approved_public_ci_required");
const repo = fs.realpathSync(process.cwd()), parent = fs.realpathSync(process.env.RUNNER_TEMP ?? "");
need(path.isAbsolute(parent) && fs.statSync(parent).isDirectory(), "runner_temp_invalid");
const root = fs.mkdtempSync(path.join(parent, "sonant-cancellation-")), identity = fs.lstatSync(root), nonce = randomUUID();
fs.writeFileSync(path.join(root, "owner"), nonce, { flag: "wx", mode: 0o600 });
for (const directory of ["tmp", "cache", "install", "baseline", "repaired"]) fs.mkdirSync(path.join(root, directory), { mode: 0o700 });
for (const file of ["npm-user", "npm-global"]) fs.writeFileSync(path.join(root, file), "", { flag: "wx", mode: 0o600 });
const env = { PATH: process.env.PATH, HOME: process.env.HOME, LANG: "C.UTF-8", TZ: "UTC", CI: "true", NO_COLOR: "1",
  TMPDIR: path.join(root, "tmp"), TMP: path.join(root, "tmp"), TEMP: path.join(root, "tmp"), NODE_COMPILE_CACHE: path.join(root, "cache", "node"),
  npm_config_userconfig: path.join(root, "npm-user"), npm_config_globalconfig: path.join(root, "npm-global"),
  npm_config_cache: path.join(root, "cache"), npm_config_registry: "https://registry.npmjs.org/", npm_config_ignore_scripts: "true",
  npm_config_audit: "false", npm_config_fund: "false", npm_config_update_notifier: "false" };
const report = { schemaVersion: "sonant.operation-cancellation.v2", sourceCommit, baselineCommit: BASE, status: "failed",
  startedAtUtc: new Date().toISOString(), scope: { baselineExecutions: 1, patchedExecutions: 24, testFiles: FILES },
  runtime: { node: process.version, platform: process.platform, architecture: process.arch },
  limits: { workSeconds: 480, cleanupSeconds: 30, finalStdoutSeconds: 2, jobMinutes: 10, streamBytes: 131072, reportBytes: 131072,
    termToKillSeconds: 3, drainAfterKillSeconds: 3 }, commands: [], guards: [], fixtures: [], errors: [],
  proofLimits: ["One baseline assertion and 24 repaired cases use synthetic providers/timers; no browser, physical audio, live service or npm release.",
    "Direct child exit/close and original groups are checked; separate descendant sessions are not independently inventoried.",
    "Executable hashes do not inventory dynamic libraries. Userspace deadlines cannot interrupt blocked kernel filesystem operations."] };
const workEnd = Date.now() + 480000, links = [];
let cleanupEnd = null, interrupted = false, manifest, historical;
const handlers = new Map(["SIGINT", "SIGTERM", "SIGHUP"].map(signal => {
  const handler = () => { interrupted = true; }; process.on(signal, handler); return [signal, handler];
}));
const globalTimer = setTimeout(() => { process.stderr.write("controller_global_deadline\n"); finish(1); }, Math.max(1, workEnd + 32000 - Date.now()));
function owner() {
  const stat = fs.lstatSync(root), marker = path.join(root, "owner");
  need(path.dirname(root) === parent && stat.isDirectory() && !stat.isSymbolicLink() && stat.dev === identity.dev && stat.ino === identity.ino
    && !fs.lstatSync(marker).isSymbolicLink() && fs.readFileSync(marker, "utf8") === nonce, "scratch_identity_changed");
}
function read(file, maximum = 16777216) {
  const a = fs.lstatSync(file); need(a.isFile() && !a.isSymbolicLink() && a.size <= maximum, "file_type_or_bound");
  const data = fs.readFileSync(file), b = fs.lstatSync(file);
  need(a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs && data.length === a.size, "file_changed"); return data;
}
function clean(value, maximum = 1200) {
  let text = String(value).replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  for (const [from, to] of [[root, "[scratch]"], [repo, "[repository]"], [process.env.HOME, "[runner-home]"]]) if (from) text = text.split(from).join(to);
  return Buffer.from(text).subarray(0, maximum).toString("utf8");
}
function absent(pid) { try { process.kill(-pid, 0); return false; } catch (error) { return error.code === "ESRCH" ? true : null; } }
async function run(label, executable, args, seconds, { cwd = repo, cleanup = false, quiet = false, exits = [0] } = {}) {
  owner(); need(cleanup || !interrupted, "interrupted_before_command");
  const remaining = (cleanup ? cleanupEnd : workEnd) - Date.now() - 6000; need(remaining > 0, "command_budget_exhausted");
  const child = spawn(executable, args, { cwd, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  const parts = [[], []], counts = [0, 0], sizes = [0, 0], hashes = [createHash("sha256"), createHash("sha256")];
  let exitCode = null, signal = null, exited = false, closed = false, reason = null, stopAt = null, term = false, killed = false, captureFinished = false;
  let poll, killTimer, drainTimer, stop;
  await new Promise(resolve => {
    stop = why => {
      if (reason) return; reason = why; stopAt = Date.now(); term = true;
      try { process.kill(-child.pid, "SIGTERM"); } catch {}
      killTimer = setTimeout(() => { killed = true; try { process.kill(-child.pid, "SIGKILL"); } catch {} }, 3000);
      drainTimer = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); resolve(); }, 6000);
    };
    [child.stdout, child.stderr].forEach((stream, index) => stream.on("data", chunk => {
      if (captureFinished) return;
      counts[index] += chunk.length; hashes[index].update(chunk);
      const captured = chunk.subarray(0, Math.max(0, 131072 - sizes[index])); parts[index].push(captured); sizes[index] += captured.length;
      if (counts[index] > 131072) stop("stream_limit");
    }));
    child.once("error", () => { if (child.pid) stop("spawn_failed"); else reason = "spawn_failed"; resolve(); });
    child.once("exit", (value, received) => { exitCode = value; signal = received; exited = true; });
    child.once("close", () => { closed = true; resolve(); });
    const start = Date.now();
    poll = setInterval(() => { if (interrupted && !cleanup) stop("interrupted"); else if (Date.now() - start >= Math.min(seconds * 1000, remaining)) stop("timeout"); }, 25);
  });
  if (child.pid && absent(child.pid) !== true) {
    if (!reason) stop("group_remaining");
    while (absent(child.pid) !== true && Date.now() < stopAt + 6000) await new Promise(resolve => setTimeout(resolve, 25));
  }
  clearInterval(poll); clearTimeout(killTimer); clearTimeout(drainTimer);
  captureFinished = true;
  const output = parts.map(chunks => Buffer.concat(chunks));
  const row = { label, args: [executable === process.execPath ? "[node]" : executable, ...args.map(value => clean(value, 300))],
    allowedExits: exits, exitCode, signal, stop: reason, spawned: !!child.pid, exitObserved: exited, closeObserved: closed,
    originalProcessGroupAbsent: child.pid ? absent(child.pid) : true, termSent: term, killSent: killed,
    streams: output.map((data, index) => ({ name: index ? "stderr" : "stdout", observedBytes: counts[index], capturedBytes: data.length,
      observedSha256: hashes[index].digest("hex"), capturedSha256: hash(data), complete: closed && counts[index] === data.length,
      ...(quiet ? {} : { head: clean(data.toString()), tail: clean(data.subarray(Math.max(0, data.length - 1600)).toString(), 1600) }) })) };
  report.commands.push(row);
  need(exits.includes(exitCode) && signal === null && reason === null && exited && closed && row.originalProcessGroupAbsent === true, label + "_failed");
  return output;
}
async function guard(label, cleanup = false) {
  const row = { label, passed: false }; report.guards.push(row); const options = { cleanup, quiet: true };
  need((await run(label + "_head", "git", ["rev-parse", "HEAD"], 10, options))[0].toString().trim() === sourceCommit, "head_changed");
  need(!fs.existsSync(".github/workflows/operation-cancellation-v2.yml"), "active_workflow_in_source");
  const raw = read(SEAL, 131072), pinned = (await run(label + "_seal", "git", ["show", "HEAD:" + SEAL], 10, options))[0];
  need(raw.equals(pinned) && (!report.sealSha256 || hash(raw) === report.sealSha256), "seal_changed");
  manifest = JSON.parse(raw); report.sealSha256 = hash(raw);
  need(manifest.schemaVersion === 1 && manifest.kind === "sonant-operation-cancellation-source" && manifest.fileCount === manifest.files.length
    && manifest.trackedFileCount === manifest.fileCount + 1 && JSON.stringify(manifest.historicalExceptions) === '["AGENTS.md","README.md"]', "seal_scope_invalid");
  const index = new Map(), tree = new Map();
  for (const line of (await run(label + "_index", "git", ["ls-files", "--stage", "-z"], 10, options))[0].toString().split("\0").filter(Boolean)) {
    const [header, name] = line.split("\t"), [mode, sha, stage] = header.split(" "); need(stage === "0" && !index.has(name), "index_invalid"); index.set(name, { mode, sha });
  }
  for (const line of (await run(label + "_tree", "git", ["ls-tree", "-r", "-z", "HEAD"], 10, options))[0].toString().split("\0").filter(Boolean)) {
    const [header, name] = line.split("\t"), [mode, type, sha] = header.split(" "); need(type === "blob" && !tree.has(name), "tree_invalid"); tree.set(name, { mode, sha });
  }
  need(index.size === manifest.trackedFileCount && tree.size === index.size, "tracked_count_changed");
  const expected = new Map(manifest.files.map(file => [file.path, file])); need(expected.size === manifest.fileCount && !expected.has(SEAL), "input_set_invalid");
  let total = 0;
  for (const [name, item] of tree) {
    need(!path.isAbsolute(name) && !name.split("/").some(part => !part || part === "." || part === ".."), "input_path_invalid");
    const bytes = read(name), mode = fs.lstatSync(name).mode & 0o111 ? "100755" : "100644";
    need(item.mode === mode && item.sha === blob(bytes) && index.get(name)?.mode === mode && index.get(name)?.sha === item.sha, "tracked_bytes_or_index_changed");
    if (name !== SEAL) {
      const wanted = expected.get(name); need(wanted && wanted.mode === mode && wanted.gitSha === item.sha && wanted.bytes === bytes.length && wanted.sha256 === hash(bytes), "input_fingerprint_changed"); total += bytes.length;
    }
  }
  need(total === manifest.sourceBytes, "input_bytes_changed");
  need((await run(label + "_status", "git", ["status", "--porcelain=v1", "-z", "--untracked-files=all"], 10, options))[0].length === 0, "worktree_not_clean");
  await run(label + "_working", "git", ["-c", "core.filemode=true", "diff", "--no-ext-diff", "--no-textconv", "--quiet", "--exit-code", "HEAD", "--"], 10, options);
  const oldRaw = read(OLD); need(hash(oldRaw) === OLD_HASH && blob(oldRaw) === OLD_BLOB, "historical_inventory_changed"); historical = JSON.parse(oldRaw);
  need(historical.source_files.length === 66 && historical.baseline_case_name === NAME && historical.baseline_runtime_sha256 === BASE_HASH
    && JSON.stringify(manifest.testFiles.map(file => file.path)) === JSON.stringify(FILES)
    && JSON.stringify(manifest.testFiles.map(file => file.names)) === JSON.stringify(historical.test_files.map(file => file.case_names)), "historical_case_scope_changed");
  const changed = historical.source_files.filter(file => { const data = read(file.path); return data.length !== file.bytes || hash(data) !== file.sha256; }).map(file => file.path);
  need(changed.every(name => manifest.historicalExceptions.includes(name)), "historical_source_changed");
  for (const file of historical.protected_files) need(hash(read(file.path)) === file.sha256, "protected_source_changed");
  Object.assign(row, { passed: true, inputFiles: expected.size, inputBytes: total, trackedFiles: tree.size, fullIndexMatchesHead: true,
    fullWorkingBytesMatchHead: true, historicalChanged: changed, historicalInventorySha256: OLD_HASH, historicalInventoryGitBlob: OLD_BLOB,
    historicalInventoryCommit: "e562e6b159b581a3d9e02ae2e4bd7e8faa268095" });
}
function copy(label, name) {
  const source = read(name), destination = path.join(root, label, name); fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
  fs.writeFileSync(destination, source, { flag: "wx", mode: 0o600 }); need(read(destination).equals(source), "fixture_copy_changed"); return { path: name, bytes: source.length, sha256: hash(source) };
}
function fixture(label, replacement) {
  const names = manifest.files.map(file => file.path).filter(name => name.startsWith("packages/sonant/src/") || ["packages/sonant/package.json", "packages/sonant/tsconfig.json", FILES[1], ...(label === "repaired" ? [FILES[0]] : [])].includes(name));
  need(names.filter(name => name.startsWith("packages/sonant/src/")).length === 12, "fixture_source_count");
  const inputs = names.map(name => copy(label, name));
  const packageBytes = Buffer.from('{"private":true,"type":"module"}\n');
  fs.writeFileSync(path.join(root, label, "package.json"), packageBytes, { flag: "wx", mode: 0o600 });
  inputs.push({ path: "package.json", bytes: packageBytes.length, sha256: hash(packageBytes) });
  if (replacement) {
    need(hash(replacement) === BASE_HASH, "baseline_runtime_changed"); fs.writeFileSync(path.join(root, label, "packages/sonant/src/runtime.ts"), replacement);
    const item = inputs.find(item => item.path === "packages/sonant/src/runtime.ts"); item.bytes = replacement.length; item.sha256 = hash(replacement);
  }
  const link = path.join(root, label, "node_modules"), target = path.join(root, "install/node_modules"); fs.symlinkSync(target, link, "dir");
  const stat = fs.lstatSync(link); links.push({ path: link, target, dev: stat.dev, ino: stat.ino });
  report.fixtures.push({ label, inputs, outputs: [] }); verifyFixture(label);
}
function verifyFixture(label) {
  const item = report.fixtures.find(item => item.label === label);
  for (const file of item.inputs) { const bytes = read(path.join(root, label, file.path)); need(bytes.length === file.bytes && hash(bytes) === file.sha256, "fixture_input_changed"); }
}
function outputs(label) {
  verifyFixture(label); const directory = path.join(root, label, "packages/sonant/dist"), names = fs.readdirSync(directory).sort();
  need(names.length === 36, "compiled_file_count");
  report.fixtures.find(item => item.label === label).outputs = names.map(name => { const bytes = read(path.join(directory, name)); return { path: name, bytes: bytes.length, sha256: hash(bytes) }; });
}
function tap(data, baseline) {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(data), gzip = gzipSync(data), cases = [];
  const result = { raw: { encoding: "gzip-base64", bytes: data.length, sha256: hash(data), compressedBytes: gzip.length }, cases, totals: {}, orderingRequired: false };
  report[baseline ? "baseline" : "patched"] = result; need(gzip.length <= 32768, "tap_gzip_limit"); result.raw.data = gzip.toString("base64");
  for (const match of text.matchAll(/^(ok|not ok) ([1-9][0-9]*) - (.*)$/gm)) cases.push({ number: Number(match[2]), name: match[3], status: match[1] });
  const count = baseline ? 1 : 24, expected = baseline ? [NAME] : historical.test_files.flatMap(file => file.case_names);
  for (const name of ["tests", "suites", "pass", "fail", "cancelled", "skipped", "todo"]) {
    const matches = [...text.matchAll(new RegExp("^# " + name + " ([0-9]+)$", "gm"))]; need(matches.length === 1, "tap_totals_missing"); result.totals[name] = Number(matches[0][1]);
  }
  const plans = [...text.matchAll(/^1\.\.([0-9]+)$/gm)];
  need(plans.length === 1 && Number(plans[0][1]) === count && cases.length === count && new Set(cases.map(item => item.name)).size === count
    && cases.every((item, index) => item.number === index + 1 && expected.includes(item.name) && item.status === (baseline ? "not ok" : "ok")), "tap_case_set_failed");
  need(JSON.stringify(result.totals) === JSON.stringify({ tests: count, suites: 0, pass: baseline ? 0 : 24, fail: baseline ? 1 : 0, cancelled: 0, skipped: 0, todo: 0 }), "tap_totals_failed");
  if (baseline) {
    const diagnostic = text.slice(text.indexOf("not ok 1 - " + NAME) + ("not ok 1 - " + NAME).length).split(/^1\.\./m)[0];
    need(/^\s+code: ['"]ERR_ASSERTION['"]\s*$/m.test(diagnostic) && /^\s+operator: ['"]strictEqual['"]\s*$/m.test(diagnostic)
      && /^\s+expected: 0\s*$/m.test(diagnostic) && /^\s+actual: 1\s*$/m.test(diagnostic), "baseline_assertion_mismatch");
  }
  result.accepted = true;
}
try {
  await guard("before");
  const digest = createHash("sha256"); for await (const chunk of fs.createReadStream(process.execPath)) digest.update(chunk); report.runtime.executableSha256 = digest.digest("hex");
  const npm = fs.realpathSync(path.join(path.dirname(process.execPath), "npm")); report.runtime.npmCliSha256 = hash(read(npm));
  report.runtime.npm = (await run("npm_version", process.execPath, [npm, "--version"], 10))[0].toString().trim();
  report.fixtures.push({ label: "install", inputs: ["package.json", "package-lock.json", "packages/sonant/package.json", "website/package.json"].map(name => copy("install", name)), outputs: [] });
  await run("install", process.execPath, [npm, "ci", "--ignore-scripts", "--no-audit", "--no-fund"], 180, { cwd: path.join(root, "install") }); verifyFixture("install"); await guard("after_install");
  const compiler = path.join(root, "install/node_modules/typescript/bin/tsc"); report.runtime.typescript = JSON.parse(read(path.join(root, "install/node_modules/typescript/package.json"))).version;
  need(report.runtime.typescript === "5.9.3", "compiler_version_changed"); report.runtime.compilerSha256 = hash(read(compiler));
  const present = (await run("baseline_object", "git", ["cat-file", "-t", BASE], 10, { quiet: true, exits: [0, 128] }))[0].toString().trim();
  if (present !== "commit") await run("fetch_baseline", "git", ["fetch", "--no-tags", "--no-recurse-submodules", "--no-write-fetch-head", "--depth=1", "origin", BASE], 45);
  const original = (await run("baseline_runtime", "git", ["show", BASE + ":packages/sonant/src/runtime.ts"], 10, { quiet: true }))[0];
  fixture("baseline", original); fixture("repaired");
  await run("compile_baseline", process.execPath, [compiler, "-p", path.join(root, "baseline/packages/sonant/tsconfig.json")], 45); outputs("baseline");
  const baseline = await run("baseline_tests", process.execPath, ["--test", "--test-concurrency=1", "--test-reporter=tap", "--test-name-pattern=^" + NAME + "$", FILES[1]], 30, { cwd: path.join(root, "baseline"), exits: [1] }); tap(baseline[0], true); await guard("after_baseline");
  await run("compile_repaired", process.execPath, [compiler, "-p", path.join(root, "repaired/packages/sonant/tsconfig.json")], 45); outputs("repaired"); await guard("after_compile");
  const patched = await run("patched_tests", process.execPath, ["--test", "--test-concurrency=1", "--test-reporter=tap", ...FILES], 120, { cwd: path.join(root, "repaired") }); tap(patched[0], false);
  verifyFixture("baseline"); verifyFixture("repaired");
  need(Date.now() <= workEnd, "work_deadline_exceeded");
} catch (error) { report.errors.push(code(error)); }
finally {
  cleanupEnd = Math.min(Date.now() + 30000, workEnd + 30000);
  try { await guard("after", true); } catch (error) { report.errors.push(code(error)); }
  try {
    owner(); need(report.commands.every(item => !item.spawned || (item.exitObserved && item.closeObserved && item.originalProcessGroupAbsent === true)), "process_cleanup_unverified");
    if (report.fixtures.some(item => item.label === "install")) verifyFixture("install");
    for (const link of links) { const stat = fs.lstatSync(link.path); need(stat.isSymbolicLink() && stat.dev === link.dev && stat.ino === link.ino && fs.readlinkSync(link.path) === link.target, "fixture_dependency_link_changed"); fs.unlinkSync(link.path); }
    report.dependencyLinksRemoved = true;
    let timer; try {
      await Promise.race([fs.promises.rm(root, { recursive: true, force: false, maxRetries: 0 }), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("scratch_cleanup_timeout")), Math.max(1, cleanupEnd - Date.now())); })]);
    } finally { clearTimeout(timer); }
    need(!fs.existsSync(root), "scratch_still_present"); report.cleanup = "passed";
  } catch (error) { report.cleanup = "failed"; report.errors.push(code(error)); }
}
if (Date.now() > cleanupEnd) report.errors.push("cleanup_deadline_exceeded");
report.interrupted = interrupted; if (interrupted) report.errors.push("interrupted"); report.completedAtUtc = new Date().toISOString();
report.status = !report.errors.length && report.baseline?.accepted && report.patched?.accepted && report.cleanup === "passed" ? "passed" : "failed";
let output = JSON.stringify(report);
if (Buffer.byteLength(output) > 131072) {
  report.status = "failed"; report.errors.push("report_limit");
  for (const item of report.commands) for (const stream of item.streams) { delete stream.head; delete stream.tail; }
  for (const item of [report.baseline, report.patched]) if (item?.raw) { delete item.raw.data; item.raw.payloadOmitted = true; }
  output = JSON.stringify(report);
}
need(Buffer.byteLength(output) <= 131072, "report_limit");
function finish(exit) { clearTimeout(globalTimer); for (const [signal, handler] of handlers) process.off(signal, handler); process.exit(exit); }
const timer = setTimeout(() => { process.stdout.destroy(); finish(1); }, Math.max(1, Math.min(2000, cleanupEnd + 2000 - Date.now(), workEnd + 32000 - Date.now())));
process.stdout.write(output + "\n", error => { clearTimeout(timer); finish(!error && !interrupted && Date.now() <= Math.min(cleanupEnd + 2000, workEnd + 32000) && report.status === "passed" ? 0 : 1); });
