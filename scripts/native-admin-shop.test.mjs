import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const owner='00000000-0000-4000-8000-000000000101';
function item(extra={}){return {id:'00000000-0000-4000-8000-000000000102',code:'QA_CATALOG',name:'Verified fixture',description:'<script>untrusted</script>',category:'title',base_price:'9007199254740993',rarity:'rare',max_stock:100,current_stock:4,is_limited:true,active:true,purchase_limit:'none',...extra};}
function core(){const window={};runInNewContext(readFileSync(new URL('../spring-backend/src/main/resources/static/assets/mv46/admin-shop-core.js',import.meta.url),'utf8'),{window,BigInt,AbortController,setTimeout,clearTimeout});return window.MV46AdminShop;}
function reply(status,body,id=owner){return {status,ok:status===200,headers:{get:name=>name.toLowerCase()==='content-type'?'application/json':name.toLowerCase()==='x-mv-owner'?id:null},json:async()=>body};}
function session(id=owner){return {signedIn:true,authenticated:true,user:{id}};}
test('catalog preserves exact price and verified empty is distinct from malformed source',()=>{const api=core();const rows=api.parseCatalog({items:[item()]});assert.equal(rows[0].base_price,'9007199254740993');assert.equal(api.formatPrice(rows[0].base_price),'9,007,199,254,740,993');assert.equal(api.parseCatalog({items:[]}).length,0);for(const data of [null,{}, {items:[item({base_price:9007199254740992})]}, {items:[item({base_price:'01'})]}, {items:[item({base_price:'9223372036854775808'})]}, {items:[item({id:'item-sample'})]}, {items:[item({current_stock:101})]}, {items:[item({active:'true'})]}])assert.throws(()=>api.parseCatalog(data),/source_unverified/);});
test('duplicate canonical item ids and codes fail closed',()=>{const api=core();assert.throws(()=>api.parseCatalog({items:[item(),item()]}),/source_unverified/);assert.throws(()=>api.parseCatalog({items:[item(),item({id:'00000000-0000-4000-8000-000000000103',code:'qa_catalog'})]}),/source_unverified/);});
test('search and category filters operate on verified records without changing price',()=>{const api=core();const rows=api.parseCatalog({items:[item(),item({id:'00000000-0000-4000-8000-000000000103',code:'QA_FRAME',name:'Frame',category:'frame'})]});assert.equal(api.filter(rows,'verified','title').length,1);assert.equal(api.filter(rows,'qa_','frame')[0].name,'Frame');assert.equal(api.filter(rows,'absent','').length,0);assert.equal(rows[0].base_price,'9007199254740993');});
test('load binds canonical response to the same actual session before and after read',async()=>{const api=core(),calls=[];const result=await api.load(async(url,options)=>{calls.push({url,options});return reply(200,url==='/api/v1/auth/me'?session():{items:[item()]});});assert.equal(result.items.length,1);assert.equal(calls.map(c=>c.url).join(','),'/api/v1/auth/me,/api/v1/admin/shop/items,/api/v1/auth/me');for(const c of calls){assert.equal(c.options.method,'GET');assert.equal(c.options.credentials,'same-origin');assert.equal(c.options.cache,'no-store');assert.equal(c.options.headers.Authorization,undefined);}});
test('API errors, missing owner proof and mid-read account switch cannot become successful empty data',async()=>{const api=core();for(const status of [401,403,429,503])await assert.rejects(api.load(async(url)=>reply(url==='/api/v1/auth/me'?200:status,url==='/api/v1/auth/me'?session():{})),/auth_required|access_denied|rate_limited|unavailable/);await assert.rejects(api.load(async(url)=>reply(200,url==='/api/v1/auth/me'?session():{items:[]},null)),/source_unverified/);let count=0;await assert.rejects(api.load(async(url)=>reply(200,url==='/api/v1/auth/me'?session(++count>1?'00000000-0000-4000-8000-000000000199':owner):{items:[item()]})),/account_changed/);});
test('loading requires explicit successful JSON and refuses contradictory identity proof',async()=>{const api=core();await assert.rejects(api.load(async()=>reply(200,{signedIn:false,authenticated:true,user:{id:owner}})),/auth_required|source_unverified/);await assert.rejects(api.load(async()=>({...reply(200,session()),headers:{get:()=> 'text/html'}})),/unavailable/);});

test('Vietnamese grouping preserves the exact large price without numeric conversion',()=>{assert.equal(core().formatPrice('9007199254740993','vi'),'9.007.199.254.740.993');});

test('protected preview read uses only its fixed same-origin authority and still binds the actual owner',async()=>{
 const api=core(),calls=[];const path='/_mv/nov18-rebuild-qa/catalog';
 const result=await api.load(async(url)=>{calls.push(url);return reply(200,url==='/api/v1/auth/me'?session():{items:[item()]});},path);
 assert.equal(result.owner,owner);assert.equal(calls.join(','),'/api/v1/auth/me,'+path+',/api/v1/auth/me');
});
test('unapproved catalog paths cannot send any session or catalog request',async()=>{
 const api=core();let calls=0;
 for(const path of ['https://example.com/catalog','//example.com/api/v1/admin/shop/items','/api/v1/admin/users','/_mv/nov18-rebuild-qa/catalog?actor=other',''])
  await assert.rejects(api.load(async()=>{calls++;return reply(200,session());},path),/source_unverified/);
 assert.equal(calls,0);
});
