"""One bounded public CI packet. No local app install, build or server."""
import hashlib
import json
import os
from pathlib import Path
import selectors
import shutil
import signal
import stat
import subprocess
import time

need = lambda condition, message: None if condition else (_ for _ in ()).throw(RuntimeError(message))
source = os.environ['SOURCE_COMMIT']
need(len(source) == 40 and all(c in '0123456789abcdef' for c in source), 'source pin required')
need(os.environ.get('CI') == 'true' and os.environ.get('GITHUB_ACTIONS') == 'true', 'CI only')
need(os.environ.get('GITHUB_REPOSITORY') == 'alvarovillalbaa/sonant', 'repository mismatch')
need(os.environ.get('GITHUB_EVENT_NAME') == 'create' and os.environ.get('GITHUB_REF') == 'refs/heads/qa/sonant-hosted-20261111-2', 'owned QA branch required')
event = json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text())
need(event['repository']['private'] is False and event['ref_type'] == 'branch', 'public branch required')
repo = Path.cwd().resolve()
parent = Path(os.environ['RUNNER_TEMP']).resolve()
root = parent / 'sonant-hosted'
root.mkdir(mode=0o700)
proof = root / 'proof'
proof.mkdir(mode=0o700)
work = root / 'work'
work.mkdir(mode=0o700)
identity = work.stat()
nonce = os.urandom(16).hex()
(work / '.owner').write_text(nonce)
for name in ('tmp', 'cache', 'browsers', 'config'): (work / name).mkdir(mode=0o700)
for name in ('npm-user', 'npm-global'): (work / name).write_text('')
env = {key: os.environ[key] for key in ('PATH', 'HOME')}
env.update(CI='true', LANG='C.UTF-8', TZ='UTC', NO_COLOR='1', SONANT_HOSTED_ROOT=str(work), SOURCE_COMMIT=source,
           PLAYWRIGHT_BROWSERS_PATH=str(work / 'browsers'), TMPDIR=str(work / 'tmp'), XDG_CACHE_HOME=str(work / 'cache'), XDG_CONFIG_HOME=str(work / 'config'),
           npm_config_cache=str(work / 'cache'), npm_config_userconfig=str(work / 'npm-user'), npm_config_globalconfig=str(work / 'npm-global'),
           npm_config_registry='https://registry.npmjs.org/', npm_config_audit='false', npm_config_fund='false', npm_config_update_notifier='false')
# Browser evidence is retained outside the removable tool directory.
(work / 'proof').symlink_to(proof, target_is_directory=True)
report = {'source': source, 'startedAt': time.time(), 'commands': [], 'passed': False, 'errors': []}
children = []
deadline = time.monotonic() + 480

def process_identity(entry):
    info = entry.stat()
    fields = (entry / 'stat').read_text().rsplit(')', 1)[1].split()
    return {'pid': int(entry.name), 'uid': info.st_uid, 'ppid': int(fields[1]), 'pgid': int(fields[2]), 'startTicks': fields[19]}

# Exclude only exact same-UID identities already alive before tool setup.
process_baseline = {}
for entry in Path('/proc').iterdir():
    if not entry.name.isdigit(): continue
    try:
        item = process_identity(entry)
        if item['uid'] == os.getuid(): process_baseline[item['pid']] = item
    except (FileNotFoundError, ProcessLookupError): pass
need(len(process_baseline) <= 2048, 'process baseline bound')
report['preToolProcessBaseline'] = list(process_baseline.values())

def git(*args):
    return subprocess.check_output(['git', *args], cwd=repo, timeout=10)

