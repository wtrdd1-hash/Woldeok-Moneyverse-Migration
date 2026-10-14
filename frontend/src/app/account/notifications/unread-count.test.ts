// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GET } from '@/app/api/notifications/unread-count/route';

const notifButtonSource = readFileSync(
  join(process.cwd(), 'src/components/notification-header-button.tsx'),
  'utf8',
);
const chatButtonSource = readFileSync(
  join(process.cwd(), 'src/components/chat-header-button.tsx'),
  'utf8',
);

describe('Notification & Chat unread count polling safety', () => {
  it('BFF unread-count fails closed when authentication is unavailable', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');

    const json = await response.json();
    expect(json).toEqual({ error: 'Authentication unavailable' });
  });

  it('NotificationHeaderButton restricts the modal to signed-in viewers', () => {
    expect(notifButtonSource).toContain('useViewer()');
    expect(notifButtonSource).toContain('if (!viewer?.signedIn) return null');
    const modalSource = readFileSync(join(process.cwd(), 'src/components/notification-center-modal.tsx'), 'utf8');
    expect(modalSource).toContain('setInterval(fetchUnreadCount, 15000)');
    expect(modalSource).toContain('countRequestId.current');
  });

  it('ChatHeaderButton incorporates totalUnread parsing, visibilityState guard, and exponential backoff', () => {
    expect(chatButtonSource).toContain('data.totalUnread ?? data.unreadCount');
    expect(chatButtonSource).toContain('document.hidden');
    expect(chatButtonSource).toContain('visibilitychange');
    expect(chatButtonSource).toContain('BASE_POLL_INTERVAL_MS = 15000');
    expect(chatButtonSource).toContain('MAX_POLL_INTERVAL_MS = 60000');
    expect(chatButtonSource).toContain('Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2)');
  });
});
