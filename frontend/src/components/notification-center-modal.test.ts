// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'src/components/notification-center-modal.tsx'), 'utf8');

describe('notification modal read acknowledgement and honesty', () => {
  it('does not advertise reward claiming when the backend only marks read', () => {
    expect(source).not.toContain('원클릭 모두 수령');
    expect(source).not.toContain('handleClaimAll');
  });
  it('uses a CSRF-protected server action and acknowledges only after success', () => {
    expect(source).toContain('markAccountNotificationRead(null)');
    expect(source).toContain('if (!result.ok) throw');
    expect(source).not.toContain("method: 'POST'");
  });
  it('shows stale/error state instead of inventing a fresh empty inbox', () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain('lastChecked');
    expect(source).toContain('cache: \'no-store\'');
  });
  it('exposes accessible pressed state on mobile filter controls', () => {
    expect(source).toContain("aria-pressed={filter === 'all'}");
    expect(source).toContain("aria-pressed={filter === 'unread'}");
  });
});
