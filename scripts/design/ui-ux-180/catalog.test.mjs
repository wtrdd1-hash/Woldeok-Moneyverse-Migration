import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { routes } from './routes.mjs';

test('every design route has an explicit usable screen contract', async () => {
  assert.ok(existsSync(new URL('./catalog.mjs', import.meta.url)), 'Screen catalog is missing');
  const { pages } = await import('./catalog.mjs');
  assert.equal(pages.length, 180);
  assert.deepEqual(pages.map(p => p.route).sort(), [...routes].sort());
  for (const p of pages) {
    assert.ok(p.title && p.purpose && p.family, p.route);
    assert.ok(p.actions.length && p.states.length >= 6, p.route);
    assert.ok(p.fields.length || p.columns.length || p.sections.length, p.route);
  }
});

test('creation, upload and receipt designs retain their real task semantics', async () => {
  assert.ok(existsSync(new URL('./catalog.mjs', import.meta.url)), 'Screen catalog is missing');
  const { pages } = await import('./catalog.mjs');
  const pick = route => pages.find(p => p.route === route);
  assert.ok(pick('/clubs/new').fields.includes('Club name'));
  assert.ok(pick('/gallery/submit').fields.includes('Photo'));
  assert.ok(!pick('/gallery/submit').fields.some(f => /password/i.test(f)));
  assert.ok(pick('/wallet/activity/transactions/[transactionId]').columns.includes('Transaction ID'));
  assert.ok(pick('/stocks/[symbol]').sections.includes('Candlestick chart'));
  assert.ok(pick('/admin/shop').columns.includes('Stock'));
  assert.ok(pick('/tools/youth-leap-calculator').fields.includes('Monthly contribution'));
});

test('all render artifacts remain visibly synthetic and cannot initiate transactions', async () => {
  assert.ok(existsSync(new URL('./render-page.mjs', import.meta.url)), 'Renderer is missing');
  const { renderPage } = await import('./render-page.mjs');
  const { pages } = await import('./catalog.mjs');
  for (const p of pages) {
    const html = renderPage(p, { locale: 'en', state: 'ready' });
    assert.match(html, /Design preview/);
    assert.match(html, /Synthetic data/);
    assert.doesNotMatch(html, /https?:\/\/[^" ]+\/api\//);
    assert.doesNotMatch(html, /fetch\s*\(|XMLHttpRequest|sendBeacon/);
    assert.match(html, /id="main-content"/);
    assert.match(html, /type="button"/);
  }
});
