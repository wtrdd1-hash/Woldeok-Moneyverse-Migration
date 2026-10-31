import assert from 'node:assert/strict';

const origin = process.env.MV_TEST_ORIGIN;
if (!origin || !/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
  throw new Error('MV_TEST_ORIGIN must be an isolated loopback Next.js origin');
}

for (const path of ['/pension', '/en/pension']) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual' });
  assert.equal(response.status, 200, `${path} must render even when the owner API is unavailable`);
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  const html = await response.text();
  assert.match(html, /내 연금 계좌 조회 불가/);
  assert.match(html, /회원 연금 자료 중 일부를 확인할 수 없습니다/);
  assert.match(html, /연금 정보 다시 조회/);
  assert.doesNotMatch(html, /아직 기여금 납입 내역이 없습니다/);
  console.log(`PASS ${path}: HTTP 200, private/noindex/no-referrer, fail-closed account and receipts`);
}
