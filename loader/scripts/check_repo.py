#!/usr/bin/env python3
"""Repository consistency check: bookmarklet sizes, publish mirroring, local refs."""
from pathlib import Path
from html.parser import HTMLParser
import re
root=Path(__file__).resolve().parents[2]
files={
 'native/bookmarklet.txt':None,
 'split/01-core.txt':5000,
 'split/02-extension.txt':5000,
 'bridge/bookmarklet.txt':None,
}
for f,maximum in files.items():
 b=(root/'loader'/f).read_bytes()
 assert b.startswith(b'javascript:') and b.endswith(b';') and not b.endswith(b'\n'), f
 assert maximum is None or len(b)<=maximum, (f,len(b),maximum)
 assert (root/'docs/loader'/f).read_bytes()==b, f
 print(f, len(b),'bytes')
for f in ('src/core.js','src/extension.js','native/full.js','bridge/index.html','bridge/app.js'):
 assert (root/'loader'/f).read_bytes()==(root/'docs/loader'/f).read_bytes(),f
class Assets(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.copy=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='button' and 'data-file' in a:self.copy.append(a['data-file'])
  if tag=='a' and 'href' in a and a['href'].startswith('loader/') :self.links.append(a['href'])
parser=Assets();parser.feed((root/'docs/index.html').read_text(encoding='utf-8'))
assert len(parser.copy)==4,parser.copy
for ref in parser.copy+parser.links:
 f=root/'docs'/ref
 if ref.endswith('/'): f=f/'index.html'
 assert f.is_file(),f
print('Install page local asset links verified:',len(parser.copy+parser.links))
bridge=(root/'loader/bridge/index.html').read_text()
for ref in ('../src/core.js','../src/extension.js','./app.js'):
 assert ref in bridge,ref
print('Bridge references verified')
