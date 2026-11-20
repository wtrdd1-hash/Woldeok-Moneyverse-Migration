import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const base=new URL('../spring-backend/src/main/resources/',import.meta.url);
const owner='00000000-0000-0000-0000-000000000101',peer='00000000-0000-0000-0000-000000000102',id='00000000-0000-0000-0000-000000000103',key='00000000-0000-0000-0000-000000000104',messageId='00000000-0000-0000-0000-000000000105',date='2026-11-20T01:23:45Z';
function core(){const path=new URL('static/assets/mv43/messaging-core.js',base);assert.ok(existsSync(path),'native messaging core must replace capture-only behavior');const window={};runInNewContext(readFileSync(path,'utf8'),{window,Intl,AbortController});return window.MV43Messaging;}
const session=()=>({ok:true,signedIn:true,csrfToken:'raw-proof',user:{id:owner}});
const response=(value,status=200)=>({ok:status<400,status,json:async()=>value,headers:{get:()=> 'application/json'}});
const thread=()=>({id,userId:owner,subject:'Question',status:'open',createdAt:date,updatedAt:date,lastMessageAt:date});
const reply=()=>({id:messageId,threadId:id,senderUserId:owner,senderKind:'user',body:'Hello\nWorld',createdAt:date});
const chat=()=>({id:messageId,conversationId:id,senderUserId:owner,body:'Hello',sequence:'9007199254740993',createdAt:date});
function client(api,post,extra={}){return api.createClient({owner:()=>owner,uuid:()=>key,fetch:async(url,o)=>url==='/api/auth/session'?response(session()):post(url,o),...extra});}
test('Unicode limits match server codepoints, ASCII edge trim, no truncation, NUL, surrogates or chat controls',()=>{
 const api=core();assert.equal(api.text('😀'.repeat(1000),1000,false).length,2000);
 for(const value of ['😀'.repeat(1001),'\0','\ud800','\udc00','  ','\n'])assert.throws(()=>api.text(value,1000,false));
 assert.equal(api.text(' \nHello\n ',1000,false),'\nHello\n');
 assert.throws(()=>api.text('Hello\n',1000,true));assert.throws(()=>api.text('a\u0085b',1000,true));
 assert.equal(api.text('　x　',1000,false),'　x　');
 assert.throws(()=>api.text('x'.repeat(121),120,false));
 assert.throws(()=>api.text('\u001c',1000,false));assert.equal(api.text('\u00a0',1000,false),'\u00a0');assert.equal(api.text('\ufeff',1000,false),'\ufeff');
});
test('actual owner-scoped list and history DTOs retain exact bigint sequence and reject foreign malformed data',()=>{
 const api=core();assert.equal(api.threads({ok:true,threads:[thread()],totalCount:1},owner)[0].id,id);
 assert.throws(()=>api.threads({ok:true,threads:[{...thread(),userId:peer}],totalCount:1},owner));
 const conversation={id,peerUserId:peer,peerNickname:'<img src=x>',lastMessage:'hello',unreadCount:2,updatedAt:date};
 assert.equal(api.conversations({ok:true,conversations:[conversation],totalUnread:2},owner)[0].peerNickname,'<img src=x>');
 assert.equal(api.messages({ok:true,messages:[chat()]},'chat',id,owner)[0].sequence,'9007199254740993');
 for(const bad of [9007199254740992,'0','01','9223372036854775808'])assert.throws(()=>api.messages({ok:true,messages:[{...chat(),sequence:bad}]},'chat',id,owner));
 assert.throws(()=>api.messages({ok:true,messages:[{...reply(),threadId:peer}]},'support',id,owner));
 assert.throws(()=>api.messages({ok:true,messages:[{...chat(),senderUserId:key}]},'chat',id,owner,peer));
 assert.throws(()=>api.threads({ok:false,threads:[],totalCount:0},owner));
 const summary=api.summary({ok:true,total:100,open:40,waitingUser:30,resolved:30});assert.equal(summary.total,100);
 assert.throws(()=>api.summary({ok:true,total:1,open:1,waitingUser:1,resolved:0}));
});
test('all mutation routes use exact reviewed request envelopes and canonical receipts with fresh CSRF',async()=>{
 const api=core(),calls=[];
 const c=client(api,async(url,o)=>{calls.push({url,o});return response(url.endsWith('/threads')?{ok:true,thread:thread()}:{ok:true,message:url.includes('/chat/')?chat():reply()});});
 assert.equal((await c.submit({kind:'thread',subject:'Question',body:'Hello\nWorld'})).id,id);
 assert.equal((await c.submit({kind:'reply',target:id,body:'Hello\nWorld'})).id,messageId);
 assert.equal((await c.submit({kind:'chat',target:id,body:'Hello'})).sequence,'9007199254740993');
 assert.deepEqual(calls.map(x=>x.url),['/api/v1/support/threads','/api/v1/support/threads/'+id+'/messages','/api/v1/chat/conversations/'+id+'/messages']);
 for(const {o} of calls){assert.equal(o.headers['X-CSRF-Token'],'raw-proof');assert.equal(o.headers['Idempotency-Key'],key);assert.equal(JSON.parse(o.body).idempotencyKey,key);assert.equal(o.credentials,'same-origin');}
 assert.equal(JSON.parse(calls[0].o.body).subject,'Question');assert.equal(c.hasPending(),false);
});
test('unknown, missing and foreign receipts retain original intent and stable key; never show false delivery',async()=>{
 const api=core();
 for(const payload of [{ok:true},{ok:true,message:{...chat(),senderUserId:peer}},{ok:true,message:{...chat(),body:'changed'}},{ok:true,message:{...chat(),conversationId:peer}},{ok:true,message:{...chat(),createdAt:null}}]){
  const c=client(api,async()=>response(payload));await assert.rejects(c.submit({kind:'chat',target:id,body:'Hello'}),/unconfirmed/);assert.equal(c.hasPending(),true);
 }
 let attempt=0;const sent=[];
 const c=client(api,async(url,o)=>{sent.push(JSON.parse(o.body));if(++attempt===1)throw Error('network');return response({ok:true,message:chat()});});
 const fields={kind:'chat',target:id,body:'Hello'};
 await assert.rejects(c.submit(fields),/unconfirmed/);
 await assert.rejects(c.submit({...fields,body:'changed'}),/pending_intent/);
 await assert.rejects(c.submit({...fields,target:peer}),/pending_intent/);
 await c.submit(fields);assert.equal(sent.length,2);assert.equal(sent[0].idempotencyKey,sent[1].idempotencyKey);
});
test('double submit posts once and stale owner/clear completion cannot be delivered',async()=>{
 const api=core();let finish,calls=0;
 const c=client(api,()=>{calls++;return new Promise(r=>finish=r);});
 const fields={kind:'chat',target:id,body:'Hello'},first=c.submit(fields);
 await new Promise(r=>setImmediate(r));await assert.rejects(c.submit(fields),/in_flight/);
 assert.equal(calls,1);c.clear();finish(response({ok:true,message:chat()}));await assert.rejects(first,/account_changed/);assert.equal(c.hasPending(),false);
});
test('session bootstrap refreshes before mutations and owner transition refuses POST',async()=>{
 const api=core();let posts=0,active=owner;
 const c=client(api,async()=>{posts++;return response({ok:true,message:chat()});},{owner:()=>active,fetch:async(url,o)=>{
  if(url==='/api/auth/session')return response({...session(),user:{id:peer}});
  posts++;return response({ok:true,message:chat()});
 }});
 await assert.rejects(c.submit({kind:'chat',target:id,body:'Hello'}),/account_changed/);assert.equal(posts,0);assert.equal(c.hasPending(),false);
 const noProof=client(api,async()=>{posts++;},{fetch:async()=>response({...session(),csrfToken:''})});
 await assert.rejects(noProof.submit({kind:'chat',target:id,body:'Hello'}),/csrf_required/);assert.equal(posts,0);
});
test('independent read generations abort and suppress stale completions',async()=>{
 const api=core(),pending=[];
 const reader=api.createReader({fetch:(url,o)=>new Promise(resolve=>pending.push({resolve,o}))});
 const first=reader.get('/first');const second=reader.get('/second');
 assert.equal(pending[0].o.signal.aborted,true);
 pending[1].resolve(response({ok:true,threads:[]}));assert.equal((await second).ok,true);
 pending[0].resolve(response({private:'old'}));await assert.rejects(first,/stale/);
 const third=reader.get('/third');reader.clear();pending[2].resolve(response({private:'cleared'}));await assert.rejects(third,/stale/);
});
test('Korea date boundaries and bounded local title/status/order filters do not imply all-time search',()=>{
 const api=core(),rows=[{...thread(),id:key,lastMessageAt:'2026-11-19T15:00:00Z'},{...thread(),lastMessageAt:'2026-11-20T15:00:00Z'}];
 assert.equal(api.filterThreads(rows,{from:'2026-11-20',to:'2026-11-20'})[0].id,key);
 assert.throws(()=>api.filterThreads(rows,{from:'2026-11-20',to:''}));
 assert.throws(()=>api.filterThreads(rows,{from:'2024-01-01',to:'2026-11-20'}));
 assert.equal(api.filterThreads(rows,{q:'Question',sort:'oldest'})[0].id,key);
});
test('source privacy constraints, scoped catalogs and no native UTF16 body maxlength',()=>{
 const js=readFileSync(new URL('static/assets/mv43/messaging.js',base),'utf8');
 assert.doesNotMatch(js,/innerHTML|insertAdjacentHTML|localStorage|sessionStorage|console\.|X-User-Id|x-actor-user-id|setInterval/);
 assert.match(js,/textContent/);assert.match(js,/mv39-language-change/);assert.match(js,/pagehide/);assert.match(js,/visibilitychange/);
 for(const name of ['support','chat']){
  const html=readFileSync(new URL('templates/mv43/'+name+'.html',base),'utf8');assert.doesNotMatch(html,/maxlength="1000"/);assert.match(html,/pageHeader/);
 }
 const catalog=JSON.parse(readFileSync(new URL('ui/mv43-copy.json',base),'utf8'));for(const [key,values] of Object.entries(catalog).filter(([key])=>key.startsWith('msg')))assert.equal(values.length,5);
});

