import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/account/page.tsx', 'utf8');

describe('account rebuild navigation', () => {
  it('keeps account tools reachable with semantic navigation and touch-sized links', () => {
    expect(source).toContain('aria-label="계정 관리 바로가기"');
    expect(source).toContain('aria-label="계정 관리 메뉴"');
    expect(source).toContain('href="/account/security"');
    expect(source).toContain('href="/account/notifications"');
    expect(source).toContain('href="/account/privacy"');
    expect(source.match(/min-h-11/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps destructive account deletion in the primary account flow', () => {
    expect(source).toContain('id="leave-moneyverse"');
    expect(source).toContain('<DeleteAccountForm />');
  });
});
