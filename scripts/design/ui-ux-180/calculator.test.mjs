
import { readFileSync } from 'node:fs';
import { pages } from './catalog.mjs';
import { renderPage } from './render-page.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
test('real-world calculators do not present virtual WLD as their output currency',()=>{
 for(const route of ['/tools/salary-calculator','/tools/youth-leap-calculator','/tools/loan-interest-calculator']){
  const p=pages.find(p=>p.route===route);assert.equal(p.unit,'KRW');
  assert.match(renderPage(p),/KRW/);
 }
 assert.deepEqual(pages.find(p=>p.route==='/tools/loan-interest-calculator').columns,['Period','Payment','Interest','Principal','Remaining']);
 assert.equal(pages.find(p=>p.route==='/shop').navigation,'shop');
});
