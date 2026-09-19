import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/account/security/page.tsx', 'utf8');
const actions = readFileSync('src/app/account/security/actions.ts', 'utf8');

describe('account security sign out all devices', () => {
  it('exposes the destructive all-device sign-out control', () => {
    expect(page).toContain('form action={terminateAllSessions}');
    expect(page).toContain('모든 기기에서 로그아웃');
  });

  it('revokes other sessions before ending the current session', () => {
    const all = actions.indexOf('export async function terminateAllSessions');
    const revoke = actions.indexOf("sessions/revoke-others", all);
    const logout = actions.indexOf("'/api/v1/auth/logout'", all);
    expect(revoke).toBeGreaterThan(all);
    expect(logout).toBeGreaterThan(revoke);
    expect(actions.slice(all)).toContain("redirect('/login?signed_out_all=1')");
  });
});