function harness(kind='support',fetcher,query='') {
 const html=readFileSync(new URL('templates/mv43/'+kind+'.html',base),'utf8'),nodes=new Map(),events={};
 class Node {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.value='';this.children=[];this.listeners={};this.dataset={};this.disabled=false;this.hidden=false;this.attributes={};this.textContent='';}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  async fire(type){for(const fn of this.listeners[type]||[])await fn({preventDefault(){},persisted:false});}
  append(...children){this.children.push(...children);}appendChild(child){this.append(child);return child;}
  replaceChildren(...children){this.children=[...children];this.textContent='';}
  setAttribute(k,v){this.attributes[k]=v;}getAttribute(k){return this.attributes[k]??null;}
  focus(){this.focused=true;}remove(){}click(){return this.fire('click');}
 }
 for(const match of html.matchAll(/<([a-z0-9]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){
  const node=new Node(match[1]);node.id=match[2];node.disabled=/\bdisabled\b/.test(match[0]);nodes.set(node.id,node);
 }
 nodes.get('messaging-root').dataset.kind=kind;
 const document={getElementById:id=>nodes.get(id)||null,createElement:tag=>new Node(tag),body:new Node('body'),hidden:false,
  addEventListener:(name,fn)=>(events[name]??=[]).push(fn)};
 const window={MV43Messaging:core(),MV39Locale:{tx:k=>language+':'+k,current:()=>language},crypto:{randomUUID:()=>key},
  location:{search:query,assign(){}},addEventListener:(name,fn)=>(events[name]??=[]).push(fn)};
 let language='en';
 const downloads=[];
 class DownloadURL extends URL {static createObjectURL(blob){downloads.push(blob);return 'blob:test';}static revokeObjectURL(){}}
 const calls=[],defaultFetch=async(url)=>{
  if(url==='/api/auth/session')return response(session());
  if(url==='/api/v1/support/threads')return response({ok:true,threads:[thread()],totalCount:1});
  if(url==='/api/v1/support/threads/summary')return response({ok:true,total:1,open:1,waitingUser:0,resolved:0});
  if(url.includes('/messages'))return response({ok:true,messages:[{...reply(),body:'<img src=x onerror=alert(1)>'}]});
  return response({},503);
 };
 const fetch=async(url,o)=>{calls.push({url,o});return fetcher?fetcher(url,o,defaultFetch):defaultFetch(url,o);};
 const jsPath=new URL('static/assets/mv43/messaging.js',base);assert.ok(existsSync(jsPath),'native DOM binding must exist');
 runInNewContext(readFileSync(jsPath,'utf8'),{window,document,fetch,Intl,URL:DownloadURL,URLSearchParams,Blob,AbortController});
 const flush=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r));};
 return {nodes,calls,downloads,flush,language:async code=>{language=code;for(const fn of events['mv39-language-change']||[])await fn();},
  emit:async name=>{for(const fn of events[name]||[])await fn({persisted:false});},document};
}
test('binding uses real owner list before private history; safe text, language retention and pagehide clearing',async()=>{
 const h=harness();await h.flush();
 assert.ok(h.calls.find(x=>x.url==='/api/v1/support/threads'));
 assert.ok(h.calls.find(x=>x.url==='/api/v1/support/threads/'+id+'/messages'));
 const field=h.nodes.get('support-body');field.value='Draft 😀';h.nodes.get('support-subject').value='Subject';
 await h.language('ko');assert.equal(field.value,'Draft 😀');assert.equal(h.nodes.get('support-subject').value,'Subject');
 const flatten=node=>[node.textContent,...node.children.flatMap(flatten)];
 assert.ok(flatten(h.nodes.get('message-history')).includes('<img src=x onerror=alert(1)>'));
 assert.equal(h.calls.filter(x=>x.o?.method==='POST').length,0);
 await h.emit('pagehide');assert.equal(field.value,'');assert.equal(h.nodes.get('support-subject').value,'');
 assert.equal(h.nodes.get('message-history').children.length,0);assert.equal(h.nodes.get('messaging-private').hidden,true);
});
test('binding pending retry locks altered inputs and locale changes preserve the same key/body',async()=>{
 let tries=0;const posts=[];
 const h=harness('support',async(url,o,fallback)=>{
  if(o?.method==='POST'){posts.push(JSON.parse(o.body));if(++tries===1)throw Error('offline');return response({ok:true,thread:thread()});}
  return fallback(url,o);
 });
 await h.flush();h.nodes.get('support-subject').value='Question';h.nodes.get('support-body').value='Hello\nWorld';
 await h.nodes.get('new-thread-form').fire('submit');await h.flush();
 assert.equal(h.nodes.get('support-body').value,'Hello\nWorld');assert.equal(h.nodes.get('support-body').disabled,true);
 await h.language('ja');assert.equal(h.nodes.get('support-body').value,'Hello\nWorld');
 await h.nodes.get('new-thread-form').fire('submit');await h.flush();
 assert.equal(posts.length,2);assert.equal(posts[0].idempotencyKey,posts[1].idempotencyKey);assert.equal(posts[0].body,posts[1].body);
 assert.equal(h.nodes.get('support-body').value,'');
});
test('binding changed account clears drafts and suppresses delayed old-account history',async()=>{
 let active=owner,finish;
 const h=harness('support',async(url,o,fallback)=>{
  if(url==='/api/auth/session')return response({...session(),user:{id:active}});
  if(url.includes('/messages'))return new Promise(r=>finish=r);
  if(url==='/api/v1/support/threads')return response({ok:true,threads:active===owner?[thread()]:[],totalCount:active===owner?1:0});
  return fallback(url,o);
 });
 await h.flush();h.nodes.get('support-body').value='Secret draft';active=peer;await h.emit('focus');await h.flush();
 finish(response({ok:true,messages:[reply()]}));await h.flush();
 assert.equal(h.nodes.get('support-body').value,'');assert.ok(h.nodes.get('message-history').children.every(node=>node.tagName!=='ARTICLE'));
 assert.equal(h.calls.filter(x=>x.o?.method==='POST').length,0);
});