def guard(filename):
    need(git('rev-parse', 'HEAD').decode().strip() == source, 'source changed')
    need(not git('status', '--porcelain', '--untracked-files=all'), 'checkout changed')
    need(not git('ls-files', '--others', '--ignored', '--exclude-standard'), 'ignored residue in source')
    rows = []
    for item in git('ls-files', '--stage', '-z').split(b'\0'):
        if not item: continue
        meta, raw = item.split(b'\t', 1)
        mode, blob, stage = meta.decode().split()
        name = raw.decode()
        need(stage == '0' and mode in ('100644', '100755') and not Path(name).is_absolute() and '..' not in Path(name).parts, 'unsupported source entry')
        file = repo / name
        need(file.is_file() and not file.is_symlink(), 'source file kind')
        need(bool(file.stat().st_mode & 0o111) == (mode == '100755'), 'source mode changed')
        data = file.read_bytes()
        need(hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest() == blob, 'source blob changed')
        rows.append({'path': name, 'mode': mode, 'blob': blob, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    need(len(rows) <= 200 and sum(row['bytes'] for row in rows) <= 12000000, 'source bound')
    (proof / filename).write_text(json.dumps(rows, indent=2) + '\n')
    return rows

def group_absent(pid):
    try: os.killpg(pid, 0); return False
    except ProcessLookupError: return True

def command(label, args, seconds):
    need(time.monotonic() < deadline, 'global work deadline')
    row = {'label': label, 'streams': {}, 'signals': [], 'exitCode': None, 'groupAbsent': False}
    report['commands'].append(row)
    child = subprocess.Popen(args, cwd=repo, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True)
    children.append(child)
    row['pid'] = child.pid
    selector = selectors.DefaultSelector()
    streams = []
    for name, stream in (('stdout', child.stdout), ('stderr', child.stderr)):
        output = open(proof / f'{label}.{name}.log', 'xb')
        state = {'bytes': 0, 'retainedBytes': 0, 'eof': False, 'closed': False, 'overflow': False}
        row['streams'][name] = state
        digest = hashlib.sha256()
        selector.register(stream, selectors.EVENT_READ, (output, state, digest))
        streams.append((stream, output, state, digest))
    end = min(time.monotonic() + seconds, deadline)
    stop_at = None
    while selector.get_map() or child.poll() is None:
        now = time.monotonic()
        if now > end and stop_at is None:
            row['signals'].append('SIGTERM'); os.killpg(child.pid, signal.SIGTERM); stop_at = now
        if stop_at is not None and now > stop_at + 3 and not group_absent(child.pid) and 'SIGKILL' not in row['signals']:
            row['signals'].append('SIGKILL'); os.killpg(child.pid, signal.SIGKILL)
        if stop_at is not None and now > stop_at + 8: break
        for key, _ in selector.select(0.1):
            data = os.read(key.fileobj.fileno(), 65536)
            output, state, digest = key.data
            if not data:
                state['eof'] = True; selector.unregister(key.fileobj); key.fileobj.close(); continue
            state['bytes'] += len(data); digest.update(data)
            if state['retainedBytes'] + len(data) <= 2097152:
                output.write(data); state['retainedBytes'] += len(data)
            else: state['overflow'] = True; end = min(end, now)
    selector.close()
    for stream, output, state, digest in streams:
        stream.close(); output.close(); state['closed'] = True; state['sha256'] = digest.hexdigest()
    row['exitCode'] = child.wait(timeout=2)
    end_group = time.monotonic() + 3
    while not group_absent(child.pid) and time.monotonic() < end_group: time.sleep(0.05)
    row['groupAbsent'] = group_absent(child.pid)
    need(all(s['eof'] and s['closed'] and not s['overflow'] for s in row['streams'].values()), f'{label} incomplete streams')
    need(row['exitCode'] == 0 and not row['signals'] and row['groupAbsent'], f'{label} failed')

try:
    baseline = guard('source-before.json')
    command('node', ['node', '--version'], 5)
    need((proof / 'node.stdout.log').read_text().strip() == 'v24.22.2', 'Node version mismatch')
    command('install', ['npm', 'install', '--prefix', str(work / 'tools'), '--ignore-scripts', '--omit=optional', '--no-audit', '--no-fund', 'playwright@1.65.0'], 90)
    lock = json.loads((work / 'tools/package-lock.json').read_text())
    pins = {'playwright': 'sha512-F3AMWcR44qMBt4kq+6Kb6mX7bjGXshktKFOPULd7reED6ZJWevjbNRqysP7q+AATE9kdPEZBibex1BYsvpVoeA==',
            'playwright-core': 'sha512-vNSKgH6YqtN7cdT/L334zo0a+YwkrpicyrHJlWWPIm/Q+Nn2SWInil01oT0mbu96U4GgoRtCYQD9CzJQgju+lA=='}
    for name, integrity in pins.items():
        entry = lock['packages']['node_modules/' + name]
        need(entry['version'] == '1.65.0' and entry['integrity'] == integrity, 'tool identity mismatch')
    (proof / 'tools-lock.json').write_text(json.dumps(lock, indent=2) + '\n')
    command('chromium-install', ['node', str(work / 'tools/node_modules/playwright/cli.js'), 'install', '--with-deps', 'chromium'], 180)
    command('browser', ['node', 'tests/hosted/website.mjs'], 160)
    browser = json.loads((proof / 'browser.json').read_text())
    need(browser['passed'] and [row['id'] for row in browser['cases']] == ['H01', 'H02', 'H03', 'H04'], 'browser acceptance failed')
    report['passed'] = True
except Exception as error:
    report['errors'].append(str(error)[:1000])
finally:
    for child in reversed(children):
        try:
            if child.poll() is None:
                os.killpg(child.pid, signal.SIGTERM)
                child.wait(timeout=4)
            need(group_absent(child.pid), 'owned process group remains')
        except Exception as error: report['errors'].append('cleanup: ' + str(error)[:200])
    remaining, uncertain, skipped = [], [], []
    for entry in Path('/proc').iterdir():
        if not entry.name.isdigit() or int(entry.name) == os.getpid(): continue
        try:
            item = process_identity(entry)
            if item['uid'] != os.getuid(): continue
            if process_baseline.get(item['pid']) == item:
                skipped.append(item)
                continue
            variables = (entry / 'environ').read_bytes().split(b'\0')
            if ('SONANT_HOSTED_ROOT=' + str(work)).encode() in variables: remaining.append(int(entry.name))
        except (FileNotFoundError, ProcessLookupError): pass
        except Exception: uncertain.append(int(entry.name))
    report['ownedMarkedProcessesRemaining'] = remaining
    report['processScanUncertain'] = uncertain
    report['unchangedPreToolProcessesSkipped'] = skipped
    try:
        after = guard('source-after.json')
        need(after == baseline, 'final source differs')
        report['sourceUnchanged'] = True
        need(not remaining and not uncertain and not any('cleanup:' in e for e in report['errors']), 'cleanup uncertain')
        current = work.lstat()
        need(stat.S_ISDIR(current.st_mode) and (current.st_dev, current.st_ino) == (identity.st_dev, identity.st_ino) and (work / '.owner').read_text() == nonce, 'cleanup ownership mismatch')
        shutil.rmtree(work)
        report['ownedWorkRemoved'] = not work.exists()
    except Exception as error: report['errors'].append('final: ' + str(error)[:300])
    report['passed'] = report['passed'] and not report['errors']
    report['finishedAt'] = time.time()
    (proof / 'run.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'passed': report['passed'], 'errors': report['errors']}))
raise SystemExit(0 if report['passed'] else 1)
