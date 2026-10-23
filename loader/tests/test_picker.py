from pathlib import Path
from playwright.sync_api import sync_playwright
r=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':840})
 page.set_content((r/'tests/fixtures/test-fixture.html').read_text())
 for f in ('src/core.js','src/extension.js'):page.evaluate((r/f).read_text())
 page.evaluate("()=>{window.clicks=0;document.addEventListener('click',()=>window.clicks++)}")
 page.evaluate("()=>{let a=window.__chext11;a.s.selector='';a.draw();document.querySelector('chext-root').shadowRoot.querySelector('button').click();window.clicks=0}")
 page.locator('#heading').click(force=True)
 page.wait_for_function("window.__chext11.s.selector.includes('#heading')")
 assert page.evaluate("window.clicks")==0,'picker event leaked to page'
 assert page.evaluate("document.querySelector('chext-root').shadowRoot.querySelector('div').style.display")!='none'
 print('picker click suppression/restoration OK')
 # Stress reruns - expect no duplicate hosts
 for i in range(3):
  page.evaluate((r/'src/core.js').read_text())
  page.evaluate((r/'src/extension.js').read_text())
 assert page.evaluate("document.querySelectorAll('chext-root').length")==1
 print('idempotent reinjection OK')
 page.evaluate("()=>{let a=window.__chext11;let b=[...document.querySelector('chext-root').shadowRoot.querySelectorAll('button')].find(x=>x.textContent==='Pick');b.click();window.clicks=0;a.terminate()}")
 page.locator('#heading').click(force=True)
 assert page.evaluate('window.clicks')==1
 print('terminate during picker cleans listeners OK')
 b.close()
