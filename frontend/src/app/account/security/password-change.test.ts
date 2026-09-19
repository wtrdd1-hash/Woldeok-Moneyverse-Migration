import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('account password change', () => {
  it('exposes a confirmed new-password form and warns that other sessions are revoked', () => {
    const page = readFileSync('src/app/account/security/page.tsx', 'utf8');
    expect(page).toContain('action={changeLocalPassword}');
    expect(page).toContain('name="confirmPassword"');
    expect(page).toContain('현재 세션을 제외한 다른 세션은 종료됩니다.');
  });
});
