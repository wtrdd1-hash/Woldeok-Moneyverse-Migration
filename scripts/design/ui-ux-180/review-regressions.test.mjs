import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pages} from './catalog.mjs';
import {renderPage} from './render-page.mjs';
test('Quant Studio includes strategy inputs and percent comparison output',()=>{
 const p=pages.find(p=>p.route==='/tools/quant-studio');
 assert.equal(p.family,'quant');assert.notEqual(p.purpose,'quant');assert.equal(p.unit,'%');
 const html=renderPage(p);
 assert.match(html,/Strategy inputs/);assert.match(html,/Illustrative strategy comparison/);assert.match(html,/\+12\.4%/);
 assert.doesNotMatch(html,/82,450 WLD/);
});
test('mobile administrator navigation selects the current route group',()=>{
 for(const [route,label] of [['/admin','Overview'],['/admin/users','Members'],['/admin/users/[id]','Members'],['/admin/logs','Audit'],['/admin/logs/errors','Audit'],['/admin/controls','Controls']]){
  const html=renderPage(pages.find(p=>p.route===route));
  const nav=html.match(/<nav class="bottom-nav"[\s\S]*?<\/nav>/)[0];
  const selected=nav.match(/<a [^>]*class="active"[\s\S]*?<\/a>/g)||[];
  assert.equal(selected.length,1,route);assert.ok(selected[0].includes('<span>'+label+'</span>'),route);
 }
});

test('order sides and bank movement labels keep their distinct meanings',async()=>{
 const {table}=await import('./primitives.mjs');
 assert.doesNotMatch(table(['Side'],'stock',4),/Deposit|Withdrawal/);
 assert.doesNotMatch(table(['Movement'],'bank',4),/Buy|Sell/);
 assert.match(table(['Movement'],'bank',4),/Deposit/);
});
