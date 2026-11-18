import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const app = readFileSync(join(dir, 'app.mjs'), 'utf8');
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const css = readFileSync(join(dir, 'styles.css'), 'utf8');

test('preview never reaches a backend or persists member data', () => {
  for (const source of [app, html]) {
    assert.doesNotMatch(source, /\bfetch\s*\(/);
    assert.doesNotMatch(source, /\bXMLHttpRequest\b/);
    assert.doesNotMatch(source, /\bsendBeacon\s*\(/);
    assert.doesNotMatch(source, /\blocalStorage\s*\./);
    assert.doesNotMatch(source, /\bsessionStorage\s*\./);
    assert.doesNotMatch(source, /\bdocument\.cookie\b/);
    assert.doesNotMatch(source, /\binnerHTML\b/);
  }
  assert.match(html, /문의\/쪽지는 전송되지 않습니다/);
  assert.match(html, /실제 전송 불가/);
});

test('support launcher is present at the root outside all pages', () => {
  assert.match(html, /id="chat-mount"/);
  assert.match(html, /id="chat-launcher"/);
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="tablist"/);
  assert.match(app, /\bNAVIGATE\b/);
  assert.match(app, /\bpopstate\b/);
});

test('mobile safe area, tap targets, overflow and reduced-motion support', () => {
  assert.match(css, /width:56px;height:56px/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /overflow-x:clip/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('prototype labels actual API health as unverified, not success', () => {
  assert.match(app, /미검증/);
  assert.match(app, /실제 API 연결/);
  assert.match(app, /미전송/);
});

test('mobile prototype exposes authentication state without relying on hidden sidebar', () => {
  assert.match(html, /id="auth-button-mobile"/);
  assert.match(app, /auth-button-mobile/);
});
