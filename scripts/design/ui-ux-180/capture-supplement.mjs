import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {pages} from './catalog.mjs';
import {renderPage} from './render-page.mjs';
const copyPath=new URL('../../../docs/design/ui-ux-180-v2026.11.24.DESIGN180.1/LOCALIZATION_COPY.md',import.meta.url);
const fence=String.fromCharCode(96).repeat(3);
const dictionary=JSON.parse(readFileSync(copyPath,'utf8').split(fence+'json\n')[1].split('\n'+fence)[0]);
const locales=['ko','ja','zh-CN','vi'];
export function localePreview(html,locale){
 if(locale==='en')return html;
 const index=locales.indexOf(locale);if(index<0)throw new Error('Unsupported review locale');
 return html.replace('<html lang="en">','<html lang="'+locale+'">').replace(/>([^<>]+)</g,(match,text)=>{
  const replacement=dictionary[text]?.[index];
  return replacement?'>'+replacement+'<':match;
 }).replace('No transactions · ready','Partial locale preview · remaining copy English');
}
const output=resolve(process.argv[2]||'artifacts/design-ui-ux-180-supplement');
mkdirSync(output,{recursive:true});
const modulePath=process.env.DESIGN_PLAYWRIGHT_MODULE;
const {chromium}=await import(pathToFileURL(modulePath).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.DESIGN_BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({reducedMotion:'reduce',colorScheme:'dark'});
let external=0;await context.route('**/*',async r=>{external++;await r.abort();});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const cases=[];
async function inspect(p,width,html,name,capture=false){
 await page.setViewportSize({width,height:1000});await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
 if(name.startsWith('stress-'))await page.evaluate(()=>{
  for(const e of document.querySelectorAll('.num'))if(!e.children.length)e.textContent='99,999,999,999,999,999,999,999,999,999,999,999,999 WLD';
 });
 const check=await page.evaluate(()=>{
  const buttons=[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().width);
  const textClip=buttons.filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
  return {overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,textClip};
 });
 await page.keyboard.press('Tab');
 const focusVisible=await page.evaluate(()=>!!document.activeElement&&document.activeElement!==document.body);
 cases.push({route:p.route,width,name,...check,focusVisible});
 if(capture)await page.evaluate(()=>document.activeElement?.blur());
 if(capture)await page.screenshot({path:join(output,name+'-'+width+'.png'),fullPage:true,animations:'disabled'});
}
for(const route of ['/bank','/admin/shop','/login']){
 const p=pages.find(p=>p.route===route);
 for(const locale of ['en',...locales])for(const width of [320,390,1440]){
  await inspect(p,width,localePreview(renderPage(p),locale),'locale-'+locale+'-'+p.id,width===390);
 }
}
for(const route of ['/wallet','/admin/shop','/clubs/new','/gallery/submit','/stocks/[symbol]','/login','/tools/youth-leap-calculator']){
 const p=pages.find(p=>p.route===route);
 for(const state of p.states.filter(s=>s!=='ready'))for(const width of [320,1440]){
  await inspect(p,width,renderPage(p,{state}),'state-'+p.id+'-'+state,route==='/wallet'&&width===320);
 }
}
for(const route of ['/wallet','/bank','/wallet/activity/transactions/[transactionId]','/admin/shop']){
 const p=pages.find(p=>p.route===route);
 for(const width of [320,390,1440])await inspect(p,width,renderPage(p),'stress-'+p.id,false);
}
const failures=cases.filter(c=>c.overflow>1||c.textClip.length||!c.focusVisible);
writeFileSync(join(output,'supplement-checks.json'),JSON.stringify({scope:'Partial shared-chrome locale previews and offline state specimens; no backend acceptance',cases,external,errors,failures:failures.length},null,2)+'\n');
await browser.close();
console.log(JSON.stringify({cases:cases.length,failures:failures.length,external,errors}));
if(failures.length)console.log(JSON.stringify(failures.slice(0,12)));
if(failures.length||external||errors.length)process.exitCode=1;
