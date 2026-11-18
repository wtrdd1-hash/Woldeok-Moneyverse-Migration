'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('path').resolve(__dirname,'../release/spring-static-next-navigation-v27.js'),'utf8');
const routes=[];let handler;
const document={addEventListener(event,fn,capture){assert.equal(event,'click');assert.equal(capture,true);handler=fn}};
const location={href:'https://easy-scraping.com/tools',pathname:'/tools',search:'',origin:'https://easy-scraping.com',assign(url){routes.push(url)}};
class FakeElement{}; const context={window:{location},location,document,URL,Element:FakeElement}
function makeEvent(href,opts={}){
 let prevented=false,stopped=false;
 const anchor={href:href.startsWith('/')?'https://easy-scraping.com'+href:href,hasAttribute(n){return n==='download'&&!!opts.download},getAttribute(n){return n==='href'?href:n==='target'?(opts.target||''):null}};
 const target=new FakeElement();target.closest=()=>anchor;
 const event={target,button:opts.button??0,defaultPrevented:!!opts.defaultPrevented,metaKey:!!opts.metaKey,ctrlKey:!!opts.ctrlKey,shiftKey:!!opts.shiftKey,altKey:!!opts.altKey,preventDefault(){prevented=true},stopImmediatePropagation(){stopped=true}};
 handler(event);return {prevented,stopped};
}
vm.createContext(context);vm.runInContext(source,context);
const good=makeEvent('/tools/compound-calculator');assert.equal(routes.length,1);assert.equal(good.prevented,true);assert.equal(good.stopped,true);
const checks=[['shift',{shiftKey:true}],['modifier',{ctrlKey:true}],['new-tab',{target:'_blank'}],['download',{download:true}],['nonleft',{button:1}],['already-prevented',{defaultPrevented:true}]];
for(const [name,flags] of checks){const before=routes.length;makeEvent('/stocks',flags);assert.equal(routes.length,before,name)}
const before=routes.length;
for(const p of ['#section','mailto:user@example.com','https://external.example/x','javascript:void(0)']){
 makeEvent(p);assert.equal(routes.length,before,p)}
console.log('STATIC_SNAPSHOT_NATIVE_NAVIGATION_TEST_PASS',1+checks.length+4);
