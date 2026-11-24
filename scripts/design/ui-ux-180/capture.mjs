import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { pages } from './catalog.mjs';
import { renderPage } from './render-page.mjs';
const args=process.argv.slice(2);
const sample=args.includes('--sample');
const output=resolve(args[args.indexOf('--out')+1]||'artifacts/design-ui-ux-180');
const modulePath=process.env.DESIGN_PLAYWRIGHT_MODULE;
if(!modulePath)throw new Error('Set DESIGN_PLAYWRIGHT_MODULE to an already installed Playwright ESM module.');
const {chromium}=await import(modulePath.startsWith('/')?pathToFileURL(modulePath).href:modulePath);
const browser=await chromium.launch({headless:true,...(process.env.DESIGN_BROWSER_EXECUTABLE?{executablePath:process.env.DESIGN_BROWSER_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({deviceScaleFactor:1,colorScheme:'dark',reducedMotion:'reduce'});
let attemptedExternal=0;
await context.route('**/*',async route=>{attemptedExternal++;await route.abort();});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const chosen=sample?pages.filter(p=>['/','/admin/shop','/bank','/stocks/[symbol]','/gallery/submit','/tools/youth-leap-calculator','/login','/wallet/activity/transactions/[transactionId]','/chat','/clubs/new'].includes(p.route)):pages;
const results=[];
mkdirSync(output,{recursive:true});
for(const p of chosen) {
 for(const width of sample?[390,1440]:[320,390,768,1100,1440]) {
  await page.setViewportSize({width,height:width<768?1000:1080});
  await page.setContent(renderPage(p,{locale:'en',state:'ready'}),{waitUntil:'load'});
  await page.evaluate(()=>document.fonts.ready);
  const check=await page.evaluate(()=>{
   const root=document.documentElement;
   const overflow=Math.max(root.scrollWidth,document.body.scrollWidth)-innerWidth;
   const small=[...document.querySelectorAll('button,input,select,textarea,.bottom-nav a')].filter(e=>{
    const s=getComputedStyle(e),r=e.getBoundingClientRect();if(s.display==='none'||s.visibility==='hidden'||!r.width||!r.height)return false;
    const hit=e.matches('input[type=checkbox]')?e.closest('label').getBoundingClientRect():r;
    return hit.width<43.9||hit.height<43.9;
   }).map(e=>({tag:e.tagName,label:e.getAttribute('aria-label')||e.textContent?.slice(0,50),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
   const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
   const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
   const unlabeled=[...document.querySelectorAll('input,select,textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')).length;
   return {overflow,small,duplicateIds,unlabeled,height:root.scrollHeight};
  });
  const row={route:p.route,family:p.family,width,...check};
  results.push(row);
  if(width===390||width===1440){const dir=join(output,width===390?'mobile':'desktop');mkdirSync(dir,{recursive:true});await page.screenshot({path:join(dir,p.id+'.png'),fullPage:true,animations:'disabled'});}
 }
 console.log('rendered '+p.route);
}
writeFileSync(join(output,'browser-checks.json'),JSON.stringify({scope:'Synthetic offline design artifacts only',routes:chosen.length,cases:results.length,attemptedExternal,errors,results},null,2)+'\n');
await browser.close();
const failures=results.filter(r=>r.overflow>1||r.small.length||r.duplicateIds.length||r.unlabeled);
console.log(JSON.stringify({routes:chosen.length,cases:results.length,failures:failures.length,attemptedExternal,errors}));
if(failures.length){console.log(JSON.stringify(failures.slice(0,20)));process.exitCode=1;}
if(attemptedExternal||errors.length)process.exitCode=1;
