import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../spring-backend/src/main/resources/static/js/mv-floating-chat.js',import.meta.url),'utf8');
function fixture(language='en',native=false) {
  const nodes={},observers=[],requests=[];
  const document={readyState:'complete',documentElement:{lang:language},activeElement:null,addEventListener(){},getElementById:id=>nodes[id]||null};
  class Element {
    constructor(){this.events={};this.attributes={};this.style={};this.value='';this.textContent='';this.open=false;this.isConnected=true;const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:x=>classes.has(x)?classes.delete(x):classes.add(x)};}
    set id(id){this._id=id;nodes[id]=this;}get id(){return this._id;}
    set innerHTML(html){this.html=html;for(const m of html.matchAll(/<([a-z][a-z0-9]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)){const e=new Element();e.id=m[3];for(const a of m[2].matchAll(/([a-z-]+)="([^"]*)"/g))e.setAttribute(a[1],a[2]);}}
    setAttribute(name,value){this.attributes[name]=value;}getAttribute(name){return this.attributes[name];}
    addEventListener(name,handler){(this.events[name]??=[]).push(handler);}
    async activate(name='click'){for(const handler of this.events[name]||[])await handler({target:this,stopPropagation(){}});}
    contains(target){return target===this;}focus(){document.activeElement=this;}
    showModal(){this.open=true;}close(){this.open=false;void this.activate('close');}
  }
  document.createElement=()=>new Element();document.body={children:[],appendChild(e){this.children.push(e);}};
  if(native){const e=new Element();e.id='mv-support-launcher';}
  // A stale legacy control must never regain an unverified send handler.
  for(const id of ['mv-support-submit','mv-support-body','mv-support-category']){const e=new Element();e.id=id;}
  const window={document,location:{pathname:'/wallet/activity'},localStorage:{setItem(){throw Error('Private data persisted');}},addEventListener(){}};
  class Observer{constructor(callback){observers.push(callback);}observe(){}}
  runInNewContext(source,{window,document,MutationObserver:Observer,fetch:async(...args)=>{requests.push(args);return {ok:true,status:200,json:async()=>({})};},alert(){},console});
  return {nodes,document,requests,observers};
}

test('legacy access widget never posts an unverified command or invents an empty-200 receipt',async()=>{
  const f=fixture();f.nodes['mv-support-body'].value='Synthetic draft';f.nodes['mv-support-category'].value='GENERAL';
  await f.nodes['mv-support-submit'].activate();
  assert.equal(f.requests.length,0,'Unverified delivery routes must remain disabled');
  assert.equal(f.nodes['mv-support-body'].value,'Synthetic draft');
});
test('an existing native support launcher prevents a duplicate global widget',()=>{
  const f=fixture('en',true);assert.equal(f.document.body.children.length,0);
});
for(const [language,support,dm] of [
  ['en','Contact support','Member messages'],['ko','관리자 고객 문의','회원 1:1 채팅'],
  ['ja','サポート窓口','メンバーのメッセージ'],['zh','联系支持','会员消息'],['vi','Liên hệ hỗ trợ','Tin nhắn thành viên']
])test('legacy access links are truthful and localized for '+language,()=>{
  const f=fixture(language);
  assert.equal(f.nodes['mv-safe-support-link']?.getAttribute('href'),'/support');
  assert.equal(f.nodes['mv-safe-chat-link']?.getAttribute('href'),'/chat');
  assert.equal(f.nodes['mv-safe-support-link']?.textContent,support);
  assert.equal(f.nodes['mv-safe-chat-link']?.textContent,dm);
  assert.equal(f.requests.length,0);
});
