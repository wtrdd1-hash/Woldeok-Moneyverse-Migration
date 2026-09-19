import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

describe('verify-email user contract', () => {
  it('documents cross-browser one-time verification without prelogin state', () => {
    expect(page).toContain('쿠키나 CSRF 토큰 없이도 다른 브라우저에서 인증할 수 있습니다.');
    expect(page).toContain('이미 사용되었습니다');
    expect(page).not.toContain('현재 가입 세션과 일치하지 않아요');
  });
});
