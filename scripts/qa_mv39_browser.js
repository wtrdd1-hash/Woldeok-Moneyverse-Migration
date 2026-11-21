'use strict';
// Isolated fixture browser tests, NOT evidence of live authenticated ledger E2E.
const {chromium}=require(process.env.MV_PLAYWRIGHT_MODULE || '/home/debian/browser-qa/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ORIGIN='http://127.0.0.1:4777';
const OUT=process.env.MV39_QA_DIR || '/tmp';
async function main(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await browser.newContext({locale:'en-US',viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await ctx.newPage();
 let tests=0,failed=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const checks=[];
 async function check(name,fn){tests++;try{await fn();checks.push('PASS '+name);}catch(e){failed++;checks.push('FAIL '+name+': '+e.message.split('\n')[0]);}}
 for(const width of [320,360,390,430,768,1024,1440,1920]){
  await check('viewport '+width,async()=>{
   await page.setViewportSize({width,height:900});
   const response=await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.waitForSelector('#hero-title:not(:empty)');
   const v=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,
    h:document.querySelector('#hero-title')?.textContent,bottom:getComputedStyle(document.querySelector('.bottom-tabs')).display,
    side:getComputedStyle(document.querySelector('.sidebar')).display}));
   assert.ok(v.doc<=v.viewport+1,JSON.stringify(v));
   assert.ok(v.h==='My assets dashboard',JSON.stringify(v));
   assert.equal(v.bottom==='none',width>=1024);
   assert.equal(v.side==='none',width<1024);
   if(width===390||width===1440) await page.screenshot({path:path.join(OUT,`home-${width}-en.png`),fullPage:true});
  });
 }
 await page.setViewportSize({width:390,height:844});await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
 await check('mobile drawer keyboard Escape',async()=>{
  await page.locator('#mobile-menu-toggle').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').isVisible(),false);
 });
 await check('English/Korean auto and user selection',async()=>{
  await page.locator('#language-selector').selectOption('ko');
  assert.equal(await page.locator('#hero-title').textContent(),'내 자산 대시보드');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#language-selector').inputValue(),'ko');
  await page.screenshot({path:path.join(OUT,'home-390-ko.png'),fullPage:true});
  await page.locator('#language-selector').selectOption('ja');assert.equal(await page.locator('#hero-title').textContent(),'マイ資産ダッシュボード');
  await page.locator('#language-selector').selectOption('zh');assert.equal(await page.locator('#hero-title').textContent(),'我的资产概览');
  await page.locator('#language-selector').selectOption('vi');assert.equal(await page.locator('#hero-title').textContent(),'Tổng quan tài sản');
  await page.locator('#language-selector').selectOption('auto');assert.equal(await page.locator('#hero-title').textContent(),'My assets dashboard');
 });
 await check('guest never sees fabricated finances or internal telemetry',async()=>{
  await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(150);
  const text=await page.locator('body').innerText();
  assert.ok(text.includes('Log in to view your assets'));
  for(const value of ['100,000,000,000,000','12,580','+2.41%','Netty 9092','99.99%','Spring Boot 3.3.5'])assert.ok(!text.includes(value),value);
  assert.ok((await page.locator('.metric-value').first().textContent()).includes('Log in'));
 });
 let actor='A';let wallet='12345678901234567890';
 await page.route('**/api/v1/auth/session',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(actor?{signedIn:true,user:{displayName:'Member '+actor,roles:['citizen']}}:{signedIn:false})}));
 await page.route('**/api/v1/wallet/summary',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedIn:!!actor,totalAvailableAmount:wallet,currency:'WLD'})}));
 await page.route('**/api/v1/stocks',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stocks:[{symbol:'MVTEST',name:'Fixture Company',current_price:'1234',day_open_price:'1200',halt_status:'ACTIVE'}]})}));
 let personalRequests=0;
 await page.route('**/api/v1/stocks/portfolio',route=>{personalRequests++;return route.fulfill({status:403,contentType:'application/json',body:'{}'});});
 await check('signed-in wallet preserves 20 digit integer precision',async()=>{
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.metric-value')?.textContent?.includes('12,345,678,901,234,567,890'));
  assert.ok((await page.locator('body').innerText()).includes('12,345,678,901,234,567,890 WLD'));
  assert.equal(personalRequests,0);
  assert.equal((await page.locator('.auth-profile').textContent()),'Member A');
 });
 await check('market data only from fetched source',async()=>{
  await page.waitForFunction(()=>document.querySelector('.data-table')?.textContent?.includes('MVTEST'));
  const table=await page.locator('.data-table').textContent();
  assert.ok(table.includes('Fixture Company')&&table.includes('1,234 WLD'));
 });
 await check('account switching never retains previous assets',async()=>{
  actor='B';wallet='42';await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.metric-value')?.textContent?.includes('42 WLD'));
  assert.equal((await page.locator('body').innerText()).includes('12,345,678,901,234,567,890'),false);
  assert.equal((await page.locator('.auth-profile').textContent()),'Member B');
 });
 await check('logout/expiry blanks member data',async()=>{
  actor='';await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('.metric-value')?.textContent?.includes('Log in'));
  assert.equal((await page.locator('body').innerText()).includes('42 WLD'),false);
 });
 await check('no JavaScript page errors',async()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(OUT,'BROWSER_QA.log'),checks.join('\n')+`\nSUMMARY ${tests-failed}/${tests}\n`);
 await browser.close();console.log(checks.join('\n'));console.log(`SUMMARY ${tests-failed}/${tests}`);
 if(failed)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
