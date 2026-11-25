import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require('/home/debian/browser-qa/node_modules/playwright');
const packageInfo = require('/home/debian/browser-qa/node_modules/playwright/package.json');
const origin = 'http://test.easy-scraping.com';
const evidence = '/home/debian/mv-test-frontend-real-backend-evidence-20261123/public-browser';
const publicPaths = ['/', '/tools', '/tools/compound-calculator', '/tools/stock-calculator'];
const authPaths = ['/login','/login/providers','/register','/forgot-password','/reset-password','/verify-email','/verify-email-change','/account-deletion'];
const languages = ['en','ko','ja','zh','vi'];
const widths = [320,360,390,430,768,1024,1440,1920];
const matrix = [...publicPaths.flatMap(p => widths.flatMap(width => languages.map(lang => ({path:p,width,lang})))), ...authPaths.flatMap(p => [390,1440].flatMap(width => languages.map(lang => ({path:p,width,lang}))))];
const favicon = '/assets/mv39/favicon.ico?v=7c17c9be67fb26d74879b5392423e736ed7079a3c00e5a203adcecddf35fa3d5';
const report = {source:null,origin,freshProfile:true,cases:0,failed:0,interactionsPassed:false,results:[],screenshots:[]};
let browser;
const ensure = (value, message) => assert.ok(value, message);
// The canonical guest summary has exactly these three fields and no financial value.
function guestWalletSafe(status,body) {
  if([401,403].includes(status))return body?.ok!==true;
  if(status!==200||!body||typeof body!=='object'||Array.isArray(body))return false;
  return Object.keys(body).sort().join(',')==='currency,signedIn,totalAvailableAmount'
    &&body.signedIn===false&&body.currency==='WLD'&&body.totalAvailableAmount===null;
}
const safePath = url => { try { const u = new URL(url); return u.origin === origin ? u.pathname : '[external-origin]'; } catch { return '[invalid-url]'; } };
const save = async () => fs.writeFile(path.join(evidence,'report.json'), JSON.stringify(report,null,2)+'\n');
const screenshot = async (page,name) => {const dest=path.join(evidence,name+'.png');await page.screenshot({path:dest,fullPage:true});report.screenshots.push(dest);};
async function fresh(width=1440) {
  const context = await browser.newContext({viewport:{width,height:width<768?860:1000},locale:'en-US',colorScheme:'dark',reducedMotion:'reduce',serviceWorkers:'block'});
  ensure((await context.cookies()).length === 0, 'Fresh context unexpectedly has cookies');
  const page = await context.newPage();
  const events = {pageErrors:[],httpErrors:[],failedRequests:[]};
  page.on('pageerror', () => events.pageErrors.push('Uncaught page JavaScript error'));
  page.on('response', r => { if(r.status()>=400) events.httpErrors.push({path:safePath(r.url()),status:r.status()}); });
  page.on('requestfailed', r => events.failedRequests.push({path:safePath(r.url()),error:r.failure()?.errorText||'request failed'}));
  return {context,page,events};
}
async function visit(page,p,lang='en') {
  const response = await page.goto(origin+p+(p.includes('?')?'&':'?')+'lang='+lang,{waitUntil:'networkidle',timeout:30000});
  ensure(response?.status()===200,'HTTP '+response?.status()+' at '+p);
  ensure(response.headers()['x-mv-renderer']==='Spring-MVC-Thymeleaf','Missing genuine Spring renderer header at '+p);
  const html = await response.text();
  ensure(/<html[^>]*\blang=/.test(html) && /class="topbar"/.test(html),'SSR shell absent at '+p);
  ensure(!/__next|_next\/|self\.__next_f|text\/x-component|<iframe\b|maintenance mode|service temporarily unavailable/i.test(html),'Maintenance, Next/RSC, or iframe presentation at '+p);
  await page.waitForFunction(() => Boolean(window.MV39Locale));
  await page.evaluate(() => document.fonts.ready);
  return response;
}
async function metrics(page,lang) {
  const m = await page.evaluate(() => {
    const visible = el => {const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;};
    const rect = el => {const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
    const overlap=(a,b)=>Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)>1&&Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y)>1;
    const named = el => el.id || el.className?.toString().split(' ')[0] || el.tagName;
    const issues=[];
    const top=[...document.querySelectorAll('.topbar button,.topbar select,.topbar a,.topbar h1')].filter(visible);
    for(let i=0;i<top.length;i++)for(let j=i+1;j<top.length;j++)if(!top[i].contains(top[j])&&!top[j].contains(top[i])&&overlap(rect(top[i]),rect(top[j])))issues.push('header-overlap:'+named(top[i])+':'+named(top[j]));
    const launcher=document.querySelector('#mv-support-launcher');
    if(launcher&&visible(launcher))for(const el of document.querySelectorAll('#mobile-tabs,.topbar,main button,main input,main select,main .primary-button,main .secondary-button'))if(!el.contains(launcher)&&visible(el)&&overlap(rect(launcher),rect(el)))issues.push('support-overlap:'+named(el));
    const badImages=[...document.images].filter(el=>!el.complete||el.naturalWidth===0).map(el=>new URL(el.src).pathname);
    const translations=[...document.querySelectorAll('[data-i18n]')].filter(visible);
    const translationErrors=translations.filter(el=>!window.MV39Locale || el.textContent.trim()!==window.MV39Locale.tx(el.dataset.i18n).trim()).map(el=>el.dataset.i18n);
    const s=getComputedStyle(document.body), root=getComputedStyle(document.documentElement);
    return {translatedElements:translations.length,translationErrors,lang:document.documentElement.lang,uiLanguage:document.documentElement.dataset.uiLanguage,bodyColor:s.backgroundColor,textColor:s.color,palette:{background:root.getPropertyValue('--bg').trim(),accent:root.getPropertyValue('--accent').trim()},scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,badImages,overlaps:issues,springPage:document.body.dataset.springPage||document.body.dataset.authPage||document.body.dataset.page,heading:document.querySelector('main h1,main h2')?.textContent?.trim(),favicon:document.querySelector('link[rel="icon"]')?.getAttribute('href'),logoCount:document.querySelectorAll('img.brand-mark').length};
  });
  ensure(m.lang===lang && m.uiLanguage===lang,'Incorrect document language '+JSON.stringify({expected:lang,lang:m.lang,ui:m.uiLanguage}));
  ensure(m.translatedElements>10&&m.translationErrors.length===0,'Incorrect translated presentation keys: '+m.translationErrors.join(','));
  ensure(m.bodyColor==='rgb(12, 16, 32)','Incorrect navy body '+m.bodyColor);
  ensure(m.textColor==='rgb(233, 241, 255)','Incorrect shared text palette '+m.textColor);
  ensure(m.scrollWidth<=m.clientWidth+1,'Horizontal document overflow '+m.scrollWidth+' > '+m.clientWidth);
  ensure(m.badImages.length===0,'Broken image '+m.badImages.join(','));
  ensure(m.overlaps.length===0,m.overlaps.join(';'));
  ensure(m.favicon===favicon,'Incorrect common favicon');
  ensure(m.logoCount>=2 && m.springPage && m.heading,'Missing shared chrome or meaningful content');
  return m;
}
async function assertHealthy(page,events,p) {
  ensure(events.pageErrors.length===0,events.pageErrors.join(';'));
  ensure(events.httpErrors.length===0,'HTTP subresource/API failures: '+JSON.stringify(events.httpErrors));
  ensure(events.failedRequests.length===0,'Failed subresource/API request: '+JSON.stringify(events.failedRequests));
  if(publicPaths.includes(p)&&p!=='/') {
    await page.waitForSelector('[data-tool-account="login"], [data-tool-account="status"]',{timeout:10000});
    await page.waitForFunction(() => !document.querySelector('[data-tool-account="status"]') || document.querySelector('[data-tool-account="retry"]'),null,{timeout:10000});
    ensure(await page.locator('[data-tool-account="login"]').count()===1,'Tool account API unavailable or unexpected shape');
  }
}
async function apiChecks() {
  const {context,page}=await fresh();
  try {
    await visit(page,'/');
    const read=async url=>page.evaluate(async url=>{const r=await fetch(url,{credentials:'same-origin',cache:'no-store'});return {status:r.status,type:r.headers.get('content-type'),body:await r.json()};},url);
    const identity=await read('/frontend-ui-version');
    ensure(identity.status===200,'Identity endpoint not 200');
    const body=identity.body;
    ensure(body.ok===true&&typeof body.id==='string'&&/^[0-9a-f]{40}$/.test(body.id),'Invalid frontend identity');
    report.source=body.id;
    if(process.env.EXPECTED_FRONTEND_ID)ensure(report.source===process.env.EXPECTED_FRONTEND_ID,'Wrong frontend identity');
    const session=await read('/api/v1/auth/session');
    ensure(session.status===200,'Guest session API not 200');
    const guest=session.body;
    ensure(guest.ok===true&&guest.success===true&&guest.signedIn===false&&guest.authenticated===false&&guest.user===null,'Guest session API unexpected shape');
    for(const [url,key] of [['/api/v1/stocks','stocks'],['/api/v1/board','posts']]) {
      const r=await read(url);
      ensure(r.status===200&&/^application\/json/.test(r.type||'')&&Array.isArray(r.body?.[key]),'Public API unavailable or unexpected shape: '+url);
      if(key==='posts')ensure(r.body.ok===true&&r.body.posts.every(p=>typeof p.id==='string'&&typeof p.title==='string'&&p.title.trim()),'Board API source shape invalid');
      if(key==='stocks')ensure(r.body.stocks.every(s=>typeof s.symbol==='string'&&typeof s.name==='string'),'Stock API source shape invalid');
    }
    const wallet=await read('/api/v1/wallet/summary');
    ensure(guestWalletSafe(wallet.status,wallet.body),'Guest wallet must be denied or match canonical ownerless null-amount summary');
    const image=await page.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();return {width:img.naturalWidth,height:img.naturalHeight};},favicon);
    ensure(image.width>0&&image.height>0,'Favicon is not decodable image');
  } finally {await context.close();}
}
async function interactionChecks() {
  const {context,page,events}=await fresh(390);
  try {
    await visit(page,'/tools/compound-calculator');
    for(const [id,v] of Object.entries({principal:'1000',monthlyDeposit:'0',annualRate:'10',years:'2'}))await page.locator('#'+id).fill(v);
    await page.locator('#frequency').selectOption('annually');
    for(const lang of ['ko','ja','zh','vi','en']) {
      await page.locator('#language-selector').selectOption(lang);
      await page.waitForFunction(lang=>document.documentElement.lang===lang,lang);
      for(const [id,v] of Object.entries({principal:'1000',monthlyDeposit:'0',annualRate:'10',years:'2',frequency:'annually'}))ensure(await page.locator('#'+id).inputValue()===v,'Language switch lost calculator draft '+id);
    }
    await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.locator('.calculator-form button[type="submit"]').click()]);
    ensure((await page.locator('[data-testid="total-final"] strong').textContent()).replaceAll(',','').trim()==='1210','Compound result must be 1210');
    await screenshot(page,'compound-mobile-known-result');
    await page.locator('#mobile-menu-toggle').click();
    ensure(await page.locator('#mobile-menu').isVisible(),'Mobile menu did not open');
    ensure(await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded')==='true','Mobile menu not expanded');
    await page.keyboard.press('Escape');
    ensure(!await page.locator('#mobile-menu').isVisible(),'Mobile Escape did not close');
    ensure(await page.locator('#mobile-menu-toggle').evaluate(el=>el===document.activeElement),'Mobile menu did not return focus');
    await page.locator('#mv-support-launcher').click();
    ensure(await page.locator('#mv-support-panel').evaluate(el=>el.open),'Support did not open');
    ensure(await page.locator('#mv-support-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;}),'Support dialog exceeds viewport');
    await page.locator('#mv-support-close').click();
    ensure(!await page.locator('#mv-support-panel').evaluate(el=>el.open),'Support did not close');
    ensure(await page.locator('#mv-support-launcher').evaluate(el=>el===document.activeElement),'Support did not return focus');
    await visit(page,'/tools/stock-calculator');
    for(const [id,v] of Object.entries({initialPrice:'100',initialQuantity:'10',additionalPrice:'200',additionalQuantity:'10',targetProfitPercent:'10',feeRate:'0'}))await page.locator('#'+id).fill(v);
    await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.locator('.calculator-form button[type="submit"]').click()]);
    for(const [id,v] of Object.entries({average:'150',quantity:'20',cost:'3000','target-price':'165',profit:'300'}))ensure((await page.locator('[data-testid="'+id+'"] strong').textContent()).replaceAll(',','').trim()===v,'Stock '+id+' must equal '+v);
    await visit(page,'/tools');
    await page.locator('#hub-q').fill('compound');
    await page.locator('#hub-category').selectOption('investing');
    await page.locator('#hub-verified').check();
    await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.locator('.hub-search button[type="submit"]').click()]);
    ensure(await page.locator('[data-tool-id="compound-calculator"]').count()===1,'Tools compound search/filter failed');
    ensure(await page.locator('[data-tool-id]').count()===1,'Tools filter returned unexpected tool count');
    await page.locator('#hub-q').fill('zzzz-no-matching-tool-acceptance');
    await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.locator('.hub-search button[type="submit"]').click()]);
    ensure(await page.locator('[data-tool-id]').count()===0,'Empty search returned results');
    ensure(await page.locator('.hub-results .notice').isVisible(),'Empty result message missing');
    await assertHealthy(page,events,'/tools');
    report.interactionsPassed=true;
  } finally {await context.close();}
}
async function overlapGuardSelfTest() {
  const {context,page}=await fresh(320);
  try {
    await visit(page,'/','en');
    await metrics(page,'en');
    await page.locator('#language-selector').evaluate(select=>{
      select.style.position='fixed';select.style.inset='auto';
      const launcher=document.getElementById('mv-support-launcher').getBoundingClientRect();
      select.style.left=launcher.x+'px';select.style.top=launcher.y+'px';select.style.width='56px';select.style.height='56px';
    });
    let rejected=false;
    try {await metrics(page,'en');} catch(error) {rejected=/header-overlap|support-overlap/.test(error.message);}
    ensure(rejected,'Overlap guard must still reject a real collision with a toolbar control');
    report.overlapGuardSelfTestPassed=true;
  } finally {await context.close();}
}

