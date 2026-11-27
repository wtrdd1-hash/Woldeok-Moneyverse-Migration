import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { copyProblems } from '@/lib/copy';
import { CONSENT_COPY, COPY, ERROR_COPY } from './copy';

// W02 / W03 five-locale QA: /login showed Korean in every locale. The sign-in page and its error
// messages now come from a five-locale table; Korean stays byte-identical.
describe('login copy', () => {
  it('is complete in five locales', () => {
    expect(copyProblems(COPY)).toEqual([]);
    expect(copyProblems(ERROR_COPY)).toEqual([]);
    expect(copyProblems(CONSENT_COPY)).toEqual([]);
  });

  it('keeps no Korean literal in the sign-in page or provider view', () => {
    for (const file of ['page.tsx', 'login-providers-view.tsx', 'consent-form.tsx']) {
      const source = readFileSync(join(__dirname, file), 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '');
      expect(source, file).not.toMatch(/[가-힣]/);
    }
  });

  it('keeps the owner Korean copy', () => {
    expect(COPY.title.ko).toBe('로그인');
    expect(COPY.lead.ko).toBe('디스코드, 구글 또는 자체 계정으로 들어옵니다.');
    expect(ERROR_COPY.local_credentials.ko).toBe('이메일 또는 비밀번호를 확인해 주세요.');
  });
});
