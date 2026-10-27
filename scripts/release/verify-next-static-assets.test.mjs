import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyNextStaticAssets } from './verify-next-static-assets.mjs';

const page = '<html><head><link rel="stylesheet" href="/_next/static/chunks/layout.css"/><link rel="preload" as="style" href="/_next/static/chunks/layout.css"/></head></html>';
function response(body, type, status = 200) {
  return { ok: status >= 200 && status < 300, status, headers: new Headers({ 'content-type': type }), text: async () => body };
}
function mockFetch(assetResponse) {
  return async (url) => String(url).endsWith('/admin') ? response(page, 'text/html') : assetResponse;
}

test('accepts a stylesheet served from the same active build', async () => {
  const result = await verifyNextStaticAssets('http://127.0.0.1:3384/admin', {
    fetchImpl: mockFetch(response('.size-9{width:2.25rem}', 'text/css')),
    expectedSelector: '.size-9{',
  });
  assert.equal(result.stylesheetCount, 1);
});

test('fails closed when a stale running manifest references a missing stylesheet', async () => {
  await assert.rejects(verifyNextStaticAssets('http://127.0.0.1:3354/admin', {
    fetchImpl: mockFetch(response('Not Found', 'text/plain', 404)),
  }), /Missing stylesheet .*HTTP 404/);
});

test('rejects HTML fallback responses masquerading as successful CSS', async () => {
  await assert.rejects(verifyNextStaticAssets('http://127.0.0.1:3384/admin', {
    fetchImpl: mockFetch(response('<html>fallback</html>', 'text/html')),
  }), /unexpected content type/);
});

test('requires the Tailwind utility to protect the compact brand size', async () => {
  await assert.rejects(verifyNextStaticAssets('http://127.0.0.1:3384/admin', {
    fetchImpl: mockFetch(response('.unknown{display:block}', 'text/css')),
    expectedSelector: '.size-9{',
  }), /Required utility not found/);
});

test('rejects a page with no linked application styles', async () => {
  await assert.rejects(verifyNextStaticAssets('http://127.0.0.1:3384/admin', {
    fetchImpl: async () => response('<html><head></head></html>', 'text/html'),
  }), /no Next.js stylesheets/);
});
