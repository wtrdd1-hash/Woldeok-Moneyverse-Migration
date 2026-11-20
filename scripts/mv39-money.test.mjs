import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const asset = name => new URL('../spring-backend/src/main/resources/static/assets/mv39/' + name, import.meta.url);
test('stock percentage changes preserve large integer and decimal prices', () => {
  const window = {};
  runInNewContext(readFileSync(asset('money.js'), 'utf8'), { window });
  const pct = window.MV39Money.percentageChange;
  assert.equal(pct('9007199254740993', '9007199254740992'), '+0.00%');
  assert.equal(pct('99999999999999999999999999999999999999', '1'), '+9999999999999999999999999999999999999800.00%');
  assert.equal(pct('105.25', '100'), '+5.25%');
  assert.equal(pct('99.995', '100'), '-0.01%');
  assert.equal(pct('0', '1'), '-100.00%');
  for (const [a,b] of [['bad','1'],['-1','1'],['1','0'],['Infinity','1'],['1','NaN'],['1e30','1'],[9007199254740992,'1']]) assert.equal(pct(a,b), null);
});

test('approved shared palette and mobile support target remain available', () => {
  const css = readFileSync(asset('site.css'), 'utf8');
  for (const value of ['#0C1020','#151D32','#9C83FF','#64B7FF','#E9F1FF','#A8BCD8']) assert.ok(css.toLowerCase().includes(value.toLowerCase()), value);
  assert.doesNotMatch(css, /\.support-fab\s*\{\s*display\s*:\s*none/i);
  assert.match(css, /safe-area-inset-bottom/);
});

test('home loads exact price arithmetic before stock rendering', () => {
  const html = readFileSync(new URL('../spring-backend/src/main/resources/static/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('/assets/mv39/money.js'));
  assert.ok(html.indexOf('/assets/mv39/money.js') < html.indexOf('/assets/mv39/app.js'));
});
