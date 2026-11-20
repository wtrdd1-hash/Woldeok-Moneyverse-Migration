const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const src = fs.readFileSync('spring-backend/src/main/resources/static/assets/mv43/chrome.js','utf8');
const listeners = {};
const elements = {
  'mobile-menu-toggle': { addEventListener(name,cb){listeners['menu:'+name]=cb},setAttribute(){},focus(){} },
  'mobile-menu-close': {addEventListener(name,cb){listeners['close:'+name]=cb},focus(){}},
  'mobile-menu': {hidden:true,querySelectorAll(){return []}},
  'drawer-backdrop': {hidden:true,addEventListener(){}},
  'language-selector': {addEventListener(name,cb){listeners['lang:'+name]=cb},setAttribute(){},value:''}
};
const document = {readyState:'complete',activeElement:null,getElementById(id){return elements[id]||null},addEventListener(){},querySelectorAll(){return []}};
const window = {MV39Locale:{tx:k=>k,preference:()=> 'auto',setPreference(){}},addEventListener(){}};
vm.runInNewContext(src,{document,window});
assert.equal(typeof listeners['menu:click'],'function','navigation must initialize without optional support dialog');
assert.equal(typeof listeners['lang:change'],'function','language selector must initialize without optional support dialog');
listeners['menu:click']();
assert.equal(elements['mobile-menu'].hidden,false);
console.log('PASS: optional support dialog does not block menu and locale bootstrap');
