'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require(process.env.MV_PLAYWRIGHT_MODULE||'/home/debian/browser-qa/node_modules/playwright');
const URL=process.env.MV_ADMIN_QA_URL||'http://127.0.0.1:4779/admin-fixture/index.html';
const OUT=process.env.MV_ADMIN_QA_DIR||'/tmp';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const context=await browser.newContext({locale:'en-US',viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let total=0,failures=0;const lines=[];
 const check=async(label,fn)=>{total++;try{await fn();lines.push('PASS '+label);}catch(e){failures++;lines.push('FAIL '+label+': '+e.message.split('\n')[0]);}};
 for(const width of [320,360,390,430,768,1024,1440,1920]){
  await check('admin fixture viewport '+width,async()=>{
    await page.setViewportSize({width,height:850});
    const response=await page.goto(URL,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
    await page.locator('.admin-hero h2').waitFor();
    const o=await page.evaluate(()=>({full:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
      side:getComputedStyle(document.querySelector('.admin-sidebar')).display,
      tabs:getComputedStyle(document.querySelector('.admin-bottom-tabs')).display}));
    assert.ok(o.full<=o.viewport+1,JSON.stringify(o));
    assert.equal(o.side==='none',width<1024);assert.equal(o.tabs==='none',width>=1024);
    if(width===1440||width===390)await page.screenshot({path:path.join(OUT,`admin-fixture-${width}-en.png`),fullPage:true});
  });
 }
 await page.setViewportSize({width:390,height:844});await page.goto(URL,{waitUntil:'domcontentloaded'});
 await check('drawer opens and Escape closes',async()=>{await page.locator('#admin-menu-open').click();assert.equal(await page.locator('#admin-drawer').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#admin-drawer').isVisible(),false);});
 await check('language auto + manual English/Korean/Japanese/Chinese/Vietnamese persistence',async()=>{
   for(const [code,expect] of [['ko','운영 관리 센터'],['ja','運営管理センター'],['zh','运营管理中心'],['vi','Trung tâm điều hành'],['en','Operations control center']]){
     await page.locator('#admin-locale').selectOption(code);assert.equal(await page.locator('.admin-hero h2').textContent(),expect);
   }
   await page.locator('#admin-locale').selectOption('ko');await page.reload({waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('#admin-locale').inputValue(),'ko');assert.equal(await page.locator('.admin-hero h2').textContent(),'운영 관리 센터');
   await page.screenshot({path:path.join(OUT,'admin-fixture-390-ko.png'),fullPage:true});
   await page.locator('#admin-locale').selectOption('auto');assert.equal(await page.locator('.admin-hero h2').textContent(),'Operations control center');
 });
 await check('verified-source fixture labels and no fake financial telemetry',async()=>{
  const text=await page.locator('body').innerText();
  assert.ok(text.includes('Source records, not a site-wide total'));
  assert.ok(text.includes('135 WLD'));
  for(const x of ['100조 WLD','100,000,000,000,000','Spring Boot 3.3.5 LIVE','12,840명','99.99%'])assert.ok(!text.includes(x),x);
 });
 await check('table escapes untrusted name',async()=>{
  const html=await page.locator('body').innerHTML();
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
  assert.ok((await page.locator('table').textContent()).includes('Fixture Industrial'));
 });
 await check('no fatal browser JS errors',async()=>assert.deepEqual(errors,[]));
 await browser.close();
 const report=lines.join('\n')+`\nSUMMARY ${total-failures}/${total}`;
 fs.writeFileSync(path.join(OUT,'BROWSER_ADMIN_QA.log'),report+'\n');console.log(report);
 if(failures)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
