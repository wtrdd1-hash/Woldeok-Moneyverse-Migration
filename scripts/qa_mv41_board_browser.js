'use strict';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.MV_PLAYWRIGHT_MODULE||'/home/debian/browser-qa/node_modules/playwright');
const URL=process.env.MV41_BOARD_URL||'http://127.0.0.1:4781/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});const page=await ctx.newPage();
 let mode='verified',tests=0,failed=0;const lines=[];
 const check=async(name,fn)=>{tests++;try{await fn();lines.push('PASS '+name);}catch(e){failed++;lines.push('FAIL '+name+': '+e.message.split('\n')[0]);}};
 const id='ad5c7c00-5a4d-47a5-98cb-fd829534cc01';
 await page.route('**/api/v1/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedIn:false})}));
 await page.route('**/api/v1/stocks',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({stocks:[]})}));
 await page.route('**/api/v1/board',r=>{
  if(mode==='fail')return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false})});
  if(mode==='unverified')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,posts:[{id,title:'Unverified sample'}]})});
  if(mode==='synthetic')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,posts:[{id:'post-wld-1',title:'Synthetic fake article'}]})});
  if(mode==='empty')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,posts:[]})});
  return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,posts:[{id,title:'Verified DB-origin post',authorName:'Verified Member',createdAt:'2026-11-19T08:00:00Z'}]})});
 });
 const feed=()=>page.locator('.feed-list').last();
 await check('Verified source post shown with real UUID',async()=>{
  await page.goto(URL,{waitUntil:'domcontentloaded'});await feed().getByText('Verified DB-origin post').waitFor();
  assert.ok((await feed().innerText()).includes('Verified Member'));
 });
 for(const [state,label] of [['fail','HTTP 503 fails closed'],['unverified','JSON false success fails closed'],['synthetic','Fabricated ID fails closed'],['empty','Verified empty shows empty not error']]){
  await check(label,async()=>{
   mode=state;await page.reload({waitUntil:'domcontentloaded'});
   const expected=state==='empty'?'Nothing to display yet':'Unable to load data';
   await feed().getByText(expected,{exact:true}).waitFor({timeout:6000});
   const text=await feed().innerText();
   assert.ok(!text.includes('Synthetic fake article')&&!text.includes('Unverified sample')&&!text.includes('Verified DB-origin post'));
   if(state!=='empty')assert.ok(text.includes('Unable to load data'));else assert.ok(text.includes('Nothing to display yet'));
  });
 }
 await check('mobile + desktop no horizontal overflow',async()=>{
  mode='verified';for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});await page.reload({waitUntil:'domcontentloaded'});
   await feed().getByText('Verified DB-origin post').waitFor();
   const [doc,viewport]=await page.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.clientWidth]);
   assert.ok(doc<=viewport+1,`${width}: ${doc}/${viewport}`);
  }
 });
 await browser.close();console.log(lines.join('\n'));console.log(`SUMMARY ${tests-failed}/${tests}`);if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
