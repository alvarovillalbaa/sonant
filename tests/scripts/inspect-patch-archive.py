"""Inspect the actual npm-produced archive, without extracting into the source."""
import base64
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import tarfile

proof = Path(os.environ['SONANT_PATCH_ROOT']) / 'proof'
source = Path.cwd()
packed = json.loads((proof / 'pack.json').read_text())
assert len(packed) == 1
info = packed[0]
assert info['name'] == '@alvarovillalbaa/sonant' and info['version'] == '0.1.1'
assert info['filename'] == 'alvarovillalbaa-sonant-0.1.1.tgz'
archive = proof / info['filename']
raw = archive.read_bytes()
assert 0 < len(raw) <= 262144
sri = 'sha512-' + base64.b64encode(hashlib.sha512(raw).digest()).decode()
assert sri == info['integrity'] and hashlib.sha1(raw).hexdigest() == info['shasum']
rows = []
with tarfile.open(archive, 'r:gz') as bundle:
    members = bundle.getmembers()
    assert len(members) == len(info['files']) and len(members) <= 100
    assert len({member.name for member in members}) == len(members)
    payload = {}
    for member in members:
        path = PurePosixPath(member.name)
        assert member.isfile() and path.parts[0] == 'package' and '..' not in path.parts and not path.is_absolute()
        relative = str(path.relative_to('package'))
        assert relative in ('package.json', 'README.md', 'LICENSE') or (
            path.parts[1] == 'dist' and len(path.parts) == 3 and relative.endswith(('.js', '.d.ts', '.js.map'))
        )
        data = bundle.extractfile(member).read()
        assert len(data) == member.size and str(source.resolve()).encode() not in data
        payload[relative] = data
        rows.append({'path': relative, 'bytes': len(data), 'mode': oct(member.mode), 'sha256': hashlib.sha256(data).hexdigest()})
    package = json.loads(payload['package.json'])
    assert package == json.loads((source / 'packages/sonant/package.json').read_text())
    assert not package.get('dependencies') and package['bin'] == {'sonant': 'dist/cli.js'}
    assert payload['README.md'] == (source / 'packages/sonant/README.md').read_bytes()
    assert payload['LICENSE'] == (source / 'packages/sonant/LICENSE').read_bytes()
    assert payload['dist/cli.js'].startswith(b'#!/usr/bin/env node')
    assert next(row for row in rows if row['path'] == 'dist/cli.js')['mode'] == '0o755'
    assert payload['dist/react.js'].startswith(b'"use client";')
    for contract in package['exports'].values():
        assert contract['types'].removeprefix('./') in payload and contract['import'].removeprefix('./') in payload
    for name, data in payload.items():
        if name.endswith('.js.map'):
            mapping = json.loads(data)
            assert mapping.get('sourceRoot', '') == ''
            assert len(mapping['sources']) == len(mapping['sourcesContent']) == 1
            original = mapping['sources'][0]
            assert original.startswith('../src/') and '..' not in PurePosixPath(original).parts[1:]
            assert mapping['sourcesContent'][0] == (source / 'packages/sonant' / original.removeprefix('../')).read_text()
    assert {row['path'] for row in rows} == {row['path'] for row in info['files']}
manifest = {'source': os.environ['SOURCE_COMMIT'], 'version': '0.1.1', 'filename': archive.name,
            'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest(), 'integrity': sri,
            'shasum': info['shasum'], 'fileCount': len(rows), 'files': rows, 'passed': True}
(proof / 'archive-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
archive.chmod(0o444)
with open(os.environ['GITHUB_ENV'], 'a') as target:
    target.write(f'SONANT_TARBALL={archive}\nSONANT_TARBALL_SHA256={manifest["sha256"]}\nSONANT_TARBALL_INTEGRITY={sri}\n')
print(json.dumps({key: value for key, value in manifest.items() if key != 'files'}))
