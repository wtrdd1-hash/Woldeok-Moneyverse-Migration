import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const script=new URL('../spring-backend/src/main/resources/static/assets/mv43/auth-core.js',import.meta.url);
function core(){const window={};if(existsSync(script))runInNewContext(readFileSync(script,'utf8'),{window});assert.ok(window.MV43Auth,'Native auth client contract is missing');return window.MV43Auth;}
const userId='00000000-0000-0000-0000-000000000101';
const result=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
const signedIn=()=>({outcome:'signed-in',userId,csrfToken:'ci_raw_proof',consentCurrent:true,displayName:'ci_member',roles:[]});
test('login posts only actual fields and requires a documented signed-in receipt',async()=>{
 const calls=[],client=core().createClient({fetch:async(url,options)=>{calls.push({url,options});return result(200,signedIn());}});
 const receipt=await client.submit('login',{email:'ci_member@example.invalid',password:'ci_password',terms:true,privacy:true,age:true,next:'https://untrusted.invalid'});
 assert.equal(receipt.userId,userId);assert.equal(calls[0].url,'/api/v1/auth/local/login');
 assert.deepEqual(JSON.parse(calls[0].options.body),{email:'ci_member@example.invalid',password:'ci_password'});
 assert.equal(calls[0].options.credentials,'same-origin');assert.equal(calls[0].options.headers['X-User-Id'],undefined);
 assert.equal(calls[0].options.headers['Content-Type'],'application/json');
});
test('blocked registration and missing recovery/verify/delete contracts never send a request',async()=>{
 let calls=0;const client=core().createClient({fetch:async()=>{calls++;return result(202,{...signedIn(),accepted:true});}});
 for(const action of ['register','forgot-password','reset-password','verify-email','verify-email-change','account-deletion'])
  await assert.rejects(client.submit(action,{email:'ci_member@example.invalid',password:'ci_password',terms:true,privacy:true,age:true}),/unavailable/);
 assert.equal(calls,0);
});
test('validation rejects empty fields and unacknowledged legal notices without posting',async()=>{
 let calls=0;const client=core().createClient({fetch:async()=>{calls++;return result(200,signedIn());}});
 for(const fields of [{email:'',password:'ci_password',terms:true,privacy:true,age:true},{email:'ci_member@example.invalid',password:'',terms:true,privacy:true,age:true},{email:'ci_member@example.invalid',password:'ci_password',terms:false,privacy:true,age:true}])
  await assert.rejects(client.submit('login',fields),/validation/);
 assert.equal(calls,0);
});
test('unknown, malformed, rejected and unavailable responses cannot become success and do not alter inputs',async()=>{
 for(const [status,data] of [[200,{}],[200,{outcome:'signed-in',userId}],[202,signedIn()],[401,{detail:'invalid credentials'}],[404,{}],[503,{outcome:'signed-in'}]]){
  const fields={email:'ci_member@example.invalid',password:'ci_password',terms:true,privacy:true,age:true};
  const client=core().createClient({fetch:async()=>result(status,data)});
  await assert.rejects(client.submit('login',fields),status===401?/credentials/:/unconfirmed/);
  assert.equal(fields.password,'ci_password');assert.equal(fields.email,'ci_member@example.invalid');
 }
});
test('duplicate in-flight login cannot create a second session and permits retry after failure',async()=>{
 let finish,calls=0;const client=core().createClient({fetch:()=>{calls++;return new Promise(resolve=>finish=resolve);}});
 const fields={email:'ci_member@example.invalid',password:'ci_password',terms:true,privacy:true,age:true};
 const first=client.submit('login',fields);
 await assert.rejects(client.submit('login',fields),/in_flight/);assert.equal(calls,1);
 finish(result(503,{}));await assert.rejects(first,/unconfirmed/);
 const second=client.submit('login',fields);assert.equal(calls,2);finish(result(200,signedIn()));await second;
});
test('redirect is fixed and never follows a token or external next parameter',()=>{
 const api=core();assert.equal(api.destination(),'/');assert.equal(api.destination('https://untrusted.invalid'),'/');
});

function view(page='login'){
 class Element extends EventTarget{constructor(){super();this.value='';this.checked=false;this.disabled=false;this.dataset={};this.textContent='';}setAttribute(k,v){this[k]=v;}}
 const window=new EventTarget(),fields=Object.fromEntries(['email','password','displayName','terms','privacy','age'].map(n=>[n,new Element()]));
 const form=new Element();form.elements={namedItem:n=>fields[n]};
 const submit=new Element(),status=new Element();const ids={'native-auth-form':form,'auth-submit':submit,'auth-status':status};
 const document={body:{dataset:{authPage:page}},title:'',hidden:false,getElementById:id=>ids[id]||null,addEventListener(){}};
 window.MV43Auth=core();window.MV39Locale={tx:key=>key};window.location={assign:url=>{window.destination=url;}};
 let session={signedIn:false,user:null},reply=result(401,{}),calls=[];
 const fetch=async(url,options)=>{calls.push({url,options});return url==='/api/v1/auth/session'?result(200,session):reply;};
 const ui=new URL('../spring-backend/src/main/resources/static/assets/mv43/auth.js',import.meta.url);
 if(existsSync(ui))runInNewContext(readFileSync(ui,'utf8'),{window,document,fetch});
 return {window,fields,form,submit,status,calls,setSession:value=>{session=value;},setReply:value=>{reply=value;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('real form preserves values on failure and language changes, and requires server receipt before navigation',async()=>{
 const v=view();await tick();
 Object.assign(v.fields.email,{value:'ci_member@example.invalid'});v.fields.password.value='ci_password';
 for(const n of ['terms','privacy','age'])v.fields[n].checked=true;
 v.form.dispatchEvent(new Event('submit',{cancelable:true}));await tick();
 assert.equal(v.calls.filter(c=>c.url==='/api/v1/auth/local/login').length,1);
 assert.equal(v.status.textContent,'authCredentials');assert.equal(v.window.destination,undefined);
 v.window.dispatchEvent(new Event('mv39-language-change'));assert.equal(v.fields.password.value,'ci_password');
 v.setReply(result(200,signedIn()));v.form.dispatchEvent(new Event('submit',{cancelable:true}));await tick();
 assert.equal(v.window.destination,'/');assert.equal(v.fields.password.value,'');assert.equal(v.fields.email.value,'');
});
test('real registration UI remains blocked even after acknowledgements and programmatic submit',async()=>{
 const v=view('register');await tick();v.fields.email.value='ci_member@example.invalid';v.fields.password.value='ci_password';
 for(const n of ['terms','privacy','age'])v.fields[n].checked=true;
 v.form.dispatchEvent(new Event('submit',{cancelable:true}));await tick();
 assert.equal(v.submit.disabled,true);assert.equal(v.calls.filter(c=>c.options&&c.options.method==='POST').length,0);
 assert.equal(v.status.textContent,'authRegistrationUnavailable');
});
test('confirmed account transition and page exit clear private fields without browser storage',async()=>{
 const v=view();await tick();v.fields.email.value='ci_member@example.invalid';v.fields.password.value='ci_password';v.fields.terms.checked=true;
 v.setSession({signedIn:true,user:{id:userId}});v.window.dispatchEvent(new Event('focus'));await tick();
 assert.equal(v.fields.password.value,'');assert.equal(v.fields.email.value,'');assert.equal(v.fields.terms.checked,false);
 v.fields.password.value='ci_password';v.window.dispatchEvent(new Event('pagehide'));assert.equal(v.fields.password.value,'');
});
