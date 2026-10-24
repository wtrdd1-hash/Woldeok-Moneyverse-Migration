import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { verifiedNotificationPreference } from './notification-preference';

describe('server-verified notification preference', () => {
  it('accepts only an actual boolean from the backend contract', () => {
    expect(verifiedNotificationPreference({ notifications_enabled: true })).toBe(true);
    expect(verifiedNotificationPreference({ notifications_enabled: false })).toBe(false);
    for (const malformed of [null, undefined, {}, [], { notifications_enabled: 'false' }, { notifications_enabled: 0 }, { notifications_enabled: null }]) {
      expect(verifiedNotificationPreference(malformed)).toBeNull();
    }
  });

  it('requires the server write receipt to agree with the requested value', () => {
    const actions = readFileSync(join(process.cwd(), 'src/app/account/notifications/actions.ts'), 'utf8');
    expect(actions).toContain('verifiedNotificationPreference(receipt) !== requested');
    expect(actions).toContain("redirect('/account/notifications?error=save')");
    expect(actions).not.toContain("redirect('/account/notifications?saved=1')");
  });

  it('does not treat a URL query as proof of a successful save', () => {
    const page = readFileSync(join(process.cwd(), 'src/app/account/notifications/page.tsx'), 'utf8');
    expect(page).toContain('verifiedNotificationPreference(board)');
    expect(page).toContain('confirmedByRead');
    expect(page).not.toContain("params.saved === '1'");
    expect(page).toContain('role="status"');
    expect(page).toContain('role="alert"');
  });
});
