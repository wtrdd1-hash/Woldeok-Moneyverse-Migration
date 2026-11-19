/* Production-like browser contract for the isolated localhost Spring read-only Test server. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.MV_PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
const path=require('node:path');
const ORIGIN='http://127.0.0.1:4672';
const OUTPUT='/srv/moneyverse-data/tasks/pc-mobile-full-frontend-v2026.11.19.38/qa-screenshots';
const routes=['/','/invest','/wallet','/quests','/shop','/board','/support','/account'];
async function main(){
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-sandbox']});
 let tests=0,failures=0; const lines=[];
 async function check(label,callback){
  try{await callback();tests++;lines.push('PASS '+label);}catch(err){tests++;failures++;lines.push('FAIL '+label+': '+err.message.split('\n')[0]);}
 }
 const context=await browser.newContext({locale:'en-US',viewport:{width:390,height:844},reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:850});
  for(const route of routes){
   await check(`viewport ${width} ${route}`,async()=>{
    const response=await page.goto(ORIGIN+route,{waitUntil:'domcontentloaded',timeout:11000});
    assert.equal(response.status(),200);
    await page.waitForSelector('.hero h2',{timeout:5000});
    await page.waitForTimeout(150);
    const data=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
      hero:document.querySelector('.hero h2')?.textContent,
      cards:document.querySelectorAll('.card').length,
      lang:document.documentElement.lang}));
    assert.ok(data.scroll<=data.client+1,`overflow ${data.scroll} > ${data.client}`);
    assert.ok(data.hero&&data.cards>0,`not rendered ${JSON.stringify(data)}`);
    assert.equal(data.lang,'en');
    if(width===390&&route==='/')await page.screenshot({path:path.join(OUTPUT,'desktop-mobile-home-390-en.png'),fullPage:true});
    if(width===1440&&route==='/')await page.screenshot({path:path.join(OUTPUT,'desktop-home-1440-en.png'),fullPage:true});
   });
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
 await check('mobile drawer opens and Escape closes',async()=>{
  await page.locator('#mobile-menu-toggle').click();
  await page.waitForSelector('#mobile-menu:not([hidden])');
  assert.equal(await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded'),'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#mobile-menu').getAttribute('hidden'),'');
 });
 await check('manual Korean persists across reload',async()=>{
  await page.locator('#language-selector').selectOption('ko');
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#hero-title').textContent(),'내 자산 대시보드');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('#language-selector').inputValue(),'ko');
  assert.equal(await page.locator('#hero-title').textContent(),'내 자산 대시보드');
  await page.screenshot({path:path.join(OUTPUT,'mobile-home-390-ko.png'),fullPage:true});
 });
 await check('manual Japanese and Vietnamese translations',async()=>{
  await page.locator('#language-selector').selectOption('ja');
  assert.equal(await page.locator('#hero-title').textContent(),'マイ資産ダッシュボード');
  await page.locator('#language-selector').selectOption('vi');
  assert.equal(await page.locator('#hero-title').textContent(),'Tổng quan tài sản');
  await page.locator('#language-selector').selectOption('zh');
  assert.equal(await page.locator('#hero-title').textContent(),'我的资产概览');
 });
 await check('reset to auto follows browser English',async()=>{
  await page.locator('#language-selector').selectOption('auto');
  assert.equal(await page.locator('#hero-title').textContent(),'My assets dashboard');
  assert.equal(await page.locator('#language-selector').inputValue(),'auto');
 });
 await check('verified stock table scrolls internally instead of vertical text',async()=>{
  await page.goto(ORIGIN+'/invest',{waitUntil:'domcontentloaded'});
  const stat=await page.evaluate(()=>({exists:!!document.querySelector('.table-scroll'),width:document.querySelector('.table-scroll')?.clientWidth,
    min:document.querySelector('.data-table')?.getBoundingClientRect().width,doc:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert.ok(stat.exists,'stock page served old Spring controller instead of new shell');
  assert.ok(stat.min>=760&&stat.min>stat.width,JSON.stringify(stat));
  assert.ok(stat.doc<=stat.client+1,JSON.stringify(stat));
 });
 await check('guest never shows sample asset or internal runtime metrics',async()=>{
  await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
  const text=await page.locator('body').innerText();
  assert.ok(text.includes('Log in to view your assets'));
  for(const forbidden of ['12,580','100,000,000,000,000','Spring Boot 3.3.5','Netty 9092','2,540.21'])assert.ok(!text.includes(forbidden),forbidden);
 });
 await check('no JavaScript fatal exceptions',async()=>{assert.deepEqual(errors,[]);});
 await browser.close();
 fs.writeFileSync('/srv/moneyverse-data/tasks/pc-mobile-full-frontend-v2026.11.19.38/BROWSER_QA.log',lines.join('\n')+'\nSUMMARY '+(tests-failures)+'/'+tests+' passed\n');
 console.log(lines.join('\n'));console.log(`SUMMARY ${tests-failures}/${tests} passed`);
 if(failures)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
