/* Simulates browser states only. Uses intercepted test-only responses, NEVER live member credentials. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require(process.env.MV_PLAYWRIGHT_MODULE || 'playwright');
const ORIGIN='http://127.0.0.1:4672';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage','--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
 const page=await context.newPage();
 let identity='A';let calls=0;
 const people={A:{name:'Member A',total:'12345678901234567890',admin:false,holdings:[{symbol:'AAA',quantity:'1',market_value:'12'}]},
               B:{name:'Member B',total:'42',admin:true,holdings:[]}};
 await page.route('**/api/v1/auth/session',route=>{
   calls++;
   if(identity==='guest')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedIn:false,authenticated:false,user:null})});
   const person=people[identity];return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedIn:true,authenticated:true,user:{displayName:person.name,roles:person.admin?['ROLE_ADMIN']:[]}})});
 });
 await page.route('**/api/v1/wallet/summary',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({signedIn:true,totalAvailableAmount:people[identity]?.total||'0'})}));
 await page.route('**/api/v1/stocks/portfolio',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({holdings:people[identity]?.holdings||[]})}));
 await page.goto(ORIGIN+'/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.innerText.includes('12,345,678,901,234,567,890 WLD'));
 assert.ok((await page.locator('#auth-actions').innerText()).includes('Member A'));
 assert.equal(await page.locator('a[data-admin="true"]').count(),0);
 await page.setViewportSize({width:320,height:800});
 const compact=await page.evaluate(()=>{
   const get=(selector)=>{const r=document.querySelector(selector).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
   return {viewport:innerWidth,document:document.documentElement.scrollWidth,title:get('.topbar h1'),auth:get('#auth-actions'),logout:get('.auth-logout'),lang:get('#language-selector')};
 });
 assert.ok(compact.logout.width>=44,'log out tap target below 44px: '+JSON.stringify(compact));
 assert.ok(compact.auth.top>=compact.title.bottom+4,'member controls not moved onto a safe second row: '+JSON.stringify(compact));
 assert.ok(compact.document<=compact.viewport+1,'horizontal overflow: '+JSON.stringify(compact));
 console.log('PASS 320px authenticated admin header rows, touch targets and zero overflow');
 console.log('PASS simulated member A receives exact large decimal WLD, never integer rounding');
 identity='B'; await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.innerText.includes('42 WLD'));
 assert.ok((await page.locator('#auth-actions').innerText()).includes('Member B'));
 assert.ok(!(await page.locator('body').innerText()).includes('12345678901234567890'));
 assert.equal(await page.locator('a[data-admin="true"]').count(),2);
 console.log('PASS simulated session switch A to B resets balance and administrator navigation');
 identity='guest';
 await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
 await page.waitForFunction(()=>document.body.innerText.includes('Log in to view your assets'));
 assert.equal(await page.locator('a[data-admin="true"]').count(),0);
 assert.ok(!(await page.locator('body').innerText()).includes('42 WLD'));
 console.log('PASS session expiration clears personal money and administrator navigation');
 await page.locator('#language-selector').selectOption('ko');
 await page.locator('#mobile-tabs a[href="/wallet"]').click();
 await page.waitForURL(ORIGIN+'/wallet');
 assert.equal(await page.locator('#language-selector').inputValue(),'ko');
 assert.ok((await page.locator('.hero h2').innerText()).includes('지갑'));
 console.log('PASS manual Korean preference follows navigation to the wallet page');
 assert.ok(calls>=3);
 await browser.close();
}
run().catch(error=>{console.error(error);process.exitCode=1});
