#!/usr/bin/env python3
"""Build Chext Full single/split bookmarks from one canonical pair of JS sources."""
from pathlib import Path
import subprocess
root = Path(__file__).resolve().parent.parent
native = root
bridge = root/'bridge'
core = (root/'src'/'core.js').read_text(encoding='utf-8').strip()
extra = (root/'src'/'extension.js').read_text(encoding='utf-8').strip()
entry = (bridge/'bridge-source.js').read_text(encoding='utf-8').strip()
assert all(x.endswith(';') for x in (core,extra,entry))
for name,js in [('core',core),('extension',extra),('bridge',entry.removeprefix('javascript:'))]:
    f = root/f'.check_{name}.js'
    f.write_text(js,encoding='utf-8')
    try: subprocess.run(['node','--check',str(f)],check=True,capture_output=True)
    finally: f.unlink(missing_ok=True)

def bookmark(rel, src, limit=None):
    path=root/rel
    path.parent.mkdir(parents=True,exist_ok=True)
    text='javascript:'+src.removeprefix('javascript:')
    b=text.encode('utf-8')
    assert b.endswith(b';') and not b.endswith(b'\n')
    if limit: assert len(b)<=limit, (rel,len(b),limit)
    path.write_bytes(b)
    local=text.replace('chext.sahayana.hk','local.sahayana.hk:8443')
    path.with_name(path.stem+'_local.txt').write_bytes(local.encode('utf-8'))
    return len(b)

(native/'native'/'full.js').parent.mkdir(parents=True,exist_ok=True)
(native/'native'/'full.js').write_bytes((core+extra).encode('utf-8'))
results={
    'full single':bookmark('native/bookmarklet.txt',core+extra),
    'split core':bookmark('split/01-core.txt',core,5000),
    'split extension':bookmark('split/02-extension.txt',extra,5000),
    'loader 3.1 bridge':bookmark('bridge/bookmarklet.txt',entry)
}
for k,v in results.items(): print(k, v, 'bytes (including javascript:)')

# Publish runtime assets into docs/loader/ for GitHub Pages /docs publishing.
import shutil
publish = root.parent/'docs'/'loader'
for relative in ('src/core.js','src/extension.js', 'native/full.js',
                 'native/bookmarklet.txt','native/bookmarklet_local.txt',
                 'split/01-core.txt','split/01-core_local.txt',
                 'split/02-extension.txt','split/02-extension_local.txt',
                 'bridge/index.html','bridge/app.js','bridge/bookmarklet.txt',
                 'bridge/bookmarklet_local.txt'):
    dest=publish/relative
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(root/relative,dest)
print('Published docs/loader assets')
