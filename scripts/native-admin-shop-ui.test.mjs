import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../spring-backend/src/main/resources/static/assets/mv46/',import.meta.url);
const item=(id,name)=>({id,code:name.toUpperCase(),name,description:'<script>untrusted()</script>',category:'title',base_price:'9007199254740993',rarity:'rare',max_stock:100,current_stock:4,is_limited:true,active:true,purchase_limit:'once'});
const rows=[item('00000000-0000-4000-8000-000000000101','Alpha'),item('00000000-0000-4000-8000-000000000102','Beta')];
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function ui(){
  const document=new EventTarget(),window=new EventTarget();document.readyState='complete';document.hidden=false;let language='en',loads=0,read=async()=>({owner:'qa-owner',items:rows});
  class Element extends EventTarget {
    constructor(tag='div'){super();this.tagName=tag;this.children=[];this.attrs={};this.dataset={};this.value='';this.disabled=false;this.open=false;this.isConnected=true;this.ownText='';}
    set innerHTML(_){throw Error('Untrusted HTML must never be evaluated');}
    set textContent(value){this.ownText=String(value);this.children=[];}
    get textContent(){return this.ownText+this.children.map(child=>child.textContent).join('');}
    append(...children){for(const child of children){child.isConnected=true;this.children.push(child);}}
    replaceChildren(...children){const disconnect=child=>{child.isConnected=false;child.children.forEach(disconnect);};for(const child of this.children)disconnect(child);this.children=[];this.ownText='';this.append(...children);}
    setAttribute(name,value){this.attrs[name]=value;}
    get options(){return this.children;}
    querySelector(selector){if(selector==='option[value=""]')return this.children.find(child=>child.value==='')||null;return null;}
    focus(){document.activeElement=this;}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatchEvent(new Event('close'));}
  }
  const names=['catalog','search','category','refresh','status','count','detail','detail-close','detail-title','detail-description','detail-fields'];
  const ids=Object.fromEntries(names.map(name=>['admin-shop-'+name,new Element()]));document.getElementById=id=>ids[id]||null;document.createElement=tag=>new Element(tag);
  window.fetch=async()=>{throw Error('Unexpected direct fetch');};window.MV39Locale={tx:key=>language+':'+key,current:()=>language};
  runInNewContext(readFileSync(new URL('admin-shop-core.js',root),'utf8'),{window,BigInt,AbortController,setTimeout,clearTimeout});
  window.MV46AdminShop={...window.MV46AdminShop,load:async()=>{loads++;return read();}};
  runInNewContext(readFileSync(new URL('admin-shop.js',root),'utf8'),{document,window,Intl});
  return {window,document,ids,loads:()=>loads,setRead:fn=>{read=fn;},setLanguage:lang=>{language=lang;window.dispatchEvent(new Event('mv39-language-change'));}};
}
test('verified catalog supports search and real detail dialog, keeping query and dialog across locale changes',async()=>{
  const page=ui();await tick();const ids=page.ids,grid=ids['admin-shop-catalog'];assert.equal(grid.children.length,2);assert.equal(ids['admin-shop-search'].disabled,false);
  ids['admin-shop-search'].value='alpha';ids['admin-shop-search'].dispatchEvent(new Event('input'));assert.equal(grid.children.length,1);
  const button=grid.children[0].children.at(-1);button.dispatchEvent(new Event('click'));assert.equal(ids['admin-shop-detail'].open,true);
  assert.equal(ids['admin-shop-detail-description'].textContent,'<script>untrusted()</script>');assert.equal(page.document.activeElement,ids['admin-shop-detail-close']);
  page.setLanguage('ko');assert.equal(ids['admin-shop-search'].value,'alpha');assert.equal(ids['admin-shop-detail'].open,true);assert.match(ids['admin-shop-detail-fields'].textContent,/ko:adminShopPrice/);assert.equal(page.loads(),1);
  ids['admin-shop-detail-close'].dispatchEvent(new Event('click'));assert.equal(ids['admin-shop-detail'].open,false);assert.equal(page.document.activeElement,ids['admin-shop-refresh']);
});
test('failed refresh clears private catalog and disables search rather than showing verified empty',async()=>{
  const page=ui();await tick();page.setRead(async()=>{throw Error('access_denied');});page.ids['admin-shop-refresh'].dispatchEvent(new Event('click'));await tick();
  assert.equal(page.ids['admin-shop-catalog'].children.length,0);assert.equal(page.ids['admin-shop-count'].textContent,'');assert.equal(page.ids['admin-shop-search'].disabled,true);
  assert.equal(page.ids['admin-shop-status'].textContent,'en:adminShopDenied');assert.equal(page.ids['admin-shop-catalog'].attrs['aria-busy'],'false');
});
test('hidden-page account transition clears old content and stale in-flight reads cannot replace the new view',async()=>{
  const page=ui();await tick();let finishOld,finishNew;
  page.setRead(()=>new Promise(resolve=>{finishOld=resolve;}));page.ids['admin-shop-refresh'].dispatchEvent(new Event('click'));await tick();
  page.document.hidden=true;page.document.dispatchEvent(new Event('visibilitychange'));assert.equal(page.ids['admin-shop-catalog'].children.length,0);
  page.setRead(()=>new Promise(resolve=>{finishNew=resolve;}));page.document.hidden=false;page.document.dispatchEvent(new Event('visibilitychange'));await tick();
  finishNew({items:[rows[1]]});await tick();finishOld({items:[rows[0]]});await tick();
  assert.match(page.ids['admin-shop-catalog'].textContent,/Beta/);assert.doesNotMatch(page.ids['admin-shop-catalog'].textContent,/Alpha/);assert.equal(page.ids['admin-shop-refresh'].disabled,false);
});

test('lost catalog authority wipes hidden detail content and category metadata as well as visible cards',async()=>{
  const page=ui();await tick();const ids=page.ids;
  ids['admin-shop-catalog'].children[0].children.at(-1).dispatchEvent(new Event('click'));
  assert.match(ids['admin-shop-detail-description'].textContent,/untrusted/);
  ids['admin-shop-search'].value='private catalog query';page.setRead(async()=>{throw Error('auth_required');});
  ids['admin-shop-refresh'].dispatchEvent(new Event('click'));await tick();
  for(const suffix of ['detail-title','detail-description','detail-fields'])assert.equal(ids['admin-shop-'+suffix].textContent,'',suffix);
  assert.equal(ids['admin-shop-category'].options.length,1);assert.equal(ids['admin-shop-category'].options[0].value,'');
  assert.equal(ids['admin-shop-search'].value,'');assert.equal(ids['admin-shop-detail'].open,false);
});

test('same-owner refresh restores search only after proof, while account change discards the old query',async()=>{
  const page=ui();await tick();page.ids['admin-shop-search'].value='alpha';
  page.ids['admin-shop-refresh'].dispatchEvent(new Event('click'));await tick();assert.equal(page.ids['admin-shop-search'].value,'alpha');
  page.setRead(async()=>({owner:'different-qa-owner',items:[rows[1]]}));page.ids['admin-shop-refresh'].dispatchEvent(new Event('click'));await tick();
  assert.equal(page.ids['admin-shop-search'].value,'');assert.match(page.ids['admin-shop-catalog'].textContent,/Beta/);
});
