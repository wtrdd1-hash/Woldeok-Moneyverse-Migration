import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const page = readFileSync('src/app/verify-email-change/page.tsx', 'utf8');
const actions = readFileSync('src/app/verify-email-change/actions.ts', 'utf8');
const security = readFileSync('src/app/account/security/page.tsx', 'utf8');
describe('login email change UI contract', () => {
  it('keeps verification private and touch-friendly', () => { expect(page).toContain('index: false'); expect(page).toContain('min-h-11 w-full sm:w-auto'); });
  it('completes through the authoritative API and returns to login', () => { expect(actions).toContain('/api/v1/auth/local/email-change/complete'); expect(actions).toContain('/login?email_changed=1'); });
  it('exposes the email-change flow only for local identities', () => { expect(security).toContain('hasLocalIdentity ?'); expect(security).toContain('requestLocalEmailChange'); expect(security).toContain('새 로그인 이메일'); });
});
