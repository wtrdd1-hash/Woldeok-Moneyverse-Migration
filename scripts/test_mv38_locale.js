const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const js = fs.readFileSync(require('node:path').join(__dirname, '../spring-backend/src/main/resources/static/assets/mv38/i18n.js'),'utf8');
const disk={};
const document={cookie:'',documentElement:{lang:''}};
const context={navigator:{languages:['ja-JP','en-US']},localStorage:{getItem:k=>disk[k]||null,setItem:(k,v)=>disk[k]=v},document,Event:class Event{constructor(type){this.type=type}},dispatchEvent:()=>{}};
context.window=context;
vm.runInNewContext(js,context);
const l=context.MV38Locale;
assert.deepEqual(Array.from(l.SUPPORTED), ['en','ko','ja','zh','vi']);
assert.equal(l.preference(),'auto');
assert.equal(l.current(),'ja');
assert.equal(document.documentElement.lang,'ja');
assert.equal(l.setPreference('ko'),'ko');
assert.equal(disk.wdmv_locale_preference,'ko');
assert.equal(document.documentElement.lang,'ko');
assert.ok(document.cookie.includes('wdmv_locale=ko'));
assert.equal(l.setPreference('auto'),'ja');
assert.ok(document.cookie.includes('Max-Age=0'));
context.navigator.languages=['xx-XX','en-US'];
assert.equal(l.setPreference('auto'),'en');
assert.equal(l.tx('login'),'Log in');
for(const [key,labels] of Object.entries(l.dictionary)) {
  assert.equal(labels.length,5,`missing language: ${key}`);
  labels.forEach(label=>assert.ok(typeof label==='string'&&label.length,`empty translation: ${key}`));
}
console.log(`PASS: five language options, auto detect, manual override, persistence, reset and ${Object.keys(l.dictionary).length} complete keys`);
