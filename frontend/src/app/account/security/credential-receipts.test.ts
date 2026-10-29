import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isVerifiedCredentialReceipt } from './credential-receipts';

const actions = readFileSync('src/app/account/security/actions.ts', 'utf8');
const page = readFileSync('src/app/account/security/page.tsx', 'utf8');

describe('member local credential mutation receipts', () => {
  it('accepts only the exact successful backend reauthentication outcome', () => {
    expect(isVerifiedCredentialReceipt({ outcome: 'reauthenticated' }, 'reauthentication')).toBe(true);
    for (const payload of [null, {}, { outcome: 'pending' }, { outcome: true }, [], 'reauthenticated']) {
      expect(isVerifiedCredentialReceipt(payload, 'reauthentication')).toBe(false);
    }
  });

  it('rejects fabricated password-change success', () => {
    expect(isVerifiedCredentialReceipt({ outcome: 'password-changed' }, 'password-change')).toBe(true);
    for (const payload of [undefined, {}, { outcome: 'reauthenticated' }, { outcome: false }, []]) {
      expect(isVerifiedCredentialReceipt(payload, 'password-change')).toBe(false);
    }
  });

  it('requires both positive email-change request fields', () => {
    expect(isVerifiedCredentialReceipt({ accepted: true, verificationRequired: true }, 'email-change')).toBe(true);
    for (const payload of [null, {}, { accepted: true }, { verificationRequired: true },
      { accepted: false, verificationRequired: true }, { accepted: true, verificationRequired: 'true' }, []]) {
      expect(isVerifiedCredentialReceipt(payload, 'email-change')).toBe(false);
    }
  });

  it('wires all three actions to verified receipts before success redirects', () => {
    expect(actions).toContain("isVerifiedCredentialReceipt(receipt, 'reauthentication')");
    expect(actions).toContain("isVerifiedCredentialReceipt(receipt, 'password-change')");
    expect(actions).toContain("isVerifiedCredentialReceipt(receipt, 'email-change')");
  });

  it('does not promise actual email delivery from an accepted send request', () => {
    expect(page).toContain('이메일 변경 확인 메일 발송 요청이 접수되었습니다.');
    expect(page).not.toContain('새 로그인 이메일로 확인 링크를 보냈습니다.');
    expect(page).toContain('robots: { index: false, follow: false }');
    expect(page).toContain('min-h-11');
  });
});
