import assert from 'node:assert/strict';
import { test } from 'node:test';

const baseUrl = process.env.SEARCH_BASE_URL;
const cases = [
  ['/search?q=wallet', false],
  ['/search?q=wallet&q=admin', true],
  ['/search?q=' + 'a'.repeat(81), true],
  ['/ko/search?q=wallet&q=admin', true],
  ['/en/search?q=wallet&q=admin', true],
  ['/ja/search?q=wallet&q=admin', true],
  ['/zh/search?q=wallet&q=admin', true],
  ['/vi/search?q=wallet&q=admin', true],
];

for (const [path, invalid] of cases) {
  test(`global search HTTP source and privacy ${path.slice(0, 70)}`, { skip: !baseUrl }, async () => {
    const response = await fetch(new URL(path, baseUrl), { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    const html = await response.text();
    if (invalid) {
      assert.ok(html.includes('검색어 형식이 올바르지 않습니다'));
    } else {
      assert.ok(html.includes('로그인 상태를 서버에서 확인하지 못했습니다'));
    }
  });
}
