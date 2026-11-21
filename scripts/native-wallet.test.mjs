import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const owner='00000000-0000-0000-0000-000000000101',recipient='00000000-0000-0000-0000-000000000102',tx='00000000-0000-0000-0000-000000000103',key='00000000-0000-0000-0000-000000000104';
function core() { const window={};runInNewContext(readFileSync(new URL('../spring-backend/src/main/resources/static/assets/mv43/wallet-core.js',import.meta.url),'utf8'),{window,Intl});return window.MV43Wallet; }
function response(status,data){return {ok:status<400,status,json:async()=>data};}
function receipt(amount='9007199254740993'){return {ok:true,success:true,data:{success:true,txId:tx,fromUserId:owner,toUserId:recipient,amount}};}
test('canonical amounts stay exact and malformed or rounded numbers are rejected',()=>{
  const api=core();
  assert.equal(api.formatMoney('99999999999999999999999999999999999999','en'),'99,999,999,999,999,999,999,999,999,999,999,999,999 WLD');
  for(const value of ['01','1.5','1e4','-1',9007199254740992,null])assert.equal(api.canonicalMoney(value),null);
  assert.equal(api.canonicalMoney('0'),'0');
});
test('transfer uses actual API fields, raw session CSRF and stable key while retaining integer string',async()=>{
  const api=core(),calls=[];
  const client=api.createTransferClient({owner:()=>owner,csrf:()=> 'ci_csrf_raw',uuid:()=>key,fetch:async(url,options)=>{calls.push({url,options});return response(200,receipt());}});
  await client.submit({recipientUserId:recipient,amountWld:'9007199254740993'});
  assert.equal(calls[0].url,'/api/v1/wallet/transfer');
  const body=JSON.parse(calls[0].options.body);
  assert.equal(body.amountWld,'9007199254740993');assert.equal(body.recipientUserId,recipient);
  assert.equal(calls[0].options.headers['X-CSRF-Token'],'ci_csrf_raw');
  assert.equal(calls[0].options.headers['Idempotency-Key'],key);
  assert.equal(client.hasPending(),false);
});
test('uncertain result retries same intent and key and never silently changes amount',async()=>{
  const api=core(),keys=[];let attempt=0;
  const client=api.createTransferClient({owner:()=>owner,csrf:()=> 'ci_csrf_raw',uuid:()=>key,fetch:async(url,o)=>{keys.push(o.headers['Idempotency-Key']);return ++attempt===1?response(503,{ok:false}):response(200,receipt());}});
  const fields={recipientUserId:recipient,amountWld:'9007199254740993'};
  await assert.rejects(client.submit(fields),/unconfirmed/);assert.equal(client.hasPending(),true);
  await assert.rejects(client.submit({...fields,amountWld:'10'}),/pending_intent/);
  await client.submit(fields);assert.equal(keys.length,2);assert.equal(keys[0],keys[1]);
});
test('missing receipt or changed owner cannot appear successful',async()=>{
  const api=core();let active=owner;
  const client=api.createTransferClient({owner:()=>active,csrf:()=> 'ci_csrf_raw',uuid:()=>key,fetch:async()=>{active=recipient;return response(200,receipt());}});
  await assert.rejects(client.submit({recipientUserId:recipient,amountWld:'9007199254740993'}),/account_changed/);
  const noProof=api.createTransferClient({owner:()=>owner,csrf:()=> 'ci_csrf_raw',uuid:()=>key,fetch:async()=>response(200,{ok:true,data:{success:true}})});
  await assert.rejects(noProof.submit({recipientUserId:recipient,amountWld:'9007199254740993'}),/unconfirmed/);
});
test('unauthenticated, missing CSRF and duplicate in-flight submissions cannot post',async()=>{
  const api=core();let calls=0,finish;
  const invalid=api.createTransferClient({owner:()=>owner,csrf:()=>null,uuid:()=>key,fetch:async()=>{calls++;}});
  await assert.rejects(invalid.submit({recipientUserId:recipient,amountWld:'1'}),/csrf_required/);assert.equal(calls,0);
  const client=api.createTransferClient({owner:()=>owner,csrf:()=> 'ci_csrf_raw',uuid:()=>key,fetch:()=>{calls++;return new Promise(resolve=>finish=resolve);}});
  const first=client.submit({recipientUserId:recipient,amountWld:'9007199254740993'});
  await assert.rejects(client.submit({recipientUserId:recipient,amountWld:'9007199254740993'}),/in_flight/);
  assert.equal(calls,1);finish(response(200,receipt()));await first;
});

test('verified overview binds its owner and exact cash plus bank total without invented history',()=>{
  const api=core(),payload={ok:true,success:true,data:{userId:owner,currency:'WLD',balanceWld:'100000000000000000000000000000000000000',pendingBalanceWld:'99999999999999999999999999999999999999',lockedBalanceWld:'1',recentTransactions:[]}};
  const result=api.normaliseOverview(payload,owner);
  assert.equal(result.total,payload.data.balanceWld);
  assert.equal(result.transactions.length,0);
  assert.throws(()=>api.normaliseOverview(payload,recipient),/source_unverified/);
  assert.throws(()=>api.normaliseOverview({...payload,data:{...payload.data,balanceWld:'0'}},owner),/source_unverified/);
  assert.throws(()=>api.normaliseOverview({...payload,data:{...payload.data,pendingBalanceWld:null}},owner),/source_unverified/);
  assert.throws(()=>api.normaliseOverview({...payload,data:{...payload.data,recentTransactions:[{amount:9007199254740992,direction:'debit'}]}},owner),/source_unverified/);
});
