import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync,existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const resources=new URL('../spring-backend/src/main/resources/',import.meta.url);
const source=path=>readFileSync(new URL(path,resources),'utf8');
function page() {
  const document={readyState:'complete',documentElement:{lang:'en',dataset:{}},title:'Compound interest calculator'};
  class Element extends EventTarget {
    constructor(value='',text=''){super();this.value=value;this.textContent=text;this.dataset={};this.attrs={};}
    setAttribute(key,value){this.attrs[key]=value;}
    getAttribute(key){return this.attrs[key]??null;}
  }
  const ids=Object.fromEntries(Object.entries({principal:'1000',monthlyDeposit:'0',annualRate:'100',years:'1',frequency:'annually'}).map(([key,value])=>[key,new Element(value)]));
  const format=new Element('','2 matching tools');format.dataset={publicFormat:'publicResultFormat',publicCount:'2'};
  const title=new Element();title.dataset.publicTitle='publicCompoundTitle';
  const metric=new Element('','2,000'),hidden=new Element('en'),label=new Element('','Initial principal');
  label.dataset.i18n='publicPrincipal';
  const reset=new Element();reset.attrs.href='/tools/compound-calculator?lang=en';reset.dataset.publicLocaleLink='';
  const docElements={'[data-i18n]':[label],'[data-public-format]':[format],'input[name="lang"]':[hidden],'[data-public-locale-link]':[reset],'[data-i18n-placeholder]':[],'[data-i18n-aria]':[]};
  document.getElementById=id=>ids[id]??null;
  document.querySelector=selector=>selector==='[data-testid="total-final"] strong'?metric:selector==='[data-public-title]'?title:null;
  document.querySelectorAll=selector=>docElements[selector]??[];
  const window=new EventTarget();window.MV39Locale={current:()=> 'vi',tx:key=>({publicPrincipal:'Vốn ban đầu',publicResultFormat:'{count} công cụ phù hợp'}[key]??key)};
  const context={document,window,URL,Event,console};
  const html=source('templates/mv28/compound.html');
  for(const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))runInNewContext(script[1],context);
  const binder=new URL('static/assets/mv43/public.js',resources);
  if(existsSync(binder))runInNewContext(readFileSync(binder,'utf8'),context);
  return {ids,metric,hidden,label,reset,window,format,document};
}

test('editing annual inputs keeps the authoritative submitted annual result until Calculate',()=>{
  const {ids,metric}=page();
  // 1000 principal, 100% annual compounding, no deposits, one year = 2000.
  ids.frequency.dispatchEvent(new Event('change'));
  assert.equal(metric.textContent,'2,000');
  ids.principal.value='3210.12';ids.principal.dispatchEvent(new Event('input'));
  assert.equal(metric.textContent,'2,000');
});
test('shared language change translates labels without resetting current fields or submitted results',()=>{
  const {ids,metric,hidden,label,reset,window}=page();
  ids.principal.value='3210.12';
  window.dispatchEvent(new Event('mv39-language-change'));
  assert.equal(ids.principal.value,'3210.12');
  assert.equal(ids.frequency.value,'annually');
  assert.equal(metric.textContent,'2,000');
  assert.equal(label.textContent,'Vốn ban đầu');
  assert.equal(hidden.value,'vi');
  assert.equal(reset.attrs.href,'/tools/compound-calculator?lang=vi');
});

test('language change translates result counts while preserving their source values',()=>{
  const {window,format}=page();
  window.dispatchEvent(new Event('mv39-language-change'));
  assert.equal(format.textContent,'2 công cụ phù hợp');
  assert.equal(format.dataset.publicCount,'2');
});

for(const [lang,labelText] of [['en','Initial principal'],['ko','초기 투자 금액'],['ja','初期投資額'],['zh','初始本金'],['vi','Vốn ban đầu']]) {
  test('real locale engine keeps unsent calculator and hub controls for '+lang,()=>{
    const {ids,metric,hidden,label,window,document}=page();
    window.document=document;window.navigator={languages:['en']};
    window.localStorage={getItem:()=>null,setItem:()=>{}};
    runInNewContext(source('static/assets/mv39/i18n.js'),{window,Event,console});
    ids.principal.value='3210.12';ids.frequency.value='daily';
    ids.q={value:'복리'};ids.category={value:'investing'};ids.verified={checked:true};
    window.MV39Locale.setPreference(lang);
    assert.equal(label.textContent,labelText);
    assert.equal(hidden.value,lang);
    const titles={en:'Compound interest calculator',ko:'복리 계산기',ja:'複利計算機',zh:'复利计算器',vi:'Máy tính lãi kép'};
    assert.equal(document.title,titles[lang]+' | Woldeok Moneyverse');
    assert.equal(ids.principal.value,'3210.12');assert.equal(ids.frequency.value,'daily');
    assert.equal(ids.q.value,'복리');assert.equal(ids.category.value,'investing');assert.equal(ids.verified.checked,true);
    assert.equal(metric.textContent,'2,000');
  });
}
