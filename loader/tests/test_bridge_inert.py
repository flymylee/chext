from pathlib import Path
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parent.parent
html=(root/'bridge/index.html').read_text()
html=re.sub(r'<script src="[^"]+"></script>', '', html)
source=(root/'tests/fixtures/test-fixture.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 pg=b.new_page()
 errors=[]
 pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.set_content(html)
 for path in [root/'src/core.js',root/'src/extension.js',root/'bridge/app.js']:
  pg.add_script_tag(content=path.read_text())
 pg.evaluate('(source)=>{document.getElementById("import").value=source;document.getElementById("load").click()}',source)
 pg.wait_for_function('window.__chext11.doc!==document')
 print('DOM clone connected',pg.evaluate("window.__chext11.doc.querySelectorAll('.hit').length"))
 assert pg.evaluate("window.__chext11.doc.querySelectorAll('.hit').length")==2
 pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.mode='Markdown';a.s.selector='.hit';a.execute()}")
 out=pg.evaluate("window.__chext11.s.output")
 assert '**bold**' in out and '## Second' in out,out
 print('MD via snapshot OK')
 pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.mode='remove';a.s.selector='.removeMe';a.execute();a.apply()}")
 assert pg.evaluate("window.__chext11.doc.querySelector('.removeMe')===null")
 print('clone removal OK')
 pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.selector='';let buttons=[...document.querySelector('chext-root').shadowRoot.querySelectorAll('button')];buttons.find(x=>x.textContent==='Pick').click()}")
 # iframe is full size. Can click in viewport while modal hidden.
 pg.frame_locator('#preview').locator('#heading').click(timeout=5000)
 pg.wait_for_function("window.__chext11.s.selector.includes('#heading')",timeout=6000)
 print('frame picker',pg.evaluate("window.__chext11.s.selector"))
 print('errors',errors)
 assert not errors,errors
 b.close()
