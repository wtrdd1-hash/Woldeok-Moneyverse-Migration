import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync(new URL('./src/app/reset-password/page.tsx', `file://${process.cwd()}/`), 'utf8');
const actions = readFileSync(new URL('./src/app/reset-password/actions.ts', `file://${process.cwd()}/`), 'utf8');

describe('password reset confirmation', () => {
  it('asks users to confirm the new password with accessible mobile-sized controls', () => {
    expect(page).toContain('htmlFor="confirm-password"');
    expect(page).toContain('id="confirm-password"');
    expect(page).toContain('name="confirmPassword"');
    expect(page).toContain('autoComplete="new-password"');
    expect(page).toContain('className="min-h-11"');
  });

  it('rejects mismatched passwords before calling the authoritative reset API', () => {
    expect(actions).toContain("formData.get('confirmPassword')");
    expect(actions).toContain("password !== confirmPassword");
    expect(actions).toContain('error=mismatch');
    expect(page).toContain("mismatch:'새 비밀번호 확인 값이 일치하지 않습니다.'");
  });
});