async function main() {
  ensure(process.env.RUN_TEST_ACCEPTANCE==='1','Set RUN_TEST_ACCEPTANCE=1 only after actual Test origin is connected');
  ensure(packageInfo.version==='1.63.0','Playwright version must remain pinned 1.63.0');
  await fs.mkdir(evidence,{recursive:true});
  const args=['--host-resolver-rules=MAP test.easy-scraping.com 127.0.0.1'];
  if(process.getuid?.()===0)args.push('--no-sandbox');
  browser=await chromium.launch({headless:true,args});
  try {
    await apiChecks();
    await overlapGuardSelfTest();
    for(const c of matrix) {
      const {context,page,events}=await fresh(c.width);
      try {
        await visit(page,c.path,c.lang);
        await assertHealthy(page,events,c.path);
        const measured=await metrics(page,c.lang);
        report.results.push({...c,metrics:measured});report.cases++;
        if(c.lang==='en'&&c.path==='/'&&[390,1440].includes(c.width))await screenshot(page,'home-'+c.width);
        if(c.lang==='en'&&c.path==='/tools/compound-calculator'&&c.width===1440)await screenshot(page,'compound-desktop');
        if(c.lang==='en'&&c.path==='/login'&&c.width===390)await screenshot(page,'login-mobile');
        if(report.cases%20===0){await save();process.stdout.write('Observed '+report.cases+'/240 cases\n');}
      } catch(error) {
        report.failed++;report.results.push({...c,error:String(error.message).slice(0,1200)});
        await screenshot(page,'failure-'+report.cases).catch(()=>{});throw error;
      } finally {await context.close();}
    }
    await interactionChecks();
    ensure(report.cases===240&&report.failed===0&&report.interactionsPassed,'Incomplete acceptance');
    await save();process.stdout.write('Observed 240/240 cases; interactions passed; source '+report.source+'\n');
  } catch(error) {
    if(report.failed===0)report.failed=1;
    report.failure=String(error.message).slice(0,1200);await save();throw error;
  } finally {await browser.close();}
}
if(process.argv.includes('--self-test')) {
  ensure(matrix.length===240,'Matrix must have 240 cases');
  ensure(new Set(matrix.map(c=>JSON.stringify(c))).size===240,'Matrix duplicate');
  ensure(matrix.filter(c=>publicPaths.includes(c.path)).length===160,'Public matrix must have 160 cases');
  ensure(matrix.filter(c=>authPaths.includes(c.path)).length===80,'Auth matrix must have 80 cases');
  assert.throws(()=>ensure(false,'deliberate failure'),'Assertion must fail closed');
  ensure(guestWalletSafe(200,{signedIn:false,currency:'WLD',totalAvailableAmount:null}),'Canonical guest wallet contract');
  ensure(guestWalletSafe(401,{})&&guestWalletSafe(403,{}),'Guest wallet denial accepted');
  for(const body of [{signedIn:false,currency:'WLD',totalAvailableAmount:'0'},{signedIn:false,currency:'WLD',totalAvailableAmount:0},{signedIn:false,currency:'WLD',totalAvailableAmount:null,user:{}},{signedIn:false,currency:'WLD',totalAvailableAmount:null,userId:'synthetic-owner'},{signedIn:false,currency:'WLD',totalAvailableAmount:null,balanceWld:'1'},{signedIn:true,currency:'WLD',totalAvailableAmount:null},{signedIn:false,currency:'USD',totalAvailableAmount:null},{signedIn:false,currency:'WLD'},{},null])ensure(!guestWalletSafe(200,body),'Unsafe or unknown guest wallet shape must be rejected');
  ensure(packageInfo.version==='1.63.0','Pinned Playwright version');
  process.stdout.write('Harness self-test: 240 unique planned cases, assertion fail-closed, pinned Playwright 1.63.0. Browser acceptance not run.\n');
} else {
  main().catch(error=>{process.stderr.write('Acceptance failed: '+String(error.message).slice(0,1200)+'\n');process.exitCode=1;});
}