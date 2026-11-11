import hashlib,json,pathlib,subprocess,sys
rows=[]
for item in subprocess.check_output(['git','ls-files','--stage','-z']).split(b'\0'):
    if not item: continue
    meta,raw=item.split(b'\t',1);mode,blob,stage=meta.decode().split();name=raw.decode()
    p=pathlib.Path(name);data=p.read_bytes()
    assert stage=='0' and mode in ('100644','100755') and not p.is_symlink()
    assert bool(p.stat().st_mode & 0o111)==(mode=='100755')
    assert hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()==blob
    rows.append({'path':name,'mode':mode,'blob':blob,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
pathlib.Path(sys.argv[1]).write_text(json.dumps(rows,indent=2)+'\n')
