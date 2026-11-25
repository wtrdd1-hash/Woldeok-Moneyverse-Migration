import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root=new URL('../spring-backend/src/main/resources/static/',import.meta.url);
const files=['shop','stocks','quests','board','status'].flatMap(name=>[name+'.html',name+'/index.html']);
const html=file=>readFileSync(new URL(file,root),'utf8');
function boot(file,{amount='9007199254740993',walletOk=true,signedIn=true,walletSignedIn=signedIn,walletStatus=500,stocks=[{current_price:'105',day_open_price:'100'},{current_price:'99',day_open_price:'100'}]}={}) {
  const source=html(file),elements={};
  for(const match of source.matchAll(/<([a-z]+)[^>]*\bid="([^"]+)"[^>]*>([^<]*)/g))elements[match[2]]={textContent:match[3],innerHTML:'',dataset:{},style:{},setAttribute(key,value){this[key]=value;}};
  const state={amount,walletOk,signedIn,walletSignedIn,walletStatus,stocks,marketOk:true};let tick;
  const window=new EventTarget();window.MVI18n={getLocale:()=> 'en'};
  const document={getElementById:id=>elements[id]??null,querySelectorAll:()=>[],querySelector:()=>null,documentElement:{lang:'en'},addEventListener(){}};
  const fetch=async path=>({status:path.includes('/summary')&&!state.walletOk?state.walletStatus:200,ok:path.includes('/stocks')?state.marketOk:path.includes('/summary')?state.walletOk:true,json:async()=>path.includes('/session')?{authenticated:state.signedIn,user:state.signedIn?{displayName:'Test member',roles:[]}:null}:path.includes('/summary')?{signedIn:state.walletSignedIn,totalAvailableAmount:state.amount}:{stocks:state.stocks}});
  const sandbox={document,window,fetch,console,AbortSignal,MutationObserver:class{observe(){}},setInterval:callback=>{tick=callback;}};
  for(const match of source.matchAll(/<script>([\s\S]*?)<\/script>/g))runInNewContext(match[1],sandbox);
  return {elements,state,window,document,tick:async()=>{await tick();await settle();}};
}
async function settle(){for(let i=0;i<3;i++)await new Promise(setImmediate);}
for(const file of files){
 test(file+': first paint has no invented metric or fabricated trend',()=>{
  const source=html(file);
  for(const id of ['kpi-wallet-val','kpi-change-val','kpi-status-val'])assert.equal(source.match(new RegExp('id="'+id+'"[^>]*>([^<]*)'))?.[1],'\u2014');
  const chart=source.match(/class="chart-box"[^>]*>([\s\S]*?)<\/div>/)?.[1]??'';
  assert.doesNotMatch(chart,/<(?:polyline|path)\b/);
 });
 for(const [amount,want] of [['9007199254740993','9,007,199,254,740,993 WLD'],['0','0 WLD'],['12345678901234567890123456789012345678','12,345,678,901,234,567,890,123,456,789,012,345,678 WLD']]){
  test(file+': preserves canonical amount '+amount,async()=>{const {elements}=boot(file,{amount});await settle();assert.equal(elements['kpi-wallet-val'].textContent,want);});
 }
 for(const amount of ['1e3','01','-1',null,9007199254740992,{},'123456789012345678901234567890123456789']){
  test(file+': invalid wallet amount is unavailable '+String(amount),async()=>{const {elements}=boot(file,{amount});await settle();assert.equal(elements['kpi-wallet-val'].textContent,'\u2014');});
 }
 test(file+': wallet read failure never exposes a sample',async()=>{const {elements}=boot(file,{walletOk:false});await settle();assert.equal(elements['kpi-wallet-val'].textContent,'\u2014');});
 test(file+': guest never exposes a member or sample amount',async()=>{const {elements}=boot(file,{signedIn:false});await settle();assert.equal(elements['kpi-wallet-val'].textContent,'\u2014');});
 test(file+': failed refresh clears a previously verified wallet and market',async()=>{const page=boot(file);await settle();page.state.walletOk=false;page.state.marketOk=false;await page.tick();assert.equal(page.elements['kpi-wallet-val'].textContent,'\u2014');assert.equal(page.elements['kpi-change-val'].textContent,'\u2014');});
 test(file+': market mean uses all verified opening prices',async()=>{const {elements}=boot(file);await settle();assert.equal(elements['kpi-change-val'].textContent,'+2.00%');});
 test(file+': missing opening price cannot become a verified zero return',async()=>{const {elements}=boot(file,{stocks:[{current_price:'100'}]});await settle();assert.equal(elements['kpi-change-val'].textContent,'\u2014');});
 test(file+': fractional market return is rounded exactly',async()=>{const {elements}=boot(file,{stocks:[{current_price:'1',day_open_price:'3'}]});await settle();assert.equal(elements['kpi-change-val'].textContent,'-66.67%');});
}

for(const file of files)for(const [lang,label] of [['ko','\uc870\ud68c \ubd88\uac00'],['ja','\u53d6\u5f97\u3067\u304d\u307e\u305b\u3093'],['zh','\u65e0\u6cd5\u83b7\u53d6'],['vi','Kh\u00f4ng kh\u1ea3 d\u1ee5ng']]){
 test(file+': manual document locale overrides stale secondary engine '+lang,async()=>{
  const page=boot(file,{walletOk:false});await settle();page.document.documentElement.lang=lang;page.window.dispatchEvent(new Event('moneyverse:localeChanged'));
  assert.equal(page.elements['kpi-wallet-state'].textContent,label);assert.equal(page.elements['chart-status'].textContent,label);
 });
}

for(const file of files){
 test(file+': newer signed-out wallet response clears the earlier member header',async()=>{const page=boot(file,{walletSignedIn:false});await settle();assert.equal(page.elements['auth-action-container'].innerHTML,'');assert.equal(page.elements['kpi-wallet-val'].dataset.sourceState,'guest');});
 test(file+': wallet401 clears the earlier member header',async()=>{const page=boot(file,{walletOk:false,walletStatus:401});await settle();assert.equal(page.elements['auth-action-container'].innerHTML,'');assert.equal(page.elements['kpi-wallet-val'].dataset.sourceState,'guest');});
 test(file+': wallet500 preserves independently verified member identity',async()=>{const page=boot(file,{walletOk:false,walletStatus:500});await settle();assert.match(page.elements['auth-action-container'].innerHTML,/Test member/);assert.equal(page.elements['kpi-wallet-val'].dataset.sourceState,'unavailable');});
}