test('binding same-owner refresh retains reply draft and restores uncertain retry readiness',async()=>{
 let tries=0;const posts=[];
 const h=harness('support',async(url,o,fallback)=>{
  if(o?.method==='POST'){posts.push(JSON.parse(o.body));if(++tries===1)throw Error('offline');return response({ok:true,message:reply()});}
  return fallback(url,o);
 });
 await h.flush();h.nodes.get('message-body').value='Hello\nWorld';
 await h.emit('focus');await h.flush();assert.equal(h.nodes.get('message-body').value,'Hello\nWorld');
 await h.nodes.get('message-form').fire('submit');await h.flush();assert.equal(h.nodes.get('message-body').disabled,true);
 await h.emit('focus');await h.flush();assert.equal(h.nodes.get('message-body').value,'Hello\nWorld');
 assert.equal(h.nodes.get('message-send').disabled,false);
 await h.nodes.get('message-form').fire('submit');await h.flush();assert.equal(posts.length,2);assert.equal(posts[0].idempotencyKey,posts[1].idempotencyKey);
});
test('binding focus during successful submission cannot leave delivered body available for a new-key duplicate',async()=>{
 let finish;const h=harness('support',async(url,o,fallback)=>{
  if(o?.method==='POST')return new Promise(resolve=>finish=resolve);
  return fallback(url,o);
 });
 await h.flush();h.nodes.get('message-body').value='Hello\nWorld';
 const sent=h.nodes.get('message-form').fire('submit');await h.flush();
 await h.emit('focus');await h.flush();finish(response({ok:true,message:reply()}));await sent;await h.flush();
 assert.equal(h.nodes.get('message-body').value,'');assert.equal(h.calls.filter(x=>x.o?.method==='POST').length,1);
});

