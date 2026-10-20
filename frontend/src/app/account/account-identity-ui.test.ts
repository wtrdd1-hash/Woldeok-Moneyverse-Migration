import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
describe('account identity UI evidence', () => {
  it('does not claim a security score without evidence', () => {
    const page = readFileSync('src/app/account/page.tsx', 'utf8');
    expect(page).not.toContain('securityScore');
    expect(page).not.toContain('title="보안 인증 완료"');
    expect(page).toContain('parseAccountIdentityEvidence(identityData)');
    expect(page).toContain('다시 조회하기');
  });
});