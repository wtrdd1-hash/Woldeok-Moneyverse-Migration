import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const root = new URL('../spring-backend/src/main/resources/', import.meta.url);
const source = path => readFileSync(new URL(path, root), 'utf8');
function localeWindow(cookie='', saved=null, language='ja') {
  return {
    navigator:{languages:['en']}, document:{cookie,documentElement:{dataset:{uiLanguage:language}}},
    localStorage:{getItem:()=>saved,setItem:()=>{}}, dispatchEvent:()=>{}
  };
}
test('client uses the server negotiated locale until the user requests automatic detection', () => {
  const window=localeWindow();
  runInNewContext(source('static/assets/mv39/i18n.js'),{window,Event,console});
  assert.equal(window.MV39Locale.current(),'ja');
  assert.equal(window.MV39Locale.setPreference('auto'),'en');
});
test('corrupt preference cookie does not break the locale engine', () => {
  const window=localeWindow('wdmv_locale=%',null,'vi');
  assert.doesNotThrow(()=>runInNewContext(source('static/assets/mv39/i18n.js'),{window,Event,console}));
  assert.equal(window.MV39Locale.current(),'vi');
});
test('missing translation falls back to safe English and records it once', () => {
  const window=localeWindow('',null,'en'), warnings=[];
  runInNewContext(source('static/assets/mv39/i18n.js'),{window,Event,console:{warn:(...args)=>warnings.push(args)}});
  assert.equal(window.MV39Locale.tx('missing.key'),'Translation unavailable');
  window.MV39Locale.tx('missing.key');
  assert.equal(warnings.length,1);
});
test('server and client catalogs contain the same five approved translations', () => {
  const window=localeWindow();
  runInNewContext(source('static/assets/mv39/i18n.js'),{window,Event,console});
  assert.equal(JSON.stringify(window.MV39Locale.dictionary),JSON.stringify(JSON.parse(source('ui/mv43-copy.json'))));
});
test('support opens, retains state on language change and restores focus on close without storage', () => {
  class Element extends EventTarget {
    constructor(){super();this.open=false;this.isConnected=true;this.dataset={};this.attributes={};}
    focus(){document.activeElement=this;}
    showModal(){this.open=true;}
    close(){this.open=false;this.dispatchEvent(new Event('close'));}
    setAttribute(k,v){this.attributes[k]=v;}
    querySelectorAll(){return [];}
  }
  const launcher=new Element(),panel=new Element(),close=new Element();
  const document={readyState:'complete',activeElement:launcher,addEventListener:()=>{},getElementById:id=>({'mv-support-launcher':launcher,'mv-support-panel':panel,'mv-support-close':close}[id])};
  const window=new EventTarget();window.MV39Locale={tx:k=>k};window.localStorage={setItem(){throw Error('private state persisted');}};
  runInNewContext(source('static/assets/mv43/chrome.js'),{document,window});
  launcher.dispatchEvent(new Event('click'));
  assert.equal(panel.open,true);assert.equal(document.activeElement,close);
  window.dispatchEvent(new Event('mv39-language-change'));
  assert.equal(panel.open,true);
  close.dispatchEvent(new Event('click'));
  assert.equal(panel.open,false);assert.equal(document.activeElement,launcher);
});

test('shared mobile navigation and locale selection work without the home renderer',()=>{
  const window=new EventTarget();let chosen=null;
  window.MV39Locale={tx:k=>k,setPreference:value=>{chosen=value;},preference:()=> 'auto'};
  const document={readyState:'complete',activeElement:null,querySelectorAll:()=>[]};
  class Element extends EventTarget {
    constructor(){super();this.hidden=true;this.open=false;this.dataset={};this.attributes={};this.value='';}
    setAttribute(k,v){this.attributes[k]=v;}
    focus(){document.activeElement=this;}
    querySelectorAll(){return [];}
  }
  const ids=Object.fromEntries(['mv-support-launcher','mv-support-panel','mv-support-close','mobile-menu-toggle','mobile-menu-close','drawer-backdrop','mobile-menu','language-selector'].map(id=>[id,new Element()]));
  document.getElementById=id=>ids[id]||null;
  document.addEventListener=()=>{};
  runInNewContext(source('static/assets/mv43/chrome.js'),{document,window});
  ids['mobile-menu-toggle'].dispatchEvent(new Event('click'));
  assert.equal(ids['mobile-menu'].hidden,false);
  assert.equal(ids['mobile-menu-toggle'].attributes['aria-expanded'],'true');
  ids['mobile-menu-close'].dispatchEvent(new Event('click'));
  assert.equal(ids['mobile-menu'].hidden,true);
  ids['language-selector'].value='ko';ids['language-selector'].dispatchEvent(new Event('change'));
  assert.equal(chosen,'ko');
});

test('shared aria labels follow locale changes while an expanded menu retains its close label',()=>{
  const window=new EventTarget(); let language='ko';
  window.MV39Locale={tx:key=>language+':'+key,preference:()=>language,setPreference:()=>{}};
  class Element extends EventTarget {
    constructor(key){super();this.dataset={i18nAria:key};this.attributes={};this.hidden=true;this.open=false;this.isConnected=true;}
    setAttribute(key,value){this.attributes[key]=value;}
    focus(){}
    querySelectorAll(){return [];}
  }
  const ids=Object.fromEntries(['mv-support-launcher','mv-support-panel','mv-support-close','mobile-menu-toggle','mobile-menu-close','drawer-backdrop','mobile-menu','language-selector'].map(id=>[id,new Element(id==='mobile-menu-toggle'?'menu':'close')]));
  const navigation=new Element('navigationMain');
  const pageHeading={dataset:{i18n:'login'}};
  const aria=[ids['mobile-menu-toggle'],ids['mobile-menu-close'],navigation];
  const document={readyState:'complete',activeElement:null,getElementById:id=>ids[id]||null,
    addEventListener:()=>{},title:'Old page title',querySelector:selector=>selector==='.topbar h1[data-i18n]'?pageHeading:null,querySelectorAll:selector=>selector==='[data-i18n-aria]'?aria:[]};
  runInNewContext(source('static/assets/mv43/chrome.js'),{document,window});
  assert.equal(navigation.attributes['aria-label'],'ko:navigationMain');
  assert.equal(document.title,'ko:login · W Moneyverse');
  ids['mobile-menu-toggle'].dispatchEvent(new Event('click'));
  language='ja';window.dispatchEvent(new Event('mv39-language-change'));
  assert.equal(navigation.attributes['aria-label'],'ja:navigationMain');
  assert.equal(document.title,'ja:login · W Moneyverse');
  assert.equal(ids['mobile-menu-toggle'].attributes['aria-label'],'ja:close');
  assert.equal(ids['mobile-menu-close'].attributes['aria-label'],'ja:close');
});
