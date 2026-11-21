import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const file='spring-backend/src/main/resources/static/assets/mv43/tool-account.js';
const idA='00000000-0000-4000-8000-000000000001',idB='00000000-0000-4000-8000-000000000002';
const member=(id=idA,name='Alice',csrfToken='fixture-proof')=>({ok:true,success:true,authenticated:true,signedIn:true,user:{id,userId:id,displayName:name},csrfToken});
const guest={ok:true,success:true,authenticated:false,signedIn:false,user:null,csrfToken:''};
const response=(data,status=200,type='application/json')=>({ok:status===200,status,headers:{get:()=>type},json:async()=>data});
class Element extends EventTarget{
  constructor(tag){super();this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.disabled=false;this.value='';this._text='';}
  set textContent(value){this._text=String(value);this.children=[];}get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
  setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}
  appendChild(x){this.children.push(x);return x;}append(...x){this.children.push(...x);}replaceChildren(...x){this._text='';this.children=x;}
  click(){this.dispatchEvent(new Event('click'));}
}
function harness(fetch){
  assert.ok(existsSync(file),'The tool account header is missing');
  const box=new Element('div'),input=new Element('input');input.value='draft-calculator-value';
  const window=new EventTarget();let lang='en';window.MV39Locale={tx:key=>lang+':'+key};window.fetch=fetch;
  const document={readyState:'complete',getElementById:id=>id==='auth-actions'?box:null,querySelector:selector=>selector==='[data-public-title]'?new Element('title'):null,createElement:tag=>new Element(tag)};
  window.document=document;runInNewContext(readFileSync(file,'utf8'),{window,document,console,Event});
  const find=kind=>{const visit=n=>n.getAttribute?.('data-tool-account')===kind?n:n.children?.map(visit).find(Boolean);return visit(box);};
  return {box,input,window,find,language(value){lang=value;window.dispatchEvent(new Event('mv39-language-change'));}};
}
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));};
test('tools show the actual signed-in name without changing calculator drafts',async()=>{
  const calls=[],h=harness(async(url,options)=>{calls.push({url,options});return response(member());});await settle();
  assert.equal(h.find('profile').textContent,'Alice');assert.equal(h.find('profile').href,'/account');assert.ok(h.find('logout'));
  assert.equal(h.input.value,'draft-calculator-value');assert.equal(calls[0].url,'/api/v1/auth/session');assert.equal(calls[0].options.credentials,'same-origin');assert.equal(calls[0].options.cache,'no-store');assert.equal(calls[0].options.redirect,'error');
});
test('only explicit guest proof shows login; failed or malformed reads remain unavailable',async()=>{
  const anonymous=harness(async()=>response(guest));await settle();assert.ok(anonymous.find('login'));
  for(const r of [response({},200),response(member(),503),response(member(),200,'text/html'),response({...member(),signedIn:false})]){
    const h=harness(async()=>r);await settle();assert.equal(h.find('login'),undefined);assert.ok(h.find('retry'));assert.equal(h.find('profile'),undefined);
  }
});
test('a late previous-owner response cannot replace the latest account',async()=>{
  let resolveFirst,calls=0;const first=new Promise(resolve=>{resolveFirst=resolve;});
  const h=harness(async()=>++calls===1?first:response(member(idB,'Bob')));h.window.dispatchEvent(new Event('focus'));await settle();
  assert.equal(h.find('profile').textContent,'Bob');resolveFirst(response(member()));await settle();assert.equal(h.find('profile').textContent,'Bob');
});
test('language changes update controls without fetching again or evaluating profile markup',async()=>{
  let calls=0;const h=harness(async()=>{calls++;return response(member(idA,'<img src=x onerror=unsafe()>'));});await settle();h.language('ko');
  assert.equal(calls,1);assert.equal(h.find('logout').textContent,'ko:logout');assert.equal(h.find('profile').textContent,'<img src=x onerror=unsafe()>');assert.equal(h.find('profile').children.length,0);assert.equal(h.input.value,'draft-calculator-value');
});
test('logout rechecks the owner and never posts against a changed account',async()=>{
  const calls=[];const h=harness(async(url,options)=>{calls.push({url,options});return response(calls.length===1?member():member(idB,'Bob'));});await settle();h.find('logout').click();await settle();
  assert.equal(calls.filter(x=>x.options.method==='POST').length,0);assert.equal(h.find('profile').textContent,'Bob');
});
test('logout uses fresh CSRF proof and requires a verified signed-out session',async()=>{
  const calls=[];let reads=0;const h=harness(async(url,options)=>{calls.push({url,options});if(options.method==='POST')return response({ok:true,success:true});return response(++reads===1?member():reads===2?member(idA,'Alice','fresh-proof'):guest);});await settle();const button=h.find('logout');button.click();button.click();await settle();
  assert.equal(calls.filter(x=>x.options.method==='POST').length,1);assert.equal(calls.find(x=>x.options.method==='POST').options.headers['X-CSRF-Token'],'fresh-proof');assert.ok(h.find('login'));assert.equal(h.find('profile'),undefined);
});
test('a success receipt without session revocation never becomes a guest header',async()=>{
  const h=harness(async(url,options)=>response(options.method==='POST'?{ok:true,success:true}:member()));await settle();h.find('logout').click();await settle();assert.equal(h.find('login'),undefined);assert.ok(h.find('retry'));
});