test('binding existing DM source, forged selection refusal, exact sequence display and unavailable actions',async()=>{
 const fixture=async(url,o,fallback)=>{
  if(url==='/api/v1/chat/conversations')return response({ok:true,conversations:[{id,peerUserId:peer,peerNickname:'Peer <script>',unreadCount:3,updatedAt:date}],totalUnread:3});
  if(url.includes('/messages'))return response({ok:true,messages:[chat()]});
  return fallback(url,o);
 };
 const h=harness('chat',fixture,'?conversationId='+id);await h.flush();
 const flatten=node=>[node.textContent,...node.children.flatMap(flatten)];
 assert.ok(flatten(h.nodes.get('message-history')).includes('en:msgSequence: 9007199254740993'));
 for(const id of ['chat-new','chat-archived','chat-archive','chat-mute','chat-block','chat-unblock','chat-report','chat-upload'])assert.equal(h.nodes.get(id).disabled,true);
 h.nodes.get('message-body').value='Draft 😀';
 for(const code of ['en','ko','ja','zh','vi']){await h.language(code);assert.equal(h.nodes.get('message-body').value,'Draft 😀');}
 const forged=harness('chat',fixture,'?conversationId='+peer);await forged.flush();
 assert.equal(forged.calls.filter(x=>x.url.includes('/messages')).length,0);
 assert.equal(h.calls.filter(x=>x.o?.method==='POST').length,0);
});
test('CSV quotes and prefixes every untrusted cell including leading whitespace/control formulas',async()=>{
 const body=' \t=HYPERLINK("x")\n+cmd',subject=' \r=1+1';
 const h=harness('support',async(url,o,fallback)=>{
  if(url==='/api/v1/support/threads')return response({ok:true,threads:[{...thread(),subject}],totalCount:1});
  if(url.includes('/messages'))return response({ok:true,messages:[{...reply(),body}]});
  return fallback(url,o);
 });
 await h.flush();await h.nodes.get('support-export-csv').fire('click');
 assert.equal(h.downloads.length,1);
 const output=await h.downloads[0].text();
 assert.ok(output.includes('"\' '+String.fromCharCode(13)+'=1+1"'));assert.ok(output.includes('"\' \\t=HYPERLINK(""x"")\\n+cmd"'.replaceAll('\\r','\r').replaceAll('\\t','\t').replaceAll('\\n','\n')));
});

test('binding preserves original query filters locally without sending private search text to source API',async()=>{
 const h=harness('support',undefined,'?q=Question&status=open&sort=oldest&from=2026-11-20&to=2026-11-20&thread='+id);await h.flush();
 for(const [id,value] of [['support-search','Question'],['support-status','open'],['support-order','oldest'],['support-date-from','2026-11-20'],['support-date-to','2026-11-20']])assert.equal(h.nodes.get(id).value,value);
 assert.ok(h.calls.every(x=>!x.url.includes('q=')&&!x.url.includes('Question')));
});
test('verified support transcript is chronologically ordered with deterministic same-time IDs',()=>{
 const api=core(),rows=api.messages({ok:true,messages:[{...reply(),id:messageId,createdAt:'2026-11-21T01:00:00Z'},{...reply(),id:key,createdAt:date}]},'support',id,owner);
 assert.equal(rows[0].id,key);
});
