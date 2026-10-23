from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
core=(root/'src/core.js').read_text()
ext=(root/'src/extension.js').read_text()
html=(root/'tests/fixtures/test-fixture.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    pg=browser.new_page()
    errors=[]
    pg.on('pageerror',lambda e:errors.append(str(e)))
    pg.set_content(html)
    pg.evaluate(core)
    pg.evaluate(ext)
    assert pg.evaluate("!!window.__chext11"),'app instantiation'
    assert pg.evaluate("!!document.querySelector('chext-root').shadowRoot"),'shadow root'
    def action(mode,selector):
        pg.evaluate("([mode,selector])=>{let a=window.__chext11;a.go('input');a.s.mode=mode;a.s.selector=selector;a.execute()}",[mode,selector])
        return pg.evaluate("window.__chext11.s.output")
    out=action('length','.hit\np')
    assert '.hit : 2' in out and 'p : 2' in out and 'Unique elements: 4' in out,out
    print('length OK',repr(out))
    out=action('Markdown','.hit')
    assert '## Second' in out and '**bold**' in out and '- Alpha' in out and '```js' in out and '    keep_indent()' in out and '| Name | Value |' in out,repr(out)
    print('markdown OK',repr(out[:180]))
    # append text
    pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.mode='append';a.s.selector='#appendMe';a.execute();a.s.format='Text';a.s.body='<b>text</b>';a.execute();a.apply()}")
    assert pg.locator('#appendMe').inner_text()=='before<b>text</b>'
    print('append text OK')
    # append HTML
    pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.mode='append';a.s.selector='#appendMe';a.execute();a.s.format='HTML';a.s.body='<strong>ok</strong><img onerror=\"alert(1)\" src=x><script>alert(1)</script>';a.execute();a.apply()}")
    assert pg.locator('#appendMe strong').count()==1
    assert pg.locator('#appendMe script').count()==0
    assert pg.locator('#appendMe img').get_attribute('onerror') is None
    print('append HTML sanitize OK')
    # remove confirmation
    pg.evaluate("()=>{let a=window.__chext11;a.go('input');a.s.mode='remove';a.s.selector='.removeMe';a.execute()}" )
    assert pg.locator('.removeMe').count()==1
    pg.evaluate('window.__chext11.apply()')
    assert pg.locator('.removeMe').count()==0
    print('remove preview/confirm OK')
    # minimize restore
    pg.evaluate("()=>{let s=document.querySelector('chext-root').shadowRoot;[...s.querySelectorAll('button')].find(x=>x.textContent==='Minimize').click()}")
    assert pg.evaluate("[...document.querySelector('chext-root').shadowRoot.querySelectorAll('button')].find(x=>x.textContent.includes('<>')).style.display")!='none' # title removed! alternative below
    pg.evaluate("()=>{let s=document.querySelector('chext-root').shadowRoot;[...s.querySelectorAll('button')].find(x=>x.textContent.includes('<>')).click()}")
    assert pg.evaluate("document.querySelector('chext-root').shadowRoot.querySelector('div').style.display")!='none'
    print('minimize/restore checked')
    # terminates cleanly
    pg.evaluate("()=>{let s=document.querySelector('chext-root').shadowRoot;[...s.querySelectorAll('button')].find(x=>x.textContent==='Terminate').click()}")
    assert pg.evaluate("window.__chext11===undefined && !document.querySelector('chext-root')")
    assert not errors, errors
    print('terminate OK')
    browser.close()
