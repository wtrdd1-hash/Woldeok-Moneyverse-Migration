'use strict';
/* Isolated visual/behavior test for the client locale picker against a local synthetic fixture.
 * It is NOT real auth, finance, or production browser QA. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.MV_PLAYWRIGHT_MODULE || 'playwright');
const ORIGIN = process.env.MV39_ORIGIN || 'http://127.0.0.1:4698';

(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  let count = 0, fails = 0;
  async function check(label, run) {
    try { await run(); count++; console.log('PASS',label); }
    catch(e) { count++; fails++; console.error('FAIL',label,e.message.split('\n')[0]); }
  }
  try {
    const c = await browser.newContext({locale:'en-US',viewport:{width:390,height:844}});
    const p = await c.newPage();
    const errors = [];
    p.on('pageerror',e=>errors.push(e.message));
    const apiCalls = [];
    p.on('request',r=>{if(r.url().includes('/api/'))apiCalls.push(r.url());});

    for (const width of [320,390,768,1440]) {
      await p.setViewportSize({width,height:840});
      await check('responsive picker viewport ' + width,async()=>{
        await p.goto(ORIGIN+'/native',{waitUntil:'domcontentloaded'});
        await p.waitForURL('**/native?lang=en&mv_auto=1');
        const selected=p.locator('details.mv-language-picker summary');
        await selected.click();
        await p.locator('.mv-language-option[data-lang="vi"]').waitFor();
        const m=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,view:document.documentElement.clientWidth}));
        assert.ok(m.scroll<=m.view+1,JSON.stringify(m));
        if(width<=390){
          const rect=await p.locator('.mv-language-panel').boundingBox();
          const help=await p.locator('.mv-support-dock summary').boundingBox();
          assert.ok(rect.y+rect.height <= help.y + 1,'language menu must not overlap fixed help');
        }
        assert.equal(await p.locator('.mv-language-option').count(),6);
      });
    }
    await p.setViewportSize({width:390,height:844});
    await check('manual KO persists cookie/localStorage and keeps server KO content',async()=>{
      await p.goto(ORIGIN+'/native');
      await p.locator('details.mv-language-picker summary').click();
      await p.locator('[data-lang="ko"].mv-language-option').click();
      await p.waitForURL('**lang=ko');
      assert.equal(await p.locator('#native-title').textContent(),'네이티브 화면');
      const state=await p.evaluate(()=>({cookie:document.cookie,storage:localStorage.getItem('wdmv_locale_preference')}));
      assert.equal(state.storage,'ko');
      assert.match(state.cookie,/wdmv_locale=ko/);
      await p.goto(ORIGIN+'/native/next');
      await p.waitForURL('**/native/next?lang=ko');
      assert.equal(await p.locator('.mv-language-code').textContent(),'KO');
    });
    await check('JA/ZH/VI select and show honest English translation fallback',async()=>{
      for (const value of ['ja','zh','vi']){
        await p.locator('details.mv-language-picker summary').click();
        await p.locator('.mv-language-option[data-lang="'+value+'"]').click();
        await p.waitForURL('**lang='+value);
        assert.equal(await p.locator('.mv-language-code').textContent(),value.toUpperCase());
        assert.equal(await p.locator('.mv-language-fallback').count(),1);
      }
    });
    await check('auto reset clears cookie, stores auto and uses browser English',async()=>{
      await p.locator('details.mv-language-picker summary').click();
      await p.locator('.mv-language-option[data-mv-auto]').click();
      await p.waitForURL('**lang=en&mv_auto=1');
      const result=await p.evaluate(()=>({storage:localStorage.getItem('wdmv_locale_preference'),cookie:document.cookie}));
      assert.equal(result.storage,'auto');
      assert.ok(!result.cookie.includes('wdmv_locale='));
    });
    await check('keyboard Escape collapses active menu',async()=>{
      await p.locator('details.mv-language-picker summary').click();
      await p.keyboard.press('Escape');
      assert.equal(await p.locator('details.mv-language-picker').getAttribute('open'),null);
    });
    await check('no account API requests or browser page exceptions',async()=>{
      assert.deepEqual(apiCalls,[]);
      assert.deepEqual(errors,[]);
    });
    await c.close();
    const korean=await browser.newContext({locale:'ko-KR',viewport:{width:390,height:844}});
    const k=await korean.newPage();
    await check('automatic Korean browser preference applies on first visit',async()=>{
      await k.goto(ORIGIN+'/native',{waitUntil:'domcontentloaded'});
      await k.waitForURL('**lang=ko&mv_auto=1');
      assert.equal(await k.locator('#native-title').textContent(),'네이티브 화면');
    });
    await korean.close();
  } finally { await browser.close(); }
  console.log('BROWSER_CHECKS',count,'FAILED',fails);
  if(fails) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
