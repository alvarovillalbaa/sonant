import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == os.environ['SOURCE_COMMIT']
assert not subprocess.check_output(['git', 'status', '--porcelain', '--untracked-files=all'])
rows = []
for item in subprocess.check_output(['git', 'ls-files', '--stage', '-z']).split(b'\0'):
    if not item:
        continue
    meta, raw = item.split(b'\t', 1)
    mode, blob, stage = meta.decode().split()
    file = Path(raw.decode())
    assert stage == '0' and mode in ('100644', '100755') and not file.is_symlink()
    data = file.read_bytes()
    assert bool(file.stat().st_mode & 0o111) == (mode == '100755')
    assert hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest() == blob
    rows.append({'path': str(file), 'mode': mode, 'blob': blob, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
assert len(rows) <= 256 and sum(row['bytes'] for row in rows) <= 32000000
Path(sys.argv[1]).write_text(json.dumps(rows, indent=2) + '\n')
