import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/app/account/page.tsx', 'utf8');

describe('account local identity reauthentication', () => {
  it('does not send local_email through the OAuth-only reauthentication action', () => {
    expect(source).toContain("identity.provider !== 'local_email'");
    expect(source).toContain('href="/account/security"');
    expect(source).toContain('이메일·비밀번호로 본인 확인');
  });

  it('labels the local sign-in identity for users instead of exposing the provider key', () => {
    expect(source).toContain("local_email: '이메일·비밀번호'");
  });

  it('keeps the local reauthentication entry point touch friendly', () => {
    expect(source).toMatch(/href="\/account\/security"[\s\S]*?min-h-11/);
  });
});
