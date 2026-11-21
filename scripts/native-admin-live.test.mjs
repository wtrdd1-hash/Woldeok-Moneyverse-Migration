import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../spring-backend/src/main/resources/static/assets/mv40/admin.js',import.meta.url),'utf8');
function ui(){
  const window=new EventTarget();let language='en';
  window.MV39Locale={current:()=>language,preference:()=>language,tx:key=>language+':'+key};
  const document=new EventTarget();document.readyState='complete';document.documentElement={lang:'en'};
  const classes=new Set();document.body={classList:{toggle:(key,value)=>value?classes.add(key):classes.delete(key)}};
  class Element extends EventTarget{
    constructor(){super();this.hidden=true;this.value='';this.dataset={};this.attrs={};}
    setAttribute(key,value){this.attrs[key]=value;}
    focus(){document.activeElement=this;}
    querySelectorAll(){return [];}
  }
  const ids=Object.fromEntries(['admin-locale','admin-log-language','admin-menu-open','admin-menu-close','admin-backdrop','admin-drawer','admin-log-filter','admin-log-lines','admin-log-source','admin-member-language','member-search','page-size'].map(id=>[id,new Element()]));
  ids['admin-log-filter'].value='keep unsent query';ids['admin-log-lines'].value='50';ids['admin-log-source'].value='NGINX_ACCESS';
  const title=new Element();title.dataset.i18n='adminSystemLogs';
  document.getElementById=id=>ids[id]||null;document.querySelector=()=>title;document.querySelectorAll=selector=>selector.includes('input')?[ids['admin-log-language'],ids['admin-member-language']]:[title];
  runInNewContext(source,{document,window});
  return {window,document,ids,setLanguage:lang=>{language=lang;window.dispatchEvent(new Event('mv39-language-change'));}};
}
test('admin locale changes preserve unsubmitted log controls and the current page title',()=>{
  const page=ui();page.setLanguage('ko');
  assert.equal(page.document.title,'ko:adminSystemLogs · Woldeok Moneyverse');
  assert.equal(page.ids['admin-log-language'].value,'ko');
  assert.equal(page.ids['admin-log-filter'].value,'keep unsent query');
  assert.equal(page.ids['admin-log-lines'].value,'50');
  assert.equal(page.ids['admin-log-source'].value,'NGINX_ACCESS');
});
test('expanded admin menu keeps a translated close label and Escape restores focus',()=>{
  const page=ui();page.ids['admin-menu-open'].dispatchEvent(new Event('click'));
  assert.equal(page.ids['admin-drawer'].hidden,false);
  assert.equal(page.document.activeElement,page.ids['admin-menu-close']);
  page.setLanguage('vi');assert.equal(page.ids['admin-menu-open'].attrs['aria-label'],'vi:close');
  const escape=new Event('keydown');Object.defineProperty(escape,'key',{value:'Escape'});page.document.dispatchEvent(escape);
  assert.equal(page.ids['admin-drawer'].hidden,true);
  assert.equal(page.ids['admin-menu-open'].attrs['aria-expanded'],'false');
  assert.equal(page.document.activeElement,page.ids['admin-menu-open']);
});

test('admin locale changes preserve unsubmitted member searches and update their submitted language',()=>{
  const page=ui();page.ids['member-search'].value='unsent member query';page.ids['page-size'].value='200';
  page.setLanguage('ja');
  assert.equal(page.ids['admin-member-language'].value,'ja');
  assert.equal(page.ids['member-search'].value,'unsent member query');
  assert.equal(page.ids['page-size'].value,'200');
});
