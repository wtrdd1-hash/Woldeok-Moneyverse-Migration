import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('admin directory matches translated words, full-width characters and exact categories', () => {
  const window={};
  runInNewContext(readFileSync(new URL('../spring-backend/src/main/resources/static/assets/mv43/admin-tools.js',import.meta.url),'utf8'),{window});
  const matches=window.MV43AdminTools.matches;
  const tool={category:'security',search:'Audit logs 감사 로그 セキュリティ 安全 Bảo mật /admin/logs'};
  assert.equal(matches(tool,'AUDIT logs','all'),true);
  assert.equal(matches(tool,'감사','security'),true);
  assert.equal(matches(tool,'ＡＵＤＩＴ','all'),true);
  assert.equal(matches(tool,'','security'),true);
  assert.equal(matches(tool,'','macro'),false);
  assert.equal(matches(tool,'not present','all'),false);
  assert.equal(matches(tool,'audit missing','all'),false);
  assert.equal(matches(tool,'安全','all'),true);
  assert.equal(matches(tool,'BẢO MẬT','all'),true);
});
